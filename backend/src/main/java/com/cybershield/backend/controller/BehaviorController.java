package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.BehaviorTrackRequest;
import com.cybershield.backend.dto.RiskScoreResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.service.BehaviorAnalyticsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/behavior")
@RequiredArgsConstructor
public class BehaviorController {

    private final BehaviorAnalyticsService behaviorAnalyticsService;

    @PostMapping("/track")
    public ResponseEntity<ApiResponse<RiskScoreResponse>> track(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody BehaviorTrackRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success("Behavior analyzed", behaviorAnalyticsService.track(user, request, servletRequest)));
    }
}
