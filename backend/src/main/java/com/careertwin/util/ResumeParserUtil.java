package com.careertwin.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ResumeParserUtil {

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

    public static int calculateSectionCompleteness(Map<String, String> sections, String text) {
        int score = 0;
        String lower = text != null ? text.toLowerCase() : "";

        // Contact info in Header (up to 20 pts)
        if (lower.contains("@")) score += 5; // Email
        if (lower.matches("(?s).*\\b\\d{10}\\b.*") || lower.contains("+91") || lower.matches("(?s).*\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{4}.*")) score += 5; // Phone
        if (lower.contains("linkedin.com")) score += 5; // LinkedIn profile
        if (lower.contains("github.com")) score += 5; // GitHub profile

        // Education details (up to 20 pts)
        if (sections.containsKey("EDUCATION") || lower.contains("education") || lower.contains("b.tech") || lower.contains("bachelor")) {
            score += 15;
            if (lower.contains("cgpa") || lower.contains("gpa") || lower.contains("%") || lower.contains("percentage")) score += 5;
        }

        // Skills section depth (up to 25 pts)
        if (sections.containsKey("SKILLS") || lower.contains("technical skills") || lower.contains("skills")) {
            score += 18;
            String skillsText = sections.getOrDefault("SKILLS", "");
            if (skillsText.length() > 60) score += 7;
        }

        // Projects section depth (up to 25 pts)
        if (sections.containsKey("PROJECTS") || lower.contains("projects") || lower.contains("academic projects")) {
            score += 18;
            String projText = sections.getOrDefault("PROJECTS", "");
            if (projText.length() > 180) score += 7;
        }

        // Experience / Certifications / Extracurricular (up to 10 pts)
        if (sections.containsKey("EXPERIENCE") || lower.contains("experience") || lower.contains("internship") || lower.contains("certificat") || lower.contains("achievement")) {
            score += 10;
        }

        return Math.min(100, Math.max(30, score));
    }

    public static int calculateFormattingScore(String text) {
        if (text == null || text.trim().isEmpty()) return 20;
        int wordCount = text.split("\\s+").length;
        int score = 48;

        // Ideal word count for 1-2 page student resume (350 - 650 words)
        if (wordCount >= 320 && wordCount <= 650) {
            score += 26;
        } else if (wordCount >= 220 && wordCount < 320) {
            score += 18;
        } else if (wordCount > 650 && wordCount <= 850) {
            score += 15;
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

        if (bulletCount >= 7) score += 16;
        else if (bulletCount >= 3) score += 10;
        else if (bulletCount >= 1) score += 5;

        // Clean link formatting bonus
        if (text.contains("linkedin.com") || text.contains("github.com")) {
            score += 10;
        }

        return Math.min(98, Math.max(35, score));
    }

    public static int calculateReadabilityScore(String text) {
        if (text == null || text.trim().isEmpty()) return 25;
        String[] sentences = text.split("[.!?\\n]+");
        int totalWords = text.split("\\s+").length;
        if (sentences.length == 0) return 65;

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
        if (validSentences == 0) return 68;

        double avgLength = (double) wordsInValid / validSentences;
        int base = 65;

        // Optimal sentence / bullet length: 11 - 22 words
        if (avgLength >= 11.0 && avgLength <= 21.0) {
            base += 24;
        } else if (avgLength >= 8.0 && avgLength < 11.0) {
            base += 17;
        } else if (avgLength > 21.0 && avgLength <= 28.0) {
            base += 13;
        } else {
            base += 6;
        }

        // Vocabulary diversity bonus (Unique words / Total words)
        String[] wordsArr = text.toLowerCase().split("\\W+");
        Set<String> uniqueWords = new HashSet<>(Arrays.asList(wordsArr));
        double diversity = (double) uniqueWords.size() / Math.max(1, wordsArr.length);
        int diversityBonus = (int) Math.round(diversity * 10);

        return Math.min(96, Math.max(40, base + diversityBonus));
    }

    public static int calculateQuantifiedImpactScore(String text) {
        if (text == null || text.isEmpty()) return 25;
        int score = 42;

        // Detect percentages (e.g. 35%, 98%)
        Pattern percentPattern = Pattern.compile("\\b\\d+%");
        Matcher percentMatcher = percentPattern.matcher(text);
        int percentCount = 0;
        while (percentMatcher.find()) percentCount++;

        // Detect scale metrics (ms, seconds, users, requests, queries, endpoints, stars, k)
        Pattern metricPattern = Pattern.compile("(?i)\\b\\d+\\+?\\s*(?:ms|seconds|users|requests|queries|endpoints|stars|k|records|tables|apis)\\b");
        Matcher metricMatcher = metricPattern.matcher(text);
        int metricCount = 0;
        while (metricMatcher.find()) metricCount++;

        score += Math.min(28, (percentCount * 9) + (metricCount * 8));

        // Action verbs density
        List<String> strongVerbs = Arrays.asList(
                "engineered", "architected", "developed", "implemented", "optimized",
                "designed", "integrated", "deployed", "automated", "built", "spearheaded", "refactored", "configured"
        );
        String lower = text.toLowerCase();
        int verbMatches = 0;
        for (String verb : strongVerbs) {
            if (lower.contains(verb)) verbMatches++;
        }
        score += Math.min(28, verbMatches * 6);

        return Math.min(98, Math.max(35, score));
    }

    public static List<String> generateActionVerbImprovements(String text) {
        List<String> suggestions = new ArrayList<>();
        String lower = text != null ? text.toLowerCase() : "";

        if (lower.contains("made a website") || lower.contains("created a website") || lower.contains("developed a website")) {
            suggestions.add("Current: 'Made a website using Java' ➔ Suggested: 'Architected and deployed a responsive full-stack web application using Java, Spring Boot, RESTful APIs, and MySQL integration.'");
        }
        if (lower.contains("worked on") || lower.contains("worked with")) {
            suggestions.add("Current: 'Worked on database queries' ➔ Suggested: 'Engineered optimized relational database schemas and indexed SQL queries in MySQL to achieve sub-100ms response times.'");
        }
        if (lower.contains("helped in") || lower.contains("was responsible for")) {
            suggestions.add("Current: 'Was responsible for backend API' ➔ Suggested: 'Designed and deployed secure stateless REST endpoints adhering to standard HTTP specifications and JWT authorization.'");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Bullet Enhancement: Start each project point with strong action verbs (e.g., 'Engineered', 'Optimized', 'Integrated') followed by measurable business impact (e.g., 'improving response latency by 35%').");
            suggestions.add("Tech Stack Transparency: Clearly specify tools used in each project header (e.g., Technologies: Java, Spring Boot, Hibernate, MySQL, Docker).");
        }

        return suggestions;
    }
}
