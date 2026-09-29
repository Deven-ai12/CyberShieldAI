package com.cybershield.backend.dto;

import java.time.Instant;

public record VerifyResetOtpResponse(
        String email,
        String resetToken,
        Instant expiresAt
) {
}
