package com.careertwin.repository;

import com.careertwin.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {
    List<AssessmentQuestion> findByCategory(String category);
    List<AssessmentQuestion> findByRoleCategory(String roleCategory);
}
