package com.cybershield.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.session-block")
public record SessionBlockLinkProperties(
        String baseUrl,
        long expirationMinutes
) {
}
