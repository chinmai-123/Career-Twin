import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { careerTwinApi, atsApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import MetricCard from '../components/MetricCard';
import colors from '../theme/colors';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [twinData, setTwinData] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [twinRes, atsRes] = await Promise.allSettled([
        careerTwinApi.getCareerTwin(),
        atsApi.getLatest(),
      ]);

      if (twinRes.status === 'fulfilled') {
        const payload = twinRes.value?.data || twinRes.value;
        setTwinData(payload);
      }
      if (atsRes.status === 'fulfilled') {
        const payload = atsRes.value?.data || atsRes.value;
        setAtsData(payload);
      }
    } catch (err) {
      console.warn('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const readinessScore = twinData?.placementReadinessScore ?? (atsData?.overallAtsScore ?? 75);
  const targetRole = twinData?.targetRole || 'Software Engineer';
  const readinessTier = twinData?.readinessTier || 'Developing Readiness';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Top Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Student'}</Text>
          <Text style={styles.userMeta}>
            {user?.branch ? `${user.branch} • ` : ''}
            {user?.college || 'Computer Science'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <Ionicons name="person" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Target Role Banner */}
      <TouchableOpacity
        style={styles.roleBanner}
        onPress={() => navigation.navigate('CareerGoal')}
        activeOpacity={0.85}
      >
        <View style={styles.roleBannerLeft}>
          <Text style={styles.roleBannerTag}>TARGET CAREER GOAL</Text>
          <Text style={styles.roleBannerTitle} numberOfLines={1}>{targetRole}</Text>
        </View>
        <View style={styles.roleBannerEdit}>
          <Ionicons name="pencil-sharp" size={16} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Main Placement Readiness Gauge Card */}
      <TouchableOpacity
        style={styles.mainGaugeCard}
        onPress={() => navigation.navigate('CareerTwinTab')}
        activeOpacity={0.85}
      >
        <View style={styles.gaugeHeader}>
          <View>
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>CAREER TWIN ENGINE</Text>
            </View>
            <Text style={styles.gaugeCardTitle}>Placement Readiness</Text>
            <Text style={styles.tierText}>{readinessTier}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>

        <ScoreGauge
          score={readinessScore}
          size={160}
          strokeWidth={14}
          title="Readiness"
          subtitle="Synthesized from Resume, Coding, Assessments & Skills"
        />
      </TouchableOpacity>

      {/* 4 Core Dimensions Metric Cards */}
      <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
      <View style={styles.metricGrid}>
        {/* ATS Score */}
        <MetricCard
          icon="document-text"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          title="ATS Resume Score"
          value={`${atsData?.overallAtsScore ?? twinData?.resumeAtsScore ?? 77}%`}
          subtitle={`Version ${atsData?.resumeVersion ?? 1} Analyzed`}
          badge="Resume"
          badgeColor={colors.primary}
          progress={atsData?.overallAtsScore ?? twinData?.resumeAtsScore ?? 77}
          onPress={() => navigation.navigate('ResumeTab')}
        />

        {/* Verified Skills */}
        <MetricCard
          icon="checkmark-done-circle"
          iconColor={colors.success}
          iconBg={colors.successLight}
          title="Verified Skills"
          value={`${twinData?.verifiedSkillsCount ?? 9} Skills`}
          subtitle="Assessment Verified"
          badge="Skills"
          badgeColor={colors.success}
          progress={twinData?.skillVerificationScore ?? 80}
          onPress={() => navigation.navigate('SkillsTab')}
        />

        {/* Coding Profiles */}
        <MetricCard
          icon="code-slash"
          iconColor={colors.secondary}
          iconBg={colors.secondaryLight}
          title="Coding Platforms"
          value={`${twinData?.codingPlatformsCount ?? 2} Connected`}
          subtitle="GitHub, LeetCode"
          badge="Coding"
          badgeColor={colors.secondary}
          progress={twinData?.codingProfileScore ?? 72}
          onPress={() => navigation.navigate('CodingProfiles')}
        />

        {/* Weekly Challenges */}
        <MetricCard
          icon="trophy"
          iconColor={colors.warning}
          iconBg={colors.warningLight}
          title="Weekly Challenges"
          value={`${twinData?.completedChallengesCount ?? 2} Completed`}
          subtitle="Consistency on track"
          badge="Growth"
          badgeColor={colors.warning}
          progress={twinData?.challengeConsistencyScore ?? 65}
          onPress={() => navigation.navigate('Challenges')}
        />
      </View>

      {/* Quick Launch Shortcuts */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => navigation.navigate('Assessment')}
          activeOpacity={0.8}
        >
          <Ionicons name="school-outline" size={20} color={colors.primary} />
          <Text style={styles.actionPillText}>Take Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => navigation.navigate('ResumeTab')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={colors.accent} />
          <Text style={styles.actionPillText}>Upload Resume</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => navigation.navigate('Roadmap')}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={20} color={colors.secondary} />
          <Text style={styles.actionPillText}>Roadmap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => navigation.navigate('AIGuidance')}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={colors.success} />
          <Text style={styles.actionPillText}>AI Mentor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  userMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surface,
    elevation: 2,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    elevation: 1,
  },
  roleBannerLeft: {
    flex: 1,
    marginRight: 10,
  },
  roleBannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  roleBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  roleBannerEdit: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainGaugeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  gaugeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeWrapper: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  gaugeCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  tierText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  metricGrid: {
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionPill: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 1,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
});

export default DashboardScreen;
