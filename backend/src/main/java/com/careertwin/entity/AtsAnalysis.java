package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ats_analyses")
public class AtsAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String targetRole;

    private Integer overallAtsScore; // 0 - 100
    private Integer keywordMatchScore; // 0 - 100
    private Integer skillMatchScore; // 0 - 100
    private Integer formattingScore; // 0 - 100
    private Integer readabilityScore; // 0 - 100
    private Integer sectionCompletenessScore; // 0 - 100

    @Column(columnDefinition = "TEXT")
    private String missingKeywordsJson; // e.g. ["Spring Security", "Docker", "JUnit"]

    @Column(columnDefinition = "TEXT")
    private String matchedKeywordsJson;

    @Column(columnDefinition = "TEXT")
    private String improvementSuggestionsJson; // List of specific suggestions e.g. bullet rewrites

    @Column(columnDefinition = "TEXT")
    private String strengthsJson;

    @Column(columnDefinition = "TEXT")
    private String weaknessesJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime analyzedAt;

    public AtsAnalysis() {
    }

    @PrePersist
    protected void onCreate() {
        this.analyzedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getMissingKeywordsJson() {
        return missingKeywordsJson;
    }

    public void setMissingKeywordsJson(String missingKeywordsJson) {
        this.missingKeywordsJson = missingKeywordsJson;
    }

    public String getMatchedKeywordsJson() {
        return matchedKeywordsJson;
    }

    public void setMatchedKeywordsJson(String matchedKeywordsJson) {
        this.matchedKeywordsJson = matchedKeywordsJson;
    }

    public String getImprovementSuggestionsJson() {
        return improvementSuggestionsJson;
    }

    public void setImprovementSuggestionsJson(String improvementSuggestionsJson) {
        this.improvementSuggestionsJson = improvementSuggestionsJson;
    }

    public String getStrengthsJson() {
        return strengthsJson;
    }

    public void setStrengthsJson(String strengthsJson) {
        this.strengthsJson = strengthsJson;
    }

    public String getWeaknessesJson() {
        return weaknessesJson;
    }

    public void setWeaknessesJson(String weaknessesJson) {
        this.weaknessesJson = weaknessesJson;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
