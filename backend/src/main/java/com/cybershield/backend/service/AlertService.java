package com.cybershield.backend.service;

import com.cybershield.backend.dto.AlertRequest;
import com.cybershield.backend.dto.AlertResponse;
import com.cybershield.backend.entity.Alert;
import com.cybershield.backend.entity.AlertStatus;
import com.cybershield.backend.entity.AlertType;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.Threat;
import com.cybershield.backend.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final EmailNotificationService emailNotificationService;
    private final WebSocketBroadcastService webSocketBroadcastService;
    private final SessionBlockLinkService sessionBlockLinkService;

    @Transactional
    public Alert createAndDispatch(AppUser user, Threat threat, AlertType type, RiskLevel severity, String title, String message) {
        SecuredAlertMessage securedMessage = appendSessionBlockLink(threat, severity, message);
        Alert alert = Alert.builder()
                .user(user)
                .threat(threat)
                .type(type)
                .severity(severity)
                .status(AlertStatus.QUEUED)
                .title(title)
                .message(securedMessage.message())
                .channel("email + websocket")
                .recipientEmail(user == null ? null : user.getEmail())
                .build();
        Alert saved = alertRepository.save(alert);
        boolean delivered = saved.getRecipientEmail() == null || emailNotificationService.send(saved);
        if (delivered && securedMessage.blockLinkId() != null) {
            sessionBlockLinkService.markNotificationSent(securedMessage.blockLinkId());
        }
        saved.setStatus(delivered ? AlertStatus.DELIVERED : AlertStatus.FAILED);
        saved.setSentAt(Instant.now());
        Alert dispatched = alertRepository.save(saved);
        webSocketBroadcastService.broadcast("/topic/alerts", AlertResponse.from(dispatched));
        return dispatched;
    }

    @Transactional
    public AlertResponse manualAlert(AppUser user, AlertRequest request) {
        Alert alert = Alert.builder()
                .user(user)
                .type(request.type() == null ? AlertType.MANUAL : request.type())
                .severity(request.severity() == null ? RiskLevel.MEDIUM : request.severity())
                .status(AlertStatus.QUEUED)
                .title(request.title())
                .message(request.message())
                .channel(request.channel() == null ? "email" : request.channel())
                .recipientEmail(request.recipientEmail() == null ? user.getEmail() : request.recipientEmail())
                .build();
        Alert saved = alertRepository.save(alert);
        boolean delivered = emailNotificationService.send(saved);
        saved.setStatus(delivered ? AlertStatus.DELIVERED : AlertStatus.FAILED);
        saved.setSentAt(Instant.now());
        Alert dispatched = alertRepository.save(saved);
        webSocketBroadcastService.broadcast("/topic/alerts", AlertResponse.from(dispatched));
        return AlertResponse.from(dispatched);
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> recentAlerts() {
        return alertRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(AlertResponse::from)
                .toList();
    }

    private SecuredAlertMessage appendSessionBlockLink(Threat threat, RiskLevel severity, String message) {
        if (threat == null || threat.getSession() == null || (severity != RiskLevel.HIGH && severity != RiskLevel.CRITICAL)) {
            return new SecuredAlertMessage(message, null);
        }
        return sessionBlockLinkService
                .createBlockLink(threat.getSession(), threat, threat.getRiskScore(), severity, message)
                .map(blockLink -> new SecuredAlertMessage("""
                        %s

                        Security action:
                        If this activity was not you, block this session immediately using this secure one-time link:
                        %s

                        This link expires in %d minutes. After it is used, the suspicious session and its refresh token are revoked.
                        """.formatted(message, blockLink.url(), sessionBlockLinkService.expirationMinutes()), blockLink.id()))
                .orElseGet(() -> new SecuredAlertMessage(message, null));
    }

    private record SecuredAlertMessage(String message, java.util.UUID blockLinkId) {
    }
}
