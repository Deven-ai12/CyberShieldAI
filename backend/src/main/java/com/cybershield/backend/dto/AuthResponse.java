package com.cybershield.backend.dto;

import java.time.Instant;

public record AuthResponse(
        String token,
        String accessToken,
        String refreshToken,
        long expiresInSeconds,
        Instant expiresAt,
        UserSummaryResponse user
) {
}
