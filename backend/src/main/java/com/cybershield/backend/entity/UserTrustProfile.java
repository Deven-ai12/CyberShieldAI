package com.cybershield.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "user_trust_profiles",
        indexes = @Index(name = "idx_user_trust_profiles_user", columnList = "user_id", unique = true)
)
public class UserTrustProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(nullable = false)
    private int behaviorSamples;

    @Column(nullable = false)
    private double avgTypingSpeed;

    @Column(nullable = false)
    private double avgTypingRhythm;

    @Column(nullable = false)
    private double avgMouseMovementSpeed;

    @Column(nullable = false)
    private double avgClickFrequency;

    @Column(nullable = false)
    private int usualLoginStartHour;

    @Column(nullable = false)
    private int usualLoginEndHour;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal avgTransferAmount;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal maxTrustedTransferAmount;

    @Column(nullable = false)
    private int knownBeneficiaries;

    @Column
    private Instant lastLearnedAt;
}
