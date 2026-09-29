package com.cybershield.backend.repository;

import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {

    Optional<Device> findByUserAndFingerprint(AppUser user, String fingerprint);

    List<Device> findTop10ByUserOrderByLastSeenAtDesc(AppUser user);
}
