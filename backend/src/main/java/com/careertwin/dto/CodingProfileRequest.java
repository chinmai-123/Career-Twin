package com.careertwin.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CodingProfileRequest {

    @NotBlank(message = "Platform is required (GITHUB, LEETCODE, CODECHEF, HACKERRANK, GEEKSFORGEEKS)")
    private String platform;

    @NotBlank(message = "Username is required")
    private String username;

    private String profileUrl;

    // Optional manual update / override fields
    private Integer totalSolved;
    private Integer easySolved;
    private Integer mediumSolved;
    private Integer hardSolved;
    private Integer rating;
    private Integer publicRepos;
    private Integer contributionsCount;
    private List<String> topLanguages;

    public CodingProfileRequest() {
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

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
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

    public List<String> getTopLanguages() {
        return topLanguages;
    }

    public void setTopLanguages(List<String> topLanguages) {
        this.topLanguages = topLanguages;
    }
}
