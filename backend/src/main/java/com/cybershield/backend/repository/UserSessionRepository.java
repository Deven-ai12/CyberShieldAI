package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.SessionStatus;
import com.cybershield.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByIdAndUser(UUID id, AppUser user);

    Optional<UserSession> findTopByUserAndStatusOrderByLastSeenAtDesc(AppUser user, SessionStatus status);

    List<UserSession> findTop25ByStatusOrderByLastSeenAtDesc(SessionStatus status);

    List<UserSession> findTop10ByUserOrderByLastSeenAtDesc(AppUser user);

    long countByStatus(SessionStatus status);
}
