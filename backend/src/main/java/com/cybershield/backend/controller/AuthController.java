package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.AuthResponse;
import com.cybershield.backend.dto.ForgotPasswordRequest;
import com.cybershield.backend.dto.LoginRequest;
import com.cybershield.backend.dto.OtpDispatchResponse;
import com.cybershield.backend.dto.PasswordResetResponse;
import com.cybershield.backend.dto.RefreshTokenRequest;
import com.cybershield.backend.dto.RegisterRequest;
import com.cybershield.backend.dto.ResendEmailOtpRequest;
import com.cybershield.backend.dto.ResetPasswordRequest;
import com.cybershield.backend.dto.VerifyEmailOtpRequest;
import com.cybershield.backend.dto.VerifyResetOtpRequest;
import com.cybershield.backend.dto.VerifyResetOtpResponse;
import com.cybershield.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<OtpDispatchResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration created. Verify your email OTP to activate the account.", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request, servletRequest)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refresh(request)));
    }

    @PostMapping("/verify-email-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", authService.verifyEmailOtp(request, servletRequest)));
    }

    @PostMapping("/resend-email-otp")
    public ResponseEntity<ApiResponse<OtpDispatchResponse>> resendEmailOtp(@Valid @RequestBody ResendEmailOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Verification OTP resent", authService.resendEmailOtp(request)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<OtpDispatchResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Password reset OTP processed", authService.forgotPassword(request)));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<VerifyResetOtpResponse>> verifyResetOtp(@Valid @RequestBody VerifyResetOtpRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Password reset OTP verified", authService.verifyResetOtp(request)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<PasswordResetResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", authService.resetPassword(request)));
    }
}
