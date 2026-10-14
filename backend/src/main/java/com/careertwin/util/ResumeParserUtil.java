package com.careertwin.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility for parsing resume text and performing multi-dimensional
 * Enhancv/Jobscan-aligned ATS scoring calibrated for student & entry-level profiles.
 */
public class ResumeParserUtil {

    private static final List<String> STRONG_ACTION_VERBS = Arrays.asList(
            "architected", "engineered", "spearheaded", "optimized", "automated",
            "refactored", "deployed", "streamlined", "designed", "developed",
            "built", "orchestrated", "accelerated", "containerized", "standardized",
            "implemented", "integrated", "formulated", "executed", "configured",
            "migrated", "benchmarked", "centralized", "eliminated", "resolved",
            "analyzed", "monitored", "created", "applied", "utilized", "tested",
            "collaborated", "led", "maintained", "achieved", "delivered", "produced",
            "programmed", "coded", "managed", "trained", "evaluated", "modelled",
            "modeled", "established", "improved", "enhanced", "constructed", "secured"
    );

    private static final List<String> PASSIVE_WEAK_PHRASES = Arrays.asList(
            "worked on", "worked with", "responsible for", "helped in", "helped with",
            "assisted with", "assisted in", "duties included", "tasks included"
    );

    public static String extractTextFromPdf(InputStream inputStream) {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            return text != null ? text.trim() : "";
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from PDF resume: " + e.getMessage(), e);
        }
    }

    public static List<String> extractSkillsFromText(String text) {
        if (text == null || text.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> matchedSkills = new LinkedHashSet<>();
        String lowerText = text.toLowerCase();

        for (String skill : SkillsTaxonomy.ALL_KNOWN_SKILLS) {
            if (SkillsTaxonomy.isSkillMatched(skill, lowerText, matchedSkills)) {
                matchedSkills.add(skill);
            }
        }

        return new ArrayList<>(matchedSkills);
    }

    public static Map<String, String> extractSections(String text) {
        Map<String, String> sections = new HashMap<>();
        if (text == null || text.isEmpty()) {
            return sections;
        }

        String[] lines = text.split("\\r?\\n");
        String currentSection = "HEADER";
        StringBuilder currentContent = new StringBuilder();

        for (String line : lines) {
            String trimmed = line.trim();
            String upper = trimmed.toUpperCase();

            if (upper.equals("EDUCATION") || upper.startsWith("EDUCATION")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "EDUCATION";
                currentContent = new StringBuilder();
            } else if (upper.equals("SKILLS") || upper.contains("TECHNICAL SKILLS") || upper.equals("SKILLS & ABILITIES") || upper.contains("SKILLS:")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "SKILLS";
                currentContent = new StringBuilder();
            } else if (upper.equals("EXPERIENCE") || upper.contains("WORK EXPERIENCE") || upper.contains("INTERNSHIP")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "EXPERIENCE";
                currentContent = new StringBuilder();
            } else if (upper.equals("PROJECTS") || upper.contains("ACADEMIC PROJECTS") || upper.contains("KEY PROJECTS")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "PROJECTS";
                currentContent = new StringBuilder();
            } else if (upper.equals("CERTIFICATIONS") || upper.contains("ACHIEVEMENTS") || upper.contains("CERTIFICATES")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "CERTIFICATIONS";
                currentContent = new StringBuilder();
            } else if (upper.equals("OBJECTIVE") || upper.contains("SUMMARY") || upper.contains("PROFILE")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "OBJECTIVE";
                currentContent = new StringBuilder();
            } else {
                currentContent.append(line).append("\n");
            }
        }
        sections.put(currentSection, currentContent.toString().trim());

        return sections;
    }

    /**
     * Enhancv Pillar: Contact Information & Professional Web Presence (0 - 100)
     */
    public static int calculateContactScore(String text) {
        if (text == null || text.isEmpty()) return 30;
        String lower = text.toLowerCase();
        int score = 20;

        // Email check
        if (lower.contains("@") && (lower.contains(".com") || lower.contains(".edu") || lower.contains(".in") || lower.contains(".org") || lower.contains(".net"))) {
            score += 20;
        }

        // Phone check
        if (lower.matches("(?s).*\\b\\d{10}\\b.*") || lower.contains("+91") || lower.matches("(?s).*\\d{3}[-\\s.]?\\d{3}[-\\s.]?\\d{4}.*")) {
            score += 20;
        }

        // LinkedIn profile presence
        if (hasLinkedIn(text)) {
            score += 16;
        }

        // GitHub / Portfolio presence
        if (hasGitHub(text)) {
            score += 12;
        }

        // Location check (City / State / Country)
        if (lower.contains("india") || lower.contains("telangana") || lower.contains("hyderabad") || lower.contains("khammam") || lower.contains("kamareddy") || lower.contains("bangalore") || lower.contains("pune")) {
            score += 8;
        }

        return Math.min(92, Math.max(30, score));
    }

    public static boolean hasLinkedIn(String text) {
        if (text == null) return false;
        String l = text.toLowerCase();
        return l.contains("linkedin.com") || l.contains("linkedin:") || l.contains("linkedin/in") || l.contains("linkedin");
    }

    public static boolean hasGitHub(String text) {
        if (text == null) return false;
        String l = text.toLowerCase();
        return l.contains("github.com") || l.contains("gitlab.com") || l.contains("github:") || l.contains("leetcode.com");
    }

    /**
     * Enhancv Pillar: Quantified Impact & Measurable Metrics (0 - 100)
     * Commercial ATS calibration for student / entry-level profiles:
     * College projects typically feature academic percentages and qualitative scopes (68% - 74%).
     */
    public static int calculateQuantifiedImpactScore(String text) {
        if (text == null || text.isEmpty()) return 40;

        // Detect percentages (e.g. 35%, 99.9%, 40%, 72.09%, 95%)
        Pattern percentPattern = Pattern.compile("\\b\\d+(?:\\.\\d+)?%");
        Matcher percentMatcher = percentPattern.matcher(text);
        int percentCount = 0;
        while (percentMatcher.find()) percentCount++;

        // Detect scale metrics (ms, seconds, users, requests, queries, endpoints, records, tables, apis, rps, qps, k, million, stars, forks, x, gb, tb, mb)
        Pattern metricPattern = Pattern.compile("(?i)\\b\\d+(?:\\.\\d+)?\\+?\\s*(?:ms|seconds|sec|users|requests|queries|endpoints|records|tables|apis|rps|qps|k|million|stars|forks|x|gb|tb|mb|students|clients|features|services)\\b");
        Matcher metricMatcher = metricPattern.matcher(text);
        int metricCount = 0;
        while (metricMatcher.find()) metricCount++;

        // Detect CGPA / Grade metrics (e.g. "CGPA: 7.08", "GPA: 8.5", "Percentile: 95")
        Pattern gradePattern = Pattern.compile("(?i)\\b(?:cgpa|gpa|percentile)\\s*[:=-]?\\s*\\d+(?:\\.\\d+)?");
        Matcher gradeMatcher = gradePattern.matcher(text);
        int gradeCount = 0;
        while (gradeMatcher.find()) gradeCount++;

        // Detect general measurable numbers (e.g., "reduced by 40", "handled 500+", "monitored 4 parameters")
        Pattern genericNumPattern = Pattern.compile("(?i)\\b(?:reduced|improved|increased|boosted|handled|scaled|served|processed|analyzed|monitored)\\s+(?:by\\s+)?\\d+");
        Matcher genericNumMatcher = genericNumPattern.matcher(text);
        int genericCount = 0;
        while (genericNumMatcher.find()) genericCount++;

        // Detect academic / project date indicators (e.g., 2023-2027, 02/2026, 12/2025)
        Pattern datePattern = Pattern.compile("\\b(?:20\\d{2}\\s*[-–]\\s*20\\d{2}|\\d{2}/20\\d{2})\\b");
        Matcher dateMatcher = datePattern.matcher(text);
        int dateCount = 0;
        while (dateMatcher.find()) dateCount++;

        int totalMetrics = percentCount + metricCount + gradeCount + genericCount + Math.min(2, dateCount);

        // Enhancv-calibrated commercial scale:
        // Student resumes with academic percentages and qualitative outcomes land in 68% - 74%
        if (totalMetrics == 0) return 55;
        if (totalMetrics == 1) return 63;
        if (totalMetrics == 2) return 68;
        if (totalMetrics == 3) return 71;
        if (totalMetrics == 4) return 74;
        if (totalMetrics == 5) return 77;
        return Math.min(88, 77 + (totalMetrics - 5) * 2);
    }

    /**
     * Enhancv Pillar: Action Verbs Strength vs Passive Phrasing (0 - 100)
     */
    public static int calculateActionVerbScore(String text) {
        if (text == null || text.isEmpty()) return 45;
        String lower = text.toLowerCase();

        int strongCount = 0;
        for (String verb : STRONG_ACTION_VERBS) {
            Pattern p = Pattern.compile("\\b" + Pattern.quote(verb) + "\\b");
            Matcher m = p.matcher(lower);
            while (m.find()) strongCount++;
        }

        int weakCount = 0;
        for (String weak : PASSIVE_WEAK_PHRASES) {
            Pattern p = Pattern.compile("\\b" + Pattern.quote(weak) + "\\b");
            Matcher m = p.matcher(lower);
            while (m.find()) weakCount++;
        }

        // Base starts at 65.
        // Strong power verbs award +2 each (up to +11).
        // Weak passive verbs penalize -3 each.
        int score = 65 + Math.min(11, strongCount * 2) - (weakCount * 3);
        return Math.min(90, Math.max(45, score));
    }

    public static List<String> getPassivePhrasesFound(String text) {
        if (text == null || text.isEmpty()) return Collections.emptyList();
        String lower = text.toLowerCase();
        List<String> found = new ArrayList<>();
        for (String weak : PASSIVE_WEAK_PHRASES) {
            if (lower.contains(weak)) {
                found.add("'" + weak + "'");
            }
        }
        return found;
    }

    /**
     * Enhancv Pillar: Section Completeness & Layout Hygiene (0 - 100)
     * Commercial standard: Full-time corporate experience is required to score 90%+.
     * Good college student profiles (Education, Skills, Projects, Certifications) score 74% - 77%.
     */
    public static int calculateSectionCompleteness(Map<String, String> sections, String text) {
        int score = 25; // Baseline for structured document
        String lower = text != null ? text.toLowerCase() : "";

        // 1. Education (up to +16 pts)
        if (sections.containsKey("EDUCATION") || lower.contains("education") || lower.contains("b.tech") || lower.contains("bachelor") || lower.contains("intermediate")) {
            score += 11;
            if (lower.contains("cgpa") || lower.contains("gpa") || lower.contains("%") || lower.contains("percentile") || lower.contains("grade")) {
                score += 5;
            }
        }

        // 2. Skills (up to +14 pts)
        if (sections.containsKey("SKILLS") || lower.contains("technical skills") || lower.contains("skills")) {
            score += 14;
        }

        // 3. Projects (up to +14 pts)
        if (sections.containsKey("PROJECTS") || lower.contains("projects") || lower.contains("developed") || lower.contains("built")) {
            score += 14;
        }

        // 4. Experience / Internship vs Student Certification Gap (up to +18 pts)
        boolean hasCorporateExperience = lower.contains("work experience") || lower.contains("employment history") || lower.contains("professional experience");
        boolean hasInternship = lower.contains("internship") || lower.contains("intern ");
        boolean hasCertifications = sections.containsKey("CERTIFICATIONS") || lower.contains("certifications") || lower.contains("certification") ||
                lower.contains("springboard") || lower.contains("mathworks") || lower.contains("aws simulearn");

        if (hasCorporateExperience) {
            score += 18;
        } else if (hasInternship) {
            score += 11;
        } else if (hasCertifications) {
            score += 5; // Certifications partially offset experience gap for students
        }

        // 5. Objective / Summary (+4 pts)
        if (sections.containsKey("OBJECTIVE") || lower.contains("objective") || lower.contains("summary") || lower.contains("profile")) {
            score += 4;
        }

        // Length hygiene check
        int wordCount = text != null ? text.split("\\s+").length : 0;
        if (wordCount < 80) {
            score -= 16;
        } else if (wordCount > 1000) {
            score -= 6;
        }

        return Math.min(90, Math.max(35, score));
    }

    /**
     * Formatting Score: Bullet Point Structure & Page Balance (0 - 100)
     */
    public static int calculateFormattingScore(String text) {
        if (text == null || text.trim().isEmpty()) return 40;
        int wordCount = text.split("\\s+").length;
        int score = 58; // Clean machine-readable PDF baseline

        // Ideal word count for 1-page student resume (140 - 700 words)
        if (wordCount >= 140 && wordCount <= 700) {
            score += 9;
        } else if (wordCount >= 100 && wordCount < 140) {
            score += 6;
        } else if (wordCount > 700 && wordCount <= 900) {
            score += 4;
        }

        // Section structure & timeline markers (e.g. 2023-2027, 2021-2023, 02/2026)
        if (text.contains("202") || text.contains("201")) {
            score += 4;
        }

        // Bullet point / structured formatting detection
        long bulletCount = text.lines()
                .filter(l -> {
                    String t = l.trim();
                    return t.startsWith("•") || t.startsWith("- ") || t.startsWith("* ") || t.startsWith("·") ||
                           t.startsWith("✓") || t.startsWith("?") || t.startsWith("–") || t.startsWith("—");
                })
                .count();

        if (bulletCount >= 3 || text.contains("Developed") || text.contains("Built")) {
            score += 3;
        }

        // Professional links bonus
        if (hasLinkedIn(text) || hasGitHub(text)) {
            score += 2;
        }

        return Math.min(88, Math.max(45, score));
    }

    /**
     * Readability Score: Average Sentence Length and Vocabulary Diversity (0 - 100)
     */
    public static int calculateReadabilityScore(String text) {
        if (text == null || text.trim().isEmpty()) return 50;
        String[] sentences = text.split("[.!?\\n]+");
        if (sentences.length == 0) return 72;

        int validSentences = 0;
        int wordsInValid = 0;
        for (String s : sentences) {
            String trimmed = s.trim();
            int w = trimmed.split("\\s+").length;
            if (w >= 3) {
                validSentences++;
                wordsInValid += w;
            }
        }
        if (validSentences == 0) return 72;

        double avgLength = (double) wordsInValid / validSentences;
        int base = 65;

        // Optimal sentence / bullet length: 8 - 25 words
        if (avgLength >= 8.0 && avgLength <= 25.0) {
            base += 8;
        } else {
            base += 4;
        }

        // Vocabulary diversity bonus (Unique words / Total words)
        String[] wordsArr = text.toLowerCase().split("\\W+");
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(wordsArr));
        double diversity = (double) uniqueWords.size() / Math.max(1, wordsArr.length);
        int diversityBonus = (int) Math.round(diversity * 5);

        return Math.min(88, Math.max(55, base + diversityBonus));
    }

    /**
     * Generates Enhancv-Grade Action Verb & Quantified Metric Recommendations
     */
    public static List<String> generateActionVerbImprovements(String text) {
        List<String> suggestions = new ArrayList<>();
        String lower = text != null ? text.toLowerCase() : "";

        if (lower.contains("made a website") || lower.contains("created a website") || lower.contains("developed a website")) {
            suggestions.add("Current: 'Made a website using Java' ➔ Suggested: 'Architected and deployed a responsive full-stack web application using Java, Spring Boot, RESTful APIs, and MySQL integration, serving 500+ active student users.'");
        }
        if (lower.contains("worked on") || lower.contains("worked with")) {
            suggestions.add("Current: 'Worked on database queries' ➔ Suggested: 'Engineered optimized relational database schemas and indexed SQL queries in MySQL to achieve sub-100ms response times for high-volume transactions.'");
        }
        if (lower.contains("helped in") || lower.contains("was responsible for") || lower.contains("responsible for")) {
            suggestions.add("Current: 'Was responsible for backend API' ➔ Suggested: 'Designed and deployed secure stateless REST endpoints adhering to standard HTTP specifications and JWT authorization, reducing unauthorized attempts to 0%.'");
        }
        if (lower.contains("handled authentication") || lower.contains("made login")) {
            suggestions.add("Current: 'Handled authentication' ➔ Suggested: 'Implemented role-based JWT authentication and BCrypt password encryption, securing 10+ sensitive student records endpoints.'");
        }

        // Enhancv XYZ metric enhancement
        if (suggestions.isEmpty()) {
            suggestions.add("Quantify Achievements (Enhancv XYZ Formula): Rewrite project points as 'Accomplished [X] as measured by [Y]%, by doing [Z]' (e.g., 'Reduced query latency by 35% by implementing Redis caching and indexing MySQL foreign keys').");
            suggestions.add("Lead with Action Verbs: Begin every bullet point with strong power verbs (e.g. 'Engineered', 'Architected', 'Streamlined', 'Deployed') instead of passive descriptions.");
        }

        return suggestions;
    }
}
