package com.cybershield.backend.service;

import com.cybershield.backend.dto.RiskEvaluation;
import com.cybershield.backend.dto.TransactionRiskContext;
import com.cybershield.backend.dto.TransferRequest;
import com.cybershield.backend.dto.TransferResponse;
import com.cybershield.backend.entity.AlertType;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.BankingTransaction;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.Threat;
import com.cybershield.backend.entity.ThreatStatus;
import com.cybershield.backend.entity.ThreatType;
import com.cybershield.backend.entity.TransactionStatus;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.repository.BankingTransactionRepository;
import com.cybershield.backend.repository.ThreatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final BankingTransactionRepository transactionRepository;
    private final ThreatRepository threatRepository;
    private final UserSessionService userSessionService;
    private final RiskEngineService riskEngineService;
    private final AdaptiveTrustService adaptiveTrustService;
    private final AlertService alertService;
    private final WebSocketBroadcastService webSocketBroadcastService;

    @Transactional
    public TransferResponse transfer(AppUser user, TransferRequest request) {
        UserSession session = userSessionService.latestActiveSession(user).orElse(null);
        int currentRisk = Math.max(session == null ? 18 : session.getRiskScore(), request.riskScore() == null ? 0 : request.riskScore());
        TransactionRiskContext trustContext = adaptiveTrustService.assessTransaction(user, session, request);
        RiskEvaluation evaluation = riskEngineService.evaluateTransaction(request.amount(), currentRisk, request.failedChecks(), trustContext);
        TransactionStatus status = statusFor(evaluation);
        String blockedReason = status == TransactionStatus.BLOCKED ? String.join("; ", evaluation.signals()) : null;

        BankingTransaction transaction = BankingTransaction.builder()
                .user(user)
                .reference("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .beneficiaryName(request.beneficiaryName())
                .accountNumber(request.accountNumber())
                .routingNumber(request.routingNumber())
                .amount(request.amount())
                .memo(request.memo())
                .status(status)
                .riskScore(evaluation.score())
                .riskLevel(evaluation.level())
                .blockedReason(blockedReason)
                .requestedAt(Instant.now())
                .build();
        BankingTransaction saved = transactionRepository.save(transaction);
        adaptiveTrustService.learnCompletedTransfer(user, saved);

        if (status != TransactionStatus.COMPLETED) {
            Threat threat = Threat.builder()
                    .user(user)
                    .session(session)
                    .type(ThreatType.SUSPICIOUS_TRANSACTION)
                    .severity(evaluation.level())
                    .status(status == TransactionStatus.BLOCKED ? ThreatStatus.BLOCKED : ThreatStatus.CHALLENGED)
                    .title(status == TransactionStatus.BLOCKED ? "Suspicious transaction blocked" : "Transaction requires fraud review")
                    .description(String.join("; ", evaluation.signals()))
                    .riskScore(evaluation.score())
                    .actionTaken(status == TransactionStatus.BLOCKED ? "transfer blocked" : "transfer placed in pending review")
                    .detectedAt(Instant.now())
                    .build();
            Threat savedThreat = threatRepository.save(threat);
            alertService.createAndDispatch(
                    user,
                    savedThreat,
                    AlertType.SUSPICIOUS_TRANSACTION,
                    evaluation.level(),
                    savedThreat.getTitle(),
                    savedThreat.getDescription()
            );
        }

        TransferResponse response = toResponse(saved, messageFor(status), trustContext.trustSignals(), stepUpRequired(status, evaluation));
        webSocketBroadcastService.broadcast("/topic/transactions", response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<TransferResponse> recentTransactions() {
        return transactionRepository.findTop20ByOrderByRequestedAtDesc().stream()
                .map(transaction -> toResponse(transaction, messageFor(transaction.getStatus())))
                .toList();
    }

    public TransferResponse toResponse(BankingTransaction transaction, String message) {
        return toResponse(transaction, message, List.of(), stepUpRequired(transaction.getStatus(), transaction.getRiskScore()));
    }

    private TransferResponse toResponse(BankingTransaction transaction, String message, List<String> trustSignals, boolean stepUpRequired) {
        return new TransferResponse(
                transaction.getId(),
                transaction.getReference(),
                transaction.getStatus(),
                transaction.getAmount(),
                transaction.getBeneficiaryName(),
                transaction.getRiskScore(),
                transaction.getRiskLevel(),
                stepUpRequired,
                stepUpRequired ? stepUpReason(transaction.getStatus(), transaction.getRiskScore()) : null,
                trustSignals,
                message,
                transaction.getRequestedAt()
        );
    }

    private TransactionStatus statusFor(RiskEvaluation evaluation) {
        if (evaluation.score() >= 75 || evaluation.level() == RiskLevel.CRITICAL) {
            return TransactionStatus.BLOCKED;
        }
        if (evaluation.score() >= 55) {
            return TransactionStatus.PENDING_REVIEW;
        }
        return TransactionStatus.COMPLETED;
    }

    private String messageFor(TransactionStatus status) {
        return switch (status) {
            case BLOCKED -> "Transfer blocked by AI fraud controls";
            case PENDING_REVIEW -> "Transfer is pending adaptive fraud review";
            case COMPLETED -> "Transfer approved and completed";
            case APPROVED -> "Transfer approved";
            case FAILED -> "Transfer failed";
        };
    }

    private boolean stepUpRequired(TransactionStatus status, RiskEvaluation evaluation) {
        return stepUpRequired(status, evaluation.score());
    }

    private boolean stepUpRequired(TransactionStatus status, int riskScore) {
        return status == TransactionStatus.PENDING_REVIEW || status == TransactionStatus.BLOCKED || riskScore >= 55;
    }

    private String stepUpReason(TransactionStatus status, int riskScore) {
        if (status == TransactionStatus.BLOCKED) {
            return "Critical context risk requires manual SOC review before funds can move";
        }
        if (status == TransactionStatus.PENDING_REVIEW) {
            return "Adaptive MFA or analyst approval is required before release";
        }
        if (riskScore >= 55) {
            return "Medium risk transfer requires step-up verification";
        }
        return null;
    }
}
