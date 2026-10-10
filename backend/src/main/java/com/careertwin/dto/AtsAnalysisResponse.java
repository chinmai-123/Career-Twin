package com.careertwin.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AtsAnalysisResponse {
    private Long id;
    private Long resumeId;
    private Integer resumeVersion;
    private String targetRole;
    private Integer overallAtsScore;
    private Integer keywordMatchScore;
    private Integer skillMatchScore;
    private Integer formattingScore;
    private Integer readabilityScore;
    private Integer sectionCompletenessScore;
    private List<String> missingKeywords;
    private List<String> matchedKeywords;
    private List<String> improvementSuggestions;
    private List<String> strengths;
    private List<String> weaknesses;
    private LocalDateTime analyzedAt;

    public AtsAnalysisResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Integer getResumeVersion() {
        return resumeVersion;
    }

    public void setResumeVersion(Integer resumeVersion) {
        this.resumeVersion = resumeVersion;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public Integer getOverallAtsScore() {
        return overallAtsScore;
    }

    public void setOverallAtsScore(Integer overallAtsScore) {
        this.overallAtsScore = overallAtsScore;
    }

    public Integer getKeywordMatchScore() {
        return keywordMatchScore;
    }

    public void setKeywordMatchScore(Integer keywordMatchScore) {
        this.keywordMatchScore = keywordMatchScore;
    }

    public Integer getSkillMatchScore() {
        return skillMatchScore;
    }

    public void setSkillMatchScore(Integer skillMatchScore) {
        this.skillMatchScore = skillMatchScore;
    }

    public Integer getFormattingScore() {
        return formattingScore;
    }

    public void setFormattingScore(Integer formattingScore) {
        this.formattingScore = formattingScore;
    }

    public Integer getReadabilityScore() {
        return readabilityScore;
    }

    public void setReadabilityScore(Integer readabilityScore) {
        this.readabilityScore = readabilityScore;
    }

    public Integer getSectionCompletenessScore() {
        return sectionCompletenessScore;
    }

    public void setSectionCompletenessScore(Integer sectionCompletenessScore) {
        this.sectionCompletenessScore = sectionCompletenessScore;
    }

    public List<String> getMissingKeywords() {
        return missingKeywords;
    }

    public void setMissingKeywords(List<String> missingKeywords) {
        this.missingKeywords = missingKeywords;
    }

    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }

    public void setMatchedKeywords(List<String> matchedKeywords) {
        this.matchedKeywords = matchedKeywords;
    }

    public List<String> getImprovementSuggestions() {
        return improvementSuggestions;
    }

    public void setImprovementSuggestions(List<String> improvementSuggestions) {
        this.improvementSuggestions = improvementSuggestions;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
