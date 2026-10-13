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
import { skillGapApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const SkillGapScreen = ({ navigation }) => {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGaps = useCallback(async () => {
    try {
      const res = await skillGapApi.getSkillGaps();
      const payload = res?.data || res;
      setGapData(payload);
    } catch (err) {
      console.warn('Could not fetch skill gaps:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGaps();
  }, [fetchGaps]);

  const gapsList = gapData?.skillGaps || gapData?.gaps || [];
  const targetRole = gapData?.targetRole || 'Software Engineer';
  const matchPercentage = gapData?.matchPercentage ?? 74;

  return (
    <View style={styles.container}>
      <Header
        title="Skill Gap Analysis"
        subtitle={`Role: ${targetRole}`}
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchGaps(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGaps(); }} colors={[colors.primary]} />}
      >
        {/* Overview Banner */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.overviewTag}>COMPETENCY ALIGNMENT</Text>
              <Text style={styles.overviewTitle}>{matchPercentage}% Role Match</Text>
              <Text style={styles.overviewSub}>
                Comparing required tech stack vs. your verified assessments & resume.
              </Text>
            </View>
            <View style={[styles.matchCircle, { borderColor: matchPercentage >= 75 ? colors.success : colors.warning }]}>
              <Text style={styles.matchCircleText}>{matchPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Skill Items List */}
        <Text style={styles.sectionTitle}>Skill Competency Matrix</Text>

        {Array.isArray(gapsList) && gapsList.length > 0 ? (
          gapsList.map((item, idx) => {
            const isMissing = item.status === 'MISSING' || item.level === 'MISSING' || !item.verified;
            const statusColor = isMissing ? colors.danger : colors.success;
            const statusBg = isMissing ? colors.dangerLight : colors.successLight;
            const statusText = isMissing ? 'CRITICAL GAP' : 'VERIFIED';

            return (
              <View key={idx} style={styles.skillRow}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{item.skillName || item.name || item}</Text>
                  <Text style={styles.skillCategory}>{item.category || 'Core Technical Requirement'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>
            );
          })
        ) : !loading ? (
          <EmptyState
            icon="analytics-outline"
            title="All Required Skills Aligned"
            description="Your profile matches the core competencies for this role!"
          />
        ) : null}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Assessment')}
          activeOpacity={0.8}
        >
          <Ionicons name="school-outline" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>Verify Skills via Quiz</Text>
        </TouchableOpacity>
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
  overviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overviewTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  overviewSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
    paddingRight: 10,
  },
  matchCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  matchCircleText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  statusIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  skillCategory: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    marginTop: 16,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SkillGapScreen;
