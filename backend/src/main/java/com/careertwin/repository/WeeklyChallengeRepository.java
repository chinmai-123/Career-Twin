package com.careertwin.repository;

import com.careertwin.entity.User;
import com.careertwin.entity.WeeklyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklyChallengeRepository extends JpaRepository<WeeklyChallenge, Long> {
    List<WeeklyChallenge> findByUserOrderByWeekNumberAsc(User user);
    List<WeeklyChallenge> findByUserIdOrderByWeekNumberAsc(Long userId);
    List<WeeklyChallenge> findByUserAndIsCompletedTrue(User user);
}
