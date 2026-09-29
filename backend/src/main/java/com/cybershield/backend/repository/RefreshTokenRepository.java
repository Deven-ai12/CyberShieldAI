package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.RefreshToken;
import com.cybershield.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(AppUser user);

    void deleteBySession(UserSession session);
}
