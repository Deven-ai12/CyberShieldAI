package com.cybershield.backend.service;

import com.cybershield.backend.dto.AuthResponse;
import com.cybershield.backend.dto.ForgotPasswordRequest;
import com.cybershield.backend.dto.LoginRequest;
import com.cybershield.backend.dto.OtpDispatchResponse;
import com.cybershield.backend.dto.PasswordResetResponse;
import com.cybershield.backend.dto.RefreshTokenRequest;
import com.cybershield.backend.dto.RegisterRequest;
import com.cybershield.backend.dto.ResendEmailOtpRequest;
import com.cybershield.backend.dto.ResetPasswordRequest;
import com.cybershield.backend.dto.UserSummaryResponse;
import com.cybershield.backend.dto.VerifyEmailOtpRequest;
import com.cybershield.backend.dto.VerifyResetOtpRequest;
import com.cybershield.backend.dto.VerifyResetOtpResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.entity.Device;
import com.cybershield.backend.entity.LoginHistory;
import com.cybershield.backend.entity.RefreshToken;
import com.cybershield.backend.entity.Role;
import com.cybershield.backend.entity.UserSession;
import com.cybershield.backend.entity.UserStatus;
import com.cybershield.backend.exception.BadRequestException;
import com.cybershield.backend.exception.ConflictException;
import com.cybershield.backend.exception.ResourceNotFoundException;
import com.cybershield.backend.repository.LoginHistoryRepository;
import com.cybershield.backend.repository.UserRepository;
import com.cybershield.backend.security.JwtService;
import com.cybershield.backend.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final DeviceService deviceService;
    private final UserSessionService userSessionService;
    private final AuthenticationOtpService authenticationOtpService;

    @Transactional
    public OtpDispatchResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Email is already registered");
        }

        AppUser user = AppUser.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role() == null ? Role.USER : request.role())
                .status(UserStatus.PENDING_EMAIL_VERIFICATION)
                .mfaEnabled(false)
                .accountTier(request.accountTier() == null ? "Private Banking" : request.accountTier())
                .build();
        AppUser savedUser = userRepository.save(user);
        return authenticationOtpService.sendEmailVerificationOtp(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest servletRequest) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email()).orElse(null);
        if (user != null && user.getStatus() == UserStatus.PENDING_EMAIL_VERIFICATION) {
            recordLogin(user, request.email(), false, "Email verification required", request.deviceFingerprint(), servletRequest);
            throw new BadRequestException("Please verify your email with OTP before login");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException exception) {
            recordLogin(user, request.email(), false, "Invalid credentials", request.deviceFingerprint(), servletRequest);
            throw exception;
        }

        AppUser authenticatedUser = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        Device device = deviceService.upsertDevice(
                authenticatedUser,
                request.deviceFingerprint(),
                request.deviceProfile(),
                servletRequest
        );
        UserSession session = userSessionService.createSession(authenticatedUser, device, servletRequest, jwtService.getAccessTokenExpiresAt());
        RefreshToken refreshToken = refreshTokenService.create(authenticatedUser, session);
        authenticatedUser.setLastLoginAt(Instant.now());
        userRepository.save(authenticatedUser);
        recordLogin(authenticatedUser, authenticatedUser.getEmail(), true, "Login successful", device.getFingerprint(), servletRequest);
        return buildAuthResponse(authenticatedUser, session, refreshToken, device.getFingerprint());
    }

    @Transactional
    public AuthResponse verifyEmailOtp(VerifyEmailOtpRequest request, HttpServletRequest servletRequest) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("No registration found for this email"));
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Email is already verified");
        }

        authenticationOtpService.verifyEmailOtp(user, request.otp());
        user.setStatus(UserStatus.ACTIVE);
        user.setLastLoginAt(Instant.now());
        AppUser savedUser = userRepository.save(user);

        Device device = deviceService.upsertDevice(
                savedUser,
                request.deviceFingerprint(),
                request.deviceProfile(),
                servletRequest
        );
        UserSession session = userSessionService.createSession(savedUser, device, servletRequest, jwtService.getAccessTokenExpiresAt());
        RefreshToken refreshToken = refreshTokenService.create(savedUser, session);
        recordLogin(savedUser, savedUser.getEmail(), true, "Email verified login", device.getFingerprint(), servletRequest);
        return buildAuthResponse(savedUser, session, refreshToken, device.getFingerprint());
    }

    @Transactional
    public OtpDispatchResponse resendEmailOtp(ResendEmailOtpRequest request) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("No registration found for this email"));
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Email is already verified");
        }
        return authenticationOtpService.resendEmailVerificationOtp(request.email());
    }

    @Transactional
    public OtpDispatchResponse forgotPassword(ForgotPasswordRequest request) {
        return authenticationOtpService.sendPasswordResetOtp(request.email());
    }

    @Transactional
    public VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request) {
        return authenticationOtpService.verifyPasswordResetOtp(request.email(), request.otp());
    }

    @Transactional
    public PasswordResetResponse resetPassword(ResetPasswordRequest request) {
        return authenticationOtpService.resetPassword(request);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verify(request.refreshToken());
        AppUser user = refreshToken.getUser();
        UserSession session = refreshToken.getSession();
        return buildAuthResponse(user, session, refreshToken, session == null ? null : session.getDeviceFingerprint());
    }

    private AuthResponse buildAuthResponse(AppUser user, UserSession session, RefreshToken refreshToken, String deviceFingerprint) {
        String token = jwtService.generateAccessToken(user, session == null ? null : session.getId());
        return new AuthResponse(
                token,
                token,
                refreshToken.getToken(),
                jwtService.getAccessTokenExpirationSeconds(),
                jwtService.getAccessTokenExpiresAt(),
                UserSummaryResponse.from(user, deviceFingerprint)
        );
    }

    private void recordLogin(AppUser user, String email, boolean successful, String reason, String deviceFingerprint, HttpServletRequest request) {
        LoginHistory history = LoginHistory.builder()
                .user(user)
                .email(email == null ? "unknown" : email.toLowerCase())
                .ipAddress(RequestUtils.clientIp(request))
                .userAgent(RequestUtils.userAgent(request))
                .deviceFingerprint(deviceFingerprint)
                .successful(successful)
                .reason(reason)
                .loginAt(Instant.now())
                .build();
        loginHistoryRepository.save(history);
    }
}
