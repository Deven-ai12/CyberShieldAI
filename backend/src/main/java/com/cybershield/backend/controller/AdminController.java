package com.cybershield.backend.controller;

import com.cybershield.backend.dto.AdminLogResponse;
import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<AdminLogResponse>> logs() {
        return ResponseEntity.ok(ApiResponse.success("Admin SOC logs loaded", adminDashboardService.logs()));
    }
}
