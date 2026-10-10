package com.careertwin;

import com.careertwin.util.SkillsTaxonomy;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class SkillsTaxonomyTest {

    @Test
    void testDetermineRequiredSkillsForBackend() {
        List<String> skills = SkillsTaxonomy.determineRequiredSkills("Backend Developer");
        assertNotNull(skills);
        assertTrue(skills.contains("Java"));
        assertTrue(skills.contains("Spring Boot"));
        assertTrue(skills.contains("SQL"));
    }

    @Test
    void testDetermineRequiredSkillsForCustomGoal() {
        List<String> skills = SkillsTaxonomy.determineRequiredSkills("Software Development Engineer at Microsoft");
        assertNotNull(skills);
        assertTrue(skills.contains("Data Structures"));
        assertTrue(skills.contains("Algorithms"));
    }

    @Test
    void testDetermineRequiredSkillsForAI() {
        List<String> skills = SkillsTaxonomy.determineRequiredSkills("AI Engineer / ML Specialist");
        assertNotNull(skills);
        assertTrue(skills.contains("Python"));
        assertTrue(skills.contains("Machine Learning"));
    }
}
