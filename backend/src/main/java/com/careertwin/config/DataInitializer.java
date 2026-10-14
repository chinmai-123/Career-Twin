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
        if (questionRepository.count() < 55) {
            logger.info("Seeding / updating comprehensive assessment question bank with Easy, Medium, and Hard tiers...");
            List<AssessmentQuestion> questions = Arrays.asList(
                    // =================== JAVA - EASY (Level 1) ===================
                    new AssessmentQuestion("JAVA", "BACKEND", "Data Structures",
                            "Which data structure follows the LIFO (Last In First Out) principle?",
                            "Array", "Stack", "Queue", "Linked List",
                            "B", "Stack operates on Last-In, First-Out (LIFO) order.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "OOP",
                            "Which OOP concept is demonstrated by having multiple methods with the same name but different parameters?",
                            "Method Overriding", "Method Overloading", "Encapsulation", "Abstraction",
                            "B", "Method overloading is compile-time polymorphism where methods have the same name but different parameter signatures.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Core Java",
                            "Why are String objects immutable in Java?",
                            "For JVM performance, thread-safety, caching in the String Constant Pool, and security", "Because primitive types cannot be strings", "To disable garbage collection", "String memory cannot be indexed",
                            "A", "String immutability enables String pool caching, guarantees thread-safety, and prevents security breaches when passing sensitive data.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Language Fundamentals",
                            "Is Java strictly pass-by-value or pass-by-reference?",
                            "Strictly pass-by-reference", "Strictly pass-by-value (object references are passed by value)", "Pass-by-value for primitives, pass-by-reference for objects", "Configurable in JVM options",
                            "B", "Java is strictly pass-by-value. When an object is passed, a copy of the reference address is passed by value.", "EASY"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Keywords",
                            "What does applying the 'final' keyword to a class achieve in Java?",
                            "The class cannot be instantiated", "The class cannot be extended (inherited from)", "All methods become static", "The class must be abstract",
                            "B", "A final class cannot be sub-classed or extended by any other class (e.g. java.lang.String is final).", "EASY"),

                    // =================== JAVA - MEDIUM (Level 2) ===================
                    new AssessmentQuestion("JAVA", "BACKEND", "Java Memory",
                            "Where are Java object instances allocated in memory?",
                            "Stack Memory", "Heap Memory", "PermGen / Metaspace", "Registers",
                            "B", "All objects in Java are allocated on the Heap memory, while references to them reside on the Stack.", "MEDIUM"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Collections",
                            "Which Map implementation guarantees insertion order of keys in Java?",
                            "HashMap", "TreeMap", "LinkedHashMap", "ConcurrentHashMap",
                            "C", "LinkedHashMap maintains a doubly-linked list running through all of its entries, preserving insertion order.", "MEDIUM"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Collections & Hashing",
                            "What is the fundamental contract between equals() and hashCode() in Java?",
                            "If two objects are equal according to equals(), they must have the same hashCode", "If two objects have the same hashCode, they must be equal", "HashCodes must be distinct for all objects", "Equals must return false for null hashes",
                            "A", "If two objects are equal via equals(), they MUST return the identical hashCode. However, unequal objects may have hash collisions.", "MEDIUM"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Exception Handling",
                            "Which of the following is an Unchecked Exception in Java?",
                            "IOException", "SQLException", "NullPointerException", "ClassNotFoundException",
                            "C", "NullPointerException inherits from RuntimeException, making it an unchecked exception that does not require explicit throws or try-catch.", "MEDIUM"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Java 8 Streams",
                            "What is the difference between map() and filter() in Java Streams?",
                            "map() transforms elements; filter() eliminates elements matching a boolean Predicate", "map() reduces elements; filter() sorts elements", "Both are terminal operations", "filter() can only be called once",
                            "A", "map() applies a Function transforming each element to another value, while filter() tests a Predicate keeping matching elements.", "MEDIUM"),

                    // =================== JAVA - HARD (Level 3 MNC) ===================
                    new AssessmentQuestion("JAVA", "BACKEND", "Concurrency & JMM",
                            "According to the Java Memory Model (JMM), how does writing to a 'volatile' variable guarantee visibility?",
                            "Locks the CPU core", "Establishes a happens-before relationship ensuring all prior writes are visible to subsequent reads across threads", "Flushes all heap memory", "Disables Garbage Collection during write",
                            "B", "A write to a volatile variable happens-before every subsequent read of that same variable, creating a synchronized memory barrier.", "HARD"),

                    new AssessmentQuestion("JAVA", "BACKEND", "JVM Internals",
                            "What strategy does Java's ForkJoinPool employ to balance thread workloads efficiently across available CPU cores?",
                            "Round-Robin assignment", "Work-stealing from the tail of deque queues of busy worker threads", "Thread prioritization by OS", "Spin-wait semaphores",
                            "B", "ForkJoinPool uses work-stealing where idle threads steal tasks from the deques of other busy worker threads.", "HARD"),

                    new AssessmentQuestion("JAVA", "BACKEND", "JVM Synchronization",
                            "How does the HotSpot JVM optimize 'synchronized' block performance through lock inflation?",
                            "Always uses OS kernel semaphores", "Gradually inflates: Biased Lock -> Lightweight (CAS) -> Heavyweight (OS Monitor)", "Converts locks into atomic variables", "Executes locks single-threaded",
                            "B", "HotSpot begins with Biased locking for single-thread scenarios, inflates to lightweight CAS spin-locking on contention, and finally to OS heavyweight mutexes.", "HARD"),

                    new AssessmentQuestion("JAVA", "BACKEND", "Garbage Collection",
                            "How does the G1 (Garbage-First) GC achieve predictable low-latency pause times compared to Parallel GC?",
                            "By pausing all threads indefinitely", "By dividing the heap into equal-sized regions and prioritizing regions with the most garbage within a pause time target", "By disabling Eden space", "By writing garbage to disk",
                            "B", "G1 partitions the heap into 2048 regions, tracking garbage density and collecting regions with maximum reclaimable memory within user-specified pause budgets.", "HARD"),

                    new AssessmentQuestion("JAVA", "BACKEND", "ClassLoader Architecture",
                            "What is the delegation hierarchy followed by Java ClassLoaders when loading a class?",
                            "Application -> Extension/Platform -> Bootstrap", "Bootstrap -> Extension/Platform -> Application (Parent-first delegation)", "Random order based on JAR path", "Thread-priority based loading",
                            "B", "Java adheres to parent-delegation: child ClassLoaders delegate class loading up to the Bootstrap ClassLoader before attempting to find the class locally.", "HARD"),

                    // =================== SPRING BOOT - EASY (Level 1) ===================
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Framework",
                            "Which annotation in Spring Boot is a shortcut combining @Controller and @ResponseBody?",
                            "@Service", "@Repository", "@RestController", "@Endpoint",
                            "C", "@RestController is a convenience annotation combining @Controller and @ResponseBody.", "EASY"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Security",
                            "What header is typically used to transmit a JWT Bearer token in REST requests?",
                            "X-API-Key", "Authorization", "Authentication", "Token",
                            "B", "JWT tokens are passed in the 'Authorization' HTTP header in the format 'Bearer <token>'.", "EASY"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Boot Core",
                            "What does the @SpringBootApplication annotation encapsulate?",
                            "@Configuration, @EnableAutoConfiguration, and @ComponentScan", "@Service and @Repository only", "@Entity and @Table", "@RestController and @GetMapping",
                            "A", "@SpringBootApplication combines configuration, automatic component scanning of package paths, and opinionated auto-configuration.", "EASY"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "REST APIs",
                            "Which standard HTTP status code should be returned after successfully creating a new resource via POST?",
                            "200 OK", "201 Created", "204 No Content", "302 Found",
                            "B", "HTTP 201 Created signifies that the request succeeded and a new database resource has been provisioned.", "EASY"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Configuration",
                            "What is the default embedded port on which a standard Spring Boot web application boots?",
                            "3000", "5000", "8080", "8085",
                            "C", "Spring Boot default web applications initialize embedded Apache Tomcat on port 8080 unless configured in application.properties.", "EASY"),

                    // =================== SPRING BOOT - MEDIUM (Level 2) ===================
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Dependency Injection",
                            "What is the recommended injection type for mandatory dependencies in modern Spring Boot?",
                            "Field Injection (@Autowired on private fields)", "Setter Injection", "Constructor Injection", "Interface Injection",
                            "C", "Constructor injection ensures immutability, easier unit testing, and prevents NullPointerExceptions.", "MEDIUM"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Transactions",
                            "What is the default propagation behavior of the @Transactional annotation in Spring?",
                            "PROPAGATION_REQUIRES_NEW", "PROPAGATION_REQUIRED", "PROPAGATION_NESTED", "PROPAGATION_SUPPORTS",
                            "B", "PROPAGATION_REQUIRED is the default; it supports a current transaction or creates a new one if none exists.", "MEDIUM"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Bean Scopes",
                            "What is the default Spring Bean scope in the application context?",
                            "Prototype", "Request", "Session", "Singleton",
                            "D", "By default, Spring beans are Singletons—one shared instance per Spring IoC container.", "MEDIUM"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Data JPA",
                            "What is the difference between findById() and getReferenceById() in Spring Data JPA?",
                            "findById() immediately executes a SELECT query returning Optional; getReferenceById() returns a lazy proxy without DB hit until accessed", "findById() is for MongoDB; getReferenceById() is for MySQL", "They are identical aliases", "getReferenceById() bypasses transactions",
                            "A", "getReferenceById() (formerly getOne) returns an uninitialized Hibernate proxy to avoid unnecessary DB SELECT queries when only setting foreign keys.", "MEDIUM"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Profiles",
                            "How do you activate a specific environment profile (e.g. 'prod') in Spring Boot?",
                            "Setting spring.profiles.active=prod in properties or via JVM argument -Dspring.profiles.active=prod", "Renaming application.properties to application-prod.xml", "Hardcoding in Java main method only", "Spring Boot only supports one profile",
                            "A", "Setting spring.profiles.active activates role/env specific property overlays (application-prod.properties).", "MEDIUM"),

                    // =================== SPRING BOOT - HARD (Level 3 MNC) ===================
                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Spring Security Architecture",
                            "In Spring Security architecture, which servlet filter acts as the bridge connecting the servlet container with Spring-managed SecurityFilterChain beans?",
                            "DelegatingFilterProxy", "BasicAuthenticationFilter", "CorsFilter", "DispatcherServlet",
                            "A", "DelegatingFilterProxy is a standard Servlet filter that delegates to a Spring-managed Filter bean (FilterChainProxy).", "HARD"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Observability & Actuator",
                            "Which Spring Boot Actuator module exposes Prometheus-compatible metrics and health probes for Kubernetes?",
                            "Micrometer with /actuator/prometheus", "Spring Batch", "Spring Cloud Eureka", "Tomcat Valve",
                            "A", "Actuator with Micrometer formats application gauges and JVM metrics into Prometheus scrapable format under /actuator/prometheus.", "HARD"),

                    new AssessmentQuestion("SPRING_BOOT", "BACKEND", "Architecture",
                            "How can circular dependency errors between two @Service beans (ServiceA and ServiceB) be resolved in Spring?",
                            "Refactor shared logic into a third service or apply @Lazy on the constructor parameter", "Restart the JVM multiple times", "Make all methods private", "Remove Spring Boot from classpath",
                            "A", "Circular dependencies indicate poor design; extracting common logic into a third service or lazy-initializing with @Lazy resolves bean creation deadlock.", "HARD"),

                    // =================== SQL & DBMS - EASY (Level 1) ===================
                    new AssessmentQuestion("SQL", "BACKEND", "DBMS",
                            "What does the 'I' represent in the ACID properties of database transactions?",
                            "Integrity", "Isolation", "Immutability", "Indexing",
                            "B", "ACID stands for Atomicity, Consistency, Isolation, and Durability.", "EASY"),

                    new AssessmentQuestion("SQL", "BACKEND", "Relational Keys",
                            "What is the difference between a Primary Key and a Unique Key in SQL databases?",
                            "A Primary Key rejects NULL values and only one can exist per table; a Unique Key allows NULLs and multiple can exist", "Primary keys are stored in RAM; unique keys on disk", "Unique keys can only be integers", "They are identical in MySQL",
                            "A", "A table can possess only one Primary Key which strictly forbids NULLs. Unique constraints enforce uniqueness while allowing NULL entries.", "EASY"),

                    new AssessmentQuestion("SQL", "BACKEND", "Aggregations",
                            "What is the difference between COUNT(*) and COUNT(column_name) in SQL?",
                            "COUNT(*) counts all rows including NULLs; COUNT(column_name) ignores rows where column_name IS NULL", "COUNT(*) only counts primary keys", "COUNT(column) is faster on all engines", "There is no functional difference",
                            "A", "COUNT(*) computes the cardinality of the full result set including NULL values, whereas COUNT(col) skips NULL records in that column.", "EASY"),

                    new AssessmentQuestion("SQL", "BACKEND", "Constraints",
                            "What is the primary role of a FOREIGN KEY constraint in relational databases?",
                            "To encrypt confidential data", "To enforce referential integrity between child and parent tables", "To automatically compress table rows", "To disable table deletes",
                            "B", "Foreign keys ensure child records point to valid existing rows in the parent table, preventing orphaned records.", "EASY"),

                    new AssessmentQuestion("SQL", "BACKEND", "Data Manipulation",
                            "What distinguishes TRUNCATE TABLE from DELETE FROM in SQL?",
                            "TRUNCATE is a DDL operation that resets identity counters and cannot be rolled back in standard transactions; DELETE is DML row-by-row", "DELETE is faster than TRUNCATE", "TRUNCATE requires a WHERE clause", "DELETE deletes the table schema definition",
                            "A", "TRUNCATE deallocates data pages directly (DDL, very fast), whereas DELETE logs each row deletion in rollback segments (DML).", "EASY"),

                    // =================== SQL & DBMS - MEDIUM (Level 2) ===================
                    new AssessmentQuestion("SQL", "BACKEND", "SQL & DBMS",
                            "Which SQL clause is used to filter records resulting from a GROUP BY operation?",
                            "WHERE", "ORDER BY", "HAVING", "LIMIT",
                            "C", "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.", "MEDIUM"),

                    new AssessmentQuestion("SQL", "BACKEND", "Database Indexing",
                            "What underlying data structure is most commonly used by MySQL InnoDB for table indexing?",
                            "B+ Tree", "Hash Table", "Binary Search Tree", "Red-Black Tree",
                            "A", "InnoDB uses B+ Trees for indexes because they provide efficient range queries and logarithmic lookups.", "MEDIUM"),

                    new AssessmentQuestion("SQL", "BACKEND", "Relational Joins",
                            "What is the difference between an INNER JOIN and a LEFT JOIN?",
                            "INNER JOIN returns only rows with matches in both tables; LEFT JOIN returns all left rows plus matched right rows (or NULL)", "LEFT JOIN only works on primary keys", "INNER JOIN returns all rows from both tables", "LEFT JOIN is deprecated",
                            "A", "INNER JOIN excludes rows without corresponding foreign keys; LEFT JOIN preserves every record from the left table.", "MEDIUM"),

                    new AssessmentQuestion("SQL", "BACKEND", "Normalization",
                            "What condition must a relational schema satisfy to achieve Third Normal Form (3NF)?",
                            "It must be in 2NF and have no transitive functional dependencies on the primary key", "It must have only one column", "All tables must have auto-increment IDs", "It requires NoSQL replication",
                            "A", "3NF requires that every non-prime attribute depends directly on the primary key, eliminating transitive dependencies (A -> B -> C).", "MEDIUM"),

                    new AssessmentQuestion("SQL", "BACKEND", "Concurrency & Anomalies",
                            "What is a 'Dirty Read' in database transaction management?",
                            "A transaction reads uncommitted changes made by another concurrently running transaction", "A transaction reads corrupted disk sectors", "A query executes without an index", "Two transactions update the same row simultaneously",
                            "A", "A Dirty Read occurs when Transaction A reads data modified by Transaction B that has not yet been committed (and could be rolled back).", "MEDIUM"),

                    // =================== SQL & DBMS - HARD (Level 3 MNC) ===================
                    new AssessmentQuestion("SQL", "BACKEND", "Concurrency & Isolation",
                            "Which Transaction Isolation Level strictly prevents Dirty Reads, Non-Repeatable Reads, AND Phantom Reads?",
                            "READ COMMITTED", "READ UNCOMMITTED", "REPEATABLE READ", "SERIALIZABLE",
                            "D", "SERIALIZABLE is the highest isolation level and prevents all concurrency anomalies including phantom reads by locking ranges.", "HARD"),

                    new AssessmentQuestion("SQL", "BACKEND", "Query Optimization",
                            "What makes an index a 'Covering Index' in MySQL InnoDB query execution?",
                            "It indexes all primary keys", "The index contains all columns requested by the SELECT query, avoiding secondary clustered table lookups", "It spans multiple tables", "It uses hash compression",
                            "B", "A covering index contains all the data needed for the query in the index leaf nodes, avoiding expensive secondary disk lookups to the main table.", "HARD"),

                    new AssessmentQuestion("SQL", "BACKEND", "Query Profiling",
                            "When analyzing MySQL query execution plans using EXPLAIN, which 'type' value indicates the poorest performance?",
                            "eq_ref", "ref", "range", "ALL",
                            "D", "'ALL' signifies a Full Table Scan where InnoDB reads every row on disk because no suitable index was matched.", "HARD"),

                    new AssessmentQuestion("SQL", "BACKEND", "Index Design",
                            "Under the Leftmost Prefix rule in a composite index ON (a, b, c), which WHERE clause CANNOT utilize the index?",
                            "WHERE a = 1 AND b = 2", "WHERE a = 1", "WHERE b = 2 AND c = 3", "WHERE a = 1 AND c = 3",
                            "C", "Composite B+ Trees can only index queries starting from the leftmost column 'a'. Searching on (b, c) without 'a' causes index bypass.", "HARD"),

                    // =================== DSA - EASY (Level 1) ===================
                    new AssessmentQuestion("DSA", "BACKEND", "Algorithms",
                            "What is the average time complexity of searching an element in a balanced Binary Search Tree (AVL / Red-Black)?",
                            "O(1)", "O(N)", "O(log N)", "O(N log N)",
                            "C", "Searching in a balanced BST takes O(log N) time because the search space halves at every level.", "EASY"),

                    new AssessmentQuestion("DSA", "BACKEND", "Data Structures",
                            "Which data structure follows the FIFO (First In First Out) principle?",
                            "Stack", "Queue", "Binary Tree", "Max-Heap",
                            "B", "Queue follows First-In, First-Out (FIFO) ordering (e.g. print queues, breadth-first search).", "EASY"),

                    new AssessmentQuestion("DSA", "BACKEND", "Array vs LinkedList",
                            "Why does an Array offer O(1) random access by index while a LinkedList takes O(N)?",
                            "Arrays store contiguous memory enabling pointer arithmetic [base + index * size]; LinkedList requires pointer traversal", "LinkedList is slower due to garbage collection", "Arrays are cached in CPU registers only", "Arrays cannot store objects",
                            "A", "Contiguous memory layout allows constant-time direct memory offset arithmetic for arrays, while linked nodes must be traversed sequentially.", "EASY"),

                    new AssessmentQuestion("DSA", "BACKEND", "Searching Algorithms",
                            "What fundamental condition must an array satisfy before Binary Search can be performed?",
                            "All elements must be distinct", "The elements must be sorted in ascending or descending order", "The array size must be a power of two", "The array cannot contain negative numbers",
                            "B", "Binary Search relies on sorted order to eliminate half of the search space at each comparison step in O(log N).", "EASY"),

                    // =================== DSA - MEDIUM (Level 2) ===================
                    new AssessmentQuestion("DSA", "BACKEND", "Data Structures",
                            "Which algorithm is commonly used to find the shortest path in an unweighted graph?",
                            "Depth First Search (DFS)", "Breadth First Search (BFS)", "Dijkstra's Algorithm", "Kruskal's Algorithm",
                            "B", "Breadth First Search explores nodes level-by-level, guaranteeing the shortest path in unweighted graphs.", "MEDIUM"),

                    new AssessmentQuestion("DSA", "BACKEND", "Sorting Algorithms",
                            "What is the worst-case time complexity of QuickSort?",
                            "O(N)", "O(N log N)", "O(N^2)", "O(log N)",
                            "C", "QuickSort degrades to O(N^2) when poor pivots are chosen repeatedly (e.g. sorted arrays without randomized pivots).", "MEDIUM"),

                    new AssessmentQuestion("DSA", "BACKEND", "Linked Lists",
                            "Which two-pointer approach detects a cycle in a singly linked list in O(N) time and O(1) space?",
                            "Floyd's Cycle-Finding Algorithm (Tortoise and Hare)", "Binary Search pointers", "Sliding window pointers", "Dijkstra's pointer",
                            "A", "Moving a slow pointer by 1 step and a fast pointer by 2 steps guarantees collision inside any cycle without extra hash memory.", "MEDIUM"),

                    new AssessmentQuestion("DSA", "BACKEND", "Hashing",
                            "How does Separate Chaining resolve hash table collisions?",
                            "By searching for the next open array slot (linear probing)", "By maintaining a linked list or bucket of entries at each hash index", "By doubling the hash seed", "By discarding colliding keys",
                            "B", "Separate Chaining stores multiple key-value nodes sharing the same hash index in a linked list or Red-Black tree bucket.", "MEDIUM"),

                    new AssessmentQuestion("DSA", "BACKEND", "Heaps",
                            "What is the time complexity to insert a new element into a binary Max-Heap of size N?",
                            "O(1)", "O(log N)", "O(N)", "O(N log N)",
                            "B", "Inserting an element appends to the tree bottom and bubbles up along the height of the tree, taking O(log N).", "MEDIUM"),

                    // =================== DSA - HARD (Level 3 MNC) ===================
                    new AssessmentQuestion("DSA", "BACKEND", "Advanced Algorithms",
                            "What is the time complexity of Dijkstra's shortest path algorithm implemented with a Fibonacci Heap (V vertices, E edges)?",
                            "O(V^2)", "O(E + V log V)", "O((V + E) log V)", "O(V * E)",
                            "B", "With a Fibonacci Heap, decrease-key is O(1) amortized, reducing Dijkstra's runtime to O(E + V log V).", "HARD"),

                    new AssessmentQuestion("DSA", "BACKEND", "Dynamic Programming",
                            "In the 0/1 Knapsack problem with capacity W and items N, how can space complexity be optimized from O(N*W) to O(W)?",
                            "Using a 2D matrix with bit shifts", "Traversing the 1D capacity array backwards from W down to item weight", "Sorting items by value-to-weight ratio", "Using recursion without memoization",
                            "B", "Traversing capacity backwards ensures each item is used at most once while overwriting previous states in a 1D array.", "HARD"),

                    new AssessmentQuestion("DSA", "BACKEND", "Dynamic Programming",
                            "What is the optimal time complexity to solve the Longest Increasing Subsequence (LIS) problem?",
                            "O(N^2) using standard DP", "O(N log N) using Patience Sorting with Binary Search", "O(N) using two pointers", "O(2^N) recursive",
                            "B", "Patience sorting maintains the smallest tail of all increasing subsequences of length k, utilizing binary search in O(N log N).", "HARD"),

                    new AssessmentQuestion("DSA", "BACKEND", "Graph Theory",
                            "Which algorithm computes the Topological Ordering of a Directed Acyclic Graph (DAG) using in-degree vertex tracking?",
                            "Kruskal's Algorithm", "Kahn's Algorithm (BFS based)", "Bellman-Ford Algorithm", "Floyd-Warshall",
                            "B", "Kahn's algorithm initializes a queue with all vertices having in-degree 0 and iteratively removes edges in O(V + E).", "HARD"),

                    // =================== SYSTEM DESIGN - EASY (Level 1) ===================
                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Architecture",
                            "What is the primary difference between Horizontal Scaling and Vertical Scaling?",
                            "Horizontal adds more servers/nodes, while Vertical increases CPU/RAM of an existing server", "Horizontal replaces software, Vertical upgrades network", "Horizontal is only for databases", "Vertical is only for microservices",
                            "A", "Horizontal scaling scales out by adding nodes; vertical scaling scales up by boosting single-machine specifications.", "EASY"),

                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Networking",
                            "What is the core role of DNS (Domain Name System) in web architectures?",
                            "Encrypting passwords", "Translating human-readable domain names (e.g. careertwin.edu) into machine-routable IP addresses", "Filtering malware", "Storing session cookies",
                            "B", "DNS acts as the phonebook of the Internet, translating hostnames into binary IPv4/IPv6 addresses.", "EASY"),

                    // =================== SYSTEM DESIGN - MEDIUM (Level 2) ===================
                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Distributed Caching",
                            "In the Cache-Aside (Lazy Loading) caching pattern, which component writes missing data into the cache?",
                            "The database triggers a cache update", "The application service reads from DB on cache miss and writes back into the cache", "The cache server auto-polls the DB", "A separate cron job",
                            "B", "In Cache-Aside, the application first queries cache; on a miss, it fetches from DB and stores the result in cache.", "MEDIUM"),

                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Edge Caching",
                            "How does a Content Delivery Network (CDN) accelerate asset delivery to global users?",
                            "By compressing video files to 10%", "By caching static assets (images, CSS, JS) at geographically distributed Edge PoP servers near users", "By bypassing DNS lookups", "By replacing web servers",
                            "B", "CDNs position Point of Presence (PoP) edge caches close to users worldwide, minimizing network latency (RTT).", "MEDIUM"),

                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Database Scaling",
                            "Why are Read Replicas deployed alongside primary database clusters?",
                            "To offload read-heavy SELECT traffic from the primary write node and boost read throughput", "To replace write transactions", "To encrypt table schemas", "To run automated cron jobs",
                            "A", "Read replicas replicate master changes asynchronously, allowing applications to direct read queries to replicas and reserve the primary for writes.", "MEDIUM"),

                    // =================== SYSTEM DESIGN - HARD (Level 3 MNC) ===================
                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Distributed Systems",
                            "According to the CAP Theorem, when an inevitable Network Partition (P) occurs in a distributed system, what trade-off must be made?",
                            "Latency vs Cost", "Consistency (C) vs Availability (A)", "Security vs Speed", "Throughput vs Durability",
                            "B", "Under a network partition, a distributed system must sacrifice either Availability (rejecting writes) or Consistency (returning stale data).", "HARD"),

                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Consensus Protocols",
                            "In the Raft distributed consensus protocol, how does a candidate node succeed in electing itself as Leader?",
                            "By having the lowest node ID", "By securing affirmative votes from a strict majority (quorum: > N/2) of cluster nodes", "By possessing the largest disk capacity", "By having the longest uptime",
                            "B", "A Raft candidate must gain votes from a strict majority (N/2 + 1) of nodes in the cluster to prevent split-brain leadership.", "HARD"),

                    new AssessmentQuestion("SYSTEM_DESIGN", "BACKEND", "Distributed Caching",
                            "Why is Consistent Hashing preferred over traditional modulo hashing (hash % N) in distributed cache clusters?",
                            "It encrypts key hashes", "When nodes are added or removed, only K/N keys need to be remapped on average rather than almost all keys", "It forces all data onto a single machine", "It avoids network routing",
                            "B", "Consistent Hashing maps servers and keys onto a circular ring, minimizing cache eviction cascades during scaling events.", "HARD")
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
