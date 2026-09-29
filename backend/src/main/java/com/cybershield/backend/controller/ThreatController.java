package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.ThreatResponse;
import com.cybershield.backend.service.ThreatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/threats")
@RequiredArgsConstructor
public class ThreatController {

    private final ThreatService threatService;

    @GetMapping("/live")
    public ResponseEntity<ApiResponse<List<ThreatResponse>>> liveThreats() {
        return ResponseEntity.ok(ApiResponse.success("Live threats loaded", threatService.liveThreats()));
    }
}
