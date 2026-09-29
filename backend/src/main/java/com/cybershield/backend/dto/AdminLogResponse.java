package com.cybershield.backend.dto;

import java.util.List;
import java.util.Map;

public record AdminLogResponse(
        long totalThreatsBlocked,
        long activeSessions,
        long fraudAttempts,
        long blockedTransactions,
        Map<String, Long> severityBreakdown,
        List<ThreatResponse> threats,
        List<SessionResponse> sessions,
        List<AlertResponse> alerts,
        List<TransferResponse> transactions
) {
}
