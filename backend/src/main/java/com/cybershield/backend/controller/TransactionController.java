package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.TransferRequest;
import com.cybershield.backend.dto.TransferResponse;
import com.cybershield.backend.entity.AppUser;
import com.cybershield.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody TransferRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Transfer processed", transactionService.transfer(user, request)));
    }
}
