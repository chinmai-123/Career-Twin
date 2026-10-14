import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { roadmapApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const ProjectsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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

  const handleRegenerate = async () => {
    Alert.alert(
      'Refresh Recommendations',
      `Regenerate projects tailored specifically for your ${user?.year || 'current year'} and verified skill gaps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              setRegenerating(true);
              const res = await roadmapApi.regenerateProjects();
              const payload = res?.data || res;
              if (Array.isArray(payload)) {
                setProjects(payload);
              }
              Alert.alert('Personalized Projects Updated', `Recommendations refreshed for your ${user?.year || 'current'} level.`);
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not refresh projects');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await roadmapApi.updateProjectStatus(projectId, newStatus);
      fetchProjects();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update status');
    }
  };

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
        subtitle={`Personalized for ${user?.year || '3rd Year'}`}
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchProjects(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects(); }} colors={[colors.primary]} />}
      >
        {/* Student Context Banner */}
        <View style={styles.contextBanner}>
          <View style={styles.contextHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.yearTag}>
                <Ionicons name="school-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.yearTagText}>{user?.year || '3rd Year Student'}</Text>
              </View>
              <Text style={styles.contextTitle}>Year-Aligned Placement Projects</Text>
              <Text style={styles.contextSubtitle}>
                Projects dynamically matched to your academic year and prioritized to bridge your verified skill gaps.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.regenBtn}
              onPress={handleRegenerate}
              disabled={regenerating}
              activeOpacity={0.8}
            >
              {regenerating ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.regenBtnText}>AI Refresh</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 13 }}>Loading personalized projects...</Text>
          </View>
        ) : projects.length > 0 ? (
          projects.map((proj, idx) => {
            const diffColor = getDifficultyColor(proj.difficulty);
            const isCompleted = proj.status === 'COMPLETED' || proj.isCompleted;
            const isInProgress = proj.status === 'IN_PROGRESS';

            return (
              <View
                key={proj.id || idx}
                style={[
                  styles.projectCard,
                  isCompleted && styles.completedProjectCard,
                  isInProgress && styles.inProgressProjectCard,
                ]}
              >
                <View style={styles.cardTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.diffBadge, { backgroundColor: `${diffColor}18` }]}>
                      <Text style={[styles.diffBadgeText, { color: diffColor }]}>
                        {proj.difficulty || 'INTERMEDIATE'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      isCompleted ? styles.statusBadgeCompleted : (isInProgress ? styles.statusBadgeProgress : styles.statusBadgeRecommended)
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        isCompleted ? styles.statusTextCompleted : (isInProgress ? styles.statusTextProgress : styles.statusTextRecommended)
                      ]}>
                        {isCompleted ? 'COMPLETED' : (isInProgress ? 'IN PROGRESS' : 'RECOMMENDED')}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.projectTitle}>{proj.title}</Text>
                <Text style={styles.projectDesc}>{proj.description}</Text>

                {/* Relevance Reason (Why recommended for you) */}
                {proj.relevanceReason ? (
                  <View style={styles.relevanceBox}>
                    <Ionicons name="sparkles" size={14} color={colors.primary} style={{ marginRight: 6, marginTop: 1 }} />
                    <Text style={styles.relevanceText}>
                      <Text style={{ fontWeight: '700', color: colors.primaryDark }}>Why this is recommended: </Text>
                      {proj.relevanceReason}
                    </Text>
                  </View>
                ) : null}

                {/* Tech Stack Pills */}
                {proj.technologies && proj.technologies.length > 0 ? (
                  <View style={styles.techWrap}>
                    {proj.technologies.map((tech, tIdx) => (
                      <View key={tIdx} style={styles.techPill}>
                        <Text style={styles.techText}>{tech.trim()}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  {!isCompleted && !isInProgress && (
                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => handleStatusChange(proj.id, 'IN_PROGRESS')}
                    >
                      <Ionicons name="play-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.startBtnText}>Start Project</Text>
                    </TouchableOpacity>
                  )}

                  {isInProgress && (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => handleStatusChange(proj.id, 'COMPLETED')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.completeBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}

                  {isCompleted && (
                    <TouchableOpacity
                      style={styles.reopenBtn}
                      onPress={() => handleStatusChange(proj.id, 'IN_PROGRESS')}
                    >
                      <Ionicons name="refresh-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.reopenBtnText}>Reopen Project</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <EmptyState
            icon="folder-outline"
            title="No Projects Yet"
            description="Tap AI Refresh above to generate projects tailored to your academic year and career goal."
          />
        )}
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
    padding: 18,
    paddingBottom: 36,
  },
  contextBanner: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 2,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  yearTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  yearTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  contextSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  regenBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  completedProjectCard: {
    borderColor: colors.successLight,
    backgroundColor: '#f6fdf9',
  },
  inProgressProjectCard: {
    borderColor: colors.primaryLight,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeRecommended: {
    backgroundColor: colors.surfaceSecondary,
  },
  statusBadgeProgress: {
    backgroundColor: colors.primaryLight,
  },
  statusBadgeCompleted: {
    backgroundColor: colors.successLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextRecommended: {
    color: colors.textMuted,
  },
  statusTextProgress: {
    color: colors.primaryDark,
  },
  statusTextCompleted: {
    color: colors.successDark,
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
  relevanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  relevanceText: {
    flex: 1,
    fontSize: 11,
    color: '#1e40af',
    lineHeight: 16,
  },
  techWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  techPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  techText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  completeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reopenBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProjectsScreen;
