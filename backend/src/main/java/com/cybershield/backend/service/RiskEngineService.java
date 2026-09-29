package com.cybershield.backend.service;

import com.cybershield.backend.dto.BehaviorTrackRequest;
import com.cybershield.backend.dto.RiskEvaluation;
import com.cybershield.backend.dto.TransactionRiskContext;
import com.cybershield.backend.entity.RiskLevel;
import com.cybershield.backend.entity.ThreatType;
import com.cybershield.backend.entity.UserSession;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class RiskEngineService {

    public RiskEvaluation evaluateBehavior(BehaviorTrackRequest request, UserSession session) {
        int score = Math.max(8, session == null ? 0 : session.getRiskScore() / 3);
        List<String> signals = new ArrayList<>();
        List<ThreatType> threatTypes = new ArrayList<>();
        boolean hijackSuspected = false;

        if (request.typingSpeed() > 130) {
            score += 12;
            signals.add("Typing speed exceeded trusted human baseline");
            threatTypes.add(ThreatType.ABNORMAL_TYPING);
        }
        if (request.typingSpeed() > 180) {
            score += 15;
            signals.add("Impossible typing velocity detected");
        }
        if (request.safeTypingRhythm() < 55) {
            score += 10;
            signals.add("Typing rhythm variance is abnormal");
            threatTypes.add(ThreatType.ABNORMAL_TYPING);
        }
        if (request.mouseMovementSpeed() > 850) {
            score += 12;
            signals.add("Mouse movement speed is outside biometric baseline");
            threatTypes.add(ThreatType.ABNORMAL_MOUSE_MOVEMENT);
        }
        if (request.clickFrequency() > 28) {
            score += 14;
            signals.add("Click frequency indicates automation or rage clicking");
            threatTypes.add(ThreatType.RAPID_CLICKING);
        }
        if (request.rageClickDetected()) {
            score += 16;
            signals.add("Rage click burst detected");
            threatTypes.add(ThreatType.RAPID_CLICKING);
        }
        if (request.copyPasteDetected()) {
            score += 14;
            signals.add("Copy-paste detected in sensitive workflow");
            threatTypes.add(ThreatType.COPY_PASTE_FRAUD);
        }
        if (request.autofillDetected()) {
            score += 18;
            signals.add("Autofill abuse signal detected");
            threatTypes.add(ThreatType.AUTOFILL_ABUSE);
        }
        if (request.tabSwitchCount() >= 3) {
            score += 11;
            hijackSuspected = true;
            signals.add("Excessive tab switching during protected session");
            threatTypes.add(ThreatType.SESSION_HIJACK);
        }
        if (request.inactiveTime() > 180 && request.clickFrequency() > 18) {
            score += 12;
            hijackSuspected = true;
            signals.add("Activity spike after long inactivity");
            threatTypes.add(ThreatType.SESSION_HIJACK);
        }
        if (request.scrollVelocity() > 1800) {
            score += 5;
            signals.add("High scroll velocity observed");
        }
        if (session != null && request.deviceFingerprint() != null
                && session.getDeviceFingerprint() != null
                && !session.getDeviceFingerprint().equals(request.deviceFingerprint())) {
            score += 35;
            hijackSuspected = true;
            signals.add("Device fingerprint mismatch against authenticated session");
            threatTypes.add(ThreatType.SESSION_HIJACK);
        }

        if (signals.isEmpty()) {
            signals.add("Behavior remains inside trusted biometric envelope");
        }

        int clampedScore = clamp(score);
        return new RiskEvaluation(clampedScore, levelFor(clampedScore), distinct(signals), distinct(threatTypes), hijackSuspected);
    }

    public RiskEvaluation evaluateTransaction(BigDecimal amount, int currentRisk, List<String> failedChecks) {
        return evaluateTransaction(amount, currentRisk, failedChecks, null);
    }

    public RiskEvaluation evaluateTransaction(
            BigDecimal amount,
            int currentRisk,
            List<String> failedChecks,
            TransactionRiskContext trustContext
    ) {
        int score = currentRisk;
        List<String> signals = new ArrayList<>();
        List<ThreatType> threatTypes = new ArrayList<>();

        if (amount.compareTo(new BigDecimal("10000")) >= 0) {
            score += 10;
            signals.add("High-value transfer requested");
            threatTypes.add(ThreatType.SUSPICIOUS_TRANSACTION);
        }
        if (amount.compareTo(new BigDecimal("50000")) >= 0) {
            score += 20;
            signals.add("Transfer amount exceeds automatic release threshold");
        }
        if (failedChecks != null && !failedChecks.isEmpty()) {
            score += failedChecks.size() * 12;
            signals.add("Frontend fraud checks failed: " + String.join(", ", failedChecks));
            threatTypes.add(ThreatType.BANKING_FRAUD);
        }
        if (currentRisk >= 70) {
            signals.add("Session risk was already elevated before transfer");
            threatTypes.add(ThreatType.SESSION_HIJACK);
        }
        if (trustContext != null) {
            signals.addAll(trustContext.trustSignals());
            if (trustContext.newBeneficiary()) {
                score += 18;
                threatTypes.add(ThreatType.SUSPICIOUS_TRANSACTION);
            }
            if (trustContext.untrustedDevice()) {
                score += 22;
                threatTypes.add(ThreatType.SESSION_HIJACK);
            }
            if (trustContext.amountAboveBaseline()) {
                score += 18;
                threatTypes.add(ThreatType.BANKING_FRAUD);
            }
            if (trustContext.unusualLoginHour()) {
                score += 8;
                threatTypes.add(ThreatType.ACCOUNT_TAKEOVER);
            }
            if (trustContext.lowProfileConfidence()) {
                score += 6;
            }
            if (trustContext.deviceTrustScore() < 50) {
                score += 8;
            }
        }
        if (signals.isEmpty()) {
            signals.add("Transaction passed risk policy checks");
        }

        int clampedScore = clamp(score);
        return new RiskEvaluation(clampedScore, levelFor(clampedScore), distinct(signals), distinct(threatTypes), clampedScore >= 85);
    }

    public RiskLevel levelFor(int score) {
        if (score >= 85) {
            return RiskLevel.CRITICAL;
        }
        if (score >= 65) {
            return RiskLevel.HIGH;
        }
        if (score >= 40) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private <T> List<T> distinct(List<T> values) {
        return values.stream().distinct().toList();
    }
}
