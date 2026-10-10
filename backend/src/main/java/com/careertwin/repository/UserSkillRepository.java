package com.careertwin.repository;

import com.careertwin.entity.User;
import com.careertwin.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUser(User user);
    List<UserSkill> findByUserId(Long userId);
    Optional<UserSkill> findByUserAndSkillNameIgnoreCase(User user, String skillName);
    Optional<UserSkill> findByUserIdAndSkillNameIgnoreCase(Long userId, String skillName);
}
