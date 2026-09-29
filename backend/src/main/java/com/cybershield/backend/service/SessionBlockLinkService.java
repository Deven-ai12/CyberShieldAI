package com.cybershield.backend.service;

import com.cybershield.backend.config.SessionBlockLinkProperties;
import com.cybershield.backend.dto.SessionBlockResponse;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.SessionBlockLink;
import com.cybershield.backend.entity.SessionStatus;
import com.cybershield.backend.entity.Threat;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.exception.BadRequestException;
import com.cybershield.backend.exception.ResourceNotFoundException;
import com.cybershield.backend.repository.SessionBlockLinkRepository;
import com.cybershield.backend.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionBlockLinkService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int TOKEN_BYTES = 32;
    private static final long MIN_EXPIRATION_MINUTES = 5;
    private static final long NOTIFICATION_COOLDOWN_MINUTES = 10;

    private final SessionBlockLinkRepository sessionBlockLinkRepository;
    private final SessionBlockLinkProperties properties;
    private final UserSessionService userSessionService;
    private final RefreshTokenService refreshTokenService;
    private final WebSocketBroadcastService webSocketBroadcastService;

    @Transactional
    public Optional<GeneratedSessionBlockLink> createBlockLink(UserSession session, Threat threat, int riskScore, RiskLevel riskLevel, String reason) {
        if (session == null || session.getStatus() == SessionStatus.REVOKED) {
            return Optional.empty();
        }
        if (riskLevel != RiskLevel.HIGH && riskLevel != RiskLevel.CRITICAL) {
            return Optional.empty();
        }

        Instant now = Instant.now();
        boolean linkRecentlyGenerated = sessionBlockLinkRepository
                .existsBySessionAndUsedAtIsNullAndExpiresAtAfterAndNotificationSentAtIsNotNullAndCreatedAtAfter(
                        session,
                        now,
                        now.minusSeconds(NOTIFICATION_COOLDOWN_MINUTES * 60)
                );
        if (linkRecentlyGenerated) {
            return Optional.empty();
        }

        String rawToken = generateToken();
        SessionBlockLink link = SessionBlockLink.builder()
                .user(session.getUser())
                .session(session)
                .threat(threat)
                .tokenHash(hashToken(rawToken))
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .reason(trim(reason, 1600))
                .expiresAt(now.plusSeconds(expirationMinutes() * 60))
                .build();
        SessionBlockLink saved = sessionBlockLinkRepository.save(link);
        return Optional.of(new GeneratedSessionBlockLink(saved.getId(), blockUrl(rawToken)));
    }

    @Transactional
    public void markNotificationSent(UUID linkId) {
        sessionBlockLinkRepository.findById(linkId).ifPresent(link -> {
            link.setNotificationSentAt(Instant.now());
            sessionBlockLinkRepository.save(link);
        });
    }

    @Transactional
    public SessionBlockResponse blockSession(String rawToken, HttpServletRequest request) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("Session block token is required");
        }

        SessionBlockLink link = sessionBlockLinkRepository.findByTokenHash(hashToken(rawToken.trim()))
                .orElseThrow(() -> new ResourceNotFoundException("This session block link is invalid"));
        Instant now = Instant.now();
        if (link.getUsedAt() != null) {
            return new SessionBlockResponse(
                    link.getSession().getId(),
                    link.getSession().getStatus(),
                    link.getSession().getStatus() == SessionStatus.REVOKED,
                    "This session block link was already used",
                    link.getUsedAt()
            );
        }
        if (link.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("This session block link has expired");
        }

        UserSession session = link.getSession();
        boolean blockedNow = session.getStatus() != SessionStatus.REVOKED;
        if (blockedNow) {
            userSessionService.revoke(session, "Blocked by customer from high-risk email link");
            refreshTokenService.revokeForSession(session);
        }
        link.setUsedAt(now);
        link.setUsedIpAddress(RequestUtils.clientIp(request));
        link.setUsedUserAgent(RequestUtils.userAgent(request));
        sessionBlockLinkRepository.save(link);

        SessionBlockResponse response = new SessionBlockResponse(
                session.getId(),
                session.getStatus(),
                true,
                blockedNow ? "High-risk session blocked successfully" : "Session was already blocked",
                now
        );
        webSocketBroadcastService.broadcast("/topic/session-blocks", response);
        return response;
    }

    public long expirationMinutes() {
        return Math.max(MIN_EXPIRATION_MINUTES, properties.expirationMinutes());
    }

    private String blockUrl(String rawToken) {
        String baseUrl = properties.baseUrl() == null || properties.baseUrl().isBlank()
                ? "http://localhost:8080"
                : properties.baseUrl();
        return baseUrl.replaceAll("/+$", "") + "/api/session/block/" + rawToken;
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String trim(String value, int maxLength) {
        if (value == null) {
            return "High-risk session detected";
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength - 3) + "...";
    }

    public record GeneratedSessionBlockLink(UUID id, String url) {
    }
}
