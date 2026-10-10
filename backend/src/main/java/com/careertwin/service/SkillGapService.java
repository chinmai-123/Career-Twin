package com.careertwin.service;

import com.careertwin.dto.SkillGapDto;
import com.careertwin.entity.SkillGap;
import com.careertwin.repository.SkillGapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillGapService {

    @Autowired
    private SkillGapRepository skillGapRepository;

    public List<SkillGapDto> getSkillGaps(Long userId) {
        List<SkillGap> gaps = skillGapRepository.findByUserIdOrderByGapScoreDesc(userId);
        return gaps.stream().map(g -> {
            SkillGapDto dto = new SkillGapDto(
                    g.getSkillName(),
                    g.getRequiredLevel(),
                    g.getCurrentLevel(),
                    g.getGapScore(),
                    g.getPriority(),
                    g.getReason(),
                    g.getRecommendedAction()
            );
            dto.setId(g.getId());
            return dto;
        }).collect(Collectors.toList());
    }
}
