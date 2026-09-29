package com.cybershield.backend.dto;

import java.time.Instant;

public record PasswordResetResponse(
        String email,
        String message,
        Instant resetAt
) {
}
