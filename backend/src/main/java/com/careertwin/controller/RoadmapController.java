package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.ProjectRecommendationDto;
import com.careertwin.dto.RoadmapPhaseDto;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.RoadmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    @Autowired
    private RoadmapService roadmapService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoadmapPhaseDto>>> getRoadmap(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RoadmapPhaseDto> roadmap = roadmapService.getUserRoadmap(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(roadmap));
    }

    @PostMapping("/phases/{phaseId}/toggle")
    public ResponseEntity<ApiResponse<RoadmapPhaseDto>> togglePhase(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long phaseId) {
        RoadmapPhaseDto updated = roadmapService.togglePhaseCompletion(principal.getId(), phaseId);
        return ResponseEntity.ok(ApiResponse.ok("Roadmap phase updated", updated));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectRecommendationDto>>> getProjects(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ProjectRecommendationDto> projects = roadmapService.getUserProjects(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(projects));
    }

    @PatchMapping("/projects/{projectId}/status")
    public ResponseEntity<ApiResponse<ProjectRecommendationDto>> updateProjectStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "IN_PROGRESS");
        ProjectRecommendationDto updated = roadmapService.updateProjectStatus(principal.getId(), projectId, status);
        return ResponseEntity.ok(ApiResponse.ok("Project status updated", updated));
    }
}
