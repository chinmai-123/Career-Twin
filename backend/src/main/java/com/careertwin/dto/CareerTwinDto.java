package com.careertwin.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CareerTwinDto {
    private String studentName;
    private String targetRole;
    private String targetCompany;
    private Integer overallReadiness; // 0 - 100%
    private Integer resumeScore;
    private Integer technicalScore;
    private Integer codingScore;
    private Integer projectScore;
    private Integer assessmentScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<SkillGapDto> topSkillGaps;
    private String recommendedNextAction;
    private String recruiterFeedbackSummary;
    private Integer roadmapProgress; // 0 - 100%
    private Integer weeklyChallengesCompleted;
    private Integer totalChallenges;
    private LocalDateTime lastUpdated;

    public CareerTwinDto() {
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTargetCompany() {
        return targetCompany;
    }

    public void setTargetCompany(String targetCompany) {
        this.targetCompany = targetCompany;
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

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<SkillGapDto> getTopSkillGaps() {
        return topSkillGaps;
    }

    public void setTopSkillGaps(List<SkillGapDto> topSkillGaps) {
        this.topSkillGaps = topSkillGaps;
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

    public Integer getRoadmapProgress() {
        return roadmapProgress;
    }

    public void setRoadmapProgress(Integer roadmapProgress) {
        this.roadmapProgress = roadmapProgress;
    }

    public Integer getWeeklyChallengesCompleted() {
        return weeklyChallengesCompleted;
    }

    public void setWeeklyChallengesCompleted(Integer weeklyChallengesCompleted) {
        this.weeklyChallengesCompleted = weeklyChallengesCompleted;
    }

    public Integer getTotalChallenges() {
        return totalChallenges;
    }

    public void setTotalChallenges(Integer totalChallenges) {
        this.totalChallenges = totalChallenges;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
