package com.careertwin.service;

import com.careertwin.dto.WeeklyChallengeDto;
import com.careertwin.entity.WeeklyChallenge;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.WeeklyChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChallengeService {

    @Autowired
    private WeeklyChallengeRepository challengeRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    public List<WeeklyChallengeDto> getUserChallenges(Long userId) {
        List<WeeklyChallenge> challenges = challengeRepository.findByUserIdOrderByWeekNumberAsc(userId);
        return challenges.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public WeeklyChallengeDto toggleChallenge(Long userId, Long challengeId) {
        WeeklyChallenge challenge = challengeRepository.findById(challengeId)
                .filter(c -> c.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + challengeId));

        boolean newStatus = !Boolean.TRUE.equals(challenge.getIsCompleted());
        challenge.setIsCompleted(newStatus);
        challenge.setCompletedAt(newStatus ? LocalDateTime.now() : null);

        WeeklyChallenge saved = challengeRepository.save(challenge);

        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToDto(saved);
    }

    private WeeklyChallengeDto mapToDto(WeeklyChallenge c) {
        WeeklyChallengeDto dto = new WeeklyChallengeDto();
        dto.setId(c.getId());
        dto.setWeekNumber(c.getWeekNumber());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategory(c.getCategory());
        dto.setDifficulty(c.getDifficulty());
        dto.setXpPoints(c.getXpPoints());
        dto.setIsCompleted(c.getIsCompleted());
        dto.setCompletedAt(c.getCompletedAt());
        return dto;
    }
}
