package com.careertwin.dto;

import java.util.ArrayList;
import java.util.List;

public class UserSolvingLevelDto {
    private String currentLevel; // "BEGINNER", "INTERMEDIATE", "ADVANCED"
    private String levelTitle; // e.g., "Level 2: Intermediate Problem Solver"
    private String recommendedDifficulty; // "EASY", "MEDIUM", "HARD"
    private int totalAttempted;
    private int totalSolved;
    private double solveRatePercentage;
    private double averageScorePercentage;
    private int easySolvedCount;
    private int mediumSolvedCount;
    private int hardSolvedCount;
    private String nextTierDescription;
    private List<String> solvedChallengeIds = new ArrayList<>();
    private List<String> passedCategories = new ArrayList<>();

    public UserSolvingLevelDto() {
    }

    public String getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(String currentLevel) {
        this.currentLevel = currentLevel;
    }

    public String getLevelTitle() {
        return levelTitle;
    }

    public void setLevelTitle(String levelTitle) {
        this.levelTitle = levelTitle;
    }

    public String getRecommendedDifficulty() {
        return recommendedDifficulty;
    }

    public void setRecommendedDifficulty(String recommendedDifficulty) {
        this.recommendedDifficulty = recommendedDifficulty;
    }

    public int getTotalAttempted() {
        return totalAttempted;
    }

    public void setTotalAttempted(int totalAttempted) {
        this.totalAttempted = totalAttempted;
    }

    public int getTotalSolved() {
        return totalSolved;
    }

    public void setTotalSolved(int totalSolved) {
        this.totalSolved = totalSolved;
    }

    public double getSolveRatePercentage() {
        return solveRatePercentage;
    }

    public void setSolveRatePercentage(double solveRatePercentage) {
        this.solveRatePercentage = solveRatePercentage;
    }

    public double getAverageScorePercentage() {
        return averageScorePercentage;
    }

    public void setAverageScorePercentage(double averageScorePercentage) {
        this.averageScorePercentage = averageScorePercentage;
    }

    public int getEasySolvedCount() {
        return easySolvedCount;
    }

    public void setEasySolvedCount(int easySolvedCount) {
        this.easySolvedCount = easySolvedCount;
    }

    public int getMediumSolvedCount() {
        return mediumSolvedCount;
    }

    public void setMediumSolvedCount(int mediumSolvedCount) {
        this.mediumSolvedCount = mediumSolvedCount;
    }

    public int getHardSolvedCount() {
        return hardSolvedCount;
    }

    public void setHardSolvedCount(int hardSolvedCount) {
        this.hardSolvedCount = hardSolvedCount;
    }

    public String getNextTierDescription() {
        return nextTierDescription;
    }

    public void setNextTierDescription(String nextTierDescription) {
        this.nextTierDescription = nextTierDescription;
    }

    public List<String> getSolvedChallengeIds() {
        return solvedChallengeIds;
    }

    public void setSolvedChallengeIds(List<String> solvedChallengeIds) {
        this.solvedChallengeIds = solvedChallengeIds;
    }

    public List<String> getPassedCategories() {
        return passedCategories;
    }

    public void setPassedCategories(List<String> passedCategories) {
        this.passedCategories = passedCategories;
    }
}
