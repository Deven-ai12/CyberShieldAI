package com.cybershield.backend.dto;

import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.ThreatType;

import java.util.List;

public record RiskEvaluation(
        int score,
        RiskLevel level,
        List<String> signals,
        List<ThreatType> threatTypes,
        boolean hijackSuspected
) {
}
