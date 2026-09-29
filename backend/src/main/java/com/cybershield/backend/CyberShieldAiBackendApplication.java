package com.cybershield.backend;

import com.cybershield.backend.config.MailProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(MailProperties.class)
public class CyberShieldAiBackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(CyberShieldAiBackendApplication.class, args);

    }
}
