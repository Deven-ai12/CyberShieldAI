package com.cybershield.backend.dto;

import com.cybershield.backend.entity.Alert;
import com.cybershield.backend.entity.AlertStatus;
import com.cybershield.backend.entity.AlertType;
import com.cybershield.backend.entity.RiskLevel;

import java.time.Instant;
import java.util.UUID;

public record AlertResponse(
        UUID id,
        AlertType type,
        RiskLevel severity,
        AlertStatus status,
        String title,
        String message,
        String channel,
        String recipientEmail,
        Instant sentAt,
        Instant createdAt
) {
    public static AlertResponse from(Alert alert) {
        return new AlertResponse(
                alert.getId(),
                alert.getType(),
                alert.getSeverity(),
                alert.getStatus(),
                alert.getTitle(),
                alert.getMessage(),
                alert.getChannel(),
                alert.getRecipientEmail(),
                alert.getSentAt(),
                alert.getCreatedAt()
        );
    }
}
