package com.cybershield.backend.dto;

import java.time.Instant;

public record HealthResponse(
        String service,
        String status,
        Instant checkedAt
) {
}
