package com.careertwin.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility for parsing resume text and performing multi-dimensional
 * Enhancv/Jobscan-aligned ATS scoring.
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
        if (text == null || text.isEmpty()) return 40;
        String lower = text.toLowerCase();
        int score = 50;

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
            score += 15;
        }

        // GitHub / Portfolio presence
        if (hasGitHub(text)) {
            score += 15;
        }

        // Location check (City / State / Country)
        if (lower.contains("india") || lower.contains("telangana") || lower.contains("hyderabad") || lower.contains("khammam") || lower.contains("kamareddy") || lower.contains("bangalore") || lower.contains("pune")) {
            score += 10;
        }

        return Math.min(100, Math.max(50, score));
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
     * Real commercial ATS scanners look for metrics, academic percentages, scale, and dates.
     */
    public static int calculateQuantifiedImpactScore(String text) {
        if (text == null || text.isEmpty()) return 50;

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
        // Student resumes with standard qualitative descriptions start at 74%
        // Measurable impact metrics raise the score to high 80s and 90s
        if (totalMetrics == 0) return 74;
        if (totalMetrics == 1) return 80;
        if (totalMetrics == 2) return 84;
        if (totalMetrics == 3) return 88;
        if (totalMetrics == 4) return 92;
        return Math.min(98, 92 + (totalMetrics - 4) * 2);
    }

    /**
     * Enhancv Pillar: Action Verbs Strength vs Passive Phrasing (0 - 100)
     */
    public static int calculateActionVerbScore(String text) {
        if (text == null || text.isEmpty()) return 60;
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

        // Base starts at 72.
        // Strong power verbs award +4 each (up to +24).
        // Weak passive verbs penalize -3 each.
        int score = 72 + Math.min(24, strongCount * 4) - (weakCount * 3);
        return Math.min(98, Math.max(55, score));
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
     */
    public static int calculateSectionCompleteness(Map<String, String> sections, String text) {
        int score = 50; // Solid baseline for an uploaded resume
        String lower = text != null ? text.toLowerCase() : "";

        // 1. Education (up to +15 pts)
        if (sections.containsKey("EDUCATION") || lower.contains("education") || lower.contains("b.tech") || lower.contains("bachelor") || lower.contains("intermediate")) {
            score += 10;
            if (lower.contains("cgpa") || lower.contains("gpa") || lower.contains("%") || lower.contains("percentile") || lower.contains("grade")) {
                score += 5;
            }
        }

        // 2. Skills (up to +15 pts)
        if (sections.containsKey("SKILLS") || lower.contains("technical skills") || lower.contains("skills")) {
            score += 15;
        }

        // 3. Projects (up to +15 pts)
        if (sections.containsKey("PROJECTS") || lower.contains("projects") || lower.contains("developed") || lower.contains("built")) {
            score += 15;
        }

        // 4. Experience / Certifications / Extracurricular (up to +15 pts)
        if (sections.containsKey("EXPERIENCE") || sections.containsKey("CERTIFICATIONS") ||
            lower.contains("certifications") || lower.contains("certification") || lower.contains("experience") ||
            lower.contains("internship") || lower.contains("achievements") || lower.contains("springboard") || lower.contains("mathworks") || lower.contains("aws")) {
            score += 15;
        }

        // 5. Objective / Summary (+5 pts)
        if (sections.containsKey("OBJECTIVE") || lower.contains("objective") || lower.contains("summary") || lower.contains("profile")) {
            score += 5;
        }

        // Length hygiene check (only penalize extreme outliers)
        int wordCount = text != null ? text.split("\\s+").length : 0;
        if (wordCount < 80) {
            score -= 20; // Extremely short/empty resume
        } else if (wordCount > 1100) {
            score -= 8; // Heavy multi-page bloat
        }

        return Math.min(100, Math.max(50, score));
    }

    /**
     * Formatting Score: Bullet Point Structure & Page Balance (0 - 100)
     */
    public static int calculateFormattingScore(String text) {
        if (text == null || text.trim().isEmpty()) return 50;
        int wordCount = text.split("\\s+").length;
        int score = 65; // High baseline for clean machine-readable PDFs

        // Ideal word count for 1-page student resume (150 - 750 words)
        if (wordCount >= 200 && wordCount <= 700) {
            score += 15;
        } else if (wordCount >= 120 && wordCount < 200) {
            score += 10;
        } else if (wordCount > 700 && wordCount <= 900) {
            score += 8;
        } else {
            score += 4;
        }

        // Section structure & timeline markers (e.g. 2023-2027, 2021-2023, 02/2026)
        if (text.contains("202") || text.contains("201")) {
            score += 8;
        }

        // Bullet point / structured formatting detection
        // In extracted PDF text, bullets appear as bullets, dashes, question marks (encoding), or distinct lines
        long bulletCount = text.lines()
                .filter(l -> {
                    String t = l.trim();
                    return t.startsWith("•") || t.startsWith("- ") || t.startsWith("* ") || t.startsWith("·") ||
                           t.startsWith("✓") || t.startsWith("?") || t.startsWith("–") || t.startsWith("—");
                })
                .count();

        if (bulletCount >= 3) {
            score += 8;
        } else if (text.contains("Developed") || text.contains("Built") || text.contains("Designed")) {
            score += 6; // Structured action items
        }

        // Professional links bonus
        if (hasLinkedIn(text) || hasGitHub(text)) {
            score += 4;
        }

        return Math.min(98, Math.max(60, score));
    }

    /**
     * Readability Score: Average Sentence Length and Vocabulary Diversity (0 - 100)
     */
    public static int calculateReadabilityScore(String text) {
        if (text == null || text.trim().isEmpty()) return 60;
        String[] sentences = text.split("[.!?\\n]+");
        if (sentences.length == 0) return 75;

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
        if (validSentences == 0) return 75;

        double avgLength = (double) wordsInValid / validSentences;
        int base = 70;

        // Optimal sentence / bullet length: 8 - 25 words
        if (avgLength >= 8.0 && avgLength <= 25.0) {
            base += 16;
        } else {
            base += 8;
        }

        // Vocabulary diversity bonus (Unique words / Total words)
        String[] wordsArr = text.toLowerCase().split("\\W+");
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(wordsArr));
        double diversity = (double) uniqueWords.size() / Math.max(1, wordsArr.length);
        int diversityBonus = (int) Math.round(diversity * 10);

        return Math.min(96, Math.max(65, base + diversityBonus));
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
