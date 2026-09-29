package com.cybershield.backend.service;

import com.cybershield.backend.dto.DeviceProfileRequest;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.Device;
import com.cybershield.backend.repository.DeviceRepository;
import com.cybershield.backend.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    @Transactional
    public Device upsertDevice(AppUser user, String fingerprint, DeviceProfileRequest profile, HttpServletRequest request) {
        String resolvedFingerprint = resolveFingerprint(user, fingerprint, profile);
        Instant now = Instant.now();
        boolean firstKnownDevice = deviceRepository.findTop10ByUserOrderByLastSeenAtDesc(user).isEmpty();
        Device device = deviceRepository.findByUserAndFingerprint(user, resolvedFingerprint)
                .orElseGet(() -> Device.builder()
                        .user(user)
                        .fingerprint(resolvedFingerprint)
                        .firstSeenAt(now)
                        .trusted(firstKnownDevice)
                        .trustScore(firstKnownDevice ? 100 : 45)
                        .riskReason(firstKnownDevice ? "First trusted device" : "New device requires adaptive verification")
                        .build());

        device.setPlatform(firstNonBlank(profile == null ? null : profile.platform(), device.getPlatform(), "Trusted workstation"));
        device.setBrowser(firstNonBlank(profile == null ? null : profile.browser(), device.getBrowser(), "Secure browser"));
        device.setScreen(firstNonBlank(profile == null ? null : profile.screen(), device.getScreen(), "Unknown"));
        device.setTimezone(firstNonBlank(profile == null ? null : profile.timezone(), device.getTimezone(), "UTC"));
        device.setIpAddress(RequestUtils.clientIp(request));
        if (device.isTrusted()) {
            device.setTrustScore(Math.max(device.getTrustScore(), 85));
            device.setRiskReason("Recognized trusted device");
        }
        device.setLastSeenAt(now);
        return deviceRepository.save(device);
    }

    @Transactional(readOnly = true)
    public List<Device> recentDevices(AppUser user) {
        return deviceRepository.findTop10ByUserOrderByLastSeenAtDesc(user);
    }

    private String resolveFingerprint(AppUser user, String fingerprint, DeviceProfileRequest profile) {
        if (fingerprint != null && !fingerprint.isBlank()) {
            return fingerprint;
        }
        if (profile != null && profile.fingerprint() != null && !profile.fingerprint().isBlank()) {
            return profile.fingerprint();
        }
        return "unknown-" + Math.abs(user.getEmail().hashCode());
    }

    private String firstNonBlank(String first, String second, String fallback) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return fallback;
    }
}
