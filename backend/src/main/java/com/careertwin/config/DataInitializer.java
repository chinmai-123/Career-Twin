package com.careertwin.config;

import com.careertwin.dto.CareerGoalRequest;
import com.careertwin.dto.CodingProfileRequest;
import com.careertwin.entity.*;
import com.careertwin.repository.*;
import com.careertwin.service.CareerGoalService;
import com.careertwin.service.CareerTwinEngineService;
import com.careertwin.service.CodingProfileService;
import com.careertwin.util.SkillsTaxonomy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssessmentQuestionRepository questionRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CareerGoalService careerGoalService;

    @Autowired
    private CodingProfileService codingProfileService;

    @Autowired
    private CareerTwinEngineService careerTwinEngineService;

    @Override
    public void run(String... args) {
        seedSkills();
        seedAssessmentQuestions();
        seedDemoStudent();
    }

    private void seedSkills() {
        if (skillRepository.count() == 0) {
            logger.info("Seeding skills taxonomy into database...");
            List<Skill> skills = new ArrayList<>();
            for (String s : SkillsTaxonomy.ALL_KNOWN_SKILLS) {
                skills.add(new Skill(s, "TECHNICAL", "Core placement skill: " + s));
            }
            skillRepository.saveAll(skills);
        }
    }

    private void seedAssessmentQuestions() {
        if (questionRepository.count() == 0) {
            logger.info("Seeding assessment question bank into database...");
            List<AssessmentQuestion> questions = Arrays.asList(
                    // Java Questions
                    new AssessmentQuestion("JAVA", "BACKEND", "Data Structures",
                            "Which data structure follows the LIFO (Last In First Out) principle?",
                            "Array", "Stack", "Queue", "Linked List",
                            "B", "Stack operates on Last-In, First-Out (LIFO) order.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "OOP",
                            "Which OOP concept is demonstrated by having multiple methods with the same name but different parameters?",
                            "Method Overriding", "Method Overloading", "Encapsulation", "Abstraction",
                            "B", "Method overloading is compile-time polymorphism where methods have the same name but different parameter signatures.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Java Memory",
                            "Where are Java object instances allocated in memory?",
                            "Stack Memory", "Heap Memory", "PermGen / Metaspace", "Registers",
                            "B", "All objects in Java are allocated on the Heap memory, while references to them reside on the Stack.", "MEDIUM"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Collections",
                            "Which Map implementation guarantees insertion order of keys in Java?",
                            "HashMap", "TreeMap", "LinkedHashMap", "ConcurrentHashMap",
                            "C", "LinkedHashMap maintains a doubly-linked list running through all of its entries, preserving insertion order.", "MEDIUM"),

                    // Spring Boot Questions
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Framework",
                            "Which annotation in Spring Boot is a shortcut combining @Controller and @ResponseBody?",
                            "@Service", "@Repository", "@RestController", "@Endpoint",
                            "C", "@RestController is a convenience annotation combining @Controller and @ResponseBody.", "EASY"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Dependency Injection",
                            "What is the recommended injection type for mandatory dependencies in modern Spring Boot?",
                            "Field Injection (@Autowired on private fields)", "Setter Injection", "Constructor Injection", "Interface Injection",
                            "C", "Constructor injection ensures immutability, easier unit testing, and prevents NullPointerExceptions.", "MEDIUM"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Security",
                            "What header is typically used to transmit a JWT Bearer token in REST requests?",
                            "X-API-Key", "Authorization", "Authentication", "Token",
                            "B", "JWT tokens are passed in the 'Authorization' HTTP header in the format 'Bearer <token>'.", "EASY"),

                    // SQL & DBMS Questions
                    new AssessmentQuestion("SQL", "BACKEND", "SQL & DBMS",
                            "Which SQL clause is used to filter records resulting from a GROUP BY operation?",
                            "WHERE", "ORDER BY", "HAVING", "LIMIT",
                            "C", "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.", "MEDIUM"),

                    new AssessmentQuestion("SQL", "BACKEND", "DBMS",
                            "What does the 'I' represent in the ACID properties of database transactions?",
                            "Integrity", "Isolation", "Immutability", "Indexing",
                            "B", "ACID stands for Atomicity, Consistency, Isolation, and Durability.", "EASY"),

                    new AssessmentQuestion("SQL", "BACKEND", "Database Indexing",
                            "What underlying data structure is most commonly used by MySQL InnoDB for table indexing?",
                            "B+ Tree", "Hash Table", "Binary Search Tree", "Red-Black Tree",
                            "A", "InnoDB uses B+ Trees for indexes because they provide efficient range queries and logarithmic lookups.", "MEDIUM"),

                    // DSA Questions
                    new AssessmentQuestion("DSA", "BACKEND", "Algorithms",
                            "What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?",
                            "O(1)", "O(N)", "O(log N)", "O(N log N)",
                            "C", "Searching in a balanced BST takes O(log N) time because the search space halves at every level.", "EASY"),

                    new AssessmentQuestion("DSA", "BACKEND", "Data Structures",
                            "Which algorithm is commonly used to find the shortest path in an unweighted graph?",
                            "Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm",
                            "B", "Breadth First Search explores nodes level-by-level, guaranteeing the shortest path in unweighted graphs.", "MEDIUM")
            );

            questionRepository.saveAll(questions);
            logger.info("Successfully seeded {} assessment questions.", questions.size());
        }
    }

    private void seedDemoStudent() {
        String demoEmail = "student@careertwin.edu";
        if (!userRepository.existsByEmail(demoEmail)) {
            logger.info("Seeding demo student profile ({})...", demoEmail);
            User student = new User();
            student.setEmail(demoEmail);
            student.setPassword(passwordEncoder.encode("password123"));
            student.setFullName("Aarav Sharma");
            student.setCollege("National Institute of Technology");
            student.setBranch("Computer Science & Engineering");
            student.setYear("4th Year");
            student.setGraduationYear(2026);
            student.setPhone("+91 9876543210");
            student.setRole("ROLE_STUDENT");

            User saved = userRepository.save(student);

            // Set Career Goal
            CareerGoalRequest goalRequest = new CareerGoalRequest();
            goalRequest.setTargetRole("Backend Developer");
            goalRequest.setTargetCompany("Microsoft / Product MNC");
            goalRequest.setDescription("Aspiring Backend Engineer passionate about distributed systems, microservices, and high-performance databases.");
            goalRequest.setTargetTimeline("Campus Placement 2026");
            careerGoalService.saveOrUpdateCareerGoal(saved.getId(), goalRequest);

            // Set Coding Profiles
            CodingProfileRequest github = new CodingProfileRequest();
            github.setPlatform("GITHUB");
            github.setUsername("aarav-sharma-dev");
            github.setProfileUrl("https://github.com/aarav-sharma-dev");
            codingProfileService.addOrUpdateProfile(saved.getId(), github);

            CodingProfileRequest leetcode = new CodingProfileRequest();
            leetcode.setPlatform("LEETCODE");
            leetcode.setUsername("aarav_codes");
            leetcode.setProfileUrl("https://leetcode.com/aarav_codes");
            codingProfileService.addOrUpdateProfile(saved.getId(), leetcode);

            // Recalculate Career Twin
            careerTwinEngineService.recalculateCareerTwin(saved.getId());

            logger.info("Demo student seeded successfully. Credentials: {} / password123", demoEmail);
        }
    }
}
