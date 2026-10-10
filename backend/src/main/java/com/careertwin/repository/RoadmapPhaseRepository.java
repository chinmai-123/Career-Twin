package com.careertwin.repository;

import com.careertwin.entity.RoadmapPhase;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapPhaseRepository extends JpaRepository<RoadmapPhase, Long> {
    List<RoadmapPhase> findByUserOrderByPhaseNumberAsc(User user);
    List<RoadmapPhase> findByUserIdOrderByPhaseNumberAsc(Long userId);
    void deleteByUser(User user);
    void deleteByUserId(Long userId);
}
