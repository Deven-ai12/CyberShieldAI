package com.cybershield.backend.dto;

import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.Threat;
import com.cybershield.backend.entity.ThreatStatus;
import com.cybershield.backend.entity.ThreatType;

import java.time.Instant;
import java.util.UUID;

public record ThreatResponse(
        UUID id,
        ThreatType type,
        RiskLevel severity,
        ThreatStatus status,
        String title,
        String description,
        int riskScore,
        String sourceIp,
        String actionTaken,
        Instant detectedAt
) {
    public static ThreatResponse from(Threat threat) {
        return new ThreatResponse(
                threat.getId(),
                threat.getType(),
                threat.getSeverity(),
                threat.getStatus(),
                threat.getTitle(),
                threat.getDescription(),
                threat.getRiskScore(),
                threat.getSourceIp(),
                threat.getActionTaken(),
                threat.getDetectedAt()
        );
    }
}
