package com.careertwin.dto;

import java.util.List;
import java.util.Map;

public class ProgressOverviewDto {
    private Integer currentReadiness;
    private Integer previousReadiness;
    private Integer readinessGrowth;
    private Integer skillsVerifiedCount;
    private Integer challengesCompletedCount;
    private Integer totalChallengesCount;
    private Integer roadmapCompletionPercentage;
    private List<ReadinessTrendPoint> readinessTrend;
    private List<SkillProficiencyPoint> skillProficiencies;
    private List<String> recentMilestones;

    public static class ReadinessTrendPoint {
        private String date;
        private Integer readinessScore;
        private Integer atsScore;

        public ReadinessTrendPoint() {
        }

        public ReadinessTrendPoint(String date, Integer readinessScore, Integer atsScore) {
            this.date = date;
            this.readinessScore = readinessScore;
            this.atsScore = atsScore;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Integer getReadinessScore() {
            return readinessScore;
        }

        public void setReadinessScore(Integer readinessScore) {
            this.readinessScore = readinessScore;
        }

        public Integer getAtsScore() {
            return atsScore;
        }

        public void setAtsScore(Integer atsScore) {
            this.atsScore = atsScore;
        }
    }

    public static class SkillProficiencyPoint {
        private String skill;
        private Integer level;
        private Integer required;

        public SkillProficiencyPoint() {
        }

        public SkillProficiencyPoint(String skill, Integer level, Integer required) {
            this.skill = skill;
            this.level = level;
            this.required = required;
        }

        public String getSkill() {
            return skill;
        }

        public void setSkill(String skill) {
            this.skill = skill;
        }

        public Integer getLevel() {
            return level;
        }

        public void setLevel(Integer level) {
            this.level = level;
        }

        public Integer getRequired() {
            return required;
        }

        public void setRequired(Integer required) {
            this.required = required;
        }
    }

    public ProgressOverviewDto() {
    }

    public Integer getCurrentReadiness() {
        return currentReadiness;
    }

    public void setCurrentReadiness(Integer currentReadiness) {
        this.currentReadiness = currentReadiness;
    }

    public Integer getPreviousReadiness() {
        return previousReadiness;
    }

    public void setPreviousReadiness(Integer previousReadiness) {
        this.previousReadiness = previousReadiness;
    }

    public Integer getReadinessGrowth() {
        return readinessGrowth;
    }

    public void setReadinessGrowth(Integer readinessGrowth) {
        this.readinessGrowth = readinessGrowth;
    }

    public Integer getSkillsVerifiedCount() {
        return skillsVerifiedCount;
    }

    public void setSkillsVerifiedCount(Integer skillsVerifiedCount) {
        this.skillsVerifiedCount = skillsVerifiedCount;
    }

    public Integer getChallengesCompletedCount() {
        return challengesCompletedCount;
    }

    public void setChallengesCompletedCount(Integer challengesCompletedCount) {
        this.challengesCompletedCount = challengesCompletedCount;
    }

    public Integer getTotalChallengesCount() {
        return totalChallengesCount;
    }

    public void setTotalChallengesCount(Integer totalChallengesCount) {
        this.totalChallengesCount = totalChallengesCount;
    }

    public Integer getRoadmapCompletionPercentage() {
        return roadmapCompletionPercentage;
    }

    public void setRoadmapCompletionPercentage(Integer roadmapCompletionPercentage) {
        this.roadmapCompletionPercentage = roadmapCompletionPercentage;
    }

    public List<ReadinessTrendPoint> getReadinessTrend() {
        return readinessTrend;
    }

    public void setReadinessTrend(List<ReadinessTrendPoint> readinessTrend) {
        this.readinessTrend = readinessTrend;
    }

    public List<SkillProficiencyPoint> getSkillProficiencies() {
        return skillProficiencies;
    }

    public void setSkillProficiencies(List<SkillProficiencyPoint> skillProficiencies) {
        this.skillProficiencies = skillProficiencies;
    }

    public List<String> getRecentMilestones() {
        return recentMilestones;
    }

    public void setRecentMilestones(List<String> recentMilestones) {
        this.recentMilestones = recentMilestones;
    }
}
