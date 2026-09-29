package com.cybershield.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.Instant;
import java.util.List;

public record BehaviorTrackRequest(
        @Min(0)
        @Max(400)
        int typingSpeed,

        @Min(0)
        @Max(100)
        Integer typingRhythm,

        @Min(0)
        double mouseMovementSpeed,

        List<MousePointRequest> mousePath,

        @Min(0)
        int clickFrequency,

        boolean rageClickDetected,
        boolean copyPasteDetected,
        boolean autofillDetected,

        @Min(0)
        int tabSwitchCount,

        @Min(0)
        int inactiveTime,

        @Min(0)
        @Max(100)
        int scrollDepth,

        @Min(0)
        int scrollVelocity,

        String deviceFingerprint,
        Instant capturedAt
) {
    public int safeTypingRhythm() {
        return typingRhythm == null ? 100 : typingRhythm;
    }
}
