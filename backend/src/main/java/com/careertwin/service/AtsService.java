package com.careertwin.service;

import com.careertwin.dto.AtsAnalysisResponse;
import com.careertwin.entity.AtsAnalysis;
import com.careertwin.entity.CareerGoal;
import com.careertwin.entity.Resume;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.AtsAnalysisRepository;
import com.careertwin.repository.CareerGoalRepository;
import com.careertwin.repository.ResumeRepository;
import com.careertwin.util.ResumeParserUtil;
import com.careertwin.util.SkillsTaxonomy;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AtsService {

    @Autowired
    private AtsAnalysisRepository atsAnalysisRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    @Autowired
    @Lazy
    private GeminiService geminiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AtsAnalysisResponse analyzeResume(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        AtsAnalysis savedAnalysis = analyzeResumeInternal(resume);
        careerTwinEngineService.recalculateCareerTwin(resume.getUser().getId());

        return mapToResponse(savedAnalysis);
    }

    @Transactional
    public AtsAnalysisResponse analyzeLatestResume(Long userId) {
        Resume latestResume = resumeRepository.findByUserIdAndIsLatestTrue(userId)
                .or(() -> resumeRepository.findByUserIdOrderByVersionNumberDesc(userId).stream().findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("No resume found. Please upload a resume first."));

        return analyzeResume(latestResume.getId());
    }

    @Transactional
    public AtsAnalysis analyzeResumeInternal(Resume resume) {
        Long userId = resume.getUser().getId();

        // Retrieve career goal or fallback
        Optional<CareerGoal> goalOpt = careerGoalRepository.findByUserId(userId);
        String targetRole = goalOpt.map(CareerGoal::getTargetRole).orElse("Software Engineer");
        List<String> requiredSkills = SkillsTaxonomy.determineRequiredSkills(targetRole);

        String text = resume.getExtractedText() != null ? resume.getExtractedText() : "";
        List<String> extractedSkills = ResumeParserUtil.extractSkillsFromText(text);
        Map<String, String> sections = ResumeParserUtil.extractSections(text);

        Set<String> extractedLower = extractedSkills.stream().map(String::toLowerCase).collect(Collectors.toSet());
        String textLower = text.toLowerCase();

        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        int skillFrequencyCount = 0;

        for (String req : requiredSkills) {
            String reqLower = req.toLowerCase();
            if (extractedLower.contains(reqLower) || textLower.contains(reqLower)) {
                matchedKeywords.add(req);
                int occurrences = countOccurrences(textLower, reqLower);
                skillFrequencyCount += Math.min(3, occurrences);
            } else {
                missingKeywords.add(req);
            }
        }

        double roleSkillRatio = requiredSkills.isEmpty() ? 0.7 : ((double) matchedKeywords.size() / requiredSkills.size());
        int techBreadth = extractedSkills.size(); // Total technical skills in candidate's resume

        // 1. Keyword Match Score (0 - 100)
        // Differentiated by core role match (65%), technology breadth (20%), and frequency depth (15%)
        int keywordMatchScore = (int) Math.round(
                (roleSkillRatio * 65.0) +
                Math.min(22.0, techBreadth * 1.5) +
                Math.min(13.0, skillFrequencyCount * 0.8)
        );
        keywordMatchScore = Math.max(30, Math.min(98, keywordMatchScore));

        // 2. Technical Skills Relevance Score (0 - 100)
        boolean hasFrameworks = extractedLower.contains("spring boot") || extractedLower.contains("react") || extractedLower.contains("node.js") || extractedLower.contains("express");
        boolean hasDatabases = extractedLower.contains("sql") || extractedLower.contains("mysql") || extractedLower.contains("mongodb") || extractedLower.contains("postgresql");
        boolean hasCloudOrTools = extractedLower.contains("aws") || extractedLower.contains("docker") || extractedLower.contains("git") || extractedLower.contains("linux");

        int skillMatchScore = (int) Math.round(
                (roleSkillRatio * 50.0) +
                Math.min(30.0, techBreadth * 2.2) +
                (hasFrameworks ? 8 : 0) +
                (hasDatabases ? 6 : 0) +
                (hasCloudOrTools ? 6 : 0)
        );
        skillMatchScore = Math.max(35, Math.min(98, skillMatchScore));

        // 3. Formatting Score (Layout, contact info, length, bullets)
        int formattingScore = ResumeParserUtil.calculateFormattingScore(text);

        // 4. Readability Score (Sentence length, vocabulary diversity)
        int readabilityScore = ResumeParserUtil.calculateReadabilityScore(text);

        // 5. Section Completeness (Header, Education metrics, Skills depth, Project details)
        int sectionCompleteness = ResumeParserUtil.calculateSectionCompleteness(sections, text);

        // 6. Quantified Impact Score (Numbers, metrics, percentages, action verbs)
        int quantifiedImpact = ResumeParserUtil.calculateQuantifiedImpactScore(text);

        // Overall ATS Score formula:
        // 30% Keyword Match + 25% Technical Skills + 18% Quantified Impact + 15% Section Completeness + 12% Formatting/Readability
        int overallScore = (int) Math.round(
                (keywordMatchScore * 0.30) +
                (skillMatchScore * 0.25) +
                (quantifiedImpact * 0.18) +
                (sectionCompleteness * 0.15) +
                (((formattingScore + readabilityScore) / 2.0) * 0.12)
        );
        overallScore = Math.max(28, Math.min(98, overallScore));

        List<String> strengths = new ArrayList<>();
        if (formattingScore >= 75) strengths.add("Clean resume structure and professional layout standards");
        if (!matchedKeywords.isEmpty()) strengths.add("Matched " + matchedKeywords.size() + " key technical skills required for " + targetRole);
        if (techBreadth >= 10) strengths.add("Strong technical vocabulary breadth with " + techBreadth + " recognized developer tools & frameworks");
        if (sectionCompleteness >= 80) strengths.add("Comprehensive sections including Education, Projects, and Skills");
        if (readabilityScore >= 75) strengths.add("Concise bullet length and readable technical phrasing");

        List<String> weaknesses = new ArrayList<>();
        if (!missingKeywords.isEmpty()) weaknesses.add("Missing critical keywords for " + targetRole + ": " + String.join(", ", missingKeywords.stream().limit(4).toList()));
        if (quantifiedImpact < 70) weaknesses.add("Project bullets lack quantified outcomes (e.g., latency reduction %, scale, user count)");
        if (sectionCompleteness < 70) weaknesses.add("Resume is missing standard sections (e.g. Work Experience or Project Impact)");
        if (keywordMatchScore < 60) weaknesses.add("Low keyword frequency for target role requirements");

        List<String> suggestions = ResumeParserUtil.generateActionVerbImprovements(text);
        if (!missingKeywords.isEmpty()) {
            suggestions.add("Add missing skills in your projects: Demonstrate hands-on use of " + missingKeywords.get(0) + (missingKeywords.size() > 1 ? " and " + missingKeywords.get(1) : ""));
        }

        AtsAnalysis analysis = atsAnalysisRepository.findByResume(resume).orElse(new AtsAnalysis());
        analysis.setResume(resume);
        analysis.setUser(resume.getUser());
        analysis.setTargetRole(targetRole);
        analysis.setOverallAtsScore(overallScore);
        analysis.setKeywordMatchScore(keywordMatchScore);
        analysis.setSkillMatchScore(skillMatchScore);
        analysis.setFormattingScore(formattingScore);
        analysis.setReadabilityScore(readabilityScore);
        analysis.setSectionCompletenessScore(sectionCompleteness);

        try {
            analysis.setMatchedKeywordsJson(objectMapper.writeValueAsString(matchedKeywords));
            analysis.setMissingKeywordsJson(objectMapper.writeValueAsString(missingKeywords));
            analysis.setStrengthsJson(objectMapper.writeValueAsString(strengths));
            analysis.setWeaknessesJson(objectMapper.writeValueAsString(weaknesses));
            analysis.setImprovementSuggestionsJson(objectMapper.writeValueAsString(suggestions));
        } catch (Exception ignored) {}

        return atsAnalysisRepository.save(analysis);
    }

    private int countOccurrences(String text, String target) {
        if (text == null || target == null || target.isEmpty()) return 0;
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(target, idx)) != -1) {
            count++;
            idx += target.length();
        }
        return count;
    }

    @Transactional(readOnly = true)
    public AtsAnalysisResponse getLatestAtsAnalysis(Long userId) {
        AtsAnalysis analysis = atsAnalysisRepository.findTopByUserIdOrderByAnalyzedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No ATS analysis found. Please upload a resume first."));
        return mapToResponse(analysis);
    }

    @Transactional
    public AtsAnalysisResponse getAtsAnalysisByResumeId(Long userId, Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        AtsAnalysis analysis = atsAnalysisRepository.findByResume(resume)
                .orElseGet(() -> analyzeResumeInternal(resume));

        return mapToResponse(analysis);
    }

    private AtsAnalysisResponse mapToResponse(AtsAnalysis analysis) {
        AtsAnalysisResponse res = new AtsAnalysisResponse();
        res.setId(analysis.getId());
        res.setResumeId(analysis.getResume() != null ? analysis.getResume().getId() : null);
        res.setResumeVersion(analysis.getResume() != null ? analysis.getResume().getVersionNumber() : 1);
        res.setTargetRole(analysis.getTargetRole());
        res.setOverallAtsScore(analysis.getOverallAtsScore());
        res.setKeywordMatchScore(analysis.getKeywordMatchScore());
        res.setSkillMatchScore(analysis.getSkillMatchScore());
        res.setFormattingScore(analysis.getFormattingScore());
        res.setReadabilityScore(analysis.getReadabilityScore());
        res.setSectionCompletenessScore(analysis.getSectionCompletenessScore());
        res.setAnalyzedAt(analysis.getAnalyzedAt());

        try {
            if (analysis.getMissingKeywordsJson() != null && !analysis.getMissingKeywordsJson().isBlank()) {
                res.setMissingKeywords(objectMapper.readValue(analysis.getMissingKeywordsJson(), new TypeReference<List<String>>() {}));
            } else {
                res.setMissingKeywords(Collections.emptyList());
            }
        } catch (Exception e) { res.setMissingKeywords(Collections.emptyList()); }

        try {
            if (analysis.getMatchedKeywordsJson() != null && !analysis.getMatchedKeywordsJson().isBlank()) {
                res.setMatchedKeywords(objectMapper.readValue(analysis.getMatchedKeywordsJson(), new TypeReference<List<String>>() {}));
            } else {
                res.setMatchedKeywords(Collections.emptyList());
            }
        } catch (Exception e) { res.setMatchedKeywords(Collections.emptyList()); }

        try {
            if (analysis.getImprovementSuggestionsJson() != null && !analysis.getImprovementSuggestionsJson().isBlank()) {
                res.setImprovementSuggestions(objectMapper.readValue(analysis.getImprovementSuggestionsJson(), new TypeReference<List<String>>() {}));
            } else {
                res.setImprovementSuggestions(Collections.emptyList());
            }
        } catch (Exception e) { res.setImprovementSuggestions(Collections.emptyList()); }

        try {
            if (analysis.getStrengthsJson() != null && !analysis.getStrengthsJson().isBlank()) {
                res.setStrengths(objectMapper.readValue(analysis.getStrengthsJson(), new TypeReference<List<String>>() {}));
            } else {
                res.setStrengths(Collections.emptyList());
            }
        } catch (Exception e) { res.setStrengths(Collections.emptyList()); }

        try {
            if (analysis.getWeaknessesJson() != null && !analysis.getWeaknessesJson().isBlank()) {
                res.setWeaknesses(objectMapper.readValue(analysis.getWeaknessesJson(), new TypeReference<List<String>>() {}));
            } else {
                res.setWeaknesses(Collections.emptyList());
            }
        } catch (Exception e) { res.setWeaknesses(Collections.emptyList()); }

        return res;
    }
}
