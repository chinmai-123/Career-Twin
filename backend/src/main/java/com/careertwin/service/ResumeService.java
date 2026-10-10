package com.careertwin.service;

import com.careertwin.dto.ResumeDto;
import com.careertwin.entity.Resume;
import com.careertwin.entity.User;
import com.careertwin.exception.BadRequestException;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.ResumeRepository;
import com.careertwin.repository.UserRepository;
import com.careertwin.util.ResumeParserUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private AtsService atsService;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    @Value("${app.upload.dir:uploads/resumes}")
    private String uploadDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ResumeDto uploadResume(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a PDF resume file to upload.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Invalid file format. Only PDF files are supported.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Determine version number (V1, V2, V3...)
        Optional<Resume> latestResumeOpt = resumeRepository.findTopByUserOrderByVersionNumberDesc(user);
        int nextVersion = latestResumeOpt.map(r -> r.getVersionNumber() + 1).orElse(1);

        // Mark all existing resumes as non-latest
        List<Resume> existingResumes = resumeRepository.findByUserIdOrderByVersionNumberDesc(userId);
        for (Resume r : existingResumes) {
            r.setLatest(false);
            resumeRepository.save(r);
        }

        // Save file to disk
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String safeFileName = "resume_user_" + userId + "_v" + nextVersion + "_" + System.currentTimeMillis() + ".pdf";
        Path targetPath = Paths.get(uploadDir, safeFileName);

        String extractedText = "";
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            // Extract text with PDFBox
            extractedText = ResumeParserUtil.extractTextFromPdf(Files.newInputStream(targetPath));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store and process PDF resume: " + e.getMessage(), e);
        }

        // Extract sections & skills
        Map<String, String> sections = ResumeParserUtil.extractSections(extractedText);
        List<String> extractedSkills = ResumeParserUtil.extractSkillsFromText(extractedText);

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setVersionNumber(nextVersion);
        resume.setFileName(safeFileName);
        resume.setOriginalFileName(originalFilename);
        resume.setFilePath(targetPath.toAbsolutePath().toString());
        resume.setFileSize(file.getSize());
        resume.setContentType(file.getContentType());
        resume.setExtractedText(extractedText);
        resume.setLatest(true);

        try {
            resume.setParsedSkills(objectMapper.writeValueAsString(extractedSkills));
            resume.setParsedEducation(sections.getOrDefault("EDUCATION", ""));
            resume.setParsedExperience(sections.getOrDefault("EXPERIENCE", ""));
            resume.setParsedProjects(sections.getOrDefault("PROJECTS", ""));
        } catch (Exception e) {
            resume.setParsedSkills("[]");
        }

        Resume savedResume = resumeRepository.save(resume);

        // Automatically trigger ATS Analysis and update Career Twin
        try {
            atsService.analyzeResume(savedResume.getId());
        } catch (Exception e) {
            // log and continue
        }

        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToDto(savedResume);
    }

    public List<ResumeDto> getResumeHistory(Long userId) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByVersionNumberDesc(userId);
        return resumes.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ResumeDto getResumeById(Long userId, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        return mapToDto(resume);
    }

    public ResumeDto getLatestResume(Long userId) {
        Resume resume = resumeRepository.findByUserIdAndIsLatestTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No resume uploaded yet."));

        return mapToDto(resume);
    }

    public Resource loadResumeResource(Long userId, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        try {
            Path path = Paths.get(resume.getFilePath());
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read resume file.");
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Resume file not accessible: " + e.getMessage());
        }
    }

    public ResumeDto mapToDto(Resume resume) {
        ResumeDto dto = new ResumeDto();
        dto.setId(resume.getId());
        dto.setVersionNumber(resume.getVersionNumber());
        dto.setFileName(resume.getFileName());
        dto.setOriginalFileName(resume.getOriginalFileName());
        dto.setFileSize(resume.getFileSize());
        dto.setLatest(resume.isLatest());
        dto.setUploadedAt(resume.getUploadedAt());
        dto.setDownloadUrl("/api/resumes/" + resume.getId() + "/download");

        List<String> skills = new ArrayList<>();
        if (resume.getParsedSkills() != null) {
            try {
                skills = objectMapper.readValue(resume.getParsedSkills(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                // ignore
            }
        }
        dto.setParsedSkills(skills);

        dto.setParsedEducation(resume.getParsedEducation() != null ? List.of(resume.getParsedEducation().split("\n")) : Collections.emptyList());
        dto.setParsedExperience(resume.getParsedExperience() != null ? List.of(resume.getParsedExperience().split("\n")) : Collections.emptyList());
        dto.setParsedProjects(resume.getParsedProjects() != null ? List.of(resume.getParsedProjects().split("\n")) : Collections.emptyList());

        return dto;
    }
}
