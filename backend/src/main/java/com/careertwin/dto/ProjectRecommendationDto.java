package com.careertwin.dto;

import java.util.List;

public class ProjectRecommendationDto {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private List<String> technologies;
    private String relevanceReason;
    private String githubTemplateUrl;
    private Boolean isCompleted;
    private String status;

    public ProjectRecommendationDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public List<String> getTechnologies() {
        return technologies;
    }

    public void setTechnologies(List<String> technologies) {
        this.technologies = technologies;
    }

    public String getRelevanceReason() {
        return relevanceReason;
    }

    public void setRelevanceReason(String relevanceReason) {
        this.relevanceReason = relevanceReason;
    }

    public String getGithubTemplateUrl() {
        return githubTemplateUrl;
    }

    public void setGithubTemplateUrl(String githubTemplateUrl) {
        this.githubTemplateUrl = githubTemplateUrl;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
