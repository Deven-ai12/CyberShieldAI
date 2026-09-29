package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.UserTrustProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserTrustProfileRepository extends JpaRepository<UserTrustProfile, UUID> {

    Optional<UserTrustProfile> findByUser(AppUser user);
}
