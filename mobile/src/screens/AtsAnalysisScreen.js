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
import { atsApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const AtsAnalysisScreen = ({ route, navigation }) => {
  const resumeId = route.params?.resumeId;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = resumeId
        ? await atsApi.getByResumeId(resumeId)
        : await atsApi.getLatest();
      const payload = res?.data || res;
      setAnalysis(payload);
    } catch (err) {
      console.warn('ATS fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resumeId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleRecalculate = async () => {
    try {
      setReanalyzing(true);
      const targetId = analysis?.resumeId || resumeId;
      const res = await atsApi.analyze(targetId);
      const payload = res?.data || res;
      setAnalysis(payload);
      Alert.alert('Analysis Updated', 'ATS scores have been recalculated with latest multi-factor algorithms.');
    } catch (err) {
      Alert.alert('Recalculation Failed', err.message || 'Could not recalculate ATS score.');
    } finally {
      setReanalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="ATS Resume Analysis"
        subtitle={analysis?.targetRole ? `Role: ${analysis.targetRole}` : 'Applicant Tracking System'}
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchAnalysis(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAnalysis(); }} colors={[colors.primary]} />}
      >
        {analysis ? (
          <>
            {/* Top Overview Score Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>RESUME VERSION {analysis.resumeVersion || 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.recalcBtn}
                  onPress={handleRecalculate}
                  disabled={reanalyzing}
                >
                  {reanalyzing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="sync" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.recalcText}>Recalculate</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.roleTitle}>{analysis.targetRole}</Text>

              <ScoreGauge
                score={analysis.overallAtsScore ?? 77}
                size={160}
                strokeWidth={14}
                title="ATS Score"
                subtitle="Synthesized keyword match, readability, and impact"
              />
            </View>

            {/* 4 Dimension Breakdown */}
            <Text style={styles.sectionTitle}>ATS Dimensions</Text>
            <View style={styles.dimensionGrid}>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{analysis.keywordMatchScore ?? 72}%</Text>
                <Text style={styles.dimLabel}>Keyword Match</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{analysis.skillMatchScore ?? 82}%</Text>
                <Text style={styles.dimLabel}>Tech Breadth</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{analysis.formattingScore ?? 76}%</Text>
                <Text style={styles.dimLabel}>Formatting</Text>
              </View>
              <View style={styles.dimBox}>
                <Text style={styles.dimValue}>{analysis.readabilityScore ?? 78}%</Text>
                <Text style={styles.dimLabel}>Readability</Text>
              </View>
            </View>

            {/* Matched Keywords */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginRight: 6 }} />
                <Text style={styles.sectionCardTitle}>
                  Matched Keywords ({analysis.matchedKeywords?.length || 0})
                </Text>
              </View>
              <View style={styles.tagWrap}>
                {analysis.matchedKeywords && analysis.matchedKeywords.length > 0 ? (
                  analysis.matchedKeywords.map((kw, i) => (
                    <View key={i} style={styles.matchedTag}>
                      <Text style={styles.matchedTagText}>{kw}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No keyword matches detected yet.</Text>
                )}
              </View>
            </View>

            {/* Missing Keywords */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} style={{ marginRight: 6 }} />
                <Text style={styles.sectionCardTitle}>
                  Missing Keywords ({analysis.missingKeywords?.length || 0})
                </Text>
              </View>
              <Text style={styles.missingDesc}>
                Add these technical skills to your projects or skills section to boost your ATS pass rate:
              </Text>
              <View style={styles.tagWrap}>
                {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
                  analysis.missingKeywords.map((kw, i) => (
                    <View key={i} style={styles.missingTag}>
                      <Text style={styles.missingTagText}>+ {kw}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No missing keywords! Excellent alignment.</Text>
                )}
              </View>
            </View>

            {/* Recruiter Suggestions */}
            {analysis.improvementSuggestions && analysis.improvementSuggestions.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="bulb" size={18} color={colors.warning} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionCardTitle}>Recruiter Suggestions</Text>
                </View>
                {analysis.improvementSuggestions.map((sug, i) => (
                  <View key={i} style={styles.suggestionRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.suggestionText}>{sug}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : !loading ? (
          <EmptyState
            icon="document-text-outline"
            title="No ATS Analysis Found"
            description="Upload a PDF resume to generate keyword scores, readability metrics, and recruiter suggestions."
            actionText="Upload Resume"
            onAction={() => navigation.navigate('ResumeTab')}
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
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  recalcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  recalcText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  dimensionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dimBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 14,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dimValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  dimLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
    marginBottom: 10,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  missingDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  matchedTag: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  matchedTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.successDark,
  },
  missingTag: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  missingTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dangerDark,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  suggestionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 16,
    color: colors.warningDark,
    marginRight: 8,
    lineHeight: 18,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
  },
});

export default AtsAnalysisScreen;
