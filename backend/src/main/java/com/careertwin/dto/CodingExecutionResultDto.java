package com.careertwin.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CodingExecutionResultDto {
    private String challengeId;
    private boolean passed;
    private int totalTestCases;
    private int passedTestCases;
    private double scorePercentage;
    private String statusMessage;
    private long executionTimeMs;
    private List<TestCaseResult> testCaseResults;
    private String feedback;

    public CodingExecutionResultDto() {
    }

    public static class TestCaseResult {
        private int testCaseIndex;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private String errorMessage;

        public TestCaseResult() {
        }

        public TestCaseResult(int testCaseIndex, String input, String expectedOutput, String actualOutput, boolean passed, String errorMessage) {
            this.testCaseIndex = testCaseIndex;
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.passed = passed;
            this.errorMessage = errorMessage;
        }

        public int getTestCaseIndex() {
            return testCaseIndex;
        }

        public void setTestCaseIndex(int testCaseIndex) {
            this.testCaseIndex = testCaseIndex;
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

        public String getActualOutput() {
            return actualOutput;
        }

        public void setActualOutput(String actualOutput) {
            this.actualOutput = actualOutput;
        }

        public boolean isPassed() {
            return passed;
        }

        public void setPassed(boolean passed) {
            this.passed = passed;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public int getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(int totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public int getPassedTestCases() {
        return passedTestCases;
    }

    public void setPassedTestCases(int passedTestCases) {
        this.passedTestCases = passedTestCases;
    }

    public double getScorePercentage() {
        return scorePercentage;
    }

    public void setScorePercentage(double scorePercentage) {
        this.scorePercentage = scorePercentage;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public List<TestCaseResult> getTestCaseResults() {
        return testCaseResults;
    }

    public void setTestCaseResults(List<TestCaseResult> testCaseResults) {
        this.testCaseResults = testCaseResults;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
