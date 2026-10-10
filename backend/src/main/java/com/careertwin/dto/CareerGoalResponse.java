package com.careertwin.dto;

import java.util.List;

public class CareerGoalResponse {
    private Long id;
    private String targetRole;
    private String targetCompany;
    private String description;
    private List<String> requiredSkills;
    private String targetTimeline;

    public CareerGoalResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getTargetTimeline() {
        return targetTimeline;
    }

    public void setTargetTimeline(String targetTimeline) {
        this.targetTimeline = targetTimeline;
    }
}
