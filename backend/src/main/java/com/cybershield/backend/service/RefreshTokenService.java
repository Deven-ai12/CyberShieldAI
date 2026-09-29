package com.cybershield.backend.service;

import com.cybershield.backend.config.JwtProperties;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.RefreshToken;
import com.cybershield.backend.entity.SessionStatus;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.exception.UnauthorizedException;
import com.cybershield.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;

    @Transactional
    public RefreshToken create(AppUser user, UserSession session) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .session(session)
                .token(UUID.randomUUID() + "." + UUID.randomUUID())
                .expiresAt(Instant.now().plusSeconds(jwtProperties.refreshTokenExpirationDays() * 24 * 60 * 60))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verify(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }
        UserSession session = refreshToken.getSession();
        if (session != null && session.getStatus() == SessionStatus.REVOKED) {
            throw new UnauthorizedException("Session has been blocked");
        }
        return refreshToken;
    }

    @Transactional
    public void revokeForUser(AppUser user) {
        refreshTokenRepository.deleteByUser(user);
    }

    @Transactional
    public void revokeForSession(UserSession session) {
        refreshTokenRepository.deleteBySession(session);
    }
}
