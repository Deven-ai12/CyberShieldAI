package com.cybershield.backend.repository;

import com.cybershield.backend.entity.SessionBlockLink;
import com.cybershield.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SessionBlockLinkRepository extends JpaRepository<SessionBlockLink, UUID> {

    Optional<SessionBlockLink> findByTokenHash(String tokenHash);

    boolean existsBySessionAndUsedAtIsNullAndExpiresAtAfterAndNotificationSentAtIsNotNullAndCreatedAtAfter(
            UserSession session,
            Instant now,
            Instant createdAfter
    );
}
