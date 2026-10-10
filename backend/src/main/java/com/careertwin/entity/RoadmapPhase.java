package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roadmap_phases")
public class RoadmapPhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer phaseNumber;

    @Column(nullable = false, length = 120)
    private String phaseTitle;

    private Integer durationWeeks = 2;

    @Column(columnDefinition = "TEXT")
    private String topicsJson; // JSON array of topic strings / tasks

    @Column(columnDefinition = "TEXT")
    private String skillsCoveredJson;

    @Column(columnDefinition = "TEXT")
    private String projectMilestone;

    private Boolean isCompleted = false;

    private Integer progressPercentage = 0; // 0 - 100

    private LocalDateTime updatedAt;

    public RoadmapPhase() {
    }

    public RoadmapPhase(User user, Integer phaseNumber, String phaseTitle, Integer durationWeeks,
                        String topicsJson, String skillsCoveredJson, String projectMilestone) {
        this.user = user;
        this.phaseNumber = phaseNumber;
        this.phaseTitle = phaseTitle;
        this.durationWeeks = durationWeeks;
        this.topicsJson = topicsJson;
        this.skillsCoveredJson = skillsCoveredJson;
        this.projectMilestone = projectMilestone;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
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

    public Integer getPhaseNumber() {
        return phaseNumber;
    }

    public void setPhaseNumber(Integer phaseNumber) {
        this.phaseNumber = phaseNumber;
    }

    public String getPhaseTitle() {
        return phaseTitle;
    }

    public void setPhaseTitle(String phaseTitle) {
        this.phaseTitle = phaseTitle;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public String getTopicsJson() {
        return topicsJson;
    }

    public void setTopicsJson(String topicsJson) {
        this.topicsJson = topicsJson;
    }

    public String getSkillsCoveredJson() {
        return skillsCoveredJson;
    }

    public void setSkillsCoveredJson(String skillsCoveredJson) {
        this.skillsCoveredJson = skillsCoveredJson;
    }

    public String getProjectMilestone() {
        return projectMilestone;
    }

    public void setProjectMilestone(String projectMilestone) {
        this.projectMilestone = projectMilestone;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
