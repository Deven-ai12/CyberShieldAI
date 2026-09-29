package com.cybershield.backend.dto;

import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.SessionStatus;
import com.cybershield.backend.entity.UserSession;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        String deviceFingerprint,
        String ipAddress,
        SessionStatus status,
        int riskScore,
        RiskLevel riskLevel,
        Instant startedAt,
        Instant lastSeenAt,
        Instant expiresAt
) {
    public static SessionResponse from(UserSession session) {
        return new SessionResponse(
                session.getId(),
                session.getDeviceFingerprint(),
                session.getIpAddress(),
                session.getStatus(),
                session.getRiskScore(),
                session.getRiskLevel(),
                session.getStartedAt(),
                session.getLastSeenAt(),
                session.getExpiresAt()
        );
    }
}
