package com.cybershield.backend.service;

import com.cybershield.backend.dto.BehaviorTrackRequest;
import com.cybershield.backend.dto.TransactionRiskContext;
import com.cybershield.backend.dto.TransferRequest;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.BankingTransaction;
import com.cybershield.backend.entity.Device;
import com.cybershield.backend.entity.TransactionStatus;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.entity.UserTrustProfile;
import com.cybershield.backend.repository.BankingTransactionRepository;
import com.cybershield.backend.repository.DeviceRepository;
import com.cybershield.backend.repository.UserTrustProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdaptiveTrustService {

    private static final BigDecimal DEFAULT_AVG_TRANSFER = new BigDecimal("15000.00");
    private static final BigDecimal DEFAULT_MAX_TRANSFER = new BigDecimal("30000.00");

    private final UserTrustProfileRepository trustProfileRepository;
    private final BankingTransactionRepository transactionRepository;
    private final DeviceRepository deviceRepository;

    @Transactional
    public UserTrustProfile getOrCreateProfile(AppUser user) {
        return trustProfileRepository.findByUser(user)
                .orElseGet(() -> trustProfileRepository.save(UserTrustProfile.builder()
                        .user(user)
                        .behaviorSamples(0)
                        .avgTypingSpeed(75)
                        .avgTypingRhythm(78)
                        .avgMouseMovementSpeed(420)
                        .avgClickFrequency(12)
                        .usualLoginStartHour(6)
                        .usualLoginEndHour(23)
                        .avgTransferAmount(DEFAULT_AVG_TRANSFER)
                        .maxTrustedTransferAmount(DEFAULT_MAX_TRANSFER)
                        .knownBeneficiaries(0)
                        .build()));
    }

    @Transactional
    public void learnBehavior(AppUser user, BehaviorTrackRequest request, int riskScore) {
        if (riskScore >= 45) {
            return;
        }
        UserTrustProfile profile = getOrCreateProfile(user);
        int samples = profile.getBehaviorSamples();
        int nextSamples = Math.min(samples + 1, 1000);
        double weight = samples == 0 ? 1.0 : 0.12;

        profile.setAvgTypingSpeed(weighted(profile.getAvgTypingSpeed(), request.typingSpeed(), weight));
        profile.setAvgTypingRhythm(weighted(profile.getAvgTypingRhythm(), request.safeTypingRhythm(), weight));
        profile.setAvgMouseMovementSpeed(weighted(profile.getAvgMouseMovementSpeed(), request.mouseMovementSpeed(), weight));
        profile.setAvgClickFrequency(weighted(profile.getAvgClickFrequency(), request.clickFrequency(), weight));
        profile.setBehaviorSamples(nextSamples);
        profile.setLastLearnedAt(ZonedDateTime.now(ZoneOffset.UTC).toInstant());
        trustProfileRepository.save(profile);
    }

    @Transactional
    public void learnCompletedTransfer(AppUser user, BankingTransaction transaction) {
        if (transaction.getStatus() != TransactionStatus.COMPLETED && transaction.getStatus() != TransactionStatus.APPROVED) {
            return;
        }
        UserTrustProfile profile = getOrCreateProfile(user);
        BigDecimal learnedAverage = profile.getAvgTransferAmount()
                .multiply(new BigDecimal("0.85"))
                .add(transaction.getAmount().multiply(new BigDecimal("0.15")))
                .setScale(2, RoundingMode.HALF_UP);
        profile.setAvgTransferAmount(learnedAverage);
        profile.setMaxTrustedTransferAmount(learnedAverage.multiply(new BigDecimal("2.5")).max(DEFAULT_MAX_TRANSFER).setScale(2, RoundingMode.HALF_UP));
        profile.setKnownBeneficiaries((int) transactionRepository.findTop20ByUserOrderByRequestedAtDesc(user).stream()
                .map(BankingTransaction::getAccountNumber)
                .distinct()
                .count());
        profile.setLastLearnedAt(ZonedDateTime.now(ZoneOffset.UTC).toInstant());
        trustProfileRepository.save(profile);
    }

    @Transactional
    public TransactionRiskContext assessTransaction(AppUser user, UserSession session, TransferRequest request) {
        UserTrustProfile profile = getOrCreateProfile(user);
        Device device = session == null || session.getDeviceFingerprint() == null
                ? null
                : deviceRepository.findByUserAndFingerprint(user, session.getDeviceFingerprint()).orElse(null);

        boolean knownBeneficiary = transactionRepository.existsByUserAndAccountNumberAndStatusIn(
                user,
                request.accountNumber(),
                List.of(TransactionStatus.COMPLETED, TransactionStatus.APPROVED)
        );
        boolean newBeneficiary = !knownBeneficiary;
        boolean untrustedDevice = device != null && (!device.isTrusted() || device.getTrustScore() < 65);
        boolean amountAboveBaseline = request.amount().compareTo(profile.getMaxTrustedTransferAmount()) > 0;
        boolean unusualLoginHour = isOutsideUsualHours(profile);
        boolean lowProfileConfidence = profile.getBehaviorSamples() < 5;

        List<String> signals = new ArrayList<>();
        if (newBeneficiary) {
            signals.add("New beneficiary has no trusted transfer history");
        }
        if (untrustedDevice) {
            signals.add("Current device is not fully trusted");
        }
        if (amountAboveBaseline) {
            signals.add("Amount is above learned transfer baseline of " + profile.getMaxTrustedTransferAmount());
        }
        if (unusualLoginHour) {
            signals.add("Transfer was attempted outside usual login hours");
        }
        if (lowProfileConfidence) {
            signals.add("User trust profile is still learning");
        }
        if (signals.isEmpty()) {
            signals.add("Device, beneficiary, timing, and amount match trusted profile");
        }

        return new TransactionRiskContext(
                newBeneficiary,
                untrustedDevice,
                amountAboveBaseline,
                unusualLoginHour,
                lowProfileConfidence,
                device == null ? 50 : device.getTrustScore(),
                signals
        );
    }

    private boolean isOutsideUsualHours(UserTrustProfile profile) {
        int hour = ZonedDateTime.now(ZoneOffset.UTC).getHour();
        return hour < profile.getUsualLoginStartHour() || hour > profile.getUsualLoginEndHour();
    }

    private double weighted(double current, double next, double weight) {
        return current * (1 - weight) + next * weight;
    }
}
