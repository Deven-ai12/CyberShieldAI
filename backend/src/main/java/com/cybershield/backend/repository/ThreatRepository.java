package com.cybershield.backend.repository;

import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.Threat;
import com.cybershield.backend.entity.ThreatStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ThreatRepository extends JpaRepository<Threat, UUID> {

    List<Threat> findTop25ByOrderByDetectedAtDesc();

    long countByStatus(ThreatStatus status);

    long countBySeverity(RiskLevel severity);
}
