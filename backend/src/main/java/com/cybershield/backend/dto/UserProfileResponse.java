package com.cybershield.backend.dto;

import java.util.List;

public record UserProfileResponse(
        UserSummaryResponse user,
        List<DeviceResponse> devices,
        List<SessionResponse> sessions,
        List<LoginHistoryResponse> loginHistory,
        TrustProfileResponse trustProfile
) {
}
