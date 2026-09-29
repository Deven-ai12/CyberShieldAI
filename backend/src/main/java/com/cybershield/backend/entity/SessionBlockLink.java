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
        name = "session_block_links",
        indexes = {
                @Index(name = "idx_session_block_token", columnList = "tokenHash", unique = true),
                @Index(name = "idx_session_block_session", columnList = "session_id"),
                @Index(name = "idx_session_block_user_created", columnList = "user_id,createdAt")
        }
)
public class SessionBlockLink extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private UserSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "threat_id")
    private Threat threat;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private RiskLevel riskLevel;

    @Column(nullable = false, length = 1600)
    private String reason;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column
    private Instant notificationSentAt;

    @Column
    private Instant usedAt;

    @Column(length = 80)
    private String usedIpAddress;

    @Column(length = 500)
    private String usedUserAgent;
}
