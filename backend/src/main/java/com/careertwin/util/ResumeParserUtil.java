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
            "migrated", "benchmarked", "centralized", "eliminated", "resolved"
    );

    private static final List<String> PASSIVE_WEAK_PHRASES = Arrays.asList(
            "worked on", "worked with", "responsible for", "helped in", "helped with",
            "assisted with", "assisted in", "handled", "made a", "created a",
            "participated in", "involved in", "duties included", "tasks included"
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
            String patternString = "\\b" + Pattern.quote(skill.toLowerCase()) + "\\b";
            Pattern pattern = Pattern.compile(patternString);
            Matcher matcher = pattern.matcher(lowerText);
            if (matcher.find()) {
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
            } else if (upper.equals("SKILLS") || upper.contains("TECHNICAL SKILLS") || upper.equals("SKILLS & ABILITIES")) {
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
            } else if (upper.equals("CERTIFICATIONS") || upper.contains("ACHIEVEMENTS")) {
                sections.put(currentSection, currentContent.toString().trim());
                currentSection = "CERTIFICATIONS";
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
        if (text == null || text.isEmpty()) return 20;
        String lower = text.toLowerCase();
        int score = 0;

        // Email check
        if (lower.contains("@") && (lower.contains(".com") || lower.contains(".edu") || lower.contains(".in") || lower.contains(".org") || lower.contains(".net"))) {
            score += 25;
        }

        // Phone check
        if (lower.matches("(?s).*\\b\\d{10}\\b.*") || lower.contains("+91") || lower.matches("(?s).*\\d{3}[-\\s.]?\\d{3}[-\\s.]?\\d{4}.*")) {
            score += 25;
        }

        // LinkedIn profile presence
        if (lower.contains("linkedin.com") || lower.contains("linkedin:") || lower.contains("linkedin/in")) {
            score += 25;
        }

        // GitHub / Portfolio / LeetCode presence
        if (lower.contains("github.com") || lower.contains("gitlab.com") || lower.contains("leetcode.com") || lower.contains("portfolio")) {
            score += 25;
        }

        return Math.min(100, Math.max(20, score));
    }

    public static boolean hasLinkedIn(String text) {
        if (text == null) return false;
        String l = text.toLowerCase();
        return l.contains("linkedin.com") || l.contains("linkedin:") || l.contains("linkedin/in");
    }

    public static boolean hasGitHub(String text) {
        if (text == null) return false;
        String l = text.toLowerCase();
        return l.contains("github.com") || l.contains("gitlab.com") || l.contains("leetcode.com");
    }

    /**
     * Enhancv Pillar: Quantified Impact & Measurable Metrics (0 - 100)
     * Real commercial ATS scanners require numbers, percentages, and scale indicators.
     */
    public static int calculateQuantifiedImpactScore(String text) {
        if (text == null || text.isEmpty()) return 20;

        // Detect percentages (e.g. 35%, 99.9%, 40%)
        Pattern percentPattern = Pattern.compile("\\b\\d+(?:\\.\\d+)?%");
        Matcher percentMatcher = percentPattern.matcher(text);
        int percentCount = 0;
        while (percentMatcher.find()) percentCount++;

        // Detect scale metrics (ms, seconds, users, requests, queries, endpoints, stars, k, million, rps, qps, records)
        Pattern metricPattern = Pattern.compile("(?i)\\b\\d+(?:\\.\\d+)?\\+?\\s*(?:ms|seconds|sec|users|requests|queries|endpoints|records|tables|apis|rps|qps|k|million|stars|forks|x|gb|tb|mb)\\b");
        Matcher metricMatcher = metricPattern.matcher(text);
        int metricCount = 0;
        while (metricMatcher.find()) metricCount++;

        // Detect general measurable numbers (e.g., "500+", "over 100", "reduced by 40")
        Pattern genericNumPattern = Pattern.compile("(?i)\\b(?:reduced|improved|increased|boosted|handled|scaled|served|processed)\\s+(?:by\\s+)?\\d+");
        Matcher genericNumMatcher = genericNumPattern.matcher(text);
        int genericCount = 0;
        while (genericNumMatcher.find()) genericCount++;

        int totalMetrics = percentCount + metricCount + genericCount;

        // Enhancv-aligned scale:
        // 0 metrics: 22 points (Unquantified warning)
        // 1 metric:  48 points
        // 2 metrics: 64 points
        // 3 metrics: 78 points
        // 4 metrics: 88 points
        // 5+ metrics: 95 points
        if (totalMetrics == 0) return 22;
        if (totalMetrics == 1) return 48;
        if (totalMetrics == 2) return 64;
        if (totalMetrics == 3) return 78;
        if (totalMetrics == 4) return 88;
        return Math.min(98, 90 + (totalMetrics - 5) * 2);
    }

    /**
     * Enhancv Pillar: Action Verbs Strength vs Passive Phrasing (0 - 100)
     */
    public static int calculateActionVerbScore(String text) {
        if (text == null || text.isEmpty()) return 25;
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

        // Base starts at 45.
        // Strong power verbs award +9 each (up to +50).
        // Weak passive verbs penalize -10 each!
        int score = 45 + (strongCount * 9) - (weakCount * 10);
        return Math.min(98, Math.max(20, score));
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
        int score = 0;
        String lower = text != null ? text.toLowerCase() : "";

        // 1. Education (25 pts)
        if (sections.containsKey("EDUCATION") || lower.contains("education") || lower.contains("b.tech") || lower.contains("bachelor")) {
            score += 18;
            if (lower.contains("cgpa") || lower.contains("gpa") || lower.contains("%") || lower.contains("percentage") || lower.contains("grade")) {
                score += 7;
            }
        }

        // 2. Skills (25 pts)
        if (sections.containsKey("SKILLS") || lower.contains("technical skills") || lower.contains("skills")) {
            score += 18;
            String skillsText = sections.getOrDefault("SKILLS", "");
            if (skillsText.length() > 50) score += 7;
        }

        // 3. Projects (25 pts)
        if (sections.containsKey("PROJECTS") || lower.contains("projects") || lower.contains("academic projects")) {
            score += 18;
            String projText = sections.getOrDefault("PROJECTS", "");
            if (projText.length() > 150) score += 7;
        }

        // 4. Experience / Certifications / Extracurricular (25 pts)
        if (sections.containsKey("EXPERIENCE") || lower.contains("experience") || lower.contains("internship") || lower.contains("certificat") || lower.contains("achievement")) {
            score += 25;
        } else {
            // For students, 2+ substantial projects can partially offset lack of formal experience
            String projText = sections.getOrDefault("PROJECTS", "");
            if (projText.length() > 280) score += 15;
        }

        // Length hygiene check
        int wordCount = text != null ? text.split("\\s+").length : 0;
        if (wordCount < 180) {
            score -= 25; // Severely incomplete resume penalty
        } else if (wordCount > 900) {
            score -= 10; // Multi-page bloat penalty for student resume
        }

        return Math.min(100, Math.max(20, score));
    }

    /**
     * Formatting Score: Bullet Point Structure & Page Balance (0 - 100)
     */
    public static int calculateFormattingScore(String text) {
        if (text == null || text.trim().isEmpty()) return 20;
        int wordCount = text.split("\\s+").length;
        int score = 35;

        // Ideal word count for 1-page student resume (350 - 650 words)
        if (wordCount >= 320 && wordCount <= 650) {
            score += 30;
        } else if (wordCount >= 220 && wordCount < 320) {
            score += 20;
        } else if (wordCount > 650 && wordCount <= 850) {
            score += 16;
        } else {
            score += 8;
        }

        // Bullet point presence
        long bulletCount = text.lines()
                .filter(l -> {
                    String t = l.trim();
                    return t.startsWith("•") || t.startsWith("- ") || t.startsWith("* ") || t.startsWith("·") || t.startsWith("✓");
                })
                .count();

        if (bulletCount >= 8) score += 25;
        else if (bulletCount >= 4) score += 18;
        else if (bulletCount >= 1) score += 8;

        // Clean link formatting bonus
        if (hasLinkedIn(text) && hasGitHub(text)) {
            score += 10;
        }

        return Math.min(98, Math.max(25, score));
    }

    /**
     * Readability Score: Average Sentence Length and Vocabulary Diversity (0 - 100)
     */
    public static int calculateReadabilityScore(String text) {
        if (text == null || text.trim().isEmpty()) return 25;
        String[] sentences = text.split("[.!?\\n]+");
        if (sentences.length == 0) return 60;

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
        if (validSentences == 0) return 60;

        double avgLength = (double) wordsInValid / validSentences;
        int base = 50;

        // Optimal sentence / bullet length: 11 - 22 words
        if (avgLength >= 11.0 && avgLength <= 21.0) {
            base += 35;
        } else if (avgLength >= 8.0 && avgLength < 11.0) {
            base += 24;
        } else if (avgLength > 21.0 && avgLength <= 28.0) {
            base += 18;
        } else {
            base += 8;
        }

        // Vocabulary diversity bonus (Unique words / Total words)
        String[] wordsArr = text.toLowerCase().split("\\W+");
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(wordsArr));
        double diversity = (double) uniqueWords.size() / Math.max(1, wordsArr.length);
        int diversityBonus = (int) Math.round(diversity * 12);

        return Math.min(96, Math.max(30, base + diversityBonus));
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

        // If no passive phrasing explicitly caught, provide foundational Enhancv guidance
        if (suggestions.isEmpty()) {
            suggestions.add("Quantify Achievements (Enhancv XYZ Formula): Rewrite project points as 'Accomplished [X] as measured by [Y]%, by doing [Z]' (e.g., 'Reduced query latency by 35% by implementing Redis caching and indexing MySQL foreign keys').");
            suggestions.add("Lead with Action Verbs: Begin every bullet point with strong power verbs (e.g. 'Engineered', 'Architected', 'Streamlined', 'Deployed') instead of passive descriptions.");
        }

        return suggestions;
    }
}
