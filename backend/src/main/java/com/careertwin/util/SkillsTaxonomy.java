package com.careertwin.util;

import java.util.*;

public class SkillsTaxonomy {

    private static final Map<String, List<String>> ROLE_SKILLS_MAP = new LinkedHashMap<>();

    static {
        ROLE_SKILLS_MAP.put("backend", Arrays.asList(
                "Java", "Spring Boot", "REST APIs", "SQL", "MySQL", "Git",
                "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems",
                "Computer Networks", "Docker", "Microservices", "JUnit"
        ));

        ROLE_SKILLS_MAP.put("frontend", Arrays.asList(
                "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS",
                "Redux", "REST APIs", "Git", "Responsive Design", "Data Structures", "Vite"
        ));

        ROLE_SKILLS_MAP.put("fullstack", Arrays.asList(
                "Java", "Spring Boot", "React", "JavaScript", "SQL", "MySQL",
                "REST APIs", "Git", "Data Structures", "Algorithms", "Docker", "HTML5", "CSS3"
        ));

        ROLE_SKILLS_MAP.put("sde", Arrays.asList(
                "Data Structures", "Algorithms", "Java", "OOP", "SQL", "Git",
                "Spring Boot", "REST APIs", "MySQL", "DBMS", "Operating Systems",
                "Computer Networks", "System Design", "Problem Solving"
        ));

        ROLE_SKILLS_MAP.put("tcs_engineer", Arrays.asList(
                "Java", "SQL", "MySQL", "Data Structures", "Algorithms", "OOP",
                "Spring Boot", "REST APIs", "Git", "DBMS", "Operating Systems",
                "Computer Networks", "Problem Solving", "Web Development"
        ));

        ROLE_SKILLS_MAP.put("data_analyst", Arrays.asList(
                "SQL", "Python", "Pandas", "NumPy", "Power BI", "Tableau",
                "Excel", "Data Visualization", "Statistics", "DBMS", "Data Cleaning"
        ));

        ROLE_SKILLS_MAP.put("ai_engineer", Arrays.asList(
                "Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
                "NLP", "Scikit-Learn", "Statistics", "Data Structures", "SQL", "Generative AI"
        ));

        ROLE_SKILLS_MAP.put("devops", Arrays.asList(
                "Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Git",
                "Terraform", "Computer Networks", "Bash", "Python", "Monitoring"
        ));

        ROLE_SKILLS_MAP.put("cybersecurity", Arrays.asList(
                "Computer Networks", "Linux", "Cryptography", "Ethical Hacking",
                "OWASP Top 10", "Network Security", "Python", "Wireshark", "Operating Systems"
        ));
    }

    public static List<String> determineRequiredSkills(String customRole) {
        if (customRole == null || customRole.trim().isEmpty()) {
            return ROLE_SKILLS_MAP.get("backend");
        }

        String lower = customRole.toLowerCase();

        if (lower.contains("tcs") || lower.contains("infosys") || lower.contains("wipro") || lower.contains("cognizant") || lower.contains("accenture")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("tcs_engineer"));
        } else if (lower.contains("data analyst") || lower.contains("business intelligence") || lower.contains("analytics")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("data_analyst"));
        } else if (lower.contains("ai") || lower.contains("machine learning") || lower.contains("data scientist") || lower.contains("deep learning")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("ai_engineer"));
        } else if (lower.contains("devops") || lower.contains("cloud") || lower.contains("site reliability") || lower.contains("sre")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("devops"));
        } else if (lower.contains("security") || lower.contains("cyber")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("cybersecurity"));
        } else if (lower.contains("frontend") || lower.contains("ui") || lower.contains("react") || lower.contains("web developer")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("frontend"));
        } else if (lower.contains("full stack") || lower.contains("fullstack")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("fullstack"));
        } else if (lower.contains("sde") || lower.contains("software development engineer") || lower.contains("software engineer")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("sde"));
        } else {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("backend"));
        }
    }

    public static final List<String> ALL_KNOWN_SKILLS = Arrays.asList(
            "Java", "Spring Boot", "REST APIs", "SQL", "MySQL", "PostgreSQL", "MongoDB",
            "Git", "GitHub", "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems",
            "Computer Networks", "Docker", "Kubernetes", "Microservices", "JUnit", "AWS",
            "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Node.js", "Express",
            "Python", "C++", "C", "Pandas", "NumPy", "Power BI", "Tableau", "Excel", "Machine Learning",
            "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Linux", "CI/CD", "System Design", "Problem Solving", "Web Development"
    );
}
