package com.careertwin.repository;

import com.careertwin.entity.CareerGoal;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerGoalRepository extends JpaRepository<CareerGoal, Long> {
    Optional<CareerGoal> findByUser(User user);
    Optional<CareerGoal> findByUserId(Long userId);
}
