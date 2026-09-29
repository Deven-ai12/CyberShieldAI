package com.cybershield.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "devices",
        uniqueConstraints = @UniqueConstraint(name = "uk_devices_user_fingerprint", columnNames = {"user_id", "fingerprint"}),
        indexes = {
                @Index(name = "idx_devices_fingerprint", columnList = "fingerprint"),
                @Index(name = "idx_devices_trusted", columnList = "trusted")
        }
)
public class Device extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 120)
    private String fingerprint;

    @Column(length = 120)
    private String platform;

    @Column(length = 120)
    private String browser;

    @Column(length = 60)
    private String screen;

    @Column(length = 80)
    private String timezone;

    @Column(length = 80)
    private String ipAddress;

    @Column(nullable = false)
    private boolean trusted;

    @Column(nullable = false, columnDefinition = "int default 100")
    private int trustScore;

    @Column(length = 500)
    private String riskReason;

    @Column
    private Instant firstSeenAt;

    @Column
    private Instant lastSeenAt;
}
