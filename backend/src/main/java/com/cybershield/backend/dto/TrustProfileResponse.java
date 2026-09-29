package com.cybershield.backend.dto;

import com.cybershield.backend.entity.UserTrustProfile;

import java.math.BigDecimal;

public record TrustProfileResponse(
        int behaviorSamples,
        double avgTypingSpeed,
        double avgTypingRhythm,
        double avgMouseMovementSpeed,
        double avgClickFrequency,
        BigDecimal avgTransferAmount,
        BigDecimal maxTrustedTransferAmount,
        int knownBeneficiaries
) {
    public static TrustProfileResponse from(UserTrustProfile profile) {
        return new TrustProfileResponse(
                profile.getBehaviorSamples(),
                profile.getAvgTypingSpeed(),
                profile.getAvgTypingRhythm(),
                profile.getAvgMouseMovementSpeed(),
                profile.getAvgClickFrequency(),
                profile.getAvgTransferAmount(),
                profile.getMaxTrustedTransferAmount(),
                profile.getKnownBeneficiaries()
        );
    }
}
