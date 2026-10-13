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
import { careerTwinApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import Header from '../components/Header';
import colors from '../theme/colors';

const CareerTwinScreen = ({ navigation }) => {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const fetchTwin = useCallback(async () => {
    try {
      const res = await careerTwinApi.getCareerTwin();
      const payload = res?.data || res;
      setTwin(payload);
    } catch (err) {
      console.warn('CareerTwin fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTwin();
  }, [fetchTwin]);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await careerTwinApi.recalculate();
      const payload = res?.data || res;
      setTwin(payload);
      Alert.alert('Recalculation Complete', 'Your Career Twin profile has been updated with your latest progress.');
    } catch (err) {
      Alert.alert('Recalculation Failed', err.message || 'Could not recalculate Career Twin.');
    } finally {
      setRecalculating(false);
    }
  };

  const score = twin?.placementReadinessScore ?? 78;
  const targetRole = twin?.targetRole || 'Software Engineer';
  const tier = twin?.readinessTier || 'Placement Ready (Tier 1)';

  return (
    <View style={styles.container}>
      <Header
        title="Career Twin Engine"
        subtitle="Holistic Placement Readiness"
        rightIcon="refresh"
        rightAction={fetchTwin}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTwin(); }} colors={[colors.primary]} />}
      >
        {/* Main Readiness Gauge Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>INTEGRATED AI PROFILE</Text>
            </View>
            <View style={[styles.tierBadge, { backgroundColor: score >= 75 ? colors.successLight : colors.warningLight }]}>
              <Text style={[styles.tierBadgeText, { color: score >= 75 ? colors.successDark : colors.warningDark }]}>
                {tier}
              </Text>
            </View>
          </View>

          <Text style={styles.cardRoleTitle}>Target Role: {targetRole}</Text>

          <ScoreGauge
            score={score}
            size={170}
            strokeWidth={16}
            title="Twin Score"
            subtitle="Weighted synthesis of 5 core placement dimensions"
          />

          <TouchableOpacity
            style={styles.recalcBtn}
            onPress={handleRecalculate}
            disabled={recalculating}
            activeOpacity={0.8}
          >
            {recalculating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="sync-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.recalcBtnText}>Recalculate Twin Score</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 5 Dimensions Breakdown */}
        <Text style={styles.sectionTitle}>Dimension Breakdown</Text>

        <View style={styles.dimensionCard}>
          <DimensionRow
            name="Skill Verification"
            weight="25%"
            score={twin?.skillVerificationScore ?? 82}
            color={colors.primary}
            icon="school-outline"
            onPress={() => navigation.navigate('SkillsTab')}
          />
          <DimensionRow
            name="Resume ATS Match"
            weight="25%"
            score={twin?.resumeAtsScore ?? 77}
            color={colors.accent}
            icon="document-text-outline"
            onPress={() => navigation.navigate('ResumeTab')}
          />
          <DimensionRow
            name="Coding Profile Activity"
            weight="20%"
            score={twin?.codingProfileScore ?? 72}
            color={colors.secondary}
            icon="code-slash-outline"
            onPress={() => navigation.navigate('CodingProfiles')}
          />
          <DimensionRow
            name="Project Portfolio Readiness"
            weight="15%"
            score={twin?.projectReadinessScore ?? 80}
            color={colors.success}
            icon="folder-open-outline"
            onPress={() => navigation.navigate('Projects')}
          />
          <DimensionRow
            name="Weekly Consistency"
            weight="15%"
            score={twin?.challengeConsistencyScore ?? 68}
            color={colors.warning}
            icon="flame-outline"
            onPress={() => navigation.navigate('Challenges')}
            isLast
          />
        </View>

        {/* Action Navigation Cards */}
        <Text style={styles.sectionTitle}>Deep Dive Analyses</Text>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => navigation.navigate('SkillGaps')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconWrapper, { backgroundColor: colors.dangerLight }]}>
            <Ionicons name="analytics-outline" size={22} color={colors.danger} />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>Skill Gap Analysis</Text>
            <Text style={styles.navSubtitle}>Identify missing technical competencies for target role</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => navigation.navigate('Roadmap')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconWrapper, { backgroundColor: colors.secondaryLight }]}>
            <Ionicons name="trail-sign-outline" size={22} color={colors.secondary} />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>Personalized Roadmap</Text>
            <Text style={styles.navSubtitle}>Milestone-based learning path curated for {targetRole}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => navigation.navigate('Reports')}
          activeOpacity={0.8}
        >
          <View style={[styles.navIconWrapper, { backgroundColor: colors.successLight }]}>
            <Ionicons name="newspaper-outline" size={22} color={colors.success} />
          </View>
          <View style={styles.navInfo}>
            <Text style={styles.navTitle}>Career Readiness Report</Text>
            <Text style={styles.navSubtitle}>Full recruiter-style evaluation and progress timeline</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const DimensionRow = ({ name, weight, score, color, icon, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.dimensionRow, !isLast && styles.dimensionBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.dimIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View style={styles.dimContent}>
      <View style={styles.dimHeader}>
        <Text style={styles.dimName}>{name}</Text>
        <Text style={[styles.dimScore, { color }]}>{score}%</Text>
      </View>
      <View style={styles.dimTrack}>
        <View style={[styles.dimBar, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.dimWeight}>Weight: {weight}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 8 }} />
  </TouchableOpacity>
);

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
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardRoleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  recalcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 12,
    marginTop: 16,
  },
  recalcBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  dimensionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dimensionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dimIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dimContent: {
    flex: 1,
  },
  dimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  dimScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  dimTrack: {
    height: 5,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    marginVertical: 6,
    overflow: 'hidden',
  },
  dimBar: {
    height: '100%',
    borderRadius: 4,
  },
  dimWeight: {
    fontSize: 10,
    color: colors.textMuted,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  navInfo: {
    flex: 1,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  navSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
});

export default CareerTwinScreen;
