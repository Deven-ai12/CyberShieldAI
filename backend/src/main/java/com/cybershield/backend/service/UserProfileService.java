package com.cybershield.backend.service;

import com.cybershield.backend.dto.DeviceResponse;
import com.cybershield.backend.dto.LoginHistoryResponse;
import com.cybershield.backend.dto.SessionResponse;
import com.cybershield.backend.dto.TrustProfileResponse;
import com.cybershield.backend.dto.UserProfileResponse;
import com.cybershield.backend.dto.UserSummaryResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.repository.DeviceRepository;
import com.cybershield.backend.repository.LoginHistoryRepository;
import com.cybershield.backend.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final DeviceRepository deviceRepository;
    private final UserSessionRepository userSessionRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final AdaptiveTrustService adaptiveTrustService;

    @Transactional
    public UserProfileResponse profile(AppUser user) {
        String latestFingerprint = deviceRepository.findTop10ByUserOrderByLastSeenAtDesc(user).stream()
                .findFirst()
                .map(device -> device.getFingerprint())
                .orElse(null);

        return new UserProfileResponse(
                UserSummaryResponse.from(user, latestFingerprint),
                deviceRepository.findTop10ByUserOrderByLastSeenAtDesc(user).stream().map(DeviceResponse::from).toList(),
                userSessionRepository.findTop10ByUserOrderByLastSeenAtDesc(user).stream().map(SessionResponse::from).toList(),
                loginHistoryRepository.findTop10ByUserOrderByLoginAtDesc(user).stream().map(LoginHistoryResponse::from).toList(),
                TrustProfileResponse.from(adaptiveTrustService.getOrCreateProfile(user))
        );
    }
}
