package com.careertwin.repository;

import com.careertwin.entity.AssessmentResult;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {
    List<AssessmentResult> findByUserOrderByCompletedAtDesc(User user);
    List<AssessmentResult> findByUserIdOrderByCompletedAtDesc(Long userId);
    Optional<AssessmentResult> findTopByUserOrderByCompletedAtDesc(User user);
    Optional<AssessmentResult> findTopByUserIdOrderByCompletedAtDesc(Long userId);
}
