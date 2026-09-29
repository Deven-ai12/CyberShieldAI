package com.cybershield.backend.service;

import com.cybershield.backend.dto.OtpDispatchResponse;
import com.cybershield.backend.dto.PasswordResetResponse;
import com.cybershield.backend.dto.ResetPasswordRequest;
import com.cybershield.backend.dto.VerifyResetOtpResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.EmailOtp;
import com.cybershield.backend.entity.OtpPurpose;
import com.cybershield.backend.exception.BadRequestException;
import com.cybershield.backend.exception.ResourceNotFoundException;
import com.cybershield.backend.repository.EmailOtpRepository;
import com.cybershield.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AuthenticationOtpService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_BOUND = 1_000_000;
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(10);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);

    private final EmailOtpRepository emailOtpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public OtpDispatchResponse sendEmailVerificationOtp(AppUser user) {
        return createAndSendOtp(
                user,
                user.getEmail(),
                OtpPurpose.EMAIL_VERIFICATION,
                "SecureTrace email verification OTP",
                "Use this OTP to verify your SecureTrace banking account: %s\n\nThis code expires in 10 minutes."
        );
    }

    @Transactional
    public OtpDispatchResponse resendEmailVerificationOtp(String email) {
        AppUser user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("No pending registration found for this email"));
        return sendEmailVerificationOtp(user);
    }

    @Transactional
    public void verifyEmailOtp(AppUser user, String otp) {
        EmailOtp emailOtp = verifyOtp(user.getEmail(), OtpPurpose.EMAIL_VERIFICATION, otp);
        emailOtp.setUsedAt(Instant.now());
        emailOtpRepository.save(emailOtp);
    }

    @Transactional
    public OtpDispatchResponse sendPasswordResetOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .map(user -> createAndSendOtp(
                        user,
                        normalizedEmail,
                        OtpPurpose.PASSWORD_RESET,
                        "SecureTrace password reset OTP",
                        "Use this OTP to reset your SecureTrace password: %s\n\nThis code expires in 10 minutes. If this was not you, ignore this email."
                ))
                .orElseGet(() -> genericPasswordResetResponse(normalizedEmail));
    }

    @Transactional
    public VerifyResetOtpResponse verifyPasswordResetOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset OTP"));

        EmailOtp emailOtp = verifyOtp(normalizedEmail, OtpPurpose.PASSWORD_RESET, otp);
        String resetToken = generateResetToken();
        Instant now = Instant.now();
        emailOtp.setUsedAt(now);
        emailOtp.setResetTokenHash(hashToken(resetToken));
        emailOtp.setResetTokenExpiresAt(now.plus(RESET_TOKEN_TTL));
        emailOtpRepository.save(emailOtp);
        return new VerifyResetOtpResponse(normalizedEmail, resetToken, emailOtp.getResetTokenExpiresAt());
    }

    @Transactional
    public PasswordResetResponse resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        String normalizedEmail = normalizeEmail(request.email());
        EmailOtp emailOtp = emailOtpRepository
                .findByResetTokenHashAndPurposeAndResetCompletedAtIsNull(hashToken(request.resetToken()), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (!emailOtp.getEmail().equalsIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Invalid or expired reset token");
        }
        if (emailOtp.getResetTokenExpiresAt() == null || emailOtp.getResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        emailOtp.setResetCompletedAt(Instant.now());
        emailOtpRepository.save(emailOtp);
        refreshTokenService.revokeForUser(user);

        return new PasswordResetResponse(
                normalizedEmail,
                "Password reset successful. Please log in again with your new password.",
                Instant.now()
        );
    }

    private OtpDispatchResponse createAndSendOtp(
            AppUser user,
            String email,
            OtpPurpose purpose,
            String subject,
            String bodyTemplate
    ) {
        String normalizedEmail = normalizeEmail(email);
        enforceResendCooldown(normalizedEmail, purpose);

        String otp = generateOtp();
        Instant now = Instant.now();
        EmailOtp emailOtp = EmailOtp.builder()
                .user(user)
                .email(normalizedEmail)
                .purpose(purpose)
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(now.plus(OTP_TTL))
                .lastSentAt(now)
                .attempts(0)
                .build();
        emailOtpRepository.save(emailOtp);

        boolean sent = emailNotificationService.send(normalizedEmail, subject, bodyTemplate.formatted(otp));
        if (!sent) {
            throw new BadRequestException("Unable to send OTP email. Please check mail configuration and try again.");
        }
        return new OtpDispatchResponse(
                normalizedEmail,
                "OTP sent to registered email",
                emailOtp.getExpiresAt(),
                now.plus(RESEND_COOLDOWN)
        );
    }

    private EmailOtp verifyOtp(String email, OtpPurpose purpose, String rawOtp) {
        EmailOtp emailOtp = emailOtpRepository
                .findTopByEmailIgnoreCaseAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(normalizeEmail(email), purpose)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));
        Instant now = Instant.now();
        if (emailOtp.getExpiresAt().isBefore(now)) {
            emailOtp.setUsedAt(now);
            emailOtpRepository.save(emailOtp);
            throw new BadRequestException("OTP has expired");
        }
        if (emailOtp.getAttempts() >= MAX_ATTEMPTS) {
            emailOtp.setUsedAt(now);
            emailOtpRepository.save(emailOtp);
            throw new BadRequestException("Maximum OTP attempts exceeded. Request a new OTP.");
        }
        if (!passwordEncoder.matches(rawOtp, emailOtp.getOtpHash())) {
            emailOtp.setAttempts(emailOtp.getAttempts() + 1);
            emailOtpRepository.save(emailOtp);
            throw new BadRequestException("Invalid OTP");
        }
        return emailOtp;
    }

    private void enforceResendCooldown(String email, OtpPurpose purpose) {
        emailOtpRepository
                .findTopByEmailIgnoreCaseAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(email, purpose)
                .ifPresent(latest -> {
                    Instant resendAvailableAt = latest.getLastSentAt().plus(RESEND_COOLDOWN);
                    if (resendAvailableAt.isAfter(Instant.now())) {
                        throw new BadRequestException("Please wait before requesting another OTP");
                    }
                });
    }

    private OtpDispatchResponse genericPasswordResetResponse(String email) {
        Instant now = Instant.now();
        return new OtpDispatchResponse(
                normalizeEmail(email),
                "If an account exists for this email, a password reset OTP has been sent",
                now.plus(OTP_TTL),
                now.plus(RESEND_COOLDOWN)
        );
    }

    private String generateOtp() {
        return "%06d".formatted(SECURE_RANDOM.nextInt(OTP_BOUND));
    }

    private String generateResetToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
