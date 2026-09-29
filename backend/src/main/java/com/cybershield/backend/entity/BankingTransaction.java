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

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "transactions",
        indexes = {
                @Index(name = "idx_transactions_reference", columnList = "reference", unique = true),
                @Index(name = "idx_transactions_user_requested", columnList = "user_id,requestedAt"),
                @Index(name = "idx_transactions_status", columnList = "status")
        }
)
public class BankingTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, unique = true, length = 80)
    private String reference;

    @Column(nullable = false, length = 180)
    private String beneficiaryName;

    @Column(nullable = false, length = 40)
    private String accountNumber;

    @Column(nullable = false, length = 20)
    private String routingNumber;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TransactionStatus status;

    @Column(nullable = false)
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private RiskLevel riskLevel;

    @Column(length = 1000)
    private String blockedReason;

    @Column(nullable = false)
    private Instant requestedAt;
}
