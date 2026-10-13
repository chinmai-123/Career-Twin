import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScoreGauge from '../components/ScoreGauge';
import Header from '../components/Header';
import colors from '../theme/colors';

const AssessmentResultScreen = ({ route, navigation }) => {
  const result = route.params?.result;
  const score = result?.scorePercentage ?? Math.round(((result?.correctAnswers ?? 4) / (result?.totalQuestions ?? 5)) * 100);
  const correct = result?.correctAnswers ?? 4;
  const total = result?.totalQuestions ?? 5;
  const category = result?.category || 'Skill Verification';

  return (
    <View style={styles.container}>
      <Header
        title="Assessment Result"
        subtitle="Verified Skill Performance"
        onBack={() => navigation.navigate('MainTabs')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{category} ASSESSMENT COMPLETE</Text>
          </View>

          <ScoreGauge
            score={score}
            size={170}
            strokeWidth={16}
            title="Score"
            subtitle={`${correct} of ${total} Questions Correct`}
          />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.statNum}>{correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="close-circle" size={20} color={colors.danger} />
              <Text style={styles.statNum}>{total - correct}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
              <Text style={styles.statNum}>{score >= 70 ? 'PASS' : 'RETRY'}</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          <View style={styles.feedbackBanner}>
            <Ionicons name="sparkles" size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.feedbackText}>
              {score >= 75
                ? 'Excellent work! These skills are now marked verified on your Career Twin.'
                : 'Good attempt! Review your skill gap recommendations to strengthen weak areas.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('SkillGaps')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Check Skill Gap Analysis</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => navigation.navigate('MainTabs')}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>Back to Dashboard</Text>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 18,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    width: '100%',
  },
  feedbackText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 16,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    marginBottom: 10,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AssessmentResultScreen;
