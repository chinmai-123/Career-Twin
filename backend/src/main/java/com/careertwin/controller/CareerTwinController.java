package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.CareerTwinDto;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.CareerTwinEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/career-twin")
public class CareerTwinController {

    @Autowired
    private CareerTwinEngineService careerTwinEngineService;

    @GetMapping
    public ResponseEntity<ApiResponse<CareerTwinDto>> getCareerTwin(
            @AuthenticationPrincipal UserPrincipal principal) {
        CareerTwinDto dto = careerTwinEngineService.getCareerTwin(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @PostMapping("/recalculate")
    public ResponseEntity<ApiResponse<CareerTwinDto>> recalculateCareerTwin(
            @AuthenticationPrincipal UserPrincipal principal) {
        CareerTwinDto dto = careerTwinEngineService.recalculateCareerTwin(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Career Twin updated with latest data", dto));
    }
}
