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
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "ALL") String category,
            @RequestParam(required = false) String difficulty) {
        Long userId = principal != null ? principal.getId() : null;
        List<AssessmentQuestionDto> questions = assessmentService.getQuestionsForAssessment(category, userId, difficulty);
        return ResponseEntity.ok(ApiResponse.ok("Assessment questions retrieved", questions));
    }

    @GetMapping("/user-level")
    public ResponseEntity<ApiResponse<UserSolvingLevelDto>> getUserSolvingLevel(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        UserSolvingLevelDto level = assessmentService.getUserSolvingLevel(userId);
        return ResponseEntity.ok(ApiResponse.ok("User solving level and adaptive progression retrieved", level));
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

    @GetMapping("/coding-challenges")
    public ResponseEntity<ApiResponse<List<CodingChallengeDto>>> getCodingChallenges(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        List<CodingChallengeDto> challenges = assessmentService.getCodingChallenges(
                category, principal != null ? principal.getId() : null, difficulty);
        return ResponseEntity.ok(ApiResponse.ok("Coding challenges retrieved", challenges));
    }

    @PostMapping("/coding-run")
    public ResponseEntity<ApiResponse<CodingExecutionResultDto>> runCodingChallenge(
            @Valid @RequestBody CodingSubmissionRequest request) {
        CodingExecutionResultDto result = assessmentService.evaluateCode(request.getChallengeId(), request.getLanguage(), request.getCode(), false);
        return ResponseEntity.ok(ApiResponse.ok("Test cases executed", result));
    }

    @PostMapping("/coding-submit")
    public ResponseEntity<ApiResponse<CodingExecutionResultDto>> submitCodingChallenge(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CodingSubmissionRequest request) {
        CodingExecutionResultDto result = assessmentService.submitCodingChallenge(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Coding assessment evaluated and Career Twin updated", result));
    }
}
