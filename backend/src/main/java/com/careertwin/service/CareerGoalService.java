package com.careertwin.service;

import com.careertwin.dto.CareerGoalRequest;
import com.careertwin.dto.CareerGoalResponse;
import com.careertwin.entity.CareerGoal;
import com.careertwin.entity.User;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.CareerGoalRepository;
import com.careertwin.repository.UserRepository;
import com.careertwin.util.SkillsTaxonomy;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CareerGoalService {

    @Autowired
    private CareerGoalRepository careerGoalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public CareerGoalResponse saveOrUpdateCareerGoal(Long userId, CareerGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CareerGoal goal = careerGoalRepository.findByUserId(userId)
                .orElse(new CareerGoal());

        goal.setUser(user);
        goal.setTargetRole(request.getTargetRole().trim());
        goal.setTargetCompany(request.getTargetCompany());
        goal.setDescription(request.getDescription());
        goal.setTargetTimeline(request.getTargetTimeline());

        List<String> requiredSkills = new ArrayList<>();
        if (request.getCustomSkills() != null && !request.getCustomSkills().isEmpty()) {
            requiredSkills.addAll(request.getCustomSkills());
        } else {
            requiredSkills = SkillsTaxonomy.determineRequiredSkills(request.getTargetRole());
        }

        try {
            goal.setRequiredSkills(objectMapper.writeValueAsString(requiredSkills));
        } catch (Exception e) {
            goal.setRequiredSkills(String.join(",", requiredSkills));
        }

        CareerGoal savedGoal = careerGoalRepository.save(goal);

        // Recalculate Career Twin with new career goal
        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToResponse(savedGoal);
    }

    public CareerGoalResponse getCareerGoal(Long userId) {
        CareerGoal goal = careerGoalRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Career goal not set yet."));
        return mapToResponse(goal);
    }

    public List<String> getRequiredSkillsForRole(String role) {
        return SkillsTaxonomy.determineRequiredSkills(role);
    }

    private CareerGoalResponse mapToResponse(CareerGoal goal) {
        CareerGoalResponse response = new CareerGoalResponse();
        response.setId(goal.getId());
        response.setTargetRole(goal.getTargetRole());
        response.setTargetCompany(goal.getTargetCompany());
        response.setDescription(goal.getDescription());
        response.setTargetTimeline(goal.getTargetTimeline());

        List<String> skills = new ArrayList<>();
        if (goal.getRequiredSkills() != null) {
            try {
                skills = objectMapper.readValue(goal.getRequiredSkills(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                skills = List.of(goal.getRequiredSkills().split(","));
            }
        }
        response.setRequiredSkills(skills);

        return response;
    }
}
