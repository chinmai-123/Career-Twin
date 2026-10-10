package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_recommendations")
public class ProjectRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String difficulty = "INTERMEDIATE"; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column(columnDefinition = "TEXT")
    private String technologiesJson; // JSON array of tech stack items

    @Column(columnDefinition = "TEXT")
    private String relevanceReason;

    @Column(length = 255)
    private String githubTemplateUrl;

    private Boolean isCompleted = false;

    @Column(length = 30)
    private String status = "RECOMMENDED"; // RECOMMENDED, IN_PROGRESS, COMPLETED

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ProjectRecommendation() {
    }

    public ProjectRecommendation(User user, String title, String description, String difficulty,
                                 String technologiesJson, String relevanceReason) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.technologiesJson = technologiesJson;
        this.relevanceReason = relevanceReason;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getTechnologiesJson() {
        return technologiesJson;
    }

    public void setTechnologiesJson(String technologiesJson) {
        this.technologiesJson = technologiesJson;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
