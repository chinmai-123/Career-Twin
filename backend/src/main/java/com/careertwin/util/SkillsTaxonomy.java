package com.careertwin.util;

import java.util.*;
import java.util.regex.Pattern;

public class SkillsTaxonomy {

    private static final Map<String, List<String>> ROLE_SKILLS_MAP = new LinkedHashMap<>();
    public static final Map<String, List<String>> SKILL_SYNONYMS = new LinkedHashMap<>();

    static {
        ROLE_SKILLS_MAP.put("java_developer", Arrays.asList(
                "Java", "Spring Boot", "REST APIs", "SQL", "MySQL", "Git",
                "OOP", "Data Structures", "Algorithms", "DBMS", "Operating Systems",
                "Computer Networks", "Docker", "JUnit", "Microservices"
        ));

        ROLE_SKILLS_MAP.put("backend", Arrays.asList(
                "Java", "Spring Boot", "REST APIs", "SQL", "MySQL", "Git",
                "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems",
                "Computer Networks", "Docker", "Microservices", "JUnit"
        ));

        ROLE_SKILLS_MAP.put("frontend", Arrays.asList(
                "JavaScript", "TypeScript", "React", "HTML5", "CSS3", "Tailwind CSS",
                "Redux", "REST APIs", "Git", "Responsive Design", "Data Structures", "Web Development"
        ));

        ROLE_SKILLS_MAP.put("fullstack", Arrays.asList(
                "Java", "Spring Boot", "React", "JavaScript", "SQL", "MySQL",
                "REST APIs", "Git", "Data Structures", "Algorithms", "Docker", "HTML5", "CSS3"
        ));

        ROLE_SKILLS_MAP.put("python_developer", Arrays.asList(
                "Python", "Django", "FastAPI", "SQL", "MySQL", "REST APIs",
                "Git", "Data Structures", "Algorithms", "OOP", "DBMS", "Linux", "Docker"
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

        // Industry standard synonym and variation mappings (strictly word-boundary matched)
        SKILL_SYNONYMS.put("Java", Arrays.asList("Java", "Core Java", "Advanced Java", "J2EE", "JDK", "Java 8", "Java 17", "Java 21"));
        SKILL_SYNONYMS.put("Spring Boot", Arrays.asList("Spring Boot", "SpringBoot", "Spring Framework", "Spring MVC", "Spring Cloud"));
        SKILL_SYNONYMS.put("REST APIs", Arrays.asList("REST APIs", "REST API", "RESTful APIs", "RESTful API", "RESTful", "REST Services", "HTTP APIs", "JSON APIs"));
        SKILL_SYNONYMS.put("SQL", Arrays.asList("SQL", "Structured Query Language", "RDBMS"));
        SKILL_SYNONYMS.put("MySQL", Arrays.asList("MySQL", "My-SQL"));
        SKILL_SYNONYMS.put("PostgreSQL", Arrays.asList("PostgreSQL", "Postgres"));
        SKILL_SYNONYMS.put("MongoDB", Arrays.asList("MongoDB", "Mongo DB", "NoSQL", "Document DB", "Mongoose"));
        SKILL_SYNONYMS.put("Git", Arrays.asList("Git", "Version Control", "Bitbucket"));
        SKILL_SYNONYMS.put("GitHub", Arrays.asList("GitHub", "GitLab"));
        SKILL_SYNONYMS.put("Data Structures", Arrays.asList("Data Structures", "DSA", "Data Structures & Algorithms", "Data Structures and Algorithms", "Arrays", "Linked Lists", "Trees", "Graphs", "Stacks", "Queues"));
        SKILL_SYNONYMS.put("Algorithms", Arrays.asList("Algorithms", "Algorithm Design", "DSA", "Problem Solving", "Competitive Programming"));
        SKILL_SYNONYMS.put("OOP", Arrays.asList("OOP", "Object-Oriented Programming", "Object Oriented Programming", "OOPS", "Object-Oriented Design", "Object Oriented Design", "OOPs Concepts"));
        SKILL_SYNONYMS.put("DBMS", Arrays.asList("DBMS", "Database Management Systems", "Database Management System", "Database Management", "RDBMS", "Relational Database"));
        SKILL_SYNONYMS.put("Operating Systems", Arrays.asList("Operating Systems", "Operating System", "Unix", "Windows OS"));
        SKILL_SYNONYMS.put("Computer Networks", Arrays.asList("Computer Networks", "Computer Networking", "Computer Network", "TCP/IP", "Network Protocols"));
        SKILL_SYNONYMS.put("Docker", Arrays.asList("Docker", "Containerization", "Containers", "Dockerfile", "Docker Compose"));
        SKILL_SYNONYMS.put("Kubernetes", Arrays.asList("Kubernetes", "K8s", "Container Orchestration"));
        SKILL_SYNONYMS.put("Microservices", Arrays.asList("Microservices", "Microservice Architecture", "Distributed Systems", "Service-Oriented Architecture", "SOA"));
        SKILL_SYNONYMS.put("JUnit", Arrays.asList("JUnit", "JUnit 5", "Unit Testing", "TestNG", "Mockito", "Testing"));
        SKILL_SYNONYMS.put("AWS", Arrays.asList("AWS", "Amazon Web Services", "Cloud Computing", "Cloud Practitioner", "EC2", "S3"));
        SKILL_SYNONYMS.put("JavaScript", Arrays.asList("JavaScript", "JS", "ES6", "ES6+", "ECMAScript", "Modern JavaScript"));
        SKILL_SYNONYMS.put("TypeScript", Arrays.asList("TypeScript", "TS"));
        SKILL_SYNONYMS.put("React", Arrays.asList("React", "React.js", "ReactJS", "React Native", "React Hooks"));
        SKILL_SYNONYMS.put("HTML5", Arrays.asList("HTML5", "HTML", "HTML/CSS"));
        SKILL_SYNONYMS.put("CSS3", Arrays.asList("CSS3", "CSS", "Tailwind CSS", "Tailwind", "Bootstrap", "SCSS", "SASS", "Responsive Design"));
        SKILL_SYNONYMS.put("Tailwind CSS", Arrays.asList("Tailwind CSS", "Tailwind"));
        SKILL_SYNONYMS.put("Redux", Arrays.asList("Redux", "Redux Toolkit", "State Management"));
        SKILL_SYNONYMS.put("Node.js", Arrays.asList("Node.js", "NodeJS", "Node JS"));
        SKILL_SYNONYMS.put("Express", Arrays.asList("Express", "Express.js", "ExpressJS"));
        SKILL_SYNONYMS.put("Python", Arrays.asList("Python", "Python3", "Py", "Python 3"));
        SKILL_SYNONYMS.put("Django", Arrays.asList("Django", "Django REST Framework"));
        SKILL_SYNONYMS.put("FastAPI", Arrays.asList("FastAPI", "Fast API"));
        SKILL_SYNONYMS.put("C++", Arrays.asList("C++", "CPP", "C / C++"));
        SKILL_SYNONYMS.put("C", Arrays.asList("C", "C Programming", "Programming in C", "C/C++", "ANSI C"));
        SKILL_SYNONYMS.put("Pandas", Arrays.asList("Pandas", "Data Analysis with Pandas"));
        SKILL_SYNONYMS.put("NumPy", Arrays.asList("NumPy", "Numerical Python"));
        SKILL_SYNONYMS.put("Power BI", Arrays.asList("Power BI", "PowerBI", "Business Intelligence", "BI"));
        SKILL_SYNONYMS.put("Tableau", Arrays.asList("Tableau", "Data Visualization"));
        SKILL_SYNONYMS.put("Excel", Arrays.asList("Excel", "MS Excel", "Advanced Excel", "Spreadsheets"));
        SKILL_SYNONYMS.put("Machine Learning", Arrays.asList("Machine Learning", "ML", "Supervised Learning", "Scikit-Learn", "Sklearn"));
        SKILL_SYNONYMS.put("Deep Learning", Arrays.asList("Deep Learning", "Neural Networks", "CNN", "RNN", "Transformers"));
        SKILL_SYNONYMS.put("TensorFlow", Arrays.asList("TensorFlow", "TF", "Keras"));
        SKILL_SYNONYMS.put("PyTorch", Arrays.asList("PyTorch", "Torch"));
        SKILL_SYNONYMS.put("NLP", Arrays.asList("NLP", "Natural Language Processing", "NLTK", "Spacy", "LLMs", "Generative AI"));
        SKILL_SYNONYMS.put("Linux", Arrays.asList("Linux", "Ubuntu", "Bash", "Shell Scripting", "Unix"));
        SKILL_SYNONYMS.put("CI/CD", Arrays.asList("CI/CD", "Continuous Integration", "Continuous Delivery", "GitHub Actions", "Jenkins"));
        SKILL_SYNONYMS.put("System Design", Arrays.asList("System Design", "Scalability", "High-Level Design", "HLD", "LLD", "Software Architecture"));
        SKILL_SYNONYMS.put("Problem Solving", Arrays.asList("Problem Solving", "Competitive Programming", "LeetCode", "HackerRank", "CodeChef", "Codeforces", "Analytical Skills"));
        SKILL_SYNONYMS.put("Web Development", Arrays.asList("Web Development", "Web Technologies", "Full Stack Development", "Frontend", "Backend"));
        SKILL_SYNONYMS.put("Responsive Design", Arrays.asList("Responsive Design", "Mobile-Friendly", "Responsive Web Design"));
        SKILL_SYNONYMS.put("Vite", Arrays.asList("Vite", "Webpack", "Build Tools"));
    }

    public static List<String> determineRequiredSkills(String customRole) {
        if (customRole == null || customRole.trim().isEmpty()) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("backend"));
        }

        String lower = customRole.toLowerCase();

        if (lower.contains("java")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("java_developer"));
        } else if (lower.contains("python")) {
            return new ArrayList<>(ROLE_SKILLS_MAP.get("python_developer"));
        } else if (lower.contains("tcs") || lower.contains("infosys") || lower.contains("wipro") || lower.contains("cognizant") || lower.contains("accenture")) {
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

    public static boolean isSkillMatched(String skill, String textLower, Set<String> extractedLower) {
        if (skill == null || textLower == null) return false;
        String skillLower = skill.toLowerCase();
        if (extractedLower != null && extractedLower.contains(skillLower)) {
            return true;
        }

        List<String> synonyms = SKILL_SYNONYMS.getOrDefault(skill, Collections.singletonList(skill));
        for (String syn : synonyms) {
            String synLower = syn.toLowerCase();
            if (extractedLower != null && extractedLower.contains(synLower)) {
                return true;
            }
            // Always enforce word boundaries to avoid false substring matches
            Pattern p = Pattern.compile("(?i)\\b" + Pattern.quote(synLower) + "\\b");
            if (p.matcher(textLower).find()) {
                return true;
            }
        }
        return false;
    }

    public static final List<String> ALL_KNOWN_SKILLS = Arrays.asList(
            "Java", "Spring Boot", "REST APIs", "SQL", "MySQL", "PostgreSQL", "MongoDB",
            "Git", "GitHub", "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems",
            "Computer Networks", "Docker", "Kubernetes", "Microservices", "JUnit", "AWS",
            "JavaScript", "TypeScript", "React", "HTML5", "HTML", "CSS3", "CSS", "Tailwind CSS", "Redux", "Node.js", "Express",
            "Python", "Django", "FastAPI", "C++", "C", "Pandas", "NumPy", "Power BI", "Tableau", "Excel", "Machine Learning",
            "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Linux", "CI/CD", "System Design", "Problem Solving", "Web Development",
            "Cloud Computing", "Cloud Practitioner"
    );
}
