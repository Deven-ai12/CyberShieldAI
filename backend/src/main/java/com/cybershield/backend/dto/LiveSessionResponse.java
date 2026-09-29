package com.cybershield.backend.dto;

import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.SessionStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record LiveSessionResponse(
        UUID sessionId,
        SessionStatus status,
        int riskScore,
        RiskLevel riskLevel,
        String deviceFingerprint,
        Instant lastSeenAt,
        List<DeviceResponse> activeDevices,
        List<BehaviorSnapshotResponse> recentBehaviors
) {
}
