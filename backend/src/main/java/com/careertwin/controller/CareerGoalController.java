package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.CareerGoalRequest;
import com.careertwin.dto.CareerGoalResponse;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.CareerGoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/career-goal")
public class CareerGoalController {

    @Autowired
    private CareerGoalService careerGoalService;

    @PostMapping
    public ResponseEntity<ApiResponse<CareerGoalResponse>> saveGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CareerGoalRequest request) {
        CareerGoalResponse response = careerGoalService.saveOrUpdateCareerGoal(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Career goal saved and required skills identified", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<CareerGoalResponse>> updateGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CareerGoalRequest request) {
        CareerGoalResponse response = careerGoalService.saveOrUpdateCareerGoal(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Career goal updated successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CareerGoalResponse>> getGoal(
            @AuthenticationPrincipal UserPrincipal principal) {
        CareerGoalResponse response = careerGoalService.getCareerGoal(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/role-skills")
    public ResponseEntity<ApiResponse<List<String>>> getSkillsForRole(@RequestParam(defaultValue = "Backend Developer") String role) {
        List<String> skills = careerGoalService.getRequiredSkillsForRole(role);
        return ResponseEntity.ok(ApiResponse.ok(skills));
    }
}
