package com.cybershield.backend.dto;

import com.cybershield.backend.entity.BehaviorEvent;
import com.cybershield.backend.entity.RiskLevel;

import java.time.Instant;

public record BehaviorSnapshotResponse(
        int typingSpeed,
        int mouseMovementSpeed,
        int clickFrequency,
        boolean copyPasteDetected,
        boolean autofillDetected,
        int tabSwitchCount,
        int riskScore,
        RiskLevel riskLevel,
        Instant capturedAt
) {
    public static BehaviorSnapshotResponse from(BehaviorEvent event) {
        return new BehaviorSnapshotResponse(
                event.getTypingSpeed(),
                (int) Math.round(event.getMouseMovementSpeed()),
                event.getClickFrequency(),
                event.isCopyPasteDetected(),
                event.isAutofillDetected(),
                event.getTabSwitchCount(),
                event.getRiskScore(),
                event.getRiskLevel(),
                event.getCapturedAt()
        );
    }
}
