package com.careertwin.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class AssessmentSubmitRequest {

    @NotBlank(message = "Category is required")
    private String category;

    private Integer timeTakenSeconds = 0;

    // Map of questionId -> selectedOption ("A", "B", "C", "D")
    private Map<Long, String> answers;

    public AssessmentSubmitRequest() {
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}
