package com.cybershield.backend.dto;

import java.time.Instant;

public record OtpDispatchResponse(
        String email,
        String message,
        Instant expiresAt,
        Instant resendAvailableAt
) {
}
