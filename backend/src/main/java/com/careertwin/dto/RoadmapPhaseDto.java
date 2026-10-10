package com.careertwin.dto;

import java.util.List;

public class RoadmapPhaseDto {
    private Long id;
    private Integer phaseNumber;
    private String phaseTitle;
    private Integer durationWeeks;
    private List<String> topics;
    private List<String> skillsCovered;
    private String projectMilestone;
    private Boolean isCompleted;
    private Integer progressPercentage;

    public RoadmapPhaseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }

    public List<String> getSkillsCovered() {
        return skillsCovered;
    }

    public void setSkillsCovered(List<String> skillsCovered) {
        this.skillsCovered = skillsCovered;
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
}
