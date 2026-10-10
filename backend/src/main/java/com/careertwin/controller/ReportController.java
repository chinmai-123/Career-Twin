package com.careertwin.controller;

import com.careertwin.dto.*;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private CareerTwinEngineService careerTwinEngineService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private SkillGapService skillGapService;

    @Autowired
    private RoadmapService roadmapService;

    @Autowired
    private ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComprehensiveReport(
            @AuthenticationPrincipal UserPrincipal principal) {
        CareerTwinDto twin = careerTwinEngineService.getCareerTwin(principal.getId());
        ProgressOverviewDto progress = progressService.getProgressOverview(principal.getId());
        List<SkillGapDto> gaps = skillGapService.getSkillGaps(principal.getId());
        List<RoadmapPhaseDto> roadmap = roadmapService.getUserRoadmap(principal.getId());
        List<WeeklyChallengeDto> challenges = challengeService.getUserChallenges(principal.getId());

        Map<String, Object> report = new HashMap<>();
        report.put("generatedAt", LocalDateTime.now());
        report.put("studentName", twin.getStudentName());
        report.put("targetRole", twin.getTargetRole());
        report.put("targetCompany", twin.getTargetCompany());
        report.put("overallReadiness", twin.getOverallReadiness());
        report.put("previousReadiness", progress.getPreviousReadiness());
        report.put("readinessGrowth", progress.getReadinessGrowth());
        report.put("categoryScores", Map.of(
                "Resume & ATS", twin.getResumeScore(),
                "Technical Skills", twin.getTechnicalScore(),
                "Coding & DSA", twin.getCodingScore(),
                "Projects", twin.getProjectScore(),
                "Assessments", twin.getAssessmentScore()
        ));
        report.put("strengths", twin.getStrengths());
        report.put("weaknesses", twin.getWeaknesses());
        report.put("skillGaps", gaps);
        report.put("roadmap", roadmap);
        report.put("challenges", challenges);
        report.put("recommendedNextAction", twin.getRecommendedNextAction());
        report.put("recruiterFeedbackSummary", twin.getRecruiterFeedbackSummary());
        report.put("status", twin.getOverallReadiness() >= 75 ? "PLACEMENT_READY" :
                              twin.getOverallReadiness() >= 55 ? "INTERMEDIATE_PROGRESS" : "EARLY_STAGE");

        return ResponseEntity.ok(ApiResponse.ok("Placement readiness report generated", report));
    }
}
