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
import { challengeApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const ChallengesScreen = ({ navigation }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await challengeApi.getChallenges();
      const payload = res?.data || res;
      if (Array.isArray(payload)) {
        setChallenges(payload);
      }
    } catch (err) {
      console.warn('Could not fetch challenges:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleToggle = async (challengeId) => {
    try {
      setTogglingId(challengeId);
      await challengeApi.toggleChallenge(challengeId);
      await fetchChallenges();
      await careerTwinApi.recalculate();
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not toggle challenge.');
    } finally {
      setTogglingId(null);
    }
  };

  const completed = challenges.filter((c) => c.completed || c.isCompleted).length;

  return (
    <View style={styles.container}>
      <Header
        title="Weekly Challenges"
        subtitle="Consistent Placement Habit Building"
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchChallenges(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChallenges(); }} colors={[colors.primary]} />}
      >
        {/* Progress Banner */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tag}>WEEKLY STREAK</Text>
              <Text style={styles.bannerTitle}>{completed} of {challenges.length} Done</Text>
              <Text style={styles.bannerSub}>Complete weekly targets to maximize consistency score.</Text>
            </View>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={26} color={colors.warning} />
            </View>
          </View>
        </View>

        {/* Challenges List */}
        <Text style={styles.sectionTitle}>Active Challenges</Text>

        {challenges.length > 0 ? (
          challenges.map((c) => {
            const isDone = c.completed || c.isCompleted;
            const isToggling = togglingId === c.id;

            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.challengeCard, isDone && styles.challengeCardDone]}
                onPress={() => handleToggle(c.id)}
                activeOpacity={0.8}
                disabled={isToggling}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.checkBtn, isDone && styles.checkBtnDone]}>
                    {isToggling ? (
                      <ActivityIndicator size="small" color={isDone ? '#ffffff' : colors.primary} />
                    ) : (
                      <Ionicons
                        name={isDone ? 'checkmark' : 'square-outline'}
                        size={18}
                        color={isDone ? '#ffffff' : colors.textMuted}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.challengeTop}>
                    <Text style={styles.categoryBadge}>{c.category || 'PRACTICE'}</Text>
                    <Text style={styles.pointsText}>+{c.points || 25} PTS</Text>
                  </View>
                  <Text style={[styles.challengeTitle, isDone && styles.challengeTitleDone]}>
                    {c.title}
                  </Text>
                  <Text style={styles.challengeDesc}>{c.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : !loading ? (
          <EmptyState
            icon="trophy-outline"
            title="No Active Challenges"
            description="Challenges are refreshed automatically on weekly intervals."
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  trophyCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  challengeCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  challengeCardDone: {
    backgroundColor: '#f8fafc',
    opacity: 0.85,
  },
  cardLeft: {
    marginRight: 14,
    justifyContent: 'center',
  },
  checkBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  checkBtnDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  cardContent: {
    flex: 1,
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.successDark,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  challengeTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default ChallengesScreen;
