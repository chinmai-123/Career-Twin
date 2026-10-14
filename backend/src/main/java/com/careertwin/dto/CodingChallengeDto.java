package com.careertwin.dto;

import java.util.List;
import java.util.Map;

public class CodingChallengeDto {
    private String id;
    private String title;
    private String category; // "DSA", "BACKEND", "SQL", "FRONTEND"
    private String roleCategory; // "Backend Developer", "Full Stack Developer", "Data Scientist", "ALL"
    private String difficulty; // "EASY", "MEDIUM", "HARD"
    private String description;
    private List<String> constraints;
    private String sampleInput;
    private String sampleOutput;
    private Map<String, String> starterCode; // language -> template code
    private List<TestCaseDto> visibleTestCases;

    public CodingChallengeDto() {
    }

    public static class TestCaseDto {
        private String input;
        private String expectedOutput;
        private String explanation;

        public TestCaseDto() {
        }

        public TestCaseDto(String input, String expectedOutput, String explanation) {
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.explanation = explanation;
        }

        public String getInput() {
            return input;
        }

        public void setInput(String input) {
            this.input = input;
        }

        public String getExpectedOutput() {
            return expectedOutput;
        }

        public void setExpectedOutput(String expectedOutput) {
            this.expectedOutput = expectedOutput;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRoleCategory() {
        return roleCategory;
    }

    public void setRoleCategory(String roleCategory) {
        this.roleCategory = roleCategory;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getConstraints() {
        return constraints;
    }

    public void setConstraints(List<String> constraints) {
        this.constraints = constraints;
    }

    public String getSampleInput() {
        return sampleInput;
    }

    public void setSampleInput(String sampleInput) {
        this.sampleInput = sampleInput;
    }

    public String getSampleOutput() {
        return sampleOutput;
    }

    public void setSampleOutput(String sampleOutput) {
        this.sampleOutput = sampleOutput;
    }

    public Map<String, String> getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(Map<String, String> starterCode) {
        this.starterCode = starterCode;
    }

    public List<TestCaseDto> getVisibleTestCases() {
        return visibleTestCases;
    }

    public void setVisibleTestCases(List<TestCaseDto> visibleTestCases) {
        this.visibleTestCases = visibleTestCases;
    }
}
