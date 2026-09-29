package com.cybershield.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record TransferRequest(
        @JsonAlias("beneficiary")
        @NotBlank(message = "Beneficiary is required")
        @Size(max = 180)
        String beneficiaryName,

        @NotBlank(message = "Account number is required")
        @Pattern(regexp = "\\d{8,18}", message = "Account number must be 8 to 18 digits")
        String accountNumber,

        @NotBlank(message = "Routing number is required")
        @Pattern(regexp = "\\d{9}", message = "Routing number must be 9 digits")
        String routingNumber,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "1.00", message = "Amount must be at least 1.00")
        BigDecimal amount,

        @Size(max = 500)
        String memo,

        Integer riskScore,
        List<String> failedChecks
) {
}
