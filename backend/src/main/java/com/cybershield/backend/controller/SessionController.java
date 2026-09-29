package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.LiveSessionResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.service.BehaviorAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
public class SessionController {

    private final BehaviorAnalyticsService behaviorAnalyticsService;

    @GetMapping("/live")
    public ResponseEntity<ApiResponse<LiveSessionResponse>> live(@AuthenticationPrincipal AppUser user) {
        return ResponseEntity.ok(ApiResponse.success("Live session loaded", behaviorAnalyticsService.liveSession(user)));
    }
}
