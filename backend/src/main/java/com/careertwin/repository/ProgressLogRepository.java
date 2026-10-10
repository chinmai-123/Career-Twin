package com.careertwin.repository;

import com.careertwin.entity.ProgressLog;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressLogRepository extends JpaRepository<ProgressLog, Long> {
    List<ProgressLog> findByUserOrderByRecordedAtAsc(User user);
    List<ProgressLog> findByUserIdOrderByRecordedAtAsc(Long userId);
}
