package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.WeeklyChallengeDto;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WeeklyChallengeDto>>> getChallenges(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<WeeklyChallengeDto> list = challengeService.getUserChallenges(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{challengeId}/toggle")
    public ResponseEntity<ApiResponse<WeeklyChallengeDto>> toggleChallenge(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long challengeId) {
        WeeklyChallengeDto updated = challengeService.toggleChallenge(principal.getId(), challengeId);
        return ResponseEntity.ok(ApiResponse.ok("Challenge status updated and XP awarded", updated));
    }
}
