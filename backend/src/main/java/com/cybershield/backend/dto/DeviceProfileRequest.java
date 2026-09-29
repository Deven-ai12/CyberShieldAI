package com.cybershield.backend.dto;

public record DeviceProfileRequest(
        String fingerprint,
        String platform,
        String browser,
        String screen,
        String timezone
) {
}
