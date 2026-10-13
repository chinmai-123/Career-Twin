import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roadmapApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await roadmapApi.getRecommendedProjects();
      const payload = res?.data || res;
      if (Array.isArray(payload)) {
        setProjects(payload);
      }
    } catch (err) {
      console.warn('Could not fetch projects:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getDifficultyColor = (diff) => {
    const d = (diff || '').toUpperCase();
    if (d.includes('ADVANCED') || d.includes('HARD')) return colors.danger;
    if (d.includes('INTERMEDIATE') || d.includes('MEDIUM')) return colors.warning;
    return colors.success;
  };

  return (
    <View style={styles.container}>
      <Header
        title="Recommended Projects"
        subtitle="Recruiter-Aligned Portfolio Ideas"
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchProjects(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects(); }} colors={[colors.primary]} />}
      >
        <Text style={styles.introText}>
          Building full-stack projects tailored to your target role directly boosts your ATS project relevance score and placement readiness.
        </Text>

        {projects.length > 0 ? (
          projects.map((proj, idx) => {
            const diffColor = getDifficultyColor(proj.difficulty);

            return (
              <View key={proj.id || idx} style={styles.projectCard}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.diffBadge, { backgroundColor: `${diffColor}18` }]}>
                    <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                      {proj.difficulty || 'INTERMEDIATE'}
                    </Text>
                  </View>
                  <Text style={styles.categoryText}>{proj.category || 'Full-Stack System'}</Text>
                </View>

                <Text style={styles.projectTitle}>{proj.title}</Text>
                <Text style={styles.projectDesc}>{proj.description}</Text>

                {/* Tech Stack Pills */}
                {proj.technologies || proj.techStack ? (
                  <View style={styles.techWrap}>
                    {(proj.technologies || proj.techStack.split(',')).map((tech, tIdx) => (
                      <View key={tIdx} style={styles.techPill}>
                        <Text style={styles.techText}>{tech.trim()}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Impact Note */}
                {proj.impact || proj.learningOutcome ? (
                  <View style={styles.impactBox}>
                    <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.impactText}>
                      Impact: {proj.impact || proj.learningOutcome}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        ) : !loading ? (
          <EmptyState
            icon="folder-outline"
            title="Projects Loading"
            description="Projects are personalized based on your target career role."
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  introText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  projectDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  techWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  techPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  techText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  impactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 8,
  },
  impactText: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
});

export default ProjectsScreen;
