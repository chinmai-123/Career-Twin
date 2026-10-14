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
import { useAuth } from '../context/AuthContext';
import { careerTwinApi, atsApi, assessmentApi, challengeApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import MetricCard from '../components/MetricCard';
import colors from '../theme/colors';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [twinData, setTwinData] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [twinRes, atsRes, assessmentRes, challengeRes] = await Promise.allSettled([
        careerTwinApi.getCareerTwin(),
        atsApi.getLatest(),
        assessmentApi.getResults(),
        challengeApi.getChallenges(),
      ]);

      if (twinRes.status === 'fulfilled') {
        const payload = twinRes.value?.data || twinRes.value;
        setTwinData(payload);
      }
      if (atsRes.status === 'fulfilled') {
        const payload = atsRes.value?.data || atsRes.value;
        setAtsData(payload);
      }
      if (assessmentRes.status === 'fulfilled') {
        const payload = assessmentRes.value?.data || assessmentRes.value;
        if (Array.isArray(payload)) setAssessmentResults(payload);
      }
      if (challengeRes.status === 'fulfilled') {
        const payload = challengeRes.value?.data || challengeRes.value;
        if (Array.isArray(payload)) setChallenges(payload);
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

  // Accurate metric calculations (no fake static fallbacks)
  const readinessScore = twinData?.overallReadiness ?? twinData?.placementReadinessScore ?? 0;
  const targetRole = twinData?.targetRole || 'Software Engineer';
  const readinessTier = twinData?.readinessTier || (readinessScore >= 80 ? 'Placement Ready (Top Tier)' : readinessScore >= 60 ? 'Proficient Readiness' : readinessScore >= 40 ? 'Developing Readiness' : 'Needs Foundation Building');

  // Real assessment / exam metrics
  const takenExamsCount = assessmentResults.length > 0
    ? assessmentResults.length
    : (twinData?.examsTakenCount ?? 0);

  const avgAssessmentScore = assessmentResults.length > 0
    ? Math.round(assessmentResults.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0) / assessmentResults.length)
    : (twinData?.assessmentScore ?? 0);

  // Real weekly challenges metrics
  const totalChall = challenges.length > 0
    ? challenges.length
    : (twinData?.totalChallenges ?? 5);

  const completedChall = challenges.length > 0
    ? challenges.filter(c => c.isCompleted || c.completed).length
    : (twinData?.weeklyChallengesCompleted ?? twinData?.completedChallengesCount ?? 0);

  const challengeProgress = totalChall > 0 ? Math.round((completedChall / totalChall) * 100) : 0;

  // Real ATS score
  const atsScore = atsData?.overallAtsScore ?? twinData?.resumeScore ?? 0;
  const resumeVersion = atsData?.resumeVersion ?? (atsScore > 0 ? 1 : 0);

  // Real Coding & Skills metrics
  const codingPlatforms = twinData?.codingPlatformsCount ?? 0;
  const verifiedSkills = twinData?.verifiedSkillsCount ?? 0;

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
            {user?.year ? `${user.year} • ` : ''}
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

      {/* 4 Core Dimensions Metric Cards (Real Data) */}
      <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
      <View style={styles.metricGrid}>
        {/* ATS Score */}
        <MetricCard
          icon="document-text"
          iconColor={colors.primary}
          iconBg={colors.primaryLight}
          title="ATS Resume Score"
          value={`${atsScore}%`}
          subtitle={atsScore > 0 ? `Version ${resumeVersion} Analyzed` : 'No Resume Uploaded'}
          badge={atsScore >= 75 ? 'Strong' : atsScore >= 50 ? 'Moderate' : 'Needs Work'}
          badgeColor={atsScore >= 75 ? colors.success : atsScore >= 50 ? colors.warning : colors.danger}
          progress={atsScore}
          onPress={() => navigation.navigate('ResumeTab')}
        />

        {/* Taken Exams & Assessments */}
        <MetricCard
          icon="school"
          iconColor={colors.success}
          iconBg={colors.successLight}
          title="Taken Exams"
          value={`${takenExamsCount} Exam${takenExamsCount === 1 ? '' : 's'} Taken`}
          subtitle={takenExamsCount > 0 ? `${avgAssessmentScore}% Avg Score • Verified` : 'No Exams Taken Yet'}
          badge={takenExamsCount > 0 ? 'Verified' : 'Pending'}
          badgeColor={takenExamsCount > 0 ? colors.success : colors.warning}
          progress={avgAssessmentScore}
          onPress={() => navigation.navigate('Assessment')}
        />

        {/* Weekly Challenges */}
        <MetricCard
          icon="trophy"
          iconColor={colors.warning}
          iconBg={colors.warningLight}
          title="Weekly Challenges"
          value={`${completedChall} / ${totalChall} Done`}
          subtitle={completedChall === totalChall && totalChall > 0 ? 'All Completed! 🏆' : (completedChall > 0 ? `${challengeProgress}% Consistency Rate` : 'No Challenges Done Yet')}
          badge={completedChall > 0 ? 'On Track' : 'To Do'}
          badgeColor={completedChall > 0 ? colors.warning : colors.textMuted}
          progress={challengeProgress}
          onPress={() => navigation.navigate('Challenges')}
        />

        {/* Coding & Profiles */}
        <MetricCard
          icon="code-slash"
          iconColor={colors.secondary}
          iconBg={colors.secondaryLight}
          title="Coding Platforms"
          value={`${codingPlatforms} Connected`}
          subtitle={codingPlatforms > 0 ? `${twinData?.codingScore ?? 0}% DSA Strength • ${verifiedSkills} Skills` : 'No Coding Platforms Linked'}
          badge={codingPlatforms > 0 ? (twinData?.codingScore >= 70 ? 'Advanced' : 'Synced') : 'Link Handle'}
          badgeColor={codingPlatforms > 0 ? colors.secondary : colors.textMuted}
          progress={twinData?.codingScore ?? 0}
          onPress={() => navigation.navigate('CodingProfiles')}
        />
      </View>

      {/* Taken Exams Detail Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="ribbon-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionCardTitle}>Skill Verification Exams ({takenExamsCount})</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Assessment')}>
            <Text style={styles.viewAllText}>{takenExamsCount > 0 ? 'Take Another' : 'Take Exam'}</Text>
          </TouchableOpacity>
        </View>

        {assessmentResults && assessmentResults.length > 0 ? (
          <View style={styles.examList}>
            {assessmentResults.slice(0, 3).map((result, idx) => (
              <View key={result.id || idx} style={styles.examItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.examCategory}>{result.category || 'TECHNICAL'}</Text>
                  <Text style={styles.examMeta}>
                    {result.correctAnswers || 0} / {result.totalQuestions || 10} correct
                  </Text>
                </View>
                <View style={[styles.examBadge, { backgroundColor: result.passed ? colors.successLight : colors.dangerLight }]}>
                  <Text style={[styles.examBadgeText, { color: result.passed ? colors.successDark : colors.dangerDark }]}>
                    {Math.round(result.scorePercentage || 0)}% {result.passed ? 'PASSED' : 'RETRY'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateBox}>
            <Ionicons name="document-text-outline" size={28} color={colors.textMuted} style={{ marginBottom: 4 }} />
            <Text style={styles.emptyStateTitle}>No Skill Exams Taken Yet</Text>
            <Text style={styles.emptyStateDesc}>
              Prove your technical competency in Core Java, Spring, SQL, or DSA to earn verified skill badges.
            </Text>
            <TouchableOpacity
              style={styles.takeExamBtn}
              onPress={() => navigation.navigate('Assessment')}
            >
              <Text style={styles.takeExamBtnText}>Take Placement Quiz &rarr;</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Weekly Placement Sprint Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flame-outline" size={18} color={colors.warning} style={{ marginRight: 6 }} />
            <Text style={styles.sectionCardTitle}>Weekly Placement Sprint</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Challenges')}>
            <Text style={styles.viewAllText}>View All ({totalChall})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.challengeProgressRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.challengeProgressLabel}>
              {completedChall} of {totalChall} Weekly Tasks Completed
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${challengeProgress}%` }]} />
            </View>
          </View>
          <Text style={styles.challengeProgressPercent}>{challengeProgress}%</Text>
        </View>

        {challenges && challenges.length > 0 ? (
          <View style={styles.challengeList}>
            {challenges.slice(0, 2).map((c, idx) => (
              <TouchableOpacity
                key={c.id || idx}
                style={styles.challengeItem}
                onPress={() => navigation.navigate('Challenges')}
              >
                <Ionicons
                  name={c.isCompleted || c.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={c.isCompleted || c.completed ? colors.success : colors.textMuted}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.challengeTitle, (c.isCompleted || c.completed) && styles.challengeTitleDone]} numberOfLines={1}>
                    {c.title}
                  </Text>
                  <Text style={styles.challengeCategory}>{c.category || 'PLACEMENT'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
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
          <Text style={styles.actionPillText}>Take Exam</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPill}
          onPress={() => navigation.navigate('Challenges')}
          activeOpacity={0.8}
        >
          <Ionicons name="trophy-outline" size={20} color={colors.warning} />
          <Text style={styles.actionPillText}>Challenges</Text>
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
    marginBottom: 14,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  examList: {
    marginTop: 4,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  examCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  examMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  examBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyStateBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  emptyStateDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  takeExamBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  takeExamBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  challengeProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 4,
  },
  challengeProgressPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.warning,
  },
  challengeList: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  challengeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  challengeTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  challengeCategory: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
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
