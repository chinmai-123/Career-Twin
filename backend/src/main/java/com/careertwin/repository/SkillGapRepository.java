package com.careertwin.repository;

import com.careertwin.entity.SkillGap;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {
    List<SkillGap> findByUserOrderByGapScoreDesc(User user);
    List<SkillGap> findByUserIdOrderByGapScoreDesc(Long userId);
    List<SkillGap> findByUserId(Long userId);
    void deleteByUser(User user);
    void deleteByUserId(Long userId);
}
