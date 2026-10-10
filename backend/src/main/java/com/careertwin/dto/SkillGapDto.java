package com.careertwin.dto;

public class SkillGapDto {
    private Long id;
    private String skillName;
    private Integer requiredLevel;
    private Integer currentLevel;
    private Integer gapScore;
    private String priority; // HIGH, MEDIUM, LOW
    private String reason;
    private String recommendedAction;

    public SkillGapDto() {
    }

    public SkillGapDto(String skillName, Integer requiredLevel, Integer currentLevel, Integer gapScore,
                       String priority, String reason, String recommendedAction) {
        this.skillName = skillName;
        this.requiredLevel = requiredLevel;
        this.currentLevel = currentLevel;
        this.gapScore = gapScore;
        this.priority = priority;
        this.reason = reason;
        this.recommendedAction = recommendedAction;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }

    public Integer getGapScore() {
        return gapScore;
    }

    public void setGapScore(Integer gapScore) {
        this.gapScore = gapScore;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }
}
