package com.careertwin.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ResumeDto {
    private Long id;
    private Integer versionNumber;
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String downloadUrl;
    private List<String> parsedSkills;
    private List<String> parsedEducation;
    private List<String> parsedExperience;
    private List<String> parsedProjects;
    private boolean isLatest;
    private LocalDateTime uploadedAt;

    public ResumeDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public List<String> getParsedSkills() {
        return parsedSkills;
    }

    public void setParsedSkills(List<String> parsedSkills) {
        this.parsedSkills = parsedSkills;
    }

    public List<String> getParsedEducation() {
        return parsedEducation;
    }

    public void setParsedEducation(List<String> parsedEducation) {
        this.parsedEducation = parsedEducation;
    }

    public List<String> getParsedExperience() {
        return parsedExperience;
    }

    public void setParsedExperience(List<String> parsedExperience) {
        this.parsedExperience = parsedExperience;
    }

    public List<String> getParsedProjects() {
        return parsedProjects;
    }

    public void setParsedProjects(List<String> parsedProjects) {
        this.parsedProjects = parsedProjects;
    }

    public boolean isLatest() {
        return isLatest;
    }

    public void setLatest(boolean latest) {
        isLatest = latest;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
