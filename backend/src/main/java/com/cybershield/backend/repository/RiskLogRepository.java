package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.RiskLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RiskLogRepository extends JpaRepository<RiskLog, UUID> {

    Optional<RiskLog> findTopByUserOrderByEvaluatedAtDesc(AppUser user);

    List<RiskLog> findTop20ByUserOrderByEvaluatedAtDesc(AppUser user);

    List<RiskLog> findTop50ByOrderByEvaluatedAtDesc();
}
