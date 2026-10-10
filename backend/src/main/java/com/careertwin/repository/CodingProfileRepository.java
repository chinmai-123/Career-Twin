package com.careertwin.repository;

import com.careertwin.entity.CodingProfile;
import com.careertwin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingProfileRepository extends JpaRepository<CodingProfile, Long> {
    List<CodingProfile> findByUser(User user);
    List<CodingProfile> findByUserId(Long userId);
    Optional<CodingProfile> findByUserAndPlatform(User user, String platform);
    Optional<CodingProfile> findByUserIdAndPlatform(Long userId, String platform);
}
