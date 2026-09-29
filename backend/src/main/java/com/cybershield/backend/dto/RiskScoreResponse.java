package com.cybershield.backend.dto;

import com.cybershield.backend.entity.RiskLevel;

import java.time.Instant;
import java.util.List;

public record RiskScoreResponse(
        int score,
        RiskLevel level,
        List<String> signals,
        Instant evaluatedAt
) {
}
