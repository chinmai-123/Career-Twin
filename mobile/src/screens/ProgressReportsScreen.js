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
import { reportApi, progressApi } from '../services/api';
import Header from '../components/Header';
import ScoreGauge from '../components/ScoreGauge';
import colors from '../theme/colors';

const ProgressReportsScreen = ({ navigation }) => {
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReportData = useCallback(async () => {
    try {
      const [repRes, progRes] = await Promise.allSettled([
        reportApi.getReport(),
        progressApi.getProgress(),
      ]);

      if (repRes.status === 'fulfilled') {
        const payload = repRes.value?.data || repRes.value;
        setReport(payload);
      }
      if (progRes.status === 'fulfilled') {
        const payload = progRes.value?.data || progRes.value;
        setProgress(payload);
      }
    } catch (err) {
      console.warn('Could not fetch report:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const readinessScore = report?.overallScore ?? 78;

  return (
    <View style={styles.container}>
      <Header
        title="Career Reports"
        subtitle="Placement Evaluation & Audit"
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchReportData(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReportData(); }} colors={[colors.primary]} />}
      >
        {/* Readiness Tier Card */}
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMPREHENSIVE AUDIT</Text>
          </View>
          <Text style={styles.roleTitle}>{report?.targetRole || 'Software Engineer'}</Text>
          <Text style={styles.tierName}>{report?.readinessTier || 'Placement Ready (Tier 1)'}</Text>

          <ScoreGauge
            score={readinessScore}
            size={160}
            strokeWidth={14}
            title="Readiness"
            subtitle="Overall Employability Index"
          />
        </View>

        {/* Strengths List */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Identified Candidate Strengths</Text>
          </View>
          {report?.strengths && report.strengths.length > 0 ? (
            report.strengths.map((str, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.bulletText}>{str}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Strengths are evaluated upon resume and quiz completion.</Text>
          )}
        </View>

        {/* Improvement Recommendations */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="trending-up" size={18} color={colors.warning} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Actionable Career Recommendations</Text>
          </View>
          {report?.recommendations && report.recommendations.length > 0 ? (
            report.recommendations.map((rec, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="arrow-forward-circle" size={16} color={colors.warningDark} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.bulletText}>{rec}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Keep maintaining active challenge consistency!</Text>
          )}
        </View>

        {/* Activity Timeline / Logs */}
        {progress?.recentActivities && progress.recentActivities.length > 0 ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="time-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Recent Activity Logs</Text>
            </View>
            {progress.recentActivities.map((act, i) => (
              <View key={i} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityText}>{act.activityDescription || act.description || act}</Text>
                  {act.timestamp ? <Text style={styles.activityTime}>{act.timestamp}</Text> : null}
                </View>
              </View>
            ))}
          </View>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  tierName: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 5,
    marginRight: 10,
  },
  activityText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default ProgressReportsScreen;
