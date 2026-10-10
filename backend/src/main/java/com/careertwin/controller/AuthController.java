package com.careertwin.controller;

import com.careertwin.dto.*;
import com.careertwin.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/demo-credentials")
    public ResponseEntity<ApiResponse<Map<String, String>>> getDemoCredentials() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Demo student credentials for quick testing",
                Map.of(
                        "email", "student@careertwin.edu",
                        "password", "password123",
                        "note", "Pre-seeded student profile ready for viva demonstration"
                )
        ));
    }
}
