package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_logs")
public class ProgressLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer readinessScore = 0;
    private Integer atsScore = 0;
    private Integer verifiedSkillsCount = 0;
    private Integer challengesCompletedCount = 0;

    @Column(length = 255)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    public ProgressLog() {
    }

    public ProgressLog(User user, Integer readinessScore, Integer atsScore,
                       Integer verifiedSkillsCount, Integer challengesCompletedCount, String notes) {
        this.user = user;
        this.readinessScore = readinessScore;
        this.atsScore = atsScore;
        this.verifiedSkillsCount = verifiedSkillsCount;
        this.challengesCompletedCount = challengesCompletedCount;
        this.notes = notes;
        this.recordedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public Integer getVerifiedSkillsCount() {
        return verifiedSkillsCount;
    }

    public void setVerifiedSkillsCount(Integer verifiedSkillsCount) {
        this.verifiedSkillsCount = verifiedSkillsCount;
    }

    public Integer getChallengesCompletedCount() {
        return challengesCompletedCount;
    }

    public void setChallengesCompletedCount(Integer challengesCompletedCount) {
        this.challengesCompletedCount = challengesCompletedCount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}
