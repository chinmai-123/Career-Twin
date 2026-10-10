package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_skills", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "skill_name"})
})
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "skill_name", nullable = false, length = 80)
    private String skillName;

    @Column(length = 50)
    private String category;

    @Column(length = 30)
    private String proficiencyLevel; // "BEGINNER", "INTERMEDIATE", "ADVANCED"

    private Integer verifiedScore = 0; // 0 - 100

    @Column(length = 30)
    private String source = "SELF_REPORTED"; // "SELF_REPORTED", "RESUME", "ASSESSMENT", "CODING"

    private LocalDateTime updatedAt;

    public UserSkill() {
    }

    public UserSkill(User user, String skillName, String category, String proficiencyLevel, Integer verifiedScore, String source) {
        this.user = user;
        this.skillName = skillName;
        this.category = category;
        this.proficiencyLevel = proficiencyLevel;
        this.verifiedScore = verifiedScore;
        this.source = source;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
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

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }

    public void setProficiencyLevel(String proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }

    public Integer getVerifiedScore() {
        return verifiedScore;
    }

    public void setVerifiedScore(Integer verifiedScore) {
        this.verifiedScore = verifiedScore;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
