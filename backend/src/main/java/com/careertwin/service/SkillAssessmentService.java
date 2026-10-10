package com.careertwin.service;

import com.careertwin.dto.*;
import com.careertwin.entity.*;
import com.careertwin.exception.BadRequestException;
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
public class SkillAssessmentService {

    @Autowired
    private AssessmentQuestionRepository questionRepository;

    @Autowired
    private AssessmentResultRepository resultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<AssessmentQuestionDto> getQuestionsForAssessment(String category) {
        List<AssessmentQuestion> list;
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            list = questionRepository.findByCategory(category.toUpperCase());
            if (list.isEmpty()) {
                list = questionRepository.findAll();
            }
        } else {
            list = questionRepository.findAll();
        }

        // Shuffle questions for randomized experience
        Collections.shuffle(list);
        return list.stream().limit(10).map(this::mapToQuestionDto).collect(Collectors.toList());
    }

    @Transactional
    public AssessmentResultDto submitAssessment(Long userId, AssessmentSubmitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            throw new BadRequestException("No answers submitted");
        }

        int correctCount = 0;
        int totalQuestions = request.getAnswers().size();
        List<AssessmentResultDto.QuestionReviewDto> reviewList = new ArrayList<>();

        for (Map.Entry<Long, String> entry : request.getAnswers().entrySet()) {
            Long questionId = entry.getKey();
            String selectedOption = entry.getValue() != null ? entry.getValue().toUpperCase() : "";

            Optional<AssessmentQuestion> qOpt = questionRepository.findById(questionId);
            if (qOpt.isPresent()) {
                AssessmentQuestion q = qOpt.get();
                boolean isCorrect = q.getCorrectOption().equalsIgnoreCase(selectedOption);
                if (isCorrect) {
                    correctCount++;
                }

                AssessmentResultDto.QuestionReviewDto review = new AssessmentResultDto.QuestionReviewDto();
                review.setQuestionId(q.getId());
                review.setQuestionText(q.getQuestionText());
                review.setOptionA(q.getOptionA());
                review.setOptionB(q.getOptionB());
                review.setOptionC(q.getOptionC());
                review.setOptionD(q.getOptionD());
                review.setSelectedOption(selectedOption);
                review.setCorrectOption(q.getCorrectOption());
                review.setCorrect(isCorrect);
                review.setExplanation(q.getExplanation());
                reviewList.add(review);
            }
        }

        double percentage = totalQuestions > 0 ? ((double) correctCount / totalQuestions) * 100.0 : 0.0;
        boolean passed = percentage >= 60.0;

        AssessmentResult result = new AssessmentResult();
        result.setUser(user);
        result.setCategory(request.getCategory().toUpperCase());
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctCount);
        result.setScorePercentage(Math.round(percentage * 10.0) / 10.0);
        result.setPassed(passed);
        result.setTimeTakenSeconds(request.getTimeTakenSeconds());

        try {
            result.setDetailedAnswersJson(objectMapper.writeValueAsString(reviewList));
        } catch (Exception e) {
            // ignore
        }

        AssessmentResult saved = resultRepository.save(result);

        // Update or create UserSkill verified score
        String skillCategory = request.getCategory().toUpperCase();
        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillNameIgnoreCase(userId, skillCategory)
                .orElse(new UserSkill(user, skillCategory, "TECHNICAL", "INTERMEDIATE", (int) Math.round(percentage), "ASSESSMENT"));

        userSkill.setVerifiedScore((int) Math.round(percentage));
        userSkill.setSource("ASSESSMENT");
        userSkill.setProficiencyLevel(percentage >= 80 ? "ADVANCED" : percentage >= 50 ? "INTERMEDIATE" : "BEGINNER");
        userSkillRepository.save(userSkill);

        // Update Career Twin Profile
        careerTwinEngineService.recalculateCareerTwin(userId);

        AssessmentResultDto dto = mapToResultDto(saved);
        dto.setReviewList(reviewList);
        return dto;
    }

    public List<AssessmentResultDto> getUserAssessmentResults(Long userId) {
        return resultRepository.findByUserIdOrderByCompletedAtDesc(userId)
                .stream().map(this::mapToResultDto).collect(Collectors.toList());
    }

    public AssessmentResultDto getLatestAssessmentResult(Long userId) {
        AssessmentResult result = resultRepository.findTopByUserIdOrderByCompletedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No assessment results found"));
        return mapToResultDto(result);
    }

    private AssessmentQuestionDto mapToQuestionDto(AssessmentQuestion q) {
        AssessmentQuestionDto dto = new AssessmentQuestionDto();
        dto.setId(q.getId());
        dto.setCategory(q.getCategory());
        dto.setRoleCategory(q.getRoleCategory());
        dto.setSkillName(q.getSkillName());
        dto.setQuestionText(q.getQuestionText());
        dto.setOptionA(q.getOptionA());
        dto.setOptionB(q.getOptionB());
        dto.setOptionC(q.getOptionC());
        dto.setOptionD(q.getOptionD());
        dto.setDifficulty(q.getDifficulty());
        return dto;
    }

    private AssessmentResultDto mapToResultDto(AssessmentResult r) {
        AssessmentResultDto dto = new AssessmentResultDto();
        dto.setId(r.getId());
        dto.setCategory(r.getCategory());
        dto.setRoleCategory(r.getRoleCategory());
        dto.setTotalQuestions(r.getTotalQuestions());
        dto.setCorrectAnswers(r.getCorrectAnswers());
        dto.setScorePercentage(r.getScorePercentage());
        dto.setPassed(r.getPassed());
        dto.setTimeTakenSeconds(r.getTimeTakenSeconds());
        dto.setCompletedAt(r.getCompletedAt());

        if (r.getDetailedAnswersJson() != null) {
            try {
                dto.setReviewList(objectMapper.readValue(r.getDetailedAnswersJson(), new TypeReference<List<AssessmentResultDto.QuestionReviewDto>>() {}));
            } catch (Exception e) {
                dto.setReviewList(Collections.emptyList());
            }
        }
        return dto;
    }
}
