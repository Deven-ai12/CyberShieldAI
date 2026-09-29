package com.cybershield.backend.dto;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.Role;

import java.time.Instant;
import java.util.UUID;

public record UserSummaryResponse(
        UUID id,
        String name,
        String fullName,
        String email,
        Role role,
        String accountTier,
        String deviceFingerprint,
        Instant lastLogin
) {
    public static UserSummaryResponse from(AppUser user, String deviceFingerprint) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getAccountTier(),
                deviceFingerprint,
                user.getLastLoginAt()
        );
    }
}
