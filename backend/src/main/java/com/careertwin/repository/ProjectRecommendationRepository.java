package com.careertwin.repository;

import com.careertwin.entity.ProjectRecommendation;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRecommendationRepository extends JpaRepository<ProjectRecommendation, Long> {
    List<ProjectRecommendation> findByUserOrderByCreatedAtDesc(User user);
    List<ProjectRecommendation> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ProjectRecommendation> findByUserId(Long userId);
    void deleteByUser(User user);
    void deleteByUserId(Long userId);
}
