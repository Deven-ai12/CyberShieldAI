package com.cybershield.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String code,
        String message,
        String path,
        Map<String, String> validationErrors,
        Instant timestamp
) {

    public static ErrorResponse of(String code, String message, String path) {
        return new ErrorResponse(code, message, path, null, Instant.now());
    }

    public static ErrorResponse validation(String message, String path, Map<String, String> validationErrors) {
        return new ErrorResponse("VALIDATION_ERROR", message, path, validationErrors, Instant.now());
    }
}
