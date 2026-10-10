package com.careertwin.service;

import com.careertwin.dto.ProgressOverviewDto;
import com.careertwin.entity.*;
import com.careertwin.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ProgressService {

    @Autowired
    private ProgressLogRepository progressLogRepository;

    @Autowired
    private CareerTwinProfileRepository careerTwinProfileRepository;

    @Autowired
    private WeeklyChallengeRepository challengeRepository;

    @Autowired
    private RoadmapPhaseRepository roadmapPhaseRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private SkillGapRepository skillGapRepository;

    @Autowired
    private AtsAnalysisRepository atsAnalysisRepository;

    public ProgressOverviewDto getProgressOverview(Long userId) {
        ProgressOverviewDto dto = new ProgressOverviewDto();

        Optional<CareerTwinProfile> profileOpt = careerTwinProfileRepository.findByUserId(userId);
        int currentReadiness = profileOpt.map(CareerTwinProfile::getOverallReadiness).orElse(50);
        dto.setCurrentReadiness(currentReadiness);

        List<ProgressLog> logs = progressLogRepository.findByUserIdOrderByRecordedAtAsc(userId);
        List<ProgressOverviewDto.ReadinessTrendPoint> trendPoints = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM");

        if (logs.isEmpty()) {
            // Seed a realistic baseline trend for visual display
            trendPoints.add(new ProgressOverviewDto.ReadinessTrendPoint("Day 1", Math.max(20, currentReadiness - 25), 45));
            trendPoints.add(new ProgressOverviewDto.ReadinessTrendPoint("Week 1", Math.max(30, currentReadiness - 15), 55));
            trendPoints.add(new ProgressOverviewDto.ReadinessTrendPoint("Week 2", Math.max(40, currentReadiness - 8), 65));
            trendPoints.add(new ProgressOverviewDto.ReadinessTrendPoint("Current", currentReadiness, profileOpt.map(CareerTwinProfile::getResumeScore).orElse(70)));
            dto.setPreviousReadiness(Math.max(20, currentReadiness - 15));
        } else {
            for (ProgressLog log : logs) {
                trendPoints.add(new ProgressOverviewDto.ReadinessTrendPoint(
                        log.getRecordedAt().format(fmt),
                        log.getReadinessScore(),
                        log.getAtsScore()
                ));
            }
            dto.setPreviousReadiness(logs.get(0).getReadinessScore());
        }
        dto.setReadinessTrend(trendPoints);
        dto.setReadinessGrowth(dto.getCurrentReadiness() - (dto.getPreviousReadiness() != null ? dto.getPreviousReadiness() : 35));

        // Skill proficiencies
        List<SkillGap> gaps = skillGapRepository.findByUserIdOrderByGapScoreDesc(userId);
        List<ProgressOverviewDto.SkillProficiencyPoint> profPoints = new ArrayList<>();
        for (SkillGap g : gaps.stream().limit(7).toList()) {
            profPoints.add(new ProgressOverviewDto.SkillProficiencyPoint(g.getSkillName(), g.getCurrentLevel(), g.getRequiredLevel()));
        }
        if (profPoints.isEmpty()) {
            profPoints.add(new ProgressOverviewDto.SkillProficiencyPoint("Java", 75, 85));
            profPoints.add(new ProgressOverviewDto.SkillProficiencyPoint("Spring Boot", 45, 85));
            profPoints.add(new ProgressOverviewDto.SkillProficiencyPoint("SQL", 70, 80));
            profPoints.add(new ProgressOverviewDto.SkillProficiencyPoint("DSA", 60, 85));
            profPoints.add(new ProgressOverviewDto.SkillProficiencyPoint("REST APIs", 65, 80));
        }
        dto.setSkillProficiencies(profPoints);

        // Challenges count
        List<WeeklyChallenge> allChallenges = challengeRepository.findByUserIdOrderByWeekNumberAsc(userId);
        dto.setTotalChallengesCount(allChallenges.size());
        dto.setChallengesCompletedCount((int) allChallenges.stream().filter(c -> Boolean.TRUE.equals(c.getIsCompleted())).count());

        // Roadmap completion
        List<RoadmapPhase> phases = roadmapPhaseRepository.findByUserIdOrderByPhaseNumberAsc(userId);
        if (!phases.isEmpty()) {
            long comp = phases.stream().filter(p -> Boolean.TRUE.equals(p.getIsCompleted())).count();
            dto.setRoadmapCompletionPercentage((int) Math.round(((double) comp / phases.size()) * 100));
        } else {
            dto.setRoadmapCompletionPercentage(0);
        }

        // Skills verified
        dto.setSkillsVerifiedCount(userSkillRepository.findByUserId(userId).size());

        // Recent milestones
        List<String> milestones = new ArrayList<>();
        if (dto.getChallengesCompletedCount() > 0) {
            milestones.add("Completed " + dto.getChallengesCompletedCount() + " weekly placement challenges");
        }
        milestones.add("Synthesized Career Twin profile with " + currentReadiness + "% placement readiness");
        if (dto.getRoadmapCompletionPercentage() > 0) {
            milestones.add("Roadmap progress achieved: " + dto.getRoadmapCompletionPercentage() + "%");
        }
        dto.setRecentMilestones(milestones);

        return dto;
    }
}
