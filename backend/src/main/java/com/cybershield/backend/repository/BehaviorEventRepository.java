package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.BehaviorEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BehaviorEventRepository extends JpaRepository<BehaviorEvent, UUID> {

    List<BehaviorEvent> findTop20ByUserOrderByCapturedAtDesc(AppUser user);

    List<BehaviorEvent> findTop50ByOrderByCapturedAtDesc();
}
