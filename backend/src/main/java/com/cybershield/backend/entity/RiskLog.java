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
        name = "risk_logs",
        indexes = {
                @Index(name = "idx_risk_logs_user_created", columnList = "user_id,createdAt"),
                @Index(name = "idx_risk_logs_score", columnList = "score")
        }
)
public class RiskLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private UserSession session;

    @Column(nullable = false)
    private int score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private RiskLevel level;

    @Column(nullable = false, length = 500)
    private String reason;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String signalsJson;

    @Column(nullable = false)
    private Instant evaluatedAt;
}
