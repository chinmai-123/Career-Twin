package com.careertwin.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CareerGoalRequest {

    @NotBlank(message = "Career goal / target role cannot be empty")
    private String targetRole; // Can be custom: e.g. "Software Development Engineer at Microsoft" or "Backend Developer"

    private String targetCompany;
    private String description;
    private String targetTimeline;
    private List<String> customSkills;

    public CareerGoalRequest() {
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

    public String getTargetTimeline() {
        return targetTimeline;
    }

    public void setTargetTimeline(String targetTimeline) {
        this.targetTimeline = targetTimeline;
    }

    public List<String> getCustomSkills() {
        return customSkills;
    }

    public void setCustomSkills(List<String> customSkills) {
        this.customSkills = customSkills;
    }
}
