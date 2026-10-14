package com.careertwin.dto;

import jakarta.validation.constraints.NotBlank;

public class CodingSubmissionRequest {

    @NotBlank(message = "Challenge ID is required")
    private String challengeId;

    @NotBlank(message = "Programming language is required")
    private String language; // "java", "python", "javascript", "sql"

    @NotBlank(message = "Code cannot be empty")
    private String code;

    public CodingSubmissionRequest() {
    }

    public String getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
