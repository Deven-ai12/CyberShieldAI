package com.cybershield.backend.repository;

import com.cybershield.backend.entity.Alert;
import com.cybershield.backend.entity.AlertStatus;
import com.cybershield.backend.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    List<Alert> findTop20ByOrderByCreatedAtDesc();

    List<Alert> findTop20ByUserOrderByCreatedAtDesc(AppUser user);

    long countByStatus(AlertStatus status);
}
