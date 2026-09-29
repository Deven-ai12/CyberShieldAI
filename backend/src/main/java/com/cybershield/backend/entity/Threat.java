package com.cybershield.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
        name = "threats",
        indexes = {
                @Index(name = "idx_threats_user_detected", columnList = "user_id,detectedAt"),
                @Index(name = "idx_threats_type_status", columnList = "type,status"),
                @Index(name = "idx_threats_severity", columnList = "severity")
        }
)
public class Threat extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private UserSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ThreatType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private RiskLevel severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ThreatStatus status;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private int riskScore;

    @Column(length = 80)
    private String sourceIp;

    @Column(length = 80)
    private String actionTaken;

    @Column(nullable = false)
    private Instant detectedAt;
}
