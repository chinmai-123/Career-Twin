package com.careertwin.repository;

import com.careertwin.entity.CareerTwinProfile;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerTwinProfileRepository extends JpaRepository<CareerTwinProfile, Long> {
    Optional<CareerTwinProfile> findByUser(User user);
    Optional<CareerTwinProfile> findByUserId(Long userId);
}
