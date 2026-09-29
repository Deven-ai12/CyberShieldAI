package com.cybershield.backend.service;

import com.cybershield.backend.dto.AdminLogResponse;
import com.cybershield.backend.dto.AlertResponse;
import com.cybershield.backend.dto.SessionResponse;
import com.cybershield.backend.dto.ThreatResponse;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.SessionStatus;
import com.cybershield.backend.entity.ThreatStatus;
import com.cybershield.backend.entity.TransactionStatus;
import com.cybershield.backend.repository.AlertRepository;
import com.cybershield.backend.repository.BankingTransactionRepository;
import com.cybershield.backend.repository.ThreatRepository;
import com.cybershield.backend.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ThreatRepository threatRepository;
    private final UserSessionRepository userSessionRepository;
    private final AlertRepository alertRepository;
    private final BankingTransactionRepository transactionRepository;
    private final TransactionService transactionService;

    @Transactional(readOnly = true)
    public AdminLogResponse logs() {
        Map<String, Long> severityBreakdown = Arrays.stream(RiskLevel.values())
                .collect(Collectors.toMap(Enum::name, threatRepository::countBySeverity));

        return new AdminLogResponse(
                threatRepository.countByStatus(ThreatStatus.BLOCKED),
                userSessionRepository.countByStatus(SessionStatus.ACTIVE) + userSessionRepository.countByStatus(SessionStatus.CHALLENGED),
                threatRepository.count(),
                transactionRepository.countByStatus(TransactionStatus.BLOCKED),
                severityBreakdown,
                threatRepository.findTop25ByOrderByDetectedAtDesc().stream().map(ThreatResponse::from).toList(),
                userSessionRepository.findTop25ByStatusOrderByLastSeenAtDesc(SessionStatus.ACTIVE).stream().map(SessionResponse::from).toList(),
                alertRepository.findTop20ByOrderByCreatedAtDesc().stream().map(AlertResponse::from).toList(),
                transactionRepository.findTop20ByOrderByRequestedAtDesc().stream()
                        .map(transaction -> transactionService.toResponse(transaction, "SOC transaction log"))
                        .toList()
        );
    }
}
