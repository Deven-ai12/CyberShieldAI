package com.cybershield.backend.dto;

import com.cybershield.backend.entity.LoginHistory;

import java.time.Instant;
import java.util.UUID;

public record LoginHistoryResponse(
        UUID id,
        String ipAddress,
        String userAgent,
        String deviceFingerprint,
        boolean successful,
        String reason,
        Instant loginAt
) {
    public static LoginHistoryResponse from(LoginHistory history) {
        return new LoginHistoryResponse(
                history.getId(),
                history.getIpAddress(),
                history.getUserAgent(),
                history.getDeviceFingerprint(),
                history.isSuccessful(),
                history.getReason(),
                history.getLoginAt()
        );
    }
}
