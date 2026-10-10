package com.careertwin.controller;

import com.careertwin.dto.ApiResponse;
import com.careertwin.dto.ResumeDto;
import com.careertwin.security.UserPrincipal;
import com.careertwin.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeDto>> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        ResumeDto resumeDto = resumeService.uploadResume(principal.getId(), file);
        return ResponseEntity.ok(ApiResponse.ok("Resume uploaded, parsed and ATS analyzed successfully", resumeDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeDto>>> getResumeHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ResumeDto> history = resumeService.getResumeHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<ResumeDto>> getLatestResume(
            @AuthenticationPrincipal UserPrincipal principal) {
        ResumeDto resume = resumeService.getLatestResume(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(resume));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeDto>> getResumeById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ResumeDto resume = resumeService.getResumeById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok(resume));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ResumeDto resume = resumeService.getResumeById(principal.getId(), id);
        Resource resource = resumeService.loadResumeResource(principal.getId(), id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resume.getOriginalFileName() + "\"")
                .body(resource);
    }
}
