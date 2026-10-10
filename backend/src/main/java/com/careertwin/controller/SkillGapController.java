package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.SkillGapDto;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.SkillGapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gaps")
public class SkillGapController {

    @Autowired
    private SkillGapService skillGapService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SkillGapDto>>> getSkillGaps(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SkillGapDto> gaps = skillGapService.getSkillGaps(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(gaps));
    }
}
