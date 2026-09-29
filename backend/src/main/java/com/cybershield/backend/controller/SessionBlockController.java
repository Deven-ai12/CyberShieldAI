package com.cybershield.backend.controller;

import com.cybershield.backend.dto.ApiResponse;
import com.cybershield.backend.dto.SessionBlockResponse;
import com.cybershield.backend.service.SessionBlockLinkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/session/block")
@RequiredArgsConstructor
public class SessionBlockController {

    private final SessionBlockLinkService sessionBlockLinkService;

    @GetMapping(value = "/{token}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> blockFromEmailLink(@PathVariable String token, HttpServletRequest request) {
        try {
            SessionBlockResponse response = sessionBlockLinkService.blockSession(token, request);
            return ResponseEntity.ok(successPage(response));
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorPage(exception.getMessage()));
        }
    }

    @PostMapping("/{token}")
    public ResponseEntity<ApiResponse<SessionBlockResponse>> blockFromApi(
            @PathVariable String token,
            HttpServletRequest request
    ) {
        SessionBlockResponse response = sessionBlockLinkService.blockSession(token, request);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    private String successPage(SessionBlockResponse response) {
        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>SecureTrace Session Blocked</title>
                  <style>
                    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #020617; color: #e5f6ff; font-family: Arial, sans-serif; }
                    main { width: min(680px, 92vw); border: 1px solid #22d3ee; background: rgba(8, 19, 35, .92); padding: 36px; box-shadow: 0 0 40px rgba(34, 211, 238, .22); }
                    .status { color: #22c55e; font-weight: 700; letter-spacing: .08em; font-size: 13px; }
                    h1 { margin: 14px 0; font-size: 34px; }
                    p { color: #9db4c9; line-height: 1.6; }
                    code { color: #22d3ee; word-break: break-all; }
                  </style>
                </head>
                <body>
                  <main>
                    <div class="status">SESSION CONTROL CONFIRMED</div>
                    <h1>High-risk session blocked</h1>
                    <p>%s</p>
                    <p>Session ID: <code>%s</code></p>
                    <p>You can now return to SecureTrace and log in again from a trusted device.</p>
                  </main>
                </body>
                </html>
                """.formatted(escape(response.message()), response.sessionId());
    }

    private String errorPage(String message) {
        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>SecureTrace Link Error</title>
                  <style>
                    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #020617; color: #e5f6ff; font-family: Arial, sans-serif; }
                    main { width: min(680px, 92vw); border: 1px solid #fb3856; background: rgba(20, 10, 22, .92); padding: 36px; box-shadow: 0 0 40px rgba(251, 56, 86, .22); }
                    .status { color: #fb3856; font-weight: 700; letter-spacing: .08em; font-size: 13px; }
                    h1 { margin: 14px 0; font-size: 34px; }
                    p { color: #f0b5c0; line-height: 1.6; }
                  </style>
                </head>
                <body>
                  <main>
                    <div class="status">SESSION CONTROL LINK FAILED</div>
                    <h1>We could not block this session from this link</h1>
                    <p>%s</p>
                    <p>Please log in to SecureTrace or contact the security team if you still see suspicious activity.</p>
                  </main>
                </body>
                </html>
                """.formatted(escape(message == null ? "The link is invalid or expired." : message));
    }

    private String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
