package com.careertwin.repository;

import com.careertwin.entity.AtsAnalysis;
import com.careertwin.entity.Resume;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsAnalysisRepository extends JpaRepository<AtsAnalysis, Long> {
    Optional<AtsAnalysis> findTopByUserOrderByAnalyzedAtDesc(User user);
    Optional<AtsAnalysis> findTopByUserIdOrderByAnalyzedAtDesc(Long userId);
    Optional<AtsAnalysis> findByResume(Resume resume);
    List<AtsAnalysis> findByUserOrderByAnalyzedAtDesc(User user);
}
