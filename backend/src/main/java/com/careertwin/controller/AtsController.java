package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.AtsAnalysisResponse;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.AtsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
public class AtsController {

    @Autowired
    private AtsService atsService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<AtsAnalysisResponse>> analyzeResume(
            @RequestParam(required = false) Long resumeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        AtsAnalysisResponse response = (resumeId != null)
                ? atsService.analyzeResume(resumeId)
                : atsService.analyzeLatestResume(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("ATS analysis completed", response));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<AtsAnalysisResponse>> getLatestAnalysis(
            @AuthenticationPrincipal UserPrincipal principal) {
        AtsAnalysisResponse response = atsService.getLatestAtsAnalysis(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<ApiResponse<AtsAnalysisResponse>> getAnalysisByResumeId(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long resumeId) {
        AtsAnalysisResponse response = atsService.getAtsAnalysisByResumeId(principal.getId(), resumeId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
