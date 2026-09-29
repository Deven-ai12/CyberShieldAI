package com.cybershield.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
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
        name = "behaviors",
        indexes = {
                @Index(name = "idx_behaviors_user_captured", columnList = "user_id,capturedAt"),
                @Index(name = "idx_behaviors_session_captured", columnList = "session_id,capturedAt"),
                @Index(name = "idx_behaviors_risk", columnList = "riskScore")
        }
)
public class BehaviorEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private UserSession session;

    @Column(length = 120)
    private String deviceFingerprint;

    @Column(nullable = false)
    private int typingSpeed;

    @Column(nullable = false)
    private int typingRhythm;

    @Column(nullable = false)
    private double mouseMovementSpeed;

    @Column(nullable = false)
    private int clickFrequency;

    @Column(nullable = false)
    private boolean rageClickDetected;

    @Column(nullable = false)
    private boolean copyPasteDetected;

    @Column(nullable = false)
    private boolean autofillDetected;

    @Column(nullable = false)
    private int tabSwitchCount;

    @Column(nullable = false)
    private int inactiveTime;

    @Column(nullable = false)
    private int scrollDepth;

    @Column(nullable = false)
    private int scrollVelocity;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String mousePathJson;

    @Column(nullable = false)
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private RiskLevel riskLevel;

    @Column(nullable = false)
    private Instant capturedAt;
}
