package com.careertwin.repository;

import com.careertwin.entity.Resume;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserOrderByVersionNumberDesc(User user);
    List<Resume> findByUserIdOrderByVersionNumberDesc(Long userId);
    Optional<Resume> findByUserAndIsLatestTrue(User user);
    Optional<Resume> findByUserIdAndIsLatestTrue(Long userId);
    Optional<Resume> findTopByUserOrderByVersionNumberDesc(User user);
}
