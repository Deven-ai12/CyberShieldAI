package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.RiskScoreResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.service.BehaviorAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/risk-score")
@RequiredArgsConstructor
public class RiskController {

    private final BehaviorAnalyticsService behaviorAnalyticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<RiskScoreResponse>> currentRisk(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(ApiResponse.success("Risk score loaded", behaviorAnalyticsService.currentRisk(user)));
    }
}
