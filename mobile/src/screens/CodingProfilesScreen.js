import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { codingProfileApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const PLATFORMS = [
  { id: 'GITHUB', label: 'GitHub', icon: 'logo-github', color: '#181717' },
  { id: 'LEETCODE', label: 'LeetCode', icon: 'code-slash', color: '#FFA116' },
  { id: 'CODECHEF', label: 'CodeChef', icon: 'restaurant-outline', color: '#5B4638' },
  { id: 'HACKERRANK', label: 'HackerRank', icon: 'terminal-outline', color: '#00EA64' },
  { id: 'GEEKSFORGEEKS', label: 'GeeksforGeeks', icon: 'book-outline', color: '#2F8D46' },
];

const CodingProfilesScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('GITHUB');
  const [usernameInput, setUsernameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await codingProfileApi.getProfiles();
      const payload = res?.data || res;
      if (Array.isArray(payload)) {
        setProfiles(payload);
      }
    } catch (err) {
      console.warn('Could not fetch coding profiles:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleConnectProfile = async () => {
    if (!usernameInput.trim()) {
      Alert.alert('Username Required', `Please enter your ${selectedPlatform} username or URL.`);
      return;
    }
    try {
      setSubmitting(true);
      await codingProfileApi.saveProfile({
        platform: selectedPlatform,
        username: usernameInput.trim(),
        profileUrl: usernameInput.trim().startsWith('http')
          ? usernameInput.trim()
          : `https://${selectedPlatform.toLowerCase()}.com/${usernameInput.trim()}`,
      });
      setUsernameInput('');
      await fetchProfiles();
      await careerTwinApi.recalculate();
      Alert.alert('Profile Connected', `${selectedPlatform} profile successfully linked!`);
    } catch (err) {
      Alert.alert('Failed to Connect', err.message || 'Could not save coding profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async (platformName, id) => {
    try {
      setSyncingId(id);
      await codingProfileApi.syncProfile(platformName);
      await fetchProfiles();
      await careerTwinApi.recalculate();
      Alert.alert('Synced', `${platformName} data refreshed successfully.`);
    } catch (err) {
      Alert.alert('Sync Error', err.message || 'Could not sync platform data.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = (id, platform) => {
    Alert.alert('Remove Profile', `Are you sure you want to disconnect your ${platform} profile?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await codingProfileApi.deleteProfile(id);
            await fetchProfiles();
            await careerTwinApi.recalculate();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Coding Profiles"
        subtitle="Developer Portfolio Analytics"
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); fetchProfiles(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfiles(); }} colors={[colors.primary]} />}
      >
        {/* Connect New Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect Coding Platform</Text>
          <Text style={styles.cardSub}>
            Link your public coding handles to reflect algorithmic and project prowess in your Career Twin:
          </Text>

          {/* Platform Selector Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformScroll}>
            {PLATFORMS.map((p) => {
              const active = selectedPlatform === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.platformChip, active && styles.platformChipActive]}
                  onPress={() => setSelectedPlatform(p.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={p.icon}
                    size={16}
                    color={active ? colors.primaryDark : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.platformChipText, active && styles.platformChipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Username Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${selectedPlatform} username / URL`}
              placeholderTextColor={colors.textMuted}
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.connectBtn}
              onPress={handleConnectProfile}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.connectBtnText}>Connect</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Connected Profiles List */}
        <Text style={styles.sectionTitle}>Connected Platforms ({profiles.length})</Text>

        {profiles.length > 0 ? (
          profiles.map((p) => (
            <View key={p.id} style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.platformBadge}>
                  <Ionicons name="code-slash" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.platformBadgeText}>{p.platform}</Text>
                </View>
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.syncBtn}
                    onPress={() => handleSync(p.platform, p.id)}
                    disabled={syncingId === p.id}
                  >
                    {syncingId === p.id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="sync" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.syncBtnText}>Sync</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(p.id, p.platform)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.profileHandle}>@{p.username}</Text>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                {p.problemsSolved !== undefined && (
                  <View style={styles.statBox}>
                    <Text style={styles.statVal}>{p.problemsSolved}</Text>
                    <Text style={styles.statLbl}>Solved</Text>
                  </View>
                )}
                {p.publicRepos !== undefined && (
                  <View style={styles.statBox}>
                    <Text style={styles.statVal}>{p.publicRepos}</Text>
                    <Text style={styles.statLbl}>Repos</Text>
                  </View>
                )}
                {p.starsCount !== undefined && (
                  <View style={styles.statBox}>
                    <Text style={styles.statVal}>{p.starsCount}</Text>
                    <Text style={styles.statLbl}>Stars</Text>
                  </View>
                )}
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{p.score || 75}%</Text>
                  <Text style={styles.statLbl}>Twin Weight</Text>
                </View>
              </View>
            </View>
          ))
        ) : !loading ? (
          <EmptyState
            icon="code-slash-outline"
            title="No Profiles Linked Yet"
            description="Connect your GitHub or LeetCode handle above to automatically import problem-solving achievements."
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },
  platformScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  platformChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  platformChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.text,
    marginRight: 8,
  },
  connectBtn: {
    backgroundColor: colors.primary,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteBtn: {
    padding: 4,
  },
  profileHandle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  statLbl: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default CodingProfilesScreen;
