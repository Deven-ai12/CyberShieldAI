package com.cybershield.backend.service;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.Device;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.SessionStatus;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.repository.UserSessionRepository;
import com.cybershield.backend.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;

    @Transactional
    public UserSession createSession(AppUser user, Device device, HttpServletRequest request, Instant expiresAt) {
        Instant now = Instant.now();
        int initialRisk = device != null && !device.isTrusted() ? 48 : 18;
        RiskLevel initialLevel = device != null && !device.isTrusted() ? RiskLevel.MEDIUM : RiskLevel.LOW;
        UserSession session = UserSession.builder()
                .user(user)
                .device(device)
                .deviceFingerprint(device == null ? null : device.getFingerprint())
                .ipAddress(RequestUtils.clientIp(request))
                .userAgent(RequestUtils.userAgent(request))
                .status(SessionStatus.ACTIVE)
                .riskScore(initialRisk)
                .riskLevel(initialLevel)
                .startedAt(now)
                .lastSeenAt(now)
                .expiresAt(expiresAt)
                .build();
        return userSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public Optional<UserSession> latestActiveSession(AppUser user) {
        return userSessionRepository.findTopByUserAndStatusOrderByLastSeenAtDesc(user, SessionStatus.ACTIVE)
                .or(() -> userSessionRepository.findTopByUserAndStatusOrderByLastSeenAtDesc(user, SessionStatus.CHALLENGED));
    }

    @Transactional
    public UserSession updateRisk(UserSession session, int score, RiskLevel level) {
        session.setRiskScore(score);
        session.setRiskLevel(level);
        session.setStatus(score >= 85 ? SessionStatus.CHALLENGED : SessionStatus.ACTIVE);
        session.setLastSeenAt(Instant.now());
        return userSessionRepository.save(session);
    }

    @Transactional
    public void revoke(UserSession session, String reason) {
        session.setStatus(SessionStatus.REVOKED);
        session.setRevokeReason(reason);
        session.setLastSeenAt(Instant.now());
        userSessionRepository.save(session);
    }
}
