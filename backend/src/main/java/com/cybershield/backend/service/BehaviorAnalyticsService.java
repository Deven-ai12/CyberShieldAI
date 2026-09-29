package com.cybershield.backend.service;

import com.cybershield.backend.dto.BehaviorSnapshotResponse;
import com.cybershield.backend.dto.BehaviorTrackRequest;
import com.cybershield.backend.dto.DeviceResponse;
import com.cybershield.backend.dto.LiveSessionResponse;
import com.cybershield.backend.dto.RiskEvaluation;
import com.cybershield.backend.dto.RiskScoreResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.BehaviorEvent;
import com.cybershield.backend.entity.Device;
import com.cybershield.backend.entity.RiskLog;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.repository.BehaviorEventRepository;
import com.cybershield.backend.repository.DeviceRepository;
import com.cybershield.backend.repository.RiskLogRepository;
import com.cybershield.backend.utils.RequestUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BehaviorAnalyticsService {

    private final BehaviorEventRepository behaviorEventRepository;
    private final RiskLogRepository riskLogRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceService deviceService;
    private final UserSessionService userSessionService;
    private final RiskEngineService riskEngineService;
    private final ThreatService threatService;
    private final AdaptiveTrustService adaptiveTrustService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RiskScoreResponse track(AppUser user, BehaviorTrackRequest request, HttpServletRequest servletRequest) {
        Device device = deviceService.upsertDevice(user, request.deviceFingerprint(), null, servletRequest);
        UserSession session = userSessionService.latestActiveSession(user)
                .orElseGet(() -> userSessionService.createSession(user, device, servletRequest, Instant.now().plusSeconds(1800)));

        RiskEvaluation evaluation = riskEngineService.evaluateBehavior(request, session);
        BehaviorEvent event = BehaviorEvent.builder()
                .user(user)
                .session(session)
                .deviceFingerprint(request.deviceFingerprint())
                .typingSpeed(request.typingSpeed())
                .typingRhythm(request.safeTypingRhythm())
                .mouseMovementSpeed(request.mouseMovementSpeed())
                .clickFrequency(request.clickFrequency())
                .rageClickDetected(request.rageClickDetected())
                .copyPasteDetected(request.copyPasteDetected())
                .autofillDetected(request.autofillDetected())
                .tabSwitchCount(request.tabSwitchCount())
                .inactiveTime(request.inactiveTime())
                .scrollDepth(request.scrollDepth())
                .scrollVelocity(request.scrollVelocity())
                .mousePathJson(writeJson(request.mousePath()))
                .riskScore(evaluation.score())
                .riskLevel(evaluation.level())
                .capturedAt(request.capturedAt() == null ? Instant.now() : request.capturedAt())
                .build();
        behaviorEventRepository.save(event);
        userSessionService.updateRisk(session, evaluation.score(), evaluation.level());
        adaptiveTrustService.learnBehavior(user, request, evaluation.score());
        saveRiskLog(user, session, evaluation);
        threatService.createThreats(user, session, evaluation, RequestUtils.clientIp(servletRequest));
        return new RiskScoreResponse(evaluation.score(), evaluation.level(), evaluation.signals(), Instant.now());
    }

    @Transactional(readOnly = true)
    public RiskScoreResponse currentRisk(AppUser user) {
        return riskLogRepository.findTopByUserOrderByEvaluatedAtDesc(user)
                .map(log -> new RiskScoreResponse(log.getScore(), log.getLevel(), List.of(log.getReason()), log.getEvaluatedAt()))
                .orElseGet(() -> userSessionService.latestActiveSession(user)
                        .map(session -> new RiskScoreResponse(session.getRiskScore(), session.getRiskLevel(), List.of("Session baseline risk"), session.getLastSeenAt()))
                        .orElse(new RiskScoreResponse(18, riskEngineService.levelFor(18), List.of("No live risk events yet"), Instant.now())));
    }

    @Transactional(readOnly = true)
    public LiveSessionResponse liveSession(AppUser user) {
        UserSession session = userSessionService.latestActiveSession(user).orElse(null);
        List<DeviceResponse> devices = deviceRepository.findTop10ByUserOrderByLastSeenAtDesc(user).stream()
                .map(DeviceResponse::from)
                .toList();
        List<BehaviorSnapshotResponse> behaviors = behaviorEventRepository.findTop20ByUserOrderByCapturedAtDesc(user).stream()
                .map(BehaviorSnapshotResponse::from)
                .toList();
        if (session == null) {
            return new LiveSessionResponse(null, null, 18, riskEngineService.levelFor(18), null, Instant.now(), devices, behaviors);
        }
        return new LiveSessionResponse(
                session.getId(),
                session.getStatus(),
                session.getRiskScore(),
                session.getRiskLevel(),
                session.getDeviceFingerprint(),
                session.getLastSeenAt(),
                devices,
                behaviors
        );
    }

    private void saveRiskLog(AppUser user, UserSession session, RiskEvaluation evaluation) {
        RiskLog riskLog = RiskLog.builder()
                .user(user)
                .session(session)
                .score(evaluation.score())
                .level(evaluation.level())
                .reason(String.join("; ", evaluation.signals()))
                .signalsJson(writeJson(evaluation.signals()))
                .evaluatedAt(Instant.now())
                .build();
        riskLogRepository.save(riskLog);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return "[]";
        }
    }
}
