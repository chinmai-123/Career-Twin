package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.ProgressOverviewDto;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProgressOverviewDto>> getProgress(
            @AuthenticationPrincipal UserPrincipal principal) {
        ProgressOverviewDto overview = progressService.getProgressOverview(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }
}
