package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.CodingProfileDto;
import com.careertwin.dto.CodingProfileRequest;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.CodingProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding-profile")
public class CodingProfileController {

    @Autowired
    private CodingProfileService codingProfileService;

    @PostMapping
    public ResponseEntity<ApiResponse<CodingProfileDto>> addOrUpdateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CodingProfileRequest request) {
        CodingProfileDto dto = codingProfileService.addOrUpdateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Coding profile connected and analyzed successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CodingProfileDto>>> getUserProfiles(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<CodingProfileDto> profiles = codingProfileService.getUserProfiles(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(profiles));
    }

    @PostMapping("/{platform}/sync")
    public ResponseEntity<ApiResponse<CodingProfileDto>> syncProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String platform) {
        CodingProfileDto dto = codingProfileService.syncProfile(principal.getId(), platform);
        return ResponseEntity.ok(ApiResponse.ok("Profile re-synced successfully", dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        codingProfileService.deleteProfile(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Coding profile disconnected successfully", null));
    }
}
