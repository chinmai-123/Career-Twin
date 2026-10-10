package com.careertwin.dto;

import java.util.List;

public class AiGuidanceResponse {
    private String targetRole;
    private String recruiterFeedback;
    private List<InterviewQuestionDto> interviewQuestions;
    private List<RoadmapWeekDto> weeklyPlan;
    private List<String> technicalTopicRecommendations;
    private List<String> resumeImprovementTips;
    private String responseText;
    private boolean isAiGenerated;
    private String userQuestion;

    public static class InterviewQuestionDto {
        private String question;
        private String concept;
        private String modelAnswer;

        public InterviewQuestionDto() {
        }

        public InterviewQuestionDto(String question, String concept, String modelAnswer) {
            this.question = question;
            this.concept = concept;
            this.modelAnswer = modelAnswer;
        }

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public String getConcept() {
            return concept;
        }

        public void setConcept(String concept) {
            this.concept = concept;
        }

        public String getModelAnswer() {
            return modelAnswer;
        }

        public void setModelAnswer(String modelAnswer) {
            this.modelAnswer = modelAnswer;
        }
    }

    public static class RoadmapWeekDto {
        private String week;
        private String focusArea;
        private List<String> topics;
        private String expectedOutput;

        public RoadmapWeekDto() {
        }

        public RoadmapWeekDto(String week, String focusArea, List<String> topics, String expectedOutput) {
            this.week = week;
            this.focusArea = focusArea;
            this.topics = topics;
            this.expectedOutput = expectedOutput;
        }

        public String getWeek() {
            return week;
        }

        public void setWeek(String week) {
            this.week = week;
        }

        public String getFocusArea() {
            return focusArea;
        }

        public void setFocusArea(String focusArea) {
            this.focusArea = focusArea;
        }

        public List<String> getTopics() {
            return topics;
        }

        public void setTopics(List<String> topics) {
            this.topics = topics;
        }

        public String getExpectedOutput() {
            return expectedOutput;
        }

        public void setExpectedOutput(String expectedOutput) {
            this.expectedOutput = expectedOutput;
        }
    }

    public AiGuidanceResponse() {
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getRecruiterFeedback() {
        return recruiterFeedback;
    }

    public void setRecruiterFeedback(String recruiterFeedback) {
        this.recruiterFeedback = recruiterFeedback;
    }

    public List<InterviewQuestionDto> getInterviewQuestions() {
        return interviewQuestions;
    }

    public void setInterviewQuestions(List<InterviewQuestionDto> interviewQuestions) {
        this.interviewQuestions = interviewQuestions;
    }

    public List<RoadmapWeekDto> getWeeklyPlan() {
        return weeklyPlan;
    }

    public void setWeeklyPlan(List<RoadmapWeekDto> weeklyPlan) {
        this.weeklyPlan = weeklyPlan;
    }

    public List<String> getTechnicalTopicRecommendations() {
        return technicalTopicRecommendations;
    }

    public void setTechnicalTopicRecommendations(List<String> technicalTopicRecommendations) {
        this.technicalTopicRecommendations = technicalTopicRecommendations;
    }

    public List<String> getResumeImprovementTips() {
        return resumeImprovementTips;
    }

    public void setResumeImprovementTips(List<String> resumeImprovementTips) {
        this.resumeImprovementTips = resumeImprovementTips;
    }

    public String getResponseText() {
        return responseText;
    }

    public void setResponseText(String responseText) {
        this.responseText = responseText;
    }

    public boolean isAiGenerated() {
        return isAiGenerated;
    }

    public void setAiGenerated(boolean aiGenerated) {
        isAiGenerated = aiGenerated;
    }

    public String getUserQuestion() {
        return userQuestion;
    }

    public void setUserQuestion(String userQuestion) {
        this.userQuestion = userQuestion;
    }
}
