package com.careertwin.controller;

import com.careertwin.dto.*;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.SkillAssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment")
public class SkillAssessmentController {

    @Autowired
    private SkillAssessmentService assessmentService;

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<List<AssessmentQuestionDto>>> getQuestions(
            @RequestParam(defaultValue = "ALL") String category) {
        List<AssessmentQuestionDto> questions = assessmentService.getQuestionsForAssessment(category);
        return ResponseEntity.ok(ApiResponse.ok("Assessment questions retrieved", questions));
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<AssessmentResultDto>> submitAssessment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AssessmentSubmitRequest request) {
        AssessmentResultDto result = assessmentService.submitAssessment(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Assessment evaluated and Career Twin updated", result));
    }

    @GetMapping("/results")
    public ResponseEntity<ApiResponse<List<AssessmentResultDto>>> getUserResults(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AssessmentResultDto> results = assessmentService.getUserAssessmentResults(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<AssessmentResultDto>> getLatestResult(
            @AuthenticationPrincipal UserPrincipal principal) {
        AssessmentResultDto result = assessmentService.getLatestAssessmentResult(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
