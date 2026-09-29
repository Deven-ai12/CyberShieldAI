package com.cybershield.backend.dto;

import com.cybershield.backend.entity.Device;

import java.time.Instant;
import java.util.UUID;

public record DeviceResponse(
        UUID id,
        String fingerprint,
        String platform,
        String browser,
        String screen,
        String timezone,
        String ipAddress,
        boolean trusted,
        int trustScore,
        String riskReason,
        Instant firstSeenAt,
        Instant lastSeenAt
) {
    public static DeviceResponse from(Device device) {
        return new DeviceResponse(
                device.getId(),
                device.getFingerprint(),
                device.getPlatform(),
                device.getBrowser(),
                device.getScreen(),
                device.getTimezone(),
                device.getIpAddress(),
                device.isTrusted(),
                device.getTrustScore(),
                device.getRiskReason(),
                device.getFirstSeenAt(),
                device.getLastSeenAt()
        );
    }
}
