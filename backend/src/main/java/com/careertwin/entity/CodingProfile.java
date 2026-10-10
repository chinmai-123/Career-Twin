package com.careertwin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_profiles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "platform"})
})
public class CodingProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String platform; // "GITHUB", "LEETCODE", "CODECHEF", "HACKERRANK", "GEEKSFORGEEKS"

    @Column(nullable = false, length = 100)
    private String username;

    @Column(length = 255)
    private String profileUrl;

    private Integer totalSolved = 0;
    private Integer easySolved = 0;
    private Integer mediumSolved = 0;
    private Integer hardSolved = 0;

    private Integer publicRepos = 0;
    private Integer contributionsCount = 0;

    private Integer rating = 0;
    private String rankName; // e.g. "3 Star", "Knight", "Gold Badge"

    @Column(columnDefinition = "TEXT")
    private String topLanguagesJson; // e.g. ["Java", "Python", "SQL"]

    private Integer dsaScore = 0; // 0 - 100 calculated metric
    private Integer activityScore = 0; // 0 - 100

    private boolean verified = false;

    private LocalDateTime lastSyncedAt;

    public CodingProfile() {
    }

    public CodingProfile(User user, String platform, String username) {
        this.user = user;
        this.platform = platform;
        this.username = username;
        this.lastSyncedAt = LocalDateTime.now();
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

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

    public Integer getTotalSolved() {
        return totalSolved;
    }

    public void setTotalSolved(Integer totalSolved) {
        this.totalSolved = totalSolved;
    }

    public Integer getEasySolved() {
        return easySolved;
    }

    public void setEasySolved(Integer easySolved) {
        this.easySolved = easySolved;
    }

    public Integer getMediumSolved() {
        return mediumSolved;
    }

    public void setMediumSolved(Integer mediumSolved) {
        this.mediumSolved = mediumSolved;
    }

    public Integer getHardSolved() {
        return hardSolved;
    }

    public void setHardSolved(Integer hardSolved) {
        this.hardSolved = hardSolved;
    }

    public Integer getPublicRepos() {
        return publicRepos;
    }

    public void setPublicRepos(Integer publicRepos) {
        this.publicRepos = publicRepos;
    }

    public Integer getContributionsCount() {
        return contributionsCount;
    }

    public void setContributionsCount(Integer contributionsCount) {
        this.contributionsCount = contributionsCount;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getRankName() {
        return rankName;
    }

    public void setRankName(String rankName) {
        this.rankName = rankName;
    }

    public String getTopLanguagesJson() {
        return topLanguagesJson;
    }

    public void setTopLanguagesJson(String topLanguagesJson) {
        this.topLanguagesJson = topLanguagesJson;
    }

    public Integer getDsaScore() {
        return dsaScore;
    }

    public void setDsaScore(Integer dsaScore) {
        this.dsaScore = dsaScore;
    }

    public Integer getActivityScore() {
        return activityScore;
    }

    public void setActivityScore(Integer activityScore) {
        this.activityScore = activityScore;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getLastSyncedAt() {
        return lastSyncedAt;
    }

    public void setLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }
}
