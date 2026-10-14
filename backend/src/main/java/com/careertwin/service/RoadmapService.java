package com.careertwin.service;

import com.careertwin.dto.ProjectRecommendationDto;
import com.careertwin.dto.RoadmapPhaseDto;
import com.careertwin.entity.*;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoadmapService {

    @Autowired
    private RoadmapPhaseRepository roadmapPhaseRepository;

    @Autowired
    private ProjectRecommendationRepository projectRecommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private SkillGapRepository skillGapRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<RoadmapPhaseDto> getUserRoadmap(Long userId) {
        List<RoadmapPhase> phases = roadmapPhaseRepository.findByUserIdOrderByPhaseNumberAsc(userId);
        return phases.stream().map(this::mapToRoadmapDto).collect(Collectors.toList());
    }

    @Transactional
    public RoadmapPhaseDto togglePhaseCompletion(Long userId, Long phaseId) {
        RoadmapPhase phase = roadmapPhaseRepository.findById(phaseId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap phase not found with id: " + phaseId));

        boolean newStatus = !Boolean.TRUE.equals(phase.getIsCompleted());
        phase.setIsCompleted(newStatus);
        phase.setProgressPercentage(newStatus ? 100 : 0);

        RoadmapPhase saved = roadmapPhaseRepository.save(phase);

        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToRoadmapDto(saved);
    }

    @Transactional
    public List<ProjectRecommendationDto> getUserProjects(Long userId) {
        List<ProjectRecommendation> projects = projectRecommendationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (projects.isEmpty()) {
            projects = generatePersonalizedProjects(userId, false);
        }
        return projects.stream().map(this::mapToProjectDto).collect(Collectors.toList());
    }

    @Transactional
    public List<ProjectRecommendationDto> regeneratePersonalizedProjects(Long userId) {
        List<ProjectRecommendation> projects = generatePersonalizedProjects(userId, true);
        careerTwinEngineService.recalculateCareerTwin(userId);
        return projects.stream().map(this::mapToProjectDto).collect(Collectors.toList());
    }

    @Transactional
    public List<ProjectRecommendation> generatePersonalizedProjects(Long userId, boolean forceRefresh) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<ProjectRecommendation> existing = projectRecommendationRepository.findByUserId(userId);
        if (!existing.isEmpty() && !forceRefresh) {
            return existing;
        }

        // Keep track of any previously completed projects
        Map<String, String> completedStatusMap = new HashMap<>();
        if (!existing.isEmpty()) {
            for (ProjectRecommendation ep : existing) {
                if ("COMPLETED".equalsIgnoreCase(ep.getStatus()) || Boolean.TRUE.equals(ep.getIsCompleted())) {
                    completedStatusMap.put(ep.getTitle().toLowerCase().trim(), "COMPLETED");
                }
            }
            projectRecommendationRepository.deleteAll(existing);
        }

        // Determine student profile details
        String year = user.getYear() != null && !user.getYear().isBlank() ? user.getYear().trim() : "3rd Year";
        Optional<CareerGoal> goalOpt = careerGoalRepository.findByUserId(userId);
        String targetRole = goalOpt.map(CareerGoal::getTargetRole).orElse("Software Engineer");

        // Extract student's verified high and medium skill gaps
        List<SkillGap> gaps = skillGapRepository.findByUserId(userId);
        List<String> highGaps = gaps.stream()
                .filter(g -> "HIGH".equals(g.getPriority()))
                .map(SkillGap::getSkillName)
                .toList();
        List<String> medGaps = gaps.stream()
                .filter(g -> "MEDIUM".equals(g.getPriority()))
                .map(SkillGap::getSkillName)
                .toList();

        String gap1 = !highGaps.isEmpty() ? highGaps.get(0) : (!medGaps.isEmpty() ? medGaps.get(0) : "System Design");
        String gap2 = highGaps.size() > 1 ? highGaps.get(1) : (!medGaps.isEmpty() ? medGaps.get(0) : "Docker");

        List<ProjectRecommendation> generated = buildProjectCatalog(user, year, targetRole, gap1, gap2);

        // Restore completion status if applicable
        for (ProjectRecommendation pr : generated) {
            if (completedStatusMap.containsKey(pr.getTitle().toLowerCase().trim())) {
                pr.setStatus("COMPLETED");
                pr.setIsCompleted(true);
            }
        }

        return projectRecommendationRepository.saveAll(generated);
    }

    private List<ProjectRecommendation> buildProjectCatalog(User user, String year, String role, String gap1, String gap2) {
        String roleLower = role.toLowerCase();
        boolean is1stYear = year.contains("1");
        boolean is2ndYear = year.contains("2");
        boolean is4thYear = year.contains("4");
        // default is 3rd Year

        List<ProjectRecommendation> list = new ArrayList<>();

        if (roleLower.contains("front") || roleLower.contains("react") || roleLower.contains("ui")) {
            // Frontend Track
            if (is1stYear) {
                list.add(new ProjectRecommendation(user,
                        "Interactive Campus Event & Hackathon Showcase",
                        "A modern, responsive multi-page web application featuring dynamic event filtering, search, and ticket registration with persistent local storage.",
                        "BEGINNER",
                        "[\"HTML5\", \"CSS3\", \"JavaScript ES6\", \"Responsive Design\", \"DOM Manipulation\"]",
                        "Ideal for 1st Year: Builds core JavaScript and CSS layout fluency without framework complexity."));
                list.add(new ProjectRecommendation(user,
                        "Personal Developer Portfolio & Blog Engine",
                        "A clean, SEO-optimized portfolio website with dark mode toggle, markdown blog viewer, and interactive contact form.",
                        "BEGINNER",
                        "[\"JavaScript\", \"TailwindCSS\", \"Markdown\", \"Git\"]",
                        "Recommended for 1st Year: Establishes your public GitHub presence and recruiter-facing portfolio early."));
                list.add(new ProjectRecommendation(user,
                        "Real-Time Weather & Air Quality Dashboard",
                        "An interactive dashboard consuming public REST APIs, handling async HTTP requests, errors, and rendering visual weather trends.",
                        "BEGINNER",
                        "[\"JavaScript\", \"Fetch API\", \"Async/Await\", \"Chart.js\"]",
                        "Recommended for 1st Year: Master asynchronous JavaScript and third-party REST API integration."));
            } else if (is2ndYear) {
                list.add(new ProjectRecommendation(user,
                        "Collaborative Kanban Task Board SPA",
                        "A Trello-style single page application with drag-and-drop task movement, multi-column filtering, and priority tagging.",
                        "INTERMEDIATE",
                        "[\"React\", \"React Hooks\", \"TailwindCSS\", \"Context API\", \"REST APIs\"]",
                        "Tailored for 2nd Year: Solidifies React state management, component architecture, and responsive UI design."));
                list.add(new ProjectRecommendation(user,
                        "E-Commerce Product Explorer with Cart & Checkout Flow",
                        "A feature-rich store catalog with live price filtering, debounced search, modal previews, and cart persistence.",
                        "INTERMEDIATE",
                        "[\"React\", \"React Router\", \"TailwindCSS\", \"REST APIs\", \"Local Storage\"]",
                        "Tailored for 2nd Year: Teaches multi-route navigation, complex client state, and responsive component libraries."));
                list.add(new ProjectRecommendation(user,
                        "Interactive Code Snippet Manager & Syntax Highlighter",
                        "A developer productivity tool allowing users to categorize, edit, copy, and search code snippets across 10+ languages.",
                        "INTERMEDIATE",
                        "[\"React\", \"TailwindCSS\", \"PrismJS\", \"REST APIs\"]",
                        "Bridges your skill gap in " + gap1 + " and demonstrates modular reusable React component design."));
            } else if (is4thYear) {
                list.add(new ProjectRecommendation(user,
                        "Enterprise Micro-Frontend Analytics SaaS Platform",
                        "A high-scale modular dashboard with Server-Side Rendering (SSR), real-time data streaming via WebSockets, and role-based views.",
                        "ADVANCED",
                        "[\"Next.js\", \"TypeScript\", \"TailwindCSS\", \"WebSockets\", \"Docker\"]",
                        "Capstone for 4th Year placement rounds: Demonstrates enterprise Next.js architecture, SSR, and bridges your verified gap in " + gap1 + "."));
                list.add(new ProjectRecommendation(user,
                        "Real-Time Collaborative Whiteboard & Flowchart Engine",
                        "An in-browser canvas editor with multi-user cursor tracking, vector shape drawing, and state synchronization.",
                        "ADVANCED",
                        "[\"React\", \"Canvas API\", \"WebSockets\", \"TypeScript\", \"Zustand\"]",
                        "Capstone for 4th Year: Proves complex browser rendering, real-time collaboration, and state performance optimization."));
                list.add(new ProjectRecommendation(user,
                        "Design System Component Library with Storybook & CI",
                        "An accessible, zero-dependency NPM UI component library with automated unit testing, documentation, and Lighthouse 98+ score.",
                        "ADVANCED",
                        "[\"React\", \"TypeScript\", \"Storybook\", \"Jest\", \"GitHub Actions\"]",
                        "Recommended for 4th Year: Proves professional frontend engineering hygiene and automated CI publishing to recruiters."));
            } else {
                // 3rd Year (Default)
                list.add(new ProjectRecommendation(user,
                        "Real-Time Developer Playground & Code Snippet Cloud",
                        "A live React application with code formatting, snippet sharing, debounced live preview, and state management via Redux Toolkit.",
                        "INTERMEDIATE",
                        "[\"React\", \"Redux Toolkit\", \"TailwindCSS\", \"REST APIs\", \"Axios\"]",
                        "Targeted for 3rd Year placement prep: Directly addresses your skill gap in " + gap1 + " and proves industry-standard state management."));
                list.add(new ProjectRecommendation(user,
                        "AI-Powered Resume Reviewer & Portfolio Builder UI",
                        "A responsive dashboard interface integrating AI API endpoints to stream resume suggestions and visualize ATS scores with Chart.js.",
                        "INTERMEDIATE",
                        "[\"React\", \"TailwindCSS\", \"Chart.js\", \"REST APIs\", \"Gemini API\"]",
                        "Targeted for 3rd Year: Demonstrates AI prompt integration, visual analytics, and modern UI/UX design."));
                list.add(new ProjectRecommendation(user,
                        "High-Performance Movie & Media Streaming Dashboard",
                        "An optimized streaming platform interface with lazy-loaded media assets, infinite scrolling, skeleton loaders, and sub-1s load time.",
                        "ADVANCED",
                        "[\"React\", \"TypeScript\", \"TailwindCSS\", \"Vite\", \"Lighthouse Optimization\"]",
                        "Targeted for 3rd Year: Demonstrates performance optimization, Web Vitals tuning, and strengthens " + gap2 + "."));
            }

        } else if (roleLower.contains("data") || roleLower.contains("machine") || roleLower.contains("ai") || roleLower.contains("ml")) {
            // Data Science & AI Track
            if (is1stYear) {
                list.add(new ProjectRecommendation(user,
                        "Exploratory Placement & Salary Data Analysis",
                        "An end-to-end data exploration project analyzing historical university placement packages with statistical insights and clean charts.",
                        "BEGINNER",
                        "[\"Python\", \"Pandas\", \"NumPy\", \"Matplotlib\", \"Seaborn\"]",
                        "Ideal for 1st Year: Master Python data manipulation, outlier detection, and statistical data visualization."));
                list.add(new ProjectRecommendation(user,
                        "Interactive CLI Student Performance Analytics",
                        "A Python command-line analytics tool computing semester CGPA trends, subject correlations, and CSV export capabilities.",
                        "BEGINNER",
                        "[\"Python\", \"Pandas\", \"CSV\", \"OOP\"]",
                        "Recommended for 1st Year: Builds strong object-oriented Python scripting and tabular data processing foundations."));
            } else if (is4thYear) {
                list.add(new ProjectRecommendation(user,
                        "Real-Time Production MLOps Pipeline & Drift Detector",
                        "An enterprise ML pipeline featuring automated data validation, model retraining triggers, MLflow tracking, and Dockerized inference.",
                        "ADVANCED",
                        "[\"Python\", \"FastAPI\", \"MLflow\", \"Docker\", \"Kubernetes\", \"Prometheus\"]",
                        "Capstone for 4th Year: Directly proves production MLOps readiness and bridges your critical gap in " + gap1 + "."));
                list.add(new ProjectRecommendation(user,
                        "Transformer-Based Multilingual Resume Information Extraction",
                        "A deep learning NLP service using HuggingFace models to extract structured entities, skills, and experience timelines from PDF resumes.",
                        "ADVANCED",
                        "[\"Python\", \"PyTorch\", \"HuggingFace\", \"FastAPI\", \"Docker\"]",
                        "Capstone for 4th Year: Showcases state-of-the-art NLP fine-tuning and production REST API serving."));
            } else {
                // 2nd / 3rd Year
                list.add(new ProjectRecommendation(user,
                        "Student Placement Prediction & Probability Engine",
                        "A supervised machine learning model evaluating candidate profiles and predicting campus placement likelihood with a Streamlit interface.",
                        "INTERMEDIATE",
                        "[\"Python\", \"Scikit-Learn\", \"Pandas\", \"Streamlit\", \"FastAPI\"]",
                        "Targeted for " + year + ": Bridges your verified skill gap in " + gap1 + " and proves end-to-end model deployment."));
                list.add(new ProjectRecommendation(user,
                        "Resume Skill Gap & Recommendation API with NLP",
                        "A FastAPI microservice that parses candidate resumes, computes TF-IDF skill cosine similarity against job descriptions, and returns gap scores.",
                        "INTERMEDIATE",
                        "[\"Python\", \"FastAPI\", \"NLTK\", \"Scikit-Learn\", \"Docker\"]",
                        "Targeted for " + year + ": Demonstrates NLP text vectorization, Docker containerization, and REST API deployment."));
                list.add(new ProjectRecommendation(user,
                        "Automated Financial Fraud Detection Service",
                        "An anomaly detection and classification pipeline for credit card transactions with precision-recall curve tuning.",
                        "ADVANCED",
                        "[\"Python\", \"Scikit-Learn\", \"XGBoost\", \"Pandas\", \"Docker\"]",
                        "Targeted for " + year + ": Demonstrates imbalanced dataset handling and production inference."));
            }

        } else if (roleLower.contains("devops") || roleLower.contains("cloud")) {
            // DevOps Track
            list.add(new ProjectRecommendation(user,
                    "Automated Multi-Stage CI/CD Pipeline with Docker & GitHub Actions",
                    "A containerized deployment pipeline running automated unit tests, linting, Docker image building, and deployment to cloud instances.",
                    "INTERMEDIATE",
                    "[\"Docker\", \"GitHub Actions\", \"Linux\", \"Bash\", \"Nginx\"]",
                    "Targeted for " + year + ": Bridges your critical gap in " + gap1 + " and establishes continuous delivery best practices."));
            list.add(new ProjectRecommendation(user,
                    "Kubernetes Cluster Deployment with Prometheus & Grafana Monitoring",
                    "A resilient multi-replica microservices cluster with auto-scaling, ingress controllers, and real-time observability dashboards.",
                    "ADVANCED",
                    "[\"Kubernetes\", \"Docker\", \"Helm\", \"Prometheus\", \"Grafana\"]",
                    "Targeted for " + year + ": Proves cloud orchestration and production reliability engineering to top recruiters."));
            list.add(new ProjectRecommendation(user,
                    "Infrastructure as Code (IaC) Cloud Provisioning with Terraform",
                    "Automated provisioning of VPCs, subnets, security groups, and database instances in AWS using modular Terraform scripts.",
                    "ADVANCED",
                    "[\"Terraform\", \"AWS\", \"Linux\", \"Security Groups\"]",
                    "Targeted for " + year + ": Demonstrates declarative infrastructure management and cloud security."));

        } else {
            // Backend / Full Stack / Software Development Engineer (SDE) - Most Common
            if (is1stYear) {
                list.add(new ProjectRecommendation(user,
                        "CLI Student Records & Placement Eligibility System",
                        "A structured command-line Java application implementing OOP principles, file I/O or JDBC persistence, and search/filtering algorithms.",
                        "BEGINNER",
                        "[\"Java\", \"OOP\", \"MySQL\", \"JDBC\", \"Git\"]",
                        "Ideal for 1st Year: Builds rock-solid object-oriented programming foundation and relational SQL database fluency."));
                list.add(new ProjectRecommendation(user,
                        "Personal Expense & Budget Tracker REST API",
                        "A clean Spring Boot REST API providing full CRUD endpoints for student expense tracking with categorized reporting.",
                        "BEGINNER",
                        "[\"Java\", \"Spring Boot\", \"MySQL\", \"REST APIs\", \"Postman\"]",
                        "Recommended for 1st Year: Introduces HTTP verbs, JSON serialization, and entity mapping early in your academic journey."));
                list.add(new ProjectRecommendation(user,
                        "Algorithm Benchmark & Data Structure Visualizer",
                        "A suite of classic DSA algorithms (sorting, graph traversals, dynamic programming) with execution timing and unit test coverage.",
                        "BEGINNER",
                        "[\"Java\", \"Data Structures\", \"Algorithms\", \"JUnit\"]",
                        "Recommended for 1st Year: Solidifies placement DSA problem solving and automated unit testing habits."));
            } else if (is2ndYear) {
                list.add(new ProjectRecommendation(user,
                        "Campus Placement & Interview Schedule Portal",
                        "A role-based web service allowing coordinators to post placement drives, manage applicants, and track round clearances.",
                        "INTERMEDIATE",
                        "[\"Java\", \"Spring Boot\", \"MySQL\", \"Hibernate JPA\", \"Postman\"]",
                        "Tailored for 2nd Year: Proves multi-table relational schema design, transaction handling, and clean REST architecture."));
                list.add(new ProjectRecommendation(user,
                        "Secure Authentication & Role-Based Authorization Service",
                        "A standalone security microservice implementing BCrypt password hashing, JWT token generation, expiration, and refresh mechanisms.",
                        "INTERMEDIATE",
                        "[\"Spring Boot\", \"Spring Security\", \"JWT\", \"MySQL\"]",
                        "Tailored for 2nd Year: Essential security baseline required by all software engineering hiring managers."));
                list.add(new ProjectRecommendation(user,
                        "Automated Job Application Tracker & Reminder API",
                        "A production backend service enabling candidates to log applications, upload resumes, and receive status reminders.",
                        "INTERMEDIATE",
                        "[\"Spring Boot\", \"REST APIs\", \"MySQL\", \"Docker\"]",
                        "Bridges your skill gap in " + gap1 + " and demonstrates containerized application packaging."));
            } else if (is4thYear) {
                list.add(new ProjectRecommendation(user,
                        "Distributed High-Concurrency Payment & Digital Wallet System",
                        "A financial ledger microservice implementing distributed ACID transactions, idempotent payment processing, and Kafka message queues.",
                        "ADVANCED",
                        "[\"Java\", \"Spring Boot\", \"Kafka\", \"Redis\", \"PostgreSQL\", \"Docker\"]",
                        "Capstone for 4th Year placement rounds: Demonstrates enterprise distributed systems design, idempotency, and closes your gap in " + gap1 + "."));
                list.add(new ProjectRecommendation(user,
                        "Real-Time Collaborative Code Execution Sandbox",
                        "A multi-tenant coding platform that compiles and executes student code inside secure isolated Docker containers with WebSockets.",
                        "ADVANCED",
                        "[\"Spring Boot\", \"Docker API\", \"WebSockets\", \"Redis\", \"MySQL\"]",
                        "Capstone for 4th Year: Directly proves advanced container sandboxing (" + gap1 + ") and low-latency full-duplex communication."));
                list.add(new ProjectRecommendation(user,
                        "High-Throughput Distributed Rate Limiter & Caching Gateway",
                        "An API gateway filter implementing the Token Bucket algorithm in Redis to throttle abusive traffic across distributed microservices.",
                        "ADVANCED",
                        "[\"Java\", \"Spring Boot\", \"Redis\", \"Docker\", \"Prometheus\"]",
                        "Capstone for 4th Year: Highly prized system design capstone showcasing caching resilience and telemetry."));
            } else {
                // 3rd Year (Pre-Final Year Placement Season Focus)
                list.add(new ProjectRecommendation(user,
                        "High-Throughput URL Shortener with Analytics & Redis Caching",
                        "A scalable URL redirection service handling concurrent read requests with sub-15ms latency, Redis caching, and rate limiting.",
                        "ADVANCED",
                        "[\"Java\", \"Spring Boot\", \"Redis\", \"MySQL\", \"Docker\"]",
                        "Specially tailored for 3rd Year placement prep: Directly closes your critical skill gap in " + gap1 + " and proves distributed caching."));
                list.add(new ProjectRecommendation(user,
                        "AI-Powered Placement Twin & Resume Matcher API",
                        "An enterprise backend application matching student resumes to job roles, computing ATS scores, and generating customized roadmaps.",
                        "INTERMEDIATE",
                        "[\"Spring Boot\", \"REST APIs\", \"MySQL\", \"JWT\", \"JPA\", \"Gemini AI\"]",
                        "Specially tailored for 3rd Year: Demonstrates production Spring Boot architecture, JWT security, and practical GenAI integration."));
                list.add(new ProjectRecommendation(user,
                        "E-Commerce Order Management & Async Inventory Service",
                        "A robust order placement pipeline using database transactions, pessimistic locking for stock reservations, and Docker containerization.",
                        "ADVANCED",
                        "[\"Java\", \"Spring Boot\", \"MySQL\", \"Docker\", \"JUnit\", \"Mockito\"]",
                        "Specially tailored for 3rd Year: Demonstrates concurrency management, transactional integrity, and strengthens your profile in " + gap2 + "."));
            }
        }

        return list;
    }

    @Transactional
    public ProjectRecommendationDto updateProjectStatus(Long userId, Long projectId, String status) {
        ProjectRecommendation project = projectRecommendationRepository.findById(projectId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Project recommendation not found with id: " + projectId));

        project.setStatus(status.toUpperCase());
        project.setIsCompleted("COMPLETED".equalsIgnoreCase(status));

        ProjectRecommendation saved = projectRecommendationRepository.save(project);

        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToProjectDto(saved);
    }

    private RoadmapPhaseDto mapToRoadmapDto(RoadmapPhase p) {
        RoadmapPhaseDto dto = new RoadmapPhaseDto();
        dto.setId(p.getId());
        dto.setPhaseNumber(p.getPhaseNumber());
        dto.setPhaseTitle(p.getPhaseTitle());
        dto.setDurationWeeks(p.getDurationWeeks());
        dto.setProjectMilestone(p.getProjectMilestone());
        dto.setIsCompleted(p.getIsCompleted());
        dto.setProgressPercentage(p.getProgressPercentage());

        try {
            dto.setTopics(objectMapper.readValue(p.getTopicsJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setTopics(Collections.emptyList()); }

        try {
            dto.setSkillsCovered(objectMapper.readValue(p.getSkillsCoveredJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setSkillsCovered(Collections.emptyList()); }

        return dto;
    }

    private ProjectRecommendationDto mapToProjectDto(ProjectRecommendation p) {
        ProjectRecommendationDto dto = new ProjectRecommendationDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setDifficulty(p.getDifficulty());
        dto.setRelevanceReason(p.getRelevanceReason());
        dto.setGithubTemplateUrl(p.getGithubTemplateUrl());
        dto.setIsCompleted(p.getIsCompleted());
        dto.setStatus(p.getStatus());

        try {
            dto.setTechnologies(objectMapper.readValue(p.getTechnologiesJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setTechnologies(Collections.emptyList()); }

        return dto;
    }
}
