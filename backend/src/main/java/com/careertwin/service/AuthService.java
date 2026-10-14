package com.careertwin.service;

import com.careertwin.dto.*;
import com.careertwin.entity.User;
import com.careertwin.exception.BadRequestException;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.UserRepository;
import com.careertwin.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setGraduationYear(request.getGraduationYear());
        user.setPhone(request.getPhone());
        user.setRole("ROLE_STUDENT");

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail());
        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole(),
                savedUser.getCollege(), savedUser.getBranch(), savedUser.getYear(), savedUser.getGraduationYear(), savedUser.getPhone());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = tokenProvider.generateToken(authentication);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(),
                user.getCollege(), user.getBranch(), user.getYear(), user.getGraduationYear(), user.getPhone());
    }

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setCollege(user.getCollege());
        dto.setBranch(user.getBranch());
        dto.setYear(user.getYear());
        dto.setGraduationYear(user.getGraduationYear());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());

        // Calculate profile completion percentage
        int filledFields = 3; // id, email, fullName always present
        int totalFields = 7;
        if (user.getCollege() != null && !user.getCollege().isEmpty()) filledFields++;
        if (user.getBranch() != null && !user.getBranch().isEmpty()) filledFields++;
        if (user.getYear() != null && !user.getYear().isEmpty()) filledFields++;
        if (user.getGraduationYear() != null) filledFields++;
        dto.setCompletionPercentage((int) Math.round(((double) filledFields / totalFields) * 100));

        return dto;
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFullName(request.getFullName().trim());
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        user.setGraduationYear(request.getGraduationYear());
        user.setPhone(request.getPhone());

        userRepository.save(user);
        return getProfile(userId);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
