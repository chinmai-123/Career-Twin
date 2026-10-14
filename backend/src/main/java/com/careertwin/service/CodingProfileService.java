package com.careertwin.service;

import com.careertwin.dto.CodingProfileDto;
import com.careertwin.dto.CodingProfileRequest;
import com.careertwin.entity.CodingProfile;
import com.careertwin.entity.User;
import com.careertwin.exception.ResourceNotFoundException;
import com.careertwin.repository.CodingProfileRepository;
import com.careertwin.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CodingProfileService {

    @Autowired
    private CodingProfileRepository codingProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private CareerTwinEngineService careerTwinEngineService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public static String sanitizeHandle(String input, String platform) {
        if (input == null || input.isBlank()) return "";
        String s = input.trim();
        while (s.endsWith("/")) {
            s = s.substring(0, s.length() - 1);
        }
        if (s.startsWith("@")) {
            s = s.substring(1);
        }
        if (s.contains("?")) {
            s = s.substring(0, s.indexOf('?'));
        }
        if (s.contains("/")) {
            int lastSlash = s.lastIndexOf('/');
            s = s.substring(lastSlash + 1);
        }
        return s.trim();
    }

    @Transactional
    public CodingProfileDto addOrUpdateProfile(Long userId, CodingProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        String platform = request.getPlatform().toUpperCase().trim();
        String cleanUsername = sanitizeHandle(request.getUsername(), platform);
        if (cleanUsername.isBlank()) {
            cleanUsername = request.getUsername().trim();
        }

        CodingProfile profile = codingProfileRepository.findByUserIdAndPlatform(userId, platform)
                .orElse(new CodingProfile(user, platform, cleanUsername));

        profile.setUsername(cleanUsername);

        String autoUrl = "https://" + platform.toLowerCase() + ".com/" + cleanUsername;
        if ("LEETCODE".equals(platform)) {
            autoUrl = "https://leetcode.com/u/" + cleanUsername;
        }
        profile.setProfileUrl(request.getProfileUrl() != null && !request.getProfileUrl().isBlank()
                ? request.getProfileUrl().trim() : autoUrl);

        // Check if user manually supplied specific metrics
        boolean hasManualStats = (request.getTotalSolved() != null && request.getTotalSolved() > 0)
                || (request.getPublicRepos() != null && request.getPublicRepos() > 0);

        if (hasManualStats) {
            applyManualStats(profile, request);
        } else {
            // Live Platform Sync
            syncPlatformData(profile);
        }

        CodingProfile saved = codingProfileRepository.save(profile);
        careerTwinEngineService.recalculateCareerTwin(userId);

        return mapToDto(saved);
    }

    public List<CodingProfileDto> getUserProfiles(Long userId) {
        return codingProfileRepository.findByUserId(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public CodingProfileDto syncProfile(Long userId, String platform) {
        CodingProfile profile = codingProfileRepository.findByUserIdAndPlatform(userId, platform.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for " + platform));

        syncPlatformData(profile);
        CodingProfile saved = codingProfileRepository.save(profile);

        careerTwinEngineService.recalculateCareerTwin(userId);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteProfile(Long userId, Long profileId) {
        CodingProfile profile = codingProfileRepository.findById(profileId)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + profileId));

        codingProfileRepository.delete(profile);
        careerTwinEngineService.recalculateCareerTwin(userId);
    }

    private void applyManualStats(CodingProfile profile, CodingProfileRequest req) {
        profile.setLastSyncedAt(LocalDateTime.now());
        profile.setVerified(true);

        if (req.getTotalSolved() != null) profile.setTotalSolved(req.getTotalSolved());
        if (req.getEasySolved() != null) profile.setEasySolved(req.getEasySolved());
        if (req.getMediumSolved() != null) profile.setMediumSolved(req.getMediumSolved());
        if (req.getHardSolved() != null) profile.setHardSolved(req.getHardSolved());
        if (req.getRating() != null) profile.setRating(req.getRating());
        if (req.getPublicRepos() != null) profile.setPublicRepos(req.getPublicRepos());
        if (req.getContributionsCount() != null) profile.setContributionsCount(req.getContributionsCount());

        if (req.getTopLanguages() != null && !req.getTopLanguages().isEmpty()) {
            try {
                profile.setTopLanguagesJson(objectMapper.writeValueAsString(req.getTopLanguages()));
            } catch (Exception ignored) {}
        }

        if ("GITHUB".equals(profile.getPlatform())) {
            int repos = profile.getPublicRepos() != null ? profile.getPublicRepos() : 0;
            int contrib = profile.getContributionsCount() != null ? profile.getContributionsCount() : repos * 10;
            profile.setContributionsCount(contrib);
            profile.setRankName(repos >= 15 ? "Prolific Contributor" : (repos >= 5 ? "Active Contributor" : (repos > 0 ? "Junior Contributor" : "New Developer")));
            profile.setActivityScore(repos == 0 ? 0 : Math.min(100, repos * 6 + Math.min(30, contrib / 10)));
            profile.setDsaScore(repos == 0 ? 0 : Math.min(70, repos * 4));
        } else {
            int total = profile.getTotalSolved() != null ? profile.getTotalSolved() : 0;
            int easy = profile.getEasySolved() != null ? profile.getEasySolved() : 0;
            int medium = profile.getMediumSolved() != null ? profile.getMediumSolved() : 0;
            int hard = profile.getHardSolved() != null ? profile.getHardSolved() : 0;

            if (total == 0) {
                profile.setDsaScore(0);
                profile.setActivityScore(0);
                profile.setRankName("Beginner (0 Solved)");
            } else {
                int dsa = Math.min(100, (int) (Math.min(20, easy * 0.2) + Math.min(50, medium * 0.6) + Math.min(30, hard * 1.5)));
                profile.setDsaScore(dsa);
                profile.setActivityScore(Math.min(100, Math.max(15, (int) (total * 0.35 + 10))));
                profile.setRankName(total >= 250 ? "Guardian / Expert Coder" : (total >= 120 ? "Knight / Proficient Coder" : (total >= 40 ? "Intermediate Problem Solver" : "Novice Coder")));
            }
        }
    }

    private void syncPlatformData(CodingProfile profile) {
        String platform = profile.getPlatform();
        String username = profile.getUsername();
        profile.setLastSyncedAt(LocalDateTime.now());

        if ("GITHUB".equals(platform)) {
            syncGitHub(profile, username);
        } else if ("LEETCODE".equals(platform)) {
            syncLeetCode(profile, username);
        } else if ("CODECHEF".equals(platform)) {
            syncCodeChef(profile, username);
        } else if ("HACKERRANK".equals(platform)) {
            syncHackerRank(profile, username);
        } else if ("GEEKSFORGEEKS".equals(platform)) {
            syncGeeksforGeeks(profile, username);
        }
    }

    private List<String> fetchGitHubLanguages(String username) {
        try {
            String url = "https://api.github.com/users/" + username + "/repos?per_page=10&sort=updated";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "CareerTwin-App/1.0");
            headers.set("Accept", "application/vnd.github.v3+json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Set<String> langs = new LinkedHashSet<>();
                for (Object item : response.getBody()) {
                    if (item instanceof Map) {
                        Object lang = ((Map) item).get("language");
                        if (lang instanceof String && !((String) lang).isBlank()) {
                            langs.add((String) lang);
                        }
                    }
                }
                if (!langs.isEmpty()) {
                    return new ArrayList<>(langs);
                }
            }
        } catch (Exception ignored) {}
        return List.of("Java", "JavaScript");
    }

    private void syncGitHub(CodingProfile profile, String username) {
        try {
            String url = "https://api.github.com/users/" + username;
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "CareerTwin-App/1.0");
            headers.set("Accept", "application/vnd.github.v3+json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                int publicRepos = ((Number) body.getOrDefault("public_repos", 0)).intValue();
                int followers = ((Number) body.getOrDefault("followers", 0)).intValue();

                profile.setPublicRepos(publicRepos);
                int contrib = publicRepos * 12 + followers * 4;
                profile.setContributionsCount(contrib);
                profile.setVerified(true);
                profile.setRankName(publicRepos >= 15 ? "Prolific Contributor" : (publicRepos >= 5 ? "Active Contributor" : (publicRepos > 0 ? "Junior Contributor" : "New Developer")));

                List<String> langs = fetchGitHubLanguages(username);
                profile.setTopLanguagesJson(objectMapper.writeValueAsString(langs));

                int activity = publicRepos == 0 ? 0 : Math.min(95, publicRepos * 6 + Math.min(25, followers * 2));
                int dsa = publicRepos == 0 ? 0 : Math.min(75, publicRepos * 4);
                profile.setActivityScore(activity);
                profile.setDsaScore(dsa);
                return;
            }
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            profile.setVerified(false);
            profile.setRankName("User Not Found on GitHub");
            profile.setPublicRepos(0);
            profile.setContributionsCount(0);
            profile.setActivityScore(0);
            profile.setDsaScore(0);
            return;
        } catch (Exception ignored) {}

        if (profile.getPublicRepos() == null) {
            profile.setPublicRepos(0);
            profile.setContributionsCount(0);
            profile.setVerified(false);
            profile.setRankName("Pending Sync");
            profile.setActivityScore(0);
            profile.setDsaScore(0);
        }
    }

    private void syncLeetCode(CodingProfile profile, String username) {
        try {
            String graphqlUrl = "https://leetcode.com/graphql";
            String query = "{\"query\":\"query getUserProfile($username: String!) { matchedUser(username: $username) { submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } } profile { ranking reputation } } }\",\"variables\":{\"username\":\"" + username + "\"}}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Referer", "https://leetcode.com");
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(query, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(graphqlUrl, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                Map data = (Map) body.get("data");
                if (data != null && data.get("matchedUser") != null) {
                    Map matchedUser = (Map) data.get("matchedUser");
                    Map submitStats = (Map) matchedUser.get("submitStats");
                    List<Map<String, Object>> acList = (List<Map<String, Object>>) submitStats.get("acSubmissionNum");

                    int total = 0, easy = 0, medium = 0, hard = 0;
                    if (acList != null) {
                        for (Map<String, Object> item : acList) {
                            String diff = (String) item.get("difficulty");
                            int count = ((Number) item.getOrDefault("count", 0)).intValue();
                            if ("All".equalsIgnoreCase(diff)) total = count;
                            else if ("Easy".equalsIgnoreCase(diff)) easy = count;
                            else if ("Medium".equalsIgnoreCase(diff)) medium = count;
                            else if ("Hard".equalsIgnoreCase(diff)) hard = count;
                        }
                    }

                    profile.setTotalSolved(total);
                    profile.setEasySolved(easy);
                    profile.setMediumSolved(medium);
                    profile.setHardSolved(hard);

                    int rating = 0;
                    String rankName = "Beginner (0 Solved)";
                    if (total > 0) {
                        rating = Math.min(2400, Math.max(1200, 1300 + (easy * 2) + (medium * 7) + (hard * 18)));
                        if (total >= 250) rankName = "Guardian / Expert Coder";
                        else if (total >= 120) rankName = "Knight / Proficient Coder";
                        else if (total >= 40) rankName = "Intermediate Problem Solver";
                        else rankName = "Novice Coder";
                    }
                    profile.setRating(rating);
                    profile.setRankName(rankName);
                    profile.setVerified(true);
                    profile.setTopLanguagesJson(objectMapper.writeValueAsString(List.of("Java", "C++", "Python")));

                    int dsaScore = 0;
                    int activityScore = 0;
                    if (total > 0) {
                        dsaScore = Math.min(100, (int) (Math.min(20, easy * 0.2) + Math.min(50, medium * 0.6) + Math.min(30, hard * 1.5)));
                        activityScore = Math.min(100, Math.max(15, (int) (total * 0.35 + 10)));
                    }
                    profile.setDsaScore(dsaScore);
                    profile.setActivityScore(activityScore);
                    return;
                } else if (data != null && data.get("matchedUser") == null) {
                    profile.setVerified(false);
                    profile.setRankName("User Not Found on LeetCode");
                    profile.setTotalSolved(0);
                    profile.setEasySolved(0);
                    profile.setMediumSolved(0);
                    profile.setHardSolved(0);
                    profile.setRating(0);
                    profile.setDsaScore(0);
                    profile.setActivityScore(0);
                    return;
                }
            }
        } catch (Exception ignored) {}

        if (profile.getTotalSolved() == null) {
            profile.setTotalSolved(0);
            profile.setEasySolved(0);
            profile.setMediumSolved(0);
            profile.setHardSolved(0);
            profile.setRating(0);
            profile.setRankName("Pending Sync");
            profile.setVerified(false);
            profile.setDsaScore(0);
            profile.setActivityScore(0);
        }
    }

    private void syncCodeChef(CodingProfile profile, String username) {
        if (profile.getTotalSolved() == null) {
            profile.setRating(0);
            profile.setTotalSolved(0);
            profile.setRankName("Unverified Handle");
            profile.setVerified(false);
            try {
                profile.setTopLanguagesJson(objectMapper.writeValueAsString(List.of("Java", "C++")));
            } catch (Exception ignored) {}
            profile.setDsaScore(0);
            profile.setActivityScore(0);
        }
    }

    private void syncHackerRank(CodingProfile profile, String username) {
        if (profile.getTotalSolved() == null) {
            profile.setTotalSolved(0);
            profile.setRankName("Unverified Handle");
            profile.setVerified(false);
            try {
                profile.setTopLanguagesJson(objectMapper.writeValueAsString(List.of("Java", "SQL")));
            } catch (Exception ignored) {}
            profile.setDsaScore(0);
            profile.setActivityScore(0);
        }
    }

    private void syncGeeksforGeeks(CodingProfile profile, String username) {
        if (profile.getTotalSolved() == null) {
            profile.setTotalSolved(0);
            profile.setRankName("Unverified Handle");
            profile.setVerified(false);
            try {
                profile.setTopLanguagesJson(objectMapper.writeValueAsString(List.of("Java", "DSA")));
            } catch (Exception ignored) {}
            profile.setDsaScore(0);
            profile.setActivityScore(0);
        }
    }

    private CodingProfileDto mapToDto(CodingProfile profile) {
        CodingProfileDto dto = new CodingProfileDto();
        dto.setId(profile.getId());
        dto.setPlatform(profile.getPlatform());
        dto.setUsername(profile.getUsername());
        dto.setProfileUrl(profile.getProfileUrl());
        dto.setTotalSolved(profile.getTotalSolved());
        dto.setEasySolved(profile.getEasySolved());
        dto.setMediumSolved(profile.getMediumSolved());
        dto.setHardSolved(profile.getHardSolved());
        dto.setPublicRepos(profile.getPublicRepos());
        dto.setContributionsCount(profile.getContributionsCount());
        dto.setRating(profile.getRating());
        dto.setRankName(profile.getRankName());
        dto.setDsaScore(profile.getDsaScore());
        dto.setActivityScore(profile.getActivityScore());
        dto.setVerified(profile.isVerified());
        dto.setLastSyncedAt(profile.getLastSyncedAt());

        try {
            dto.setTopLanguages(objectMapper.readValue(profile.getTopLanguagesJson(), new TypeReference<List<String>>() {}));
        } catch (Exception e) {
            dto.setTopLanguages(Collections.emptyList());
        }

        return dto;
    }
}
