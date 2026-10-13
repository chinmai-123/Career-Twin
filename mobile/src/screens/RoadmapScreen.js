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
import { roadmapApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const RoadmapScreen = ({ navigation }) => {
  const [phases, setPhases] = useState([]);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRoadmap = useCallback(async () => {
    try {
      const res = await roadmapApi.getRoadmap();
      const payload = res?.data || res;
      if (payload?.phases) {
        setPhases(payload.phases);
        if (payload.targetRole) setTargetRole(payload.targetRole);
      } else if (Array.isArray(payload)) {
        setPhases(payload);
      }
    } catch (err) {
      console.warn('Could not fetch roadmap:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const handleToggle = async (phaseId) => {
    try {
      setTogglingId(phaseId);
      await roadmapApi.togglePhase(phaseId);
      await fetchRoadmap();
      await careerTwinApi.recalculate();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update milestone.');
    } finally {
      setTogglingId(null);
    }
  };

  const completedCount = phases.filter((p) => p.completed || p.isCompleted).length;
  const progressPercent = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Personalized Roadmap"
        subtitle={`Role: ${targetRole}`}
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchRoadmap(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoadmap(); }} colors={[colors.primary]} />}
      >
        {/* Progress Overview Card */}
        <View style={styles.card}>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressTag}>CURATED MILESTONES</Text>
              <Text style={styles.progressTitle}>{completedCount} of {phases.length} Phases Done</Text>
              <Text style={styles.progressSub}>Step-by-step path designed for {targetRole}</Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.bar, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Action Button to Projects */}
        <TouchableOpacity
          style={styles.projectsLinkCard}
          onPress={() => navigation.navigate('Projects')}
          activeOpacity={0.8}
        >
          <View style={styles.projectsIcon}>
            <Ionicons name="folder-open" size={22} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.projectsLinkTitle}>Recommended Projects</Text>
            <Text style={styles.projectsLinkSub}>Build portfolio projects tailored for this roadmap</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Milestone Timeline */}
        <Text style={styles.sectionTitle}>Learning Timeline</Text>

        {phases.length > 0 ? (
          phases.map((phase, idx) => {
            const isDone = phase.completed || phase.isCompleted;
            const isToggling = togglingId === phase.id;

            return (
              <View key={phase.id || idx} style={styles.timelineItem}>
                {/* Timeline connector dot */}
                <View style={styles.timelineLeft}>
                  <TouchableOpacity
                    style={[styles.checkCircle, isDone && styles.checkCircleDone]}
                    onPress={() => handleToggle(phase.id)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <ActivityIndicator size="small" color={isDone ? '#ffffff' : colors.primary} />
                    ) : (
                      <Ionicons
                        name={isDone ? 'checkmark' : 'ellipse-outline'}
                        size={16}
                        color={isDone ? '#ffffff' : colors.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                  {idx < phases.length - 1 && <View style={styles.connectorLine} />}
                </View>

                {/* Content Box */}
                <View style={[styles.phaseBox, isDone && styles.phaseBoxDone]}>
                  <View style={styles.phaseHeader}>
                    <Text style={styles.phaseNumber}>PHASE {phase.phaseNumber || idx + 1}</Text>
                    <Text style={styles.phaseDuration}>{phase.estimatedWeeks || '2-3'} Weeks</Text>
                  </View>
                  <Text style={[styles.phaseTitle, isDone && styles.phaseTitleDone]}>
                    {phase.title || phase.phaseName}
                  </Text>
                  <Text style={styles.phaseDesc}>{phase.description}</Text>

                  {/* Skills/Topics Tags */}
                  {phase.skillsJson || phase.topics ? (
                    <View style={styles.topicsWrap}>
                      {(phase.topics || []).map((top, tIdx) => (
                        <View key={tIdx} style={styles.topicPill}>
                          <Text style={styles.topicText}>{top}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        ) : !loading ? (
          <EmptyState
            icon="trail-sign-outline"
            title="Roadmap Being Generated"
            description="Set a target career goal to generate an AI-powered curriculum roadmap."
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  progressSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  track: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  projectsLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  projectsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  projectsLinkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  projectsLinkSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 14,
    width: 32,
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  phaseBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  phaseBoxDone: {
    backgroundColor: '#fafcff',
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  phaseNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  phaseDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  phaseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  phaseTitleDone: {
    color: colors.textSecondary,
  },
  phaseDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  topicsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  topicPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

export default RoadmapScreen;
