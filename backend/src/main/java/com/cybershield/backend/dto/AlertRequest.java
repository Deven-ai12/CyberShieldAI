package com.cybershield.backend.dto;

import com.cybershield.backend.entity.AlertType;
import com.cybershield.backend.entity.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlertRequest(
        AlertType type,
        RiskLevel severity,

        @NotBlank(message = "Alert title is required")
        @Size(max = 180)
        String title,

        @NotBlank(message = "Alert message is required")
        @Size(max = 1000)
        String message,

        String channel,
        String recipientEmail
) {
}
