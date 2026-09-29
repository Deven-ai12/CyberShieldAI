package com.cybershield.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        CorsProperties.class,
        JwtProperties.class,
        MailProperties.class,
        SessionBlockLinkProperties.class
})
public class WebConfig {
}
