package com.cybershield.backend.config;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.Role;
import com.cybershield.backend.entity.UserStatus;
import com.cybershield.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            createUserIfMissing(
                    "Security Analyst",
                    "analyst@neuroshield.ai",
                    "Secure@1234",
                    Role.ADMIN,
                    "Private Banking"
            );
            createUserIfMissing(
                    "Demo Banking User",
                    "customer@neuroshield.ai",
                    "Secure@1234",
                    Role.USER,
                    "Retail Banking"
            );
        };
    }

    private void createUserIfMissing(String name, String email, String password, Role role, String tier) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }
        AppUser user = AppUser.builder()
                .fullName(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .status(UserStatus.ACTIVE)
                .mfaEnabled(false)
                .accountTier(tier)
                .build();
        userRepository.save(user);
    }
}
