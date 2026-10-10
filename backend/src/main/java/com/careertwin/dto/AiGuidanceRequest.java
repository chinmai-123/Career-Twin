package com.careertwin.dto;

import java.util.List;

public class AiGuidanceRequest {
    private String customPrompt;
    private String queryType; // "GENERAL", "ROADMAP", "INTERVIEW", "RECRUITER_FEEDBACK", "PROJECTS"

    public AiGuidanceRequest() {
    }

    public String getCustomPrompt() {
        return customPrompt;
    }

    public void setCustomPrompt(String customPrompt) {
        this.customPrompt = customPrompt;
    }

    public String getQueryType() {
        return queryType;
    }

    public void setQueryType(String queryType) {
        this.queryType = queryType;
    }
}
