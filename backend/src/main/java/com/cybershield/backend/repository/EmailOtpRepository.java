package com.cybershield.backend.repository;

import com.cybershield.backend.entity.EmailOtp;
import com.cybershield.backend.entity.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, UUID> {

    Optional<EmailOtp> findTopByEmailIgnoreCaseAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(
            String email,
            OtpPurpose purpose
    );

    Optional<EmailOtp> findByResetTokenHashAndPurposeAndResetCompletedAtIsNull(
            String resetTokenHash,
            OtpPurpose purpose
    );
}
