package com.careertwin.service;

import com.careertwin.dto.*;
import com.careertwin.entity.*;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.*;
import com.careertwin.util.SkillsTaxonomy;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CareerTwinEngineService {

    @Autowired
    private CareerTwinProfileRepository careerTwinProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private AtsAnalysisRepository atsAnalysisRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private CodingProfileRepository codingProfileRepository;

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private SkillGapRepository skillGapRepository;

    @Autowired
    private RoadmapPhaseRepository roadmapPhaseRepository;

    @Autowired
    private ProjectRecommendationRepository projectRecommendationRepository;

    @Autowired
    private WeeklyChallengeRepository weeklyChallengeRepository;

    @Autowired
    private ProgressLogRepository progressLogRepository;

    @Autowired
    @Lazy
    private GeminiService geminiService;

    @Autowired
    @Lazy
    private RoadmapService roadmapService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public CareerTwinDto recalculateCareerTwin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Optional<CareerGoal> goalOpt = careerGoalRepository.findByUserId(userId);
        String targetRole = goalOpt.map(CareerGoal::getTargetRole).orElse("Backend Developer");
        String targetCompany = goalOpt.map(CareerGoal::getTargetCompany).orElse("Tech Industry");

        List<String> requiredSkills = SkillsTaxonomy.determineRequiredSkills(targetRole);

        // 1. Resume Score (0 - 100)
        Optional<AtsAnalysis> atsOpt = atsAnalysisRepository.findTopByUserIdOrderByAnalyzedAtDesc(userId);
        int resumeScore = atsOpt.map(AtsAnalysis::getOverallAtsScore).orElse(0);

        // 2. Technical Score (0 - 100)
        // Gather known student skills from resume, user skills, coding profile languages
        Set<String> knownSkills = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

        // From resume
        Optional<Resume> latestResume = resumeRepository.findByUserIdAndIsLatestTrue(userId);
        if (latestResume.isPresent() && latestResume.get().getParsedSkills() != null) {
            try {
                List<String> skills = objectMapper.readValue(latestResume.get().getParsedSkills(), new TypeReference<List<String>>() {});
                knownSkills.addAll(skills);
            } catch (Exception ignored) {}
        }

        // From UserSkill entities
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);
        for (UserSkill us : userSkills) {
            knownSkills.add(us.getSkillName());
        }

        // From Coding Profiles
        List<CodingProfile> codingProfiles = codingProfileRepository.findByUserId(userId);
        for (CodingProfile cp : codingProfiles) {
            if (cp.getTopLanguagesJson() != null) {
                try {
                    List<String> langs = objectMapper.readValue(cp.getTopLanguagesJson(), new TypeReference<List<String>>() {});
                    knownSkills.addAll(langs);
                } catch (Exception ignored) {}
            }
        }

        int matchedCount = 0;
        for (String req : requiredSkills) {
            if (knownSkills.contains(req)) {
                matchedCount++;
            }
        }

        int technicalScore = requiredSkills.isEmpty() ? 50 :
                (int) Math.round(((double) matchedCount / requiredSkills.size()) * 100);

        // 3. Coding Score (0 - 100)
        int codingScore = 0;
        if (!codingProfiles.isEmpty()) {
            int dsaSum = 0;
            int actSum = 0;
            for (CodingProfile cp : codingProfiles) {
                dsaSum += (cp.getDsaScore() != null ? cp.getDsaScore() : 50);
                actSum += (cp.getActivityScore() != null ? cp.getActivityScore() : 50);
            }
            codingScore = Math.min(100, (int) Math.round(((dsaSum * 0.6) + (actSum * 0.4)) / codingProfiles.size()));
        }

        // 4. Assessment Score (0 - 100)
        List<AssessmentResult> assessments = assessmentResultRepository.findByUserIdOrderByCompletedAtDesc(userId);
        int assessmentScore = 0;
        if (!assessments.isEmpty()) {
            double avgScore = assessments.stream().mapToDouble(AssessmentResult::getScorePercentage).average().orElse(0.0);
            assessmentScore = (int) Math.round(avgScore);
        }

        // 5. Projects Score (0 - 100)
        int projectCount = 0;
        if (latestResume.isPresent() && latestResume.get().getParsedProjects() != null && !latestResume.get().getParsedProjects().isEmpty()) {
            projectCount += 2;
        }
        long completedProjects = projectRecommendationRepository.findByUserId(userId).stream().filter(p -> Boolean.TRUE.equals(p.getIsCompleted())).count();
        projectCount += (int) completedProjects;
        int projectScore = Math.min(100, Math.max(20, projectCount * 30));

        // Deterministic Placement Readiness Formula:
        // Resume (25%) + Technical (25%) + Coding (20%) + Projects (15%) + Assessment (15%)
        int overallReadiness = (int) Math.round(
                (resumeScore * 0.25) +
                (technicalScore * 0.25) +
                (codingScore * 0.20) +
                (projectScore * 0.15) +
                (assessmentScore * 0.15)
        );
        overallReadiness = Math.min(100, Math.max(10, overallReadiness));

        // Strengths & Weaknesses
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        for (String req : requiredSkills) {
            if (knownSkills.contains(req)) {
                strengths.add(req);
            } else {
                weaknesses.add(req);
            }
        }

        // Update Skill Gap records
        skillGapRepository.deleteByUserId(userId);
        List<SkillGap> createdGaps = new ArrayList<>();
        for (String req : requiredSkills) {
            boolean hasSkill = knownSkills.contains(req);
            int requiredLevel = 85;
            int currentLevel = hasSkill ? 75 : 30;

            // Check if assessment verified score exists
            for (UserSkill us : userSkills) {
                if (us.getSkillName().equalsIgnoreCase(req) && us.getVerifiedScore() > 0) {
                    currentLevel = us.getVerifiedScore();
                    break;
                }
            }

            int gap = Math.max(0, requiredLevel - currentLevel);
            String priority = gap >= 35 ? "HIGH" : gap >= 15 ? "MEDIUM" : "LOW";
            String reason = priority.equals("HIGH") ? "Essential core prerequisite for " + targetRole + " interviews." :
                            priority.equals("MEDIUM") ? "Frequently asked in technical rounds and system design." :
                            "Good foundational baseline achieved; keep practicing.";
            String action = priority.equals("HIGH") ? "Complete verified assessment and build a hands-on project using " + req + "." :
                            "Review advanced patterns and solve 3-5 related problems.";

            SkillGap sg = new SkillGap(user, req, requiredLevel, currentLevel, priority, reason, action);
            createdGaps.add(sg);
        }
        skillGapRepository.saveAll(createdGaps);

        // Recommend Next Action
        String recommendedNextAction;
        if (resumeScore < 60) {
            recommendedNextAction = "Upload an updated PDF resume with quantified project impacts to increase your ATS match.";
        } else if (assessmentScore < 60) {
            recommendedNextAction = "Take the Skill Verification Assessment for " + (weaknesses.isEmpty() ? "Core Java" : weaknesses.get(0)) + " to prove technical competency.";
        } else if (codingScore < 65) {
            recommendedNextAction = "Connect or sync your LeetCode/GitHub profiles to boost your verified DSA & Coding ranking.";
        } else {
            recommendedNextAction = "Build and deploy the recommended '" + targetRole + "' capstone project to solidify your placement readiness.";
        }

        String recruiterFeedbackSummary = "Candidate has demonstrated active interest in " + targetRole + " roles. " +
                "Readiness currently sits at " + overallReadiness + "%. " +
                (strengths.isEmpty() ? "Need to substantiate core technical foundations." : "Strong grasp in " + String.join(", ", strengths.stream().limit(3).toList()) + ". ") +
                (weaknesses.isEmpty() ? "Ready for mock interviews!" : "Focus placement preparation on closing gaps in " + String.join(", ", weaknesses.stream().limit(3).toList()) + ".");

        // Save CareerTwinProfile
        CareerTwinProfile profile = careerTwinProfileRepository.findByUserId(userId)
                .orElse(new CareerTwinProfile(user, targetRole));

        profile.setTargetRole(targetRole);
        profile.setOverallReadiness(overallReadiness);
        profile.setResumeScore(resumeScore);
        profile.setTechnicalScore(technicalScore);
        profile.setCodingScore(codingScore);
        profile.setProjectScore(projectScore);
        profile.setAssessmentScore(assessmentScore);
        profile.setRecommendedNextAction(recommendedNextAction);
        profile.setRecruiterFeedbackSummary(recruiterFeedbackSummary);

        try {
            profile.setStrengthsJson(objectMapper.writeValueAsString(strengths));
            profile.setWeaknessesJson(objectMapper.writeValueAsString(weaknesses));
            List<String> topGapNames = createdGaps.stream()
                    .filter(g -> "HIGH".equals(g.getPriority()))
                    .map(SkillGap::getSkillName)
                    .limit(4).toList();
            profile.setTopSkillGapsJson(objectMapper.writeValueAsString(topGapNames));
        } catch (Exception ignored) {}

        CareerTwinProfile savedProfile = careerTwinProfileRepository.save(profile);

        // Record progress history log
        recordProgressLog(user, overallReadiness, resumeScore, userSkills.size());

        // Ensure default Roadmap, Projects and Challenges are initialized for user
        initializeUserArtifactsIfEmpty(user, targetRole);

        return mapToDto(savedProfile, user, goalOpt.orElse(null));
    }

    public CareerTwinDto getCareerTwin(Long userId) {
        CareerTwinProfile profile = careerTwinProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Calculate initial profile if not yet created
                    return recalculateCareerTwinEntity(userId);
                });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CareerGoal goal = careerGoalRepository.findByUserId(userId).orElse(null);

        return mapToDto(profile, user, goal);
    }

    private CareerTwinProfile recalculateCareerTwinEntity(Long userId) {
        recalculateCareerTwin(userId);
        return careerTwinProfileRepository.findByUserId(userId).orElseThrow();
    }

    private void recordProgressLog(User user, int readiness, int ats, int verifiedSkills) {
        long completedChallenges = weeklyChallengeRepository.findByUserAndIsCompletedTrue(user).size();
        ProgressLog log = new ProgressLog(user, readiness, ats, verifiedSkills, (int) completedChallenges, "Career Twin auto-recalculated");
        progressLogRepository.save(log);
    }

    public void initializeUserArtifactsIfEmpty(User user, String targetRole) {
        Long userId = user.getId();

        // 1. Roadmap Phases
        List<RoadmapPhase> existingPhases = roadmapPhaseRepository.findByUserIdOrderByPhaseNumberAsc(userId);
        if (existingPhases.isEmpty()) {
            List<RoadmapPhase> defaultPhases = List.of(
                    new RoadmapPhase(user, 1, "Core Technical Foundations & OOP", 2,
                            "[\"Object-Oriented Programming (OOP) Deep Dive\", \"Java Collections Framework & Memory Model\", \"Exception Handling & Clean Code Principles\"]",
                            "[\"Java\", \"OOP\", \"Data Structures\"]", "Build CLI Bank Management System"),
                    new RoadmapPhase(user, 2, "Backend Architecture & Spring Boot", 2,
                            "[\"Spring Boot Fundamentals & Dependency Injection\", \"RESTful API Design & HTTP Statuses\", \"Spring Data JPA & Hibernate ORM\"]",
                            "[\"Spring Boot\", \"REST APIs\", \"JPA\"]", "Build Employee Management REST API"),
                    new RoadmapPhase(user, 3, "Database Engineering & SQL Optimization", 2,
                            "[\"Relational Schemas & Normalization\", \"Complex SQL Joins, Indexing & Transactions\", \"MySQL Performance Tuning\"]",
                            "[\"SQL\", \"MySQL\", \"DBMS\"]", "Design High-Concurrency E-Commerce DB Schema"),
                    new RoadmapPhase(user, 4, "Security, Testing & Cloud Deployment", 2,
                            "[\"JWT Authentication & Spring Security\", \"Unit & Integration Testing with JUnit/Mockito\", \"Containerization with Docker & CI/CD Pipelines\"]",
                            "[\"Spring Security\", \"Docker\", \"JUnit\"]", "Secure API Deployment with Docker"),
                    new RoadmapPhase(user, 5, "Placement Interview Prep & Mock Rounds", 2,
                            "[\"DSA Placement Sheet (Top 50 Interview Questions)\", \"System Design & Architecture Questions\", \"HR & Behavioral STAR Method Practice\"]",
                            "[\"DSA\", \"System Design\", \"Algorithms\"]", "Complete 3 Full-Length Mock Placement Interviews")
            );
            roadmapPhaseRepository.saveAll(defaultPhases);
        }

        // 2. Project Recommendations (Student-Specific & Year-Aligned)
        List<ProjectRecommendation> existingProjects = projectRecommendationRepository.findByUserId(userId);
        if (existingProjects.isEmpty()) {
            roadmapService.generatePersonalizedProjects(userId, false);
        }

        // 3. Weekly Challenges
        List<WeeklyChallenge> existingChallenges = weeklyChallengeRepository.findByUserIdOrderByWeekNumberAsc(userId);
        if (existingChallenges.isEmpty()) {
            List<WeeklyChallenge> defaultChallenges = List.of(
                    new WeeklyChallenge(user, 1, "Array & HashMap Problem Solving Sprint",
                            "Solve 5 classic array and hashmap interview questions (Two Sum, Group Anagrams, Subarray Sum Equals K).",
                            "DSA", "MEDIUM", 60),
                    new WeeklyChallenge(user, 2, "Build Secure JWT Authentication Endpoints",
                            "Implement register, login, and token refresh endpoints with BCrypt password hashing in Spring Boot.",
                            "BACKEND", "MEDIUM", 75),
                    new WeeklyChallenge(user, 3, "Master Complex SQL Joins & Window Functions",
                            "Write 5 optimized SQL queries solving employee-department salary ranking and order grouping scenarios.",
                            "SQL", "MEDIUM", 50),
                    new WeeklyChallenge(user, 4, "Resume Polish: Action Verb & Metrics Upgrade",
                            "Rewrite project bullet points using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
                            "RESUME", "EASY", 40),
                    new WeeklyChallenge(user, 5, "Take the Full Java OOP & Spring Assessment",
                            "Achieve 75%+ score on the verified technical placement assessment.",
                            "ASSESSMENT", "HARD", 100)
            );
            weeklyChallengeRepository.saveAll(defaultChallenges);
        }
    }

    private CareerTwinDto mapToDto(CareerTwinProfile p, User user, CareerGoal goal) {
        CareerTwinDto dto = new CareerTwinDto();
        dto.setStudentName(user.getFullName());
        dto.setTargetRole(p.getTargetRole());
        dto.setTargetCompany(goal != null && goal.getTargetCompany() != null ? goal.getTargetCompany() : "Tech Product Companies");
        dto.setOverallReadiness(p.getOverallReadiness());
        dto.setResumeScore(p.getResumeScore());
        dto.setTechnicalScore(p.getTechnicalScore());
        dto.setCodingScore(p.getCodingScore());
        dto.setProjectScore(p.getProjectScore());
        dto.setAssessmentScore(p.getAssessmentScore());
        dto.setRecommendedNextAction(p.getRecommendedNextAction());
        dto.setRecruiterFeedbackSummary(p.getRecruiterFeedbackSummary());
        dto.setLastUpdated(p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCalculatedAt());

        try {
            dto.setStrengths(objectMapper.readValue(p.getStrengthsJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setStrengths(Collections.emptyList()); }

        try {
            dto.setWeaknesses(objectMapper.readValue(p.getWeaknessesJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) { dto.setWeaknesses(Collections.emptyList()); }

        // Top skill gaps
        List<SkillGap> gaps = skillGapRepository.findByUserIdOrderByGapScoreDesc(user.getId());
        List<SkillGapDto> gapDtos = gaps.stream().limit(5).map(g ->
                new SkillGapDto(g.getSkillName(), g.getRequiredLevel(), g.getCurrentLevel(), g.getGapScore(),
                        g.getPriority(), g.getReason(), g.getRecommendedAction())
        ).collect(Collectors.toList());
        dto.setTopSkillGaps(gapDtos);

        // Roadmap progress
        List<RoadmapPhase> phases = roadmapPhaseRepository.findByUserIdOrderByPhaseNumberAsc(user.getId());
        if (!phases.isEmpty()) {
            long completedPhases = phases.stream().filter(ph -> Boolean.TRUE.equals(ph.getIsCompleted())).count();
            dto.setRoadmapProgress((int) Math.round(((double) completedPhases / phases.size()) * 100));
        } else {
            dto.setRoadmapProgress(0);
        }

        // Challenges
        List<WeeklyChallenge> challenges = weeklyChallengeRepository.findByUserIdOrderByWeekNumberAsc(user.getId());
        dto.setTotalChallenges(challenges.size());
        dto.setWeeklyChallengesCompleted((int) challenges.stream().filter(c -> Boolean.TRUE.equals(c.getIsCompleted())).count());

        return dto;
    }
}
