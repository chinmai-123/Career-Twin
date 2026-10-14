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
        if (questionRepository.count() < 25) {
            logger.info("Seeding / updating assessment question bank into database with Easy, Medium, and Hard tiers...");
            List<AssessmentQuestion> questions = Arrays.asList(
                    // Java Questions - EASY
                    new AssessmentQuestion("JAVA", "BACKEND", "Data Structures",
                            "Which data structure follows the LIFO (Last In First Out) principle?",
                            "Array", "Stack", "Queue", "Linked List",
                            "B", "Stack operates on Last-In, First-Out (LIFO) order.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "OOP",
                            "Which OOP concept is demonstrated by having multiple methods with the same name but different parameters?",
                            "Method Overriding", "Method Overloading", "Encapsulation", "Abstraction",
                            "B", "Method overloading is compile-time polymorphism where methods have the same name but different parameter signatures.", "EASY"),

                    // Java Questions - MEDIUM
                    new AssessmentQuestion("JAVA", "BACKEND", "Java Memory",
                            "Where are Java object instances allocated in memory?",
                            "Stack Memory", "Heap Memory", "PermGen / Metaspace", "Registers",
                            "B", "All objects in Java are allocated on the Heap memory, while references to them reside on the Stack.", "MEDIUM"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Collections",
                            "Which Map implementation guarantees insertion order of keys in Java?",
                            "HashMap", "TreeMap", "LinkedHashMap", "ConcurrentHashMap",
                            "C", "LinkedHashMap maintains a doubly-linked list running through all of its entries, preserving insertion order.", "MEDIUM"),

                    // Java Questions - HARD
                    new AssessmentQuestion("JAVA", "BACKEND", "Concurrency & JMM",
                            "According to the Java Memory Model (JMM), how does writing to a 'volatile' variable guarantee visibility?",
                            "Locks the CPU core", "Establishes a happens-before relationship ensuring all prior writes are visible to subsequent reads across threads", "Flushes all heap memory", "Disables Garbage Collection during write",
                            "B", "A write to a volatile variable happens-before every subsequent read of that same variable, creating a synchronized memory barrier.", "HARD"),

                    new AssessmentQuestion("JAVA", "BACKEND", "JVM Internals",
                            "What strategy does Java's ForkJoinPool employ to balance thread workloads efficiently across available CPU cores?",
                            "Round-Robin assignment", "Work-stealing from the tail of deque queues of busy worker threads", "Thread prioritization by OS", "Spin-wait semaphores",
                            "B", "ForkJoinPool uses work-stealing where idle threads steal tasks from the deques of other busy worker threads.", "HARD"),

                    // Spring Boot Questions - EASY
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Framework",
                            "Which annotation in Spring Boot is a shortcut combining @Controller and @ResponseBody?",
                            "@Service", "@Repository", "@RestController", "@Endpoint",
                            "C", "@RestController is a convenience annotation combining @Controller and @ResponseBody.", "EASY"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Security",
                            "What header is typically used to transmit a JWT Bearer token in REST requests?",
                            "X-API-Key", "Authorization", "Authentication", "Token",
                            "B", "JWT tokens are passed in the 'Authorization' HTTP header in the format 'Bearer <token>'.", "EASY"),

                    // Spring Boot Questions - MEDIUM
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Dependency Injection",
                            "What is the recommended injection type for mandatory dependencies in modern Spring Boot?",
                            "Field Injection (@Autowired on private fields)", "Setter Injection", "Constructor Injection", "Interface Injection",
                            "C", "Constructor injection ensures immutability, easier unit testing, and prevents NullPointerExceptions.", "MEDIUM"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Transactions",
                            "What is the default propagation behavior of the @Transactional annotation in Spring?",
                            "PROPAGATION_REQUIRES_NEW", "PROPAGATION_REQUIRED", "PROPAGATION_NESTED", "PROPAGATION_SUPPORTS",
                            "B", "PROPAGATION_REQUIRED is the default; it supports a current transaction or creates a new one if none exists.", "MEDIUM"),

                    // Spring Boot Questions - HARD
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Security Architecture",
                            "In Spring Security architecture, which servlet filter acts as the bridge connecting the servlet container with Spring-managed SecurityFilterChain beans?",
                            "DelegatingFilterProxy", "BasicAuthenticationFilter", "CorsFilter", "DispatcherServlet",
                            "A", "DelegatingFilterProxy is a standard Servlet filter that delegates to a Spring-managed Filter bean (FilterChainProxy).", "HARD"),

                    // SQL & DBMS Questions - EASY
                    new AssessmentQuestion("SQL", "BACKEND", "DBMS",
                            "What does the 'I' represent in the ACID properties of database transactions?",
                            "Integrity", "Isolation", "Immutability", "Indexing",
                            "B", "ACID stands for Atomicity, Consistency, Isolation, and Durability.", "EASY"),

                    // SQL & DBMS Questions - MEDIUM
                    new AssessmentQuestion("SQL", "BACKEND", "SQL & DBMS",
                            "Which SQL clause is used to filter records resulting from a GROUP BY operation?",
                            "WHERE", "ORDER BY", "HAVING", "LIMIT",
                            "C", "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.", "MEDIUM"),

                    new AssessmentQuestion("SQL", "BACKEND", "Database Indexing",
                            "What underlying data structure is most commonly used by MySQL InnoDB for table indexing?",
                            "B+ Tree", "Hash Table", "Binary Search Tree", "Red-Black Tree",
                            "A", "InnoDB uses B+ Trees for indexes because they provide efficient range queries and logarithmic lookups.", "MEDIUM"),

                    // SQL & DBMS Questions - HARD
                    new AssessmentQuestion("SQL", "BACKEND", "Concurrency & Isolation",
                            "Which Transaction Isolation Level strictly prevents Dirty Reads, Non-Repeatable Reads, AND Phantom Reads?",
                            "READ COMMITTED", "READ UNCOMMITTED", "REPEATABLE READ", "SERIALIZABLE",
                            "D", "SERIALIZABLE is the highest isolation level and prevents all concurrency anomalies including phantom reads by locking ranges.", "HARD"),

                    new AssessmentQuestion("SQL", "BACKEND", "Query Optimization",
                            "What makes an index a 'Covering Index' in MySQL InnoDB query execution?",
                            "It indexes all primary keys", "The index contains all columns requested by the SELECT query, avoiding secondary clustered table lookups", "It spans multiple tables", "It uses hash compression",
                            "B", "A covering index contains all the data needed for the query in the index leaf nodes, avoiding expensive secondary disk lookups to the main table.", "HARD"),

                    // DSA Questions - EASY
                    new AssessmentQuestion("DSA", "BACKEND", "Algorithms",
                            "What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?",
                            "O(1)", "O(N)", "O(log N)", "O(N log N)",
                            "C", "Searching in a balanced BST takes O(log N) time because the search space halves at every level.", "EASY"),

                    // DSA Questions - MEDIUM
                    new AssessmentQuestion("DSA", "BACKEND", "Data Structures",
                            "Which algorithm is commonly used to find the shortest path in an unweighted graph?",
                            "Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm",
                            "B", "Breadth First Search explores nodes level-by-level, guaranteeing the shortest path in unweighted graphs.", "MEDIUM"),

                    new AssessmentQuestion("DSA", "BACKEND", "Sorting Algorithms",
                            "What is the worst-case time complexity of QuickSort?",
                            "O(N)", "O(N log N)", "O(N^2)", "O(log N)",
                            "C", "QuickSort degrades to O(N^2) when poor pivots are chosen repeatedly (e.g. sorted arrays without randomized pivots).", "MEDIUM"),

                    // DSA Questions - HARD
                    new AssessmentQuestion("DSA", "BACKEND", "Advanced Algorithms",
                            "What is the time complexity of Dijkstra's shortest path algorithm implemented with a Fibonacci Heap (V vertices, E edges)?",
                            "O(V^2)", "O(E + V log V)", "O((V + E) log V)", "O(V * E)",
                            "B", "With a Fibonacci Heap, decrease-key is O(1) amortized, reducing Dijkstra's runtime to O(E + V log V).", "HARD"),

                    new AssessmentQuestion("DSA", "BACKEND", "Dynamic Programming",
                            "In the 0/1 Knapsack problem with capacity W and items N, how can space complexity be optimized from O(N*W) to O(W)?",
                            "Using a 2D matrix with bit shifts", "Traversing the 1D capacity array backwards from W down to item weight", "Sorting items by value-to-weight ratio", "Using recursion without memoization",
                            "B", "Traversing capacity backwards ensures each item is used at most once while overwriting previous states in a 1D array.", "HARD"),

                    // System Design - EASY
                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Architecture",
                            "What is the primary difference between Horizontal Scaling and Vertical Scaling?",
                            "Horizontal adds more servers/nodes, while Vertical increases CPU/RAM of an existing server", "Horizontal replaces software, Vertical upgrades network", "Horizontal is only for databases", "Vertical is only for microservices",
                            "A", "Horizontal scaling scales out by adding nodes; vertical scaling scales up by boosting single-machine specifications.", "EASY"),

                    // System Design - MEDIUM
                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Distributed Caching",
                            "In the Cache-Aside (Lazy Loading) caching pattern, which component writes missing data into the cache?",
                            "The database triggers a cache update", "The application service reads from DB on cache miss and writes back into the cache", "The cache server auto-polls the DB", "A separate cron job",
                            "B", "In Cache-Aside, the application first queries cache; on a miss, it fetches from DB and stores the result in cache.", "MEDIUM"),

                    // System Design - HARD
                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Distributed Systems",
                            "According to the CAP Theorem, when an inevitable Network Partition (P) occurs in a distributed system, what trade-off must be made?",
                            "Latency vs Cost", "Consistency (C) vs Availability (A)", "Security vs Speed", "Throughput vs Durability",
                            "B", "Under a network partition, a distributed system must sacrifice either Availability (rejecting writes) or Consistency (returning stale data).", "HARD"),

                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Consensus Protocols",
                            "In the Raft distributed consensus protocol, how does a candidate node succeed in electing itself as Leader?",
                            "By having the lowest node ID", "By securing affirmative votes from a strict majority (quorum: > N/2) of cluster nodes", "By possessing the largest disk capacity", "By having the longest uptime",
                            "B", "A Raft candidate must gain votes from a strict majority (N/2 + 1) of nodes in the cluster to prevent split-brain leadership.", "HARD")
            );

            questionRepository.deleteAll();
            questionRepository.saveAll(questions);
            logger.info("Successfully seeded {} assessment questions across Easy, Medium, and Hard tiers.", questions.size());
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

            // Recalculate Career Twin (clean initial state for fresh student profile)
            careerTwinEngineService.recalculateCareerTwin(saved.getId());

            logger.info("Demo student seeded successfully. Credentials: {} / password123", demoEmail);
        }
    }
}
