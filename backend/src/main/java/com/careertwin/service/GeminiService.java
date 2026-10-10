package com.careertwin.service;

import com.careertwin.dto.AiGuidanceRequest;
import com.careertwin.dto.AiGuidanceResponse;
import com.careertwin.entity.CareerGoal;
import com.careertwin.entity.CareerTwinProfile;
import com.careertwin.repository.CareerGoalRepository;
import com.careertwin.repository.CareerTwinProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.gemini.base-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private CareerTwinProfileRepository careerTwinProfileRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiGuidanceResponse getGuidance(Long userId, AiGuidanceRequest request) {
        Optional<CareerGoal> goalOpt = careerGoalRepository.findByUserId(userId);
        String targetRole = goalOpt.map(CareerGoal::getTargetRole).orElse("Software Engineer");
        String targetCompany = goalOpt.map(CareerGoal::getTargetCompany).orElse("Top Product Companies");

        Optional<CareerTwinProfile> twinOpt = careerTwinProfileRepository.findByUserId(userId);
        int readiness = twinOpt.map(CareerTwinProfile::getOverallReadiness).orElse(65);

        String prompt = request != null && request.getCustomPrompt() != null ? request.getCustomPrompt().trim() : "";

        // Check if Gemini API key is configured
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equals("your_gemini_api_key_here")) {
            try {
                return callGeminiApi(targetRole, targetCompany, readiness, request);
            } catch (Exception e) {
                logger.warn("Gemini API call failed, falling back to intelligent heuristic guidance: {}", e.getMessage());
            }
        }

        // Return rich structured fallback guidance with intelligent mentor response
        return generateFallbackGuidance(targetRole, targetCompany, readiness, request);
    }

    private AiGuidanceResponse callGeminiApi(String targetRole, String targetCompany, int readiness, AiGuidanceRequest req) {
        String url = geminiBaseUrl + "/" + geminiModel + ":generateContent?key=" + geminiApiKey;
        String prompt = req != null && req.getCustomPrompt() != null ? req.getCustomPrompt().trim() : "";

        String systemPrompt;
        if (!prompt.isEmpty()) {
            systemPrompt = "You are an expert technical campus placement director and senior hiring manager for " + targetRole + " roles at " + targetCompany + ". " +
                    "The student has a placement readiness score of " + readiness + "%. " +
                    "The student asks you this question: \"" + prompt + "\".\n\n" +
                    "Please answer the student's question directly, comprehensively, and conversationally. " +
                    "Provide practical word-for-word scripts where applicable, key technical talking points, and tips to impress interviewers.";
        } else {
            systemPrompt = "You are an expert technical campus placement director and engineering recruiter for " + targetRole + " roles. " +
                    "The student has a placement readiness score of " + readiness + "% aiming for " + targetCompany + ". " +
                    "Provide a structured placement readiness assessment with recruiter feedback, 4-week placement sprint plan, and interview questions.";
        }

        Map<String, Object> part = Map.of("text", systemPrompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of("temperature", 0.6, "maxOutputTokens", 1500)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidateTextNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
                String rawAiText = candidateTextNode.asText();

                AiGuidanceResponse res = generateFallbackGuidance(targetRole, targetCompany, readiness, req);
                res.setResponseText(rawAiText);
                res.setUserQuestion(prompt);
                res.setAiGenerated(true);
                return res;
            } catch (Exception e) {
                logger.error("Error parsing Gemini API response", e);
            }
        }

        return generateFallbackGuidance(targetRole, targetCompany, readiness, req);
    }

    private AiGuidanceResponse generateFallbackGuidance(String targetRole, String targetCompany, int readiness, AiGuidanceRequest req) {
        AiGuidanceResponse res = new AiGuidanceResponse();
        res.setTargetRole(targetRole);
        res.setAiGenerated(false);

        String prompt = req != null && req.getCustomPrompt() != null ? req.getCustomPrompt().trim() : "";
        res.setUserQuestion(prompt);

        // Recruiter Feedback
        res.setRecruiterFeedback(
                "From a campus recruiter's perspective for " + targetRole + " at " + targetCompany + ": " +
                "Your baseline readiness currently sits at " + readiness + "%. " +
                "Recruiters evaluate candidates on three non-negotiables: algorithmic problem-solving agility (DSA), core CS fundamentals (DBMS, OS, Networks), and end-to-end project ownership. " +
                "Demonstrating clean code practices and explaining trade-offs during technical rounds will significantly increase your shortlisting probability."
        );

        // Mock Interview Questions
        List<AiGuidanceResponse.InterviewQuestionDto> questions = new ArrayList<>();
        if (targetRole.toLowerCase().contains("frontend")) {
            questions.add(new AiGuidanceResponse.InterviewQuestionDto(
                    "Explain React Reconciliation and how Virtual DOM diffing works.",
                    "React Virtual DOM & Fiber",
                    "Virtual DOM is an in-memory representation of real DOM. React creates two trees during render, computes minimal DOM mutations using heuristics (key attributes, component type identity), and commits batch changes to the DOM."
            ));
            questions.add(new AiGuidanceResponse.InterviewQuestionDto(
                    "What is Event Bubbling and Event Delegation in JavaScript?",
                    "Browser DOM & Event Loop",
                    "Event bubbling allows child events to propagate upward to ancestors. Event delegation attaches a single listener to a parent element to handle events on dynamic children, drastically reducing memory overhead."
            ));
        } else {
            questions.add(new AiGuidanceResponse.InterviewQuestionDto(
                    "How does Spring Boot manage dependency injection and bean lifecycle?",
                    "Inversion of Control (IoC) & ApplicationContext",
                    "Spring IoC container discovers annotated beans (@Component, @Service) via component scanning, wires dependencies via constructor/field injection, and invokes lifecycle hooks (@PostConstruct, DisposableBean)."
            ));
            questions.add(new AiGuidanceResponse.InterviewQuestionDto(
                    "What are ACID properties in MySQL, and how do database indexes work internally?",
                    "Relational DBMS & B+ Trees",
                    "ACID stands for Atomicity, Consistency, Isolation, and Durability. Indexes in MySQL InnoDB use B+ Tree structures to provide O(log N) lookup time for selective queries."
            ));
            questions.add(new AiGuidanceResponse.InterviewQuestionDto(
                    "Explain the difference between HashMap and ConcurrentHashMap in Java.",
                    "Collections & Concurrency",
                    "HashMap is not thread-safe. ConcurrentHashMap uses bucket-level synchronized locks (in Java 8+ CAS operations and synchronized tree nodes) allowing concurrent reads without blocking writes."
            ));
        }
        res.setInterviewQuestions(questions);

        // Weekly multi-phase plan
        List<AiGuidanceResponse.RoadmapWeekDto> plan = new ArrayList<>();
        plan.add(new AiGuidanceResponse.RoadmapWeekDto(
                "Week 1", "Core Language Mastery & OOP",
                List.of("Deep dive into OOP principles", "Memory management & Garbage Collection", "Collections framework & Generics"),
                "Implement a modular CLI application adhering to clean architecture."
        ));
        plan.add(new AiGuidanceResponse.RoadmapWeekDto(
                "Week 2", "Enterprise Frameworks (Spring Boot / APIs)",
                List.of("Stateless REST APIs design", "Spring Data JPA & Entity mappings", "Validation & Global Exception Handling"),
                "Build CRUD endpoints with MySQL database persistence."
        ));
        plan.add(new AiGuidanceResponse.RoadmapWeekDto(
                "Week 3", "Security, DB Optimization & Testing",
                List.of("JWT Authentication & Spring Security filters", "SQL indexing & query performance", "JUnit 5 & Mockito test coverage"),
                "Secure all protected REST endpoints and write unit tests."
        ));
        plan.add(new AiGuidanceResponse.RoadmapWeekDto(
                "Week 4", "System Design & Placement Viva Simulation",
                List.of("Top 50 DSA placement questions", "System design fundamentals (Caching, Load Balancer)", "HR STAR method interview prep"),
                "Full placement rehearsal and polished GitHub portfolio."
        ));
        res.setWeeklyPlan(plan);

        // Technical Topics
        res.setTechnicalTopicRecommendations(List.of(
                "Data Structures: Binary Trees, HashMaps, Sliding Window, Dynamic Programming",
                "Backend: Spring Boot, RESTful Architecture, Hibernate Caching, JWT",
                "Database: SQL Joins, Normalization, Transactions, B-Tree Indexes",
                "Operating Systems: Concurrency, Deadlocks, Virtual Memory, Process vs Threads"
        ));

        // Resume Tips
        res.setResumeImprovementTips(List.of(
                "Quantify achievements: 'Increased query speed by 40% by indexing frequently searched foreign keys'",
                "Highlight target role skills in the first 1/3 of the page",
                "Ensure live GitHub links and hosted demo URLs are prominently displayed",
                "Replace passive phrasing ('worked on') with active engineering verbs ('designed', 'built', 'orchestrated')"
        ));

        // Generate intelligent contextual response to the user's specific question
        if (!prompt.isEmpty()) {
            res.setResponseText(generateContextualMentorAnswer(prompt, targetRole, targetCompany, readiness));
        } else {
            res.setResponseText(
                    "Welcome to your AI Placement Mentor session! I am configured to guide you towards securing a " + targetRole + " position at " + targetCompany + ".\n\n" +
                    "Your current readiness score is " + readiness + "%. Use the prompt bar above to ask me any technical interview question, HR strategy, project explanation advice, or resume critique."
            );
        }

        return res;
    }

    private String generateContextualMentorAnswer(String question, String role, String company, int readiness) {
        String q = question.toLowerCase();

        // 1. "Tell me about yourself" / Introduction
        if (q.contains("tell me about yourself") || q.contains("introduce yourself") || q.contains("introduction")) {
            return "### 🎯 How to Answer 'Tell Me About Yourself' (The Present-Past-Future Formula)\n\n" +
                    "Recruiters use this question to assess communication structure and role alignment within the first 90 seconds. Never recite your resume linearly—use this 3-part framework:\n\n" +
                    "**1. Present (30 seconds): Who you are right now**\n" +
                    "\"Hello, I am a final-year Computer Science Engineering student specializing in backend and full-stack software development. Currently, I focus heavily on building scalable Java & Spring Boot web applications with RESTful APIs, MySQL relational databases, and secure JWT authentication.\"\n\n" +
                    "**2. Past (30 seconds): Key achievements and hands-on projects**\n" +
                    "\"Over the past two years, I have strengthened my problem-solving skills by solving 100+ Data Structures & Algorithms problems across LeetCode and competitive programming platforms. Most recently, I engineered an AI-powered Placement Readiness platform with automated ATS resume parsing, real-time skill verification, and multi-tier analytics.\"\n\n" +
                    "**3. Future (30 seconds): Why this company & role**\n" +
                    "\"I am passionate about building enterprise-grade backend systems. I am excited about the " + role + " role at " + company + " because your engineering team solves complex scalability challenges where I can contribute my core Java, SQL, and system design skills while growing into an impactful software engineer.\"\n\n" +
                    "💡 **Pro-Tip:** Keep your answer between 75 and 90 seconds. Smile, maintain steady eye contact, and end with: *'I'd be glad to dive deeper into any of my projects or technical areas.'*";
        }

        // 2. Project Explanation / STAR Method
        if (q.contains("project") || q.contains("explain") && q.contains("project") || q.contains("star method")) {
            return "### 🛠️ How to Explain Projects in Technical Interviews (The STAR Method)\n\n" +
                    "Interviewers look for **ownership, architectural decision-making, and measurable impact** rather than just a feature list.\n\n" +
                    "Structure your answer into 4 clear steps:\n\n" +
                    "1. **Situation (Context):**\n" +
                    "\"College students often prepare for campus placements in fragmented silos—practicing coding on LeetCode without knowing if their resume matches company ATS requirements or if they can build real systems. I wanted to build a single centralized digital twin platform to bridge this gap.\"\n\n" +
                    "2. **Task (Your Responsibility):**\n" +
                    "\"As the full-stack developer, my goal was to design the complete database schema in MySQL, build secure Spring Boot REST APIs with JWT authentication, integrate Apache PDFBox for server-side resume parsing, and construct a responsive React frontend with analytics dashboards.\"\n\n" +
                    "3. **Action (Engineering Decisions & Challenges):**\n" +
                    "\"I designed a 5-pillar mathematical engine weighting ATS score, skill match, coding profiles, verified tests, and projects. When integrating the Gemini AI API, I designed a resilient fallback layer so the system continues operating smoothly even during external API downtime or rate-limits. I also configured Spring Data JPA entity relationships and optimized query execution using indexes.\"\n\n" +
                    "4. **Result (Impact & Learnings):**\n" +
                    "\"The system successfully parses PDF resumes within 1.2 seconds, provides explainable placement scores, and generates actionable skill roadmaps. Through this project, I gained practical mastery in Java 21, Spring Security filters, and state management in React.\"\n\n" +
                    "💡 **Common Mistake:** Avoid saying 'We did this'. Use 'I designed the schema', 'I implemented the JWT filter', 'I handled the exception hierarchy'.";
        }

        // 3. SQL / Database Questions
        if (q.contains("sql") || q.contains("database") || q.contains("dbms") || q.contains("join") || q.contains("index") || q.contains("acid")) {
            return "### 💾 Top Technical SQL & DBMS Interview Concepts for " + role + "\n\n" +
                    "Campus interviewers heavily test database fundamentals. Here are the core topics and model explanations:\n\n" +
                    "**1. What are ACID Properties?**\n" +
                    "- **Atomicity:** All operations in a transaction succeed, or the entire transaction rolls back ('All or nothing').\n" +
                    "- **Consistency:** Database transitions from one valid state to another, maintaining constraints and foreign keys.\n" +
                    "- **Isolation:** Concurrent transactions execute without interfering with one another (controlled via isolation levels: Read Committed, Repeatable Read, Serializable).\n" +
                    "- **Durability:** Once committed, changes are permanently written to non-volatile storage even after a system crash.\n\n" +
                    "**2. How do Indexes work in MySQL (InnoDB)?**\n" +
                    "\"InnoDB uses **B+ Tree data structures** for clustered and secondary indexes. The root and intermediate nodes hold key pointers, while all data records reside in the leaf nodes linked sequentially. This reduces disk I/O and provides $O(\\log N)$ search time instead of full-table scans ($O(N)$).\"\n\n" +
                    "**3. Differences Between INNER JOIN vs LEFT JOIN:**\n" +
                    "- `INNER JOIN`: Returns only rows with matching values in both tables.\n" +
                    "- `LEFT JOIN`: Returns all rows from the left table, plus matched rows from the right table (unmatched right columns return `NULL`).\n\n" +
                    "**4. How do you find the 2nd Highest Salary in SQL?**\n" +
                    "```sql\n" +
                    "SELECT MAX(salary) FROM employees \n" +
                    "WHERE salary < (SELECT MAX(salary) FROM employees);\n" +
                    "-- OR using DENSE_RANK():\n" +
                    "SELECT salary FROM (\n" +
                    "    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rnk\n" +
                    "    FROM employees\n" +
                    ") WHERE rnk = 2;\n" +
                    "```";
        }

        // 4. Java / Spring Boot / Framework Questions
        if (q.contains("java") || q.contains("spring") || q.contains("oop") || q.contains("rest") || q.contains("backend")) {
            return "### ☕ High-Frequency Java & Spring Boot Placement Questions\n\n" +
                    "For a " + role + " interview, be prepared for these standard deep-dives:\n\n" +
                    "**1. What is the difference between Spring and Spring Boot?**\n" +
                    "\"Spring Framework provides extensive enterprise features but requires heavy XML or manual Java configuration and external Tomcat setup. Spring Boot provides **Auto-Configuration**, **Starter POMs**, and an **Embedded Tomcat Server**, enabling developers to create production-ready applications with minimal boilerplate.\"\n\n" +
                    "**2. How does Dependency Injection (DI) work in Spring?**\n" +
                    "\"Dependency Injection is an implementation of Inversion of Control (IoC). Instead of a class creating its own dependencies via `new MyService()`, the Spring IoC container instantiates and injects them (prefer constructor injection for immutability and testability).\"\n\n" +
                    "**3. Why is String immutable in Java?**\n" +
                    "- **Security:** Sensitive parameters like database URLs, passwords, and socket connections are passed as Strings.\n" +
                    "- **String Pool (Memory Efficiency):** Different variables referencing the same literal share a single heap object.\n" +
                    "- **Thread Safety:** Immutable objects are inherently thread-safe without synchronization overhead.\n" +
                    "- **Caching HashCode:** The hash code is cached upon creation, making Strings optimal HashMap keys.\n\n" +
                    "**4. Explain RESTful API Design Best Practices:**\n" +
                    "- Use standard HTTP verbs: `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial update), `DELETE` (remove).\n" +
                    "- Plural resource nouns: `/api/users`, `/api/resumes/2/download`.\n" +
                    "- Return appropriate HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`.";
        }

        // 5. DSA / Coding Rounds Strategy
        if (q.contains("dsa") || q.contains("coding") || q.contains("leetcode") || q.contains("algorithm") || q.contains("time complexity")) {
            return "### 🚀 The 4-Step Strategy to Clear DSA Technical Coding Rounds\n\n" +
                    "In a 45-minute live coding round, interviewers care more about your **thinking process and communication** than jumping straight to code.\n\n" +
                    "**Step 1: Clarify & Ask Edge Cases (First 5 Minutes)**\n" +
                    "- Restate the problem in your own words.\n" +
                    "- Ask: *'Can the array contain negative numbers or duplicates?'*, *'What is the maximum size of $N$?'*, *'Should I handle empty inputs?'*\n\n" +
                    "**Step 2: Propose the Brute Force Approach (5-10 Minutes)**\n" +
                    "- State the obvious solution first (e.g., nested loops $O(N^2)$ time, $O(1)$ space).\n" +
                    "- Explain the bottleneck: *'Because we re-scan the entire array, time complexity becomes quadratic.'*\n\n" +
                    "**Step 3: Optimize with Appropriate Data Structure (10-15 Minutes)**\n" +
                    "- Patterns: Can a **HashMap** reduce lookup to $O(1)$? Can **Two Pointers / Sliding Window** reduce an $O(N^2)$ problem to $O(N)$? Does sorting enable binary search $O(N \\log N)$?\n" +
                    "- Communicate your trade-off: *'By using an $O(N)$ hash set for auxiliary space, we drop time complexity to linear $O(N)$.'*\n\n" +
                    "**Step 4: Clean Coding & Dry Run (15-20 Minutes)**\n" +
                    "- Write modular, clean code with descriptive variable names (`leftPointer`, `maxCount`).\n" +
                    "- Walk through a sample test case line-by-line before running the test cases.";
        }

        // 6. Company Specific (TCS / Infosys / MNC / Campus Drives)
        if (q.contains("tcs") || q.contains("infosys") || q.contains("wipro") || q.contains("accenture") || q.contains("mnc") || q.contains("campus")) {
            return "### 🏢 Campus Placement Preparation Guide for Service & Product MNCs\n\n" +
                    "For companies like TCS (Ninja/Digital/Prime tracks), Cognizant, Infosys, and Tech Mahindra, the recruitment process typically follows this 3-tier sequence:\n\n" +
                    "**1. Online Assessment (Aptitude + Coding):**\n" +
                    "- **Numerical Ability:** Percentages, Time & Work, Profit & Loss, Speed & Distance.\n" +
                    "- **Logical Reasoning:** Syllogisms, Coding-Decoding, Data Sufficiency.\n" +
                    "- **Coding Section:** Usually 2 problems—one String/Array manipulation and one Intermediate DSA (Sorting/HashMap).\n\n" +
                    "**2. Technical Interview (30-40 Mins):**\n" +
                    "- Explain your final year B.Tech project in detail.\n" +
                    "- Core CS Fundamentals: OOP (Inheritance, Polymorphism), SQL (Joins, Primary vs Foreign Keys), OS (Deadlocks, Process Scheduling).\n" +
                    "- Live coding or dry-running basic algorithms (Reverse linked list, Palindrome, Fibonacci, Matrix traversal).\n\n" +
                    "**3. Managerial & HR Round (15-20 Mins):**\n" +
                    "- Willingness to relocate, work in different technology stacks, and team collaboration.\n" +
                    "- Questions like *'Why " + company + "?'* and *'Where do you see yourself in 3 years?'*\n\n" +
                    "💡 **Pro-Tip:** Emphasize adaptability, positive body language, and your completed academic projects.";
        }

        // 7. General Mentor Guidance
        return "### 💡 Career Twin AI Mentor Recommendation for " + role + "\n\n" +
                "Regarding your question: *\"" + question + "\"*\n\n" +
                "**1. Key Concept:**\n" +
                "For a " + role + " role aiming for " + company + ", recruiters want to verify both your conceptual grounding and your practical execution ability.\n\n" +
                "**2. Actionable Preparation Steps:**\n" +
                "- Ensure your core programming foundation (Java / Python / C++) is rock-solid, especially memory models and collections.\n" +
                "- Connect theory to practice: when asked about database concepts, relate them directly to how you designed MySQL schemas in your web applications.\n" +
                "- Practice communicating your thought process aloud while solving technical coding questions.\n\n" +
                "**3. What to Say in the Interview:**\n" +
                "\"In my placement preparation, I focus on building reliable applications with clean architectures. For example, in my projects I implemented end-to-end RESTful APIs with automated exception handling and database normalization.\"\n\n" +
                "Feel free to ask more specific questions about technical rounds, HR questions, or resume optimization!";
    }
}
