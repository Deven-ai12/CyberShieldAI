package com.cybershield.backend.service;

import com.cybershield.backend.dto.RiskEvaluation;
import com.cybershield.backend.dto.ThreatResponse;
import com.cybershield.backend.entity.AlertType;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.Threat;
import com.cybershield.backend.entity.ThreatStatus;
import com.cybershield.backend.entity.ThreatType;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.repository.ThreatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ThreatService {

    private final ThreatRepository threatRepository;
    private final AlertService alertService;
    private final WebSocketBroadcastService webSocketBroadcastService;

    @Transactional
    public List<Threat> createThreats(AppUser user, UserSession session, RiskEvaluation evaluation, String sourceIp) {
        if (evaluation.score() < 40) {
            return List.of();
        }
        List<ThreatType> threatTypes = evaluation.threatTypes().isEmpty()
                ? List.of(ThreatType.BANKING_FRAUD)
                : evaluation.threatTypes();
        List<Threat> threats = new ArrayList<>();
        for (ThreatType threatType : threatTypes) {
            Threat threat = Threat.builder()
                    .user(user)
                    .session(session)
                    .type(threatType)
                    .severity(evaluation.level())
                    .status(evaluation.score() >= 75 ? ThreatStatus.BLOCKED : ThreatStatus.CHALLENGED)
                    .title(titleFor(threatType, evaluation.level()))
                    .description(String.join("; ", evaluation.signals()))
                    .riskScore(evaluation.score())
                    .sourceIp(sourceIp)
                    .actionTaken(evaluation.score() >= 85 ? "session challenged and transaction controls tightened" : "adaptive challenge issued")
                    .detectedAt(Instant.now())
                    .build();
            Threat saved = threatRepository.save(threat);
            threats.add(saved);
            ThreatResponse response = ThreatResponse.from(saved);
            webSocketBroadcastService.broadcast("/topic/threats", response);
        }
        if ((evaluation.level() == RiskLevel.HIGH || evaluation.level() == RiskLevel.CRITICAL) && !threats.isEmpty()) {
            Threat primaryThreat = primaryThreat(threats, evaluation);
            alertService.createAndDispatch(
                    user,
                    primaryThreat,
                    evaluation.hijackSuspected() ? AlertType.SESSION_HIJACK : AlertType.BEHAVIOR_ANOMALY,
                    evaluation.level(),
                    primaryThreat.getTitle(),
                    primaryThreat.getDescription()
            );
        }
        return threats;
    }

    @Transactional(readOnly = true)
    public List<ThreatResponse> liveThreats() {
        return threatRepository.findTop25ByOrderByDetectedAtDesc().stream()
                .map(ThreatResponse::from)
                .toList();
    }

    private String titleFor(ThreatType type, RiskLevel level) {
        return switch (type) {
            case SESSION_HIJACK -> level == RiskLevel.CRITICAL ? "Critical session hijack attempt" : "Session hijack signal";
            case BANKING_FRAUD -> "Banking fraud pattern detected";
            case BOT_ACTIVITY -> "Bot activity detected";
            case ABNORMAL_TYPING -> "Suspicious typing behavior";
            case ABNORMAL_MOUSE_MOVEMENT -> "Abnormal mouse movement";
            case RAPID_CLICKING -> "Rapid click attack pattern";
            case COPY_PASTE_FRAUD -> "Copy-paste fraud signal";
            case AUTOFILL_ABUSE -> "Autofill abuse detected";
            case SUSPICIOUS_TRANSACTION -> "Suspicious transaction blocked";
            case ACCOUNT_TAKEOVER -> "Account takeover attempt";
        };
    }

    private Threat primaryThreat(List<Threat> threats, RiskEvaluation evaluation) {
        if (evaluation.hijackSuspected()) {
            return threats.stream()
                    .filter(threat -> threat.getType() == ThreatType.SESSION_HIJACK)
                    .findFirst()
                    .orElse(threats.getFirst());
        }
        return threats.getFirst();
    }
}
