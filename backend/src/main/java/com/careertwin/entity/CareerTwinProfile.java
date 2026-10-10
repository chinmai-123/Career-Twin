package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "career_twin_profiles")
public class CareerTwinProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 150)
    private String targetRole;

    private Integer overallReadiness = 0; // 0 - 100%
    private Integer resumeScore = 0; // 0 - 100%
    private Integer technicalScore = 0; // 0 - 100%
    private Integer codingScore = 0; // 0 - 100%
    private Integer projectScore = 0; // 0 - 100%
    private Integer assessmentScore = 0; // 0 - 100%

    @Column(columnDefinition = "TEXT")
    private String strengthsJson; // e.g. ["Java", "SQL", "Git"]

    @Column(columnDefinition = "TEXT")
    private String weaknessesJson; // e.g. ["Spring Boot", "Advanced DSA", "REST API Design"]

    @Column(columnDefinition = "TEXT")
    private String topSkillGapsJson; // JSON list of primary gaps

    @Column(columnDefinition = "TEXT")
    private String recommendedNextAction;

    @Column(columnDefinition = "TEXT")
    private String recruiterFeedbackSummary;

    private LocalDateTime calculatedAt;
    private LocalDateTime updatedAt;

    public CareerTwinProfile() {
    }

    public CareerTwinProfile(User user, String targetRole) {
        this.user = user;
        this.targetRole = targetRole;
        this.calculatedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.calculatedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
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

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public Integer getOverallReadiness() {
        return overallReadiness;
    }

    public void setOverallReadiness(Integer overallReadiness) {
        this.overallReadiness = overallReadiness;
    }

    public Integer getResumeScore() {
        return resumeScore;
    }

    public void setResumeScore(Integer resumeScore) {
        this.resumeScore = resumeScore;
    }

    public Integer getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(Integer technicalScore) {
        this.technicalScore = technicalScore;
    }

    public Integer getCodingScore() {
        return codingScore;
    }

    public void setCodingScore(Integer codingScore) {
        this.codingScore = codingScore;
    }

    public Integer getProjectScore() {
        return projectScore;
    }

    public void setProjectScore(Integer projectScore) {
        this.projectScore = projectScore;
    }

    public Integer getAssessmentScore() {
        return assessmentScore;
    }

    public void setAssessmentScore(Integer assessmentScore) {
        this.assessmentScore = assessmentScore;
    }

    public String getStrengthsJson() {
        return strengthsJson;
    }

    public void setStrengthsJson(String strengthsJson) {
        this.strengthsJson = strengthsJson;
    }

    public String getWeaknessesJson() {
        return weaknessesJson;
    }

    public void setWeaknessesJson(String weaknessesJson) {
        this.weaknessesJson = weaknessesJson;
    }

    public String getTopSkillGapsJson() {
        return topSkillGapsJson;
    }

    public void setTopSkillGapsJson(String topSkillGapsJson) {
        this.topSkillGapsJson = topSkillGapsJson;
    }

    public String getRecommendedNextAction() {
        return recommendedNextAction;
    }

    public void setRecommendedNextAction(String recommendedNextAction) {
        this.recommendedNextAction = recommendedNextAction;
    }

    public String getRecruiterFeedbackSummary() {
        return recruiterFeedbackSummary;
    }

    public void setRecruiterFeedbackSummary(String recruiterFeedbackSummary) {
        this.recruiterFeedbackSummary = recruiterFeedbackSummary;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
