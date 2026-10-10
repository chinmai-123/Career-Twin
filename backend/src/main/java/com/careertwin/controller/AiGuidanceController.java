package com.careertwin.controller;

import com.careertwin.dto.AiGuidanceRequest;
import com.careertwin.dto.AiGuidanceResponse;
import com.careertwin.dto.ApiResponse;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiGuidanceController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/guidance")
    public ResponseEntity<ApiResponse<AiGuidanceResponse>> getGuidance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) AiGuidanceRequest request) {
        if (request == null) {
            request = new AiGuidanceRequest();
        }
        AiGuidanceResponse response = geminiService.getGuidance(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("AI career guidance generated successfully", response));
    }
}
