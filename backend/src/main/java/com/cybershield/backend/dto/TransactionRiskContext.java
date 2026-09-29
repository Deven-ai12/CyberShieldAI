package com.cybershield.backend.dto;

import java.util.List;

public record TransactionRiskContext(
        boolean newBeneficiary,
        boolean untrustedDevice,
        boolean amountAboveBaseline,
        boolean unusualLoginHour,
        boolean lowProfileConfidence,
        int deviceTrustScore,
        List<String> trustSignals
) {
}
