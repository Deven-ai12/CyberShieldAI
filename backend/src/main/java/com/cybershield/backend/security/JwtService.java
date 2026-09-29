package com.cybershield.backend.security;

import com.cybershield.backend.config.JwtProperties;
import com.cybershield.backend.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = buildSigningKey(jwtProperties.secret());
    }

    public String generateAccessToken(AppUser user, UUID sessionId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(getAccessTokenExpirationSeconds());
        return Jwts.builder()
                .claims(Map.of(
                        "userId", user.getId().toString(),
                        "role", user.getRole().name(),
                        "sessionId", sessionId == null ? "" : sessionId.toString()
                ))
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public UUID extractSessionId(String token) {
        String sessionId = extractAllClaims(token).get("sessionId", String.class);
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }
        return UUID.fromString(sessionId);
    }

    public boolean isTokenValid(String token, AppUser user) {
        String username = extractUsername(token);
        return username.equalsIgnoreCase(user.getEmail()) && !isTokenExpired(token);
    }

    public long getAccessTokenExpirationSeconds() {
        return jwtProperties.accessTokenExpirationMinutes() * 60;
    }

    public Instant getAccessTokenExpiresAt() {
        return Instant.now().plusSeconds(getAccessTokenExpirationSeconds());
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey buildSigningKey(String secret) {
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        } catch (RuntimeException ignored) {
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
    }
}
