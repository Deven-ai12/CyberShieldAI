package com.cybershield.backend.dto;

import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.TransactionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransferResponse(
        UUID transactionId,
        String reference,
        TransactionStatus status,
        BigDecimal amount,
        String beneficiaryName,
        int riskScore,
        RiskLevel riskLevel,
        boolean stepUpRequired,
        String stepUpReason,
        java.util.List<String> trustSignals,
        String message,
        Instant requestedAt
) {
}
