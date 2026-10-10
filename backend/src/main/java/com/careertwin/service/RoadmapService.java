package com.careertwin.service;

import com.careertwin.dto.ProjectRecommendationDto;
import com.careertwin.dto.RoadmapPhaseDto;
import com.careertwin.entity.ProjectRecommendation;
import com.careertwin.entity.RoadmapPhase;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.ProjectRecommendationRepository;
import com.careertwin.repository.RoadmapPhaseRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoadmapService {

    @Autowired
    private RoadmapPhaseRepository roadmapPhaseRepository;

    @Autowired
    private ProjectRecommendationRepository projectRecommendationRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<RoadmapPhaseDto> getUserRoadmap(Long userId) {
        List<RoadmapPhase> phases = roadmapPhaseRepository.findByUserIdOrderByPhaseNumberAsc(userId);
        return phases.stream().map(this::mapToRoadmapDto).collect(Collectors.toList());
    }

    @Transactional
    public RoadmapPhaseDto togglePhaseCompletion(Long userId, Long phaseId) {
        RoadmapPhase phase = roadmapPhaseRepository.findById(phaseId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap phase not found with id: " + phaseId));

        boolean newStatus = !Boolean.TRUE.equals(phase.getIsCompleted());
        phase.setIsCompleted(newStatus);
        phase.setProgressPercentage(newStatus ? 100 : 0);

        RoadmapPhase saved = roadmapPhaseRepository.save(phase);

        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToRoadmapDto(saved);
    }

    public List<ProjectRecommendationDto> getUserProjects(Long userId) {
        List<ProjectRecommendation> projects = projectRecommendationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return projects.stream().map(this::mapToProjectDto).collect(Collectors.toList());
    }

    @Transactional
    public ProjectRecommendationDto updateProjectStatus(Long userId, Long projectId, String status) {
        ProjectRecommendation project = projectRecommendationRepository.findById(projectId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Project recommendation not found with id: " + projectId));

        project.setStatus(status.toUpperCase());
        project.setIsCompleted("COMPLETED".equalsIgnoreCase(status));

        ProjectRecommendation saved = projectRecommendationRepository.save(project);

        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToProjectDto(saved);
    }

    private RoadmapPhaseDto mapToRoadmapDto(RoadmapPhase p) {
        RoadmapPhaseDto dto = new RoadmapPhaseDto();
        dto.setId(p.getId());
        dto.setPhaseNumber(p.getPhaseNumber());
        dto.setPhaseTitle(p.getPhaseTitle());
        dto.setDurationWeeks(p.getDurationWeeks());
        dto.setProjectMilestone(p.getProjectMilestone());
        dto.setIsCompleted(p.getIsCompleted());
        dto.setProgressPercentage(p.getProgressPercentage());

        try {
            dto.setTopics(objectMapper.readValue(p.getTopicsJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setTopics(Collections.emptyList()); }

        try {
            dto.setSkillsCovered(objectMapper.readValue(p.getSkillsCoveredJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setSkillsCovered(Collections.emptyList()); }

        return dto;
    }

    private ProjectRecommendationDto mapToProjectDto(ProjectRecommendation p) {
        ProjectRecommendationDto dto = new ProjectRecommendationDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setDifficulty(p.getDifficulty());
        dto.setRelevanceReason(p.getRelevanceReason());
        dto.setGithubTemplateUrl(p.getGithubTemplateUrl());
        dto.setIsCompleted(p.getIsCompleted());
        dto.setStatus(p.getStatus());

        try {
            dto.setTechnologies(objectMapper.readValue(p.getTechnologiesJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setTechnologies(Collections.emptyList()); }

        return dto;
    }
}
