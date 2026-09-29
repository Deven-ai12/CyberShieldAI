package com.cybershield.backend.dto;

import com.cybershield.backend.entity.SessionStatus;

import java.time.Instant;
import java.util.UUID;

public record SessionBlockResponse(
        UUID sessionId,
        SessionStatus status,
        boolean blocked,
        String message,
        Instant blockedAt
) {
}
