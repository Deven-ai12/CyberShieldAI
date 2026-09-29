package com.cybershield.backend.controller;

import com.cybershield.backend.dto.AlertRequest;
import com.cybershield.backend.dto.AlertResponse;
import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<AlertResponse>> send(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody AlertRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Alert dispatched", alertService.manualAlert(user, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertResponse>>> alerts() {
        return ResponseEntity.ok(ApiResponse.success("Alerts loaded", alertService.recentAlerts()));
    }
}
