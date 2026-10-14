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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { codingProfileApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const PLATFORMS = [
  { id: 'LEETCODE', label: 'LeetCode', icon: 'code-slash', color: '#FFA116' },
  { id: 'GITHUB', label: 'GitHub', icon: 'logo-github', color: '#181717' },
  { id: 'CODECHEF', label: 'CodeChef', icon: 'restaurant-outline', color: '#5B4638' },
  { id: 'HACKERRANK', label: 'HackerRank', icon: 'terminal-outline', color: '#00EA64' },
  { id: 'GEEKSFORGEEKS', label: 'GeeksforGeeks', icon: 'book-outline', color: '#2F8D46' },
];

const sanitizeHandle = (input) => {
  if (!input) return '';
  let s = input.trim();
  while (s.endsWith('/')) {
    s = s.substring(0, s.length - 1);
  }
  if (s.startsWith('@')) {
    s = s.substring(1);
  }
  if (s.includes('?')) {
    s = s.substring(0, s.indexOf('?'));
  }
  if (s.includes('/')) {
    const lastSlash = s.lastIndexOf('/');
    s = s.substring(lastSlash + 1);
  }
  return s.trim();
};

const CodingProfilesScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('LEETCODE');
  const [usernameInput, setUsernameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState(null);

  // Edit Stats Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editForm, setEditForm] = useState({
    totalSolved: '0',
    easySolved: '0',
    mediumSolved: '0',
    hardSolved: '0',
    rating: '0',
    publicRepos: '0',
    contributionsCount: '0',
    topLanguages: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
    const cleanUser = sanitizeHandle(usernameInput);
    if (!cleanUser) {
      Alert.alert('Username Required', `Please enter your ${selectedPlatform} username.`);
      return;
    }
    try {
      setSubmitting(true);
      await codingProfileApi.saveProfile({
        platform: selectedPlatform,
        username: cleanUser,
        profileUrl: `https://${selectedPlatform.toLowerCase()}.com/${selectedPlatform === 'LEETCODE' ? 'u/' : ''}${cleanUser}`,
      });
      setUsernameInput('');
      await fetchProfiles();
      await careerTwinApi.recalculate();
      Alert.alert('Profile Connected', `${selectedPlatform} handle @${cleanUser} successfully connected and analyzed.`);
    } catch (err) {
      Alert.alert('Connection Failed', err.message || 'Could not verify coding profile handle.');
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
      Alert.alert('Live Sync Complete', `${platformName} metrics refreshed successfully.`);
    } catch (err) {
      Alert.alert('Sync Notice', err.message || 'Could not refresh profile live data.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDelete = (id, platform) => {
    Alert.alert('Disconnect Platform', `Are you sure you want to disconnect ${platform}? Your Career Twin coding strength will be updated.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
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

  const openEditModal = (p) => {
    setEditingProfile(p);
    setEditForm({
      totalSolved: String(p.totalSolved ?? 0),
      easySolved: String(p.easySolved ?? 0),
      mediumSolved: String(p.mediumSolved ?? 0),
      hardSolved: String(p.hardSolved ?? 0),
      rating: String(p.rating ?? 0),
      publicRepos: String(p.publicRepos ?? 0),
      contributionsCount: String(p.contributionsCount ?? 0),
      topLanguages: Array.isArray(p.topLanguages) ? p.topLanguages.join(', ') : '',
    });
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProfile) return;
    try {
      setSavingEdit(true);
      const isGithub = editingProfile.platform === 'GITHUB';
      const languages = editForm.topLanguages
        ? editForm.topLanguages.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await codingProfileApi.saveProfile({
        platform: editingProfile.platform,
        username: editingProfile.username,
        profileUrl: editingProfile.profileUrl,
        totalSolved: isGithub ? 0 : parseInt(editForm.totalSolved || '0', 10),
        easySolved: isGithub ? 0 : parseInt(editForm.easySolved || '0', 10),
        mediumSolved: isGithub ? 0 : parseInt(editForm.mediumSolved || '0', 10),
        hardSolved: isGithub ? 0 : parseInt(editForm.hardSolved || '0', 10),
        rating: isGithub ? 0 : parseInt(editForm.rating || '0', 10),
        publicRepos: isGithub ? parseInt(editForm.publicRepos || '0', 10) : 0,
        contributionsCount: isGithub ? parseInt(editForm.contributionsCount || '0', 10) : 0,
        topLanguages: languages,
      });

      setEditModalVisible(false);
      setEditingProfile(null);
      await fetchProfiles();
      await careerTwinApi.recalculate();
      Alert.alert('Stats Saved', `${editingProfile.platform} statistics updated successfully.`);
    } catch (err) {
      Alert.alert('Save Failed', err.message || 'Could not update statistics.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Coding Profiles"
        subtitle="Live Algorithmic & GitHub Portfolios"
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
            Link your LeetCode, GitHub, or competitive handles. Statistics are analyzed and factored into your Career Twin.
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
              placeholder={`Enter ${selectedPlatform} username`}
              placeholderTextColor={colors.textMuted}
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
              autoCorrect={false}
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
          profiles.map((p) => {
            const isGithub = p.platform === 'GITHUB';
            return (
              <View key={p.id} style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.platformBadge}>
                      <Ionicons
                        name={isGithub ? 'logo-github' : 'code-slash'}
                        size={15}
                        color={colors.primary}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.platformBadgeText}>{p.platform}</Text>
                    </View>
                    <View style={[styles.verifyBadge, { backgroundColor: p.verified ? colors.successLight : colors.surfaceSecondary }]}>
                      <Ionicons
                        name={p.verified ? 'checkmark-circle' : 'time-outline'}
                        size={12}
                        color={p.verified ? colors.successDark : colors.textMuted}
                        style={{ marginRight: 3 }}
                      />
                      <Text style={[styles.verifyBadgeText, { color: p.verified ? colors.successDark : colors.textMuted }]}>
                        {p.verified ? 'Verified' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.profileActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEditModal(p)}
                    >
                      <Ionicons name="pencil" size={13} color={colors.primary} style={{ marginRight: 3 }} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.syncBtn}
                      onPress={() => handleSync(p.platform, p.id)}
                      disabled={syncingId === p.id}
                    >
                      {syncingId === p.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <>
                          <Ionicons name="sync" size={13} color={colors.primary} style={{ marginRight: 3 }} />
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

                {/* Handle and Rank */}
                <View style={styles.handleRow}>
                  <Text style={styles.profileHandle}>@{p.username}</Text>
                  <Text style={styles.rankNameText}>
                    {p.rankName || (isGithub ? 'Developer' : 'Problem Solver')}
                  </Text>
                </View>

                {/* Realistic Metrics Grid */}
                <View style={styles.statsGrid}>
                  {isGithub ? (
                    <>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>{p.publicRepos ?? 0}</Text>
                        <Text style={styles.statLbl}>Repos</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>{p.contributionsCount ?? 0}</Text>
                        <Text style={styles.statLbl}>Contributions</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={[styles.statVal, { color: colors.primary }]}>{p.activityScore ?? 0}%</Text>
                        <Text style={styles.statLbl}>Activity</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={[styles.statVal, { color: colors.secondary }]}>{p.dsaScore ?? 0}%</Text>
                        <Text style={styles.statLbl}>Project DSA</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>{p.totalSolved ?? 0}</Text>
                        <Text style={styles.statLbl}>Total Solved</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>
                          <Text style={{ color: colors.warning }}>{p.mediumSolved ?? 0}M</Text>
                          <Text style={{ fontSize: 11, color: colors.danger }}> +{p.hardSolved ?? 0}H</Text>
                        </Text>
                        <Text style={styles.statLbl}>Med & Hard</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>{p.rating && p.rating > 0 ? p.rating : '—'}</Text>
                        <Text style={styles.statLbl}>Rating</Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={[styles.statVal, { color: colors.success }]}>{p.dsaScore ?? 0}%</Text>
                        <Text style={styles.statLbl}>DSA Score</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Top Languages */}
                {Array.isArray(p.topLanguages) && p.topLanguages.length > 0 && (
                  <View style={styles.languagesRow}>
                    <Text style={styles.languagesLabel}>Languages: </Text>
                    {p.topLanguages.map((lang, idx) => (
                      <View key={idx} style={styles.langPill}>
                        <Text style={styles.langPillText}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        ) : !loading ? (
          <EmptyState
            icon="code-slash-outline"
            title="No Coding Profiles Linked Yet"
            description="Link your LeetCode or GitHub username above to accurately reflect your problem-solving experience in your Career Twin."
          />
        ) : null}
      </ScrollView>

      {/* Manual Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editingProfile?.platform} Stats
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {editingProfile?.platform === 'GITHUB' ? (
                <>
                  <Text style={styles.inputLabel}>Public Repositories</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={editForm.publicRepos}
                    onChangeText={(val) => setEditForm(prev => ({ ...prev, publicRepos: val }))}
                  />

                  <Text style={styles.inputLabel}>Contributions Count</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={editForm.contributionsCount}
                    onChangeText={(val) => setEditForm(prev => ({ ...prev, contributionsCount: val }))}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Total Solved</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={editForm.totalSolved}
                    onChangeText={(val) => setEditForm(prev => ({ ...prev, totalSolved: val }))}
                  />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Easy</Text>
                      <TextInput
                        style={styles.modalInput}
                        keyboardType="number-pad"
                        value={editForm.easySolved}
                        onChangeText={(val) => setEditForm(prev => ({ ...prev, easySolved: val }))}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Medium</Text>
                      <TextInput
                        style={styles.modalInput}
                        keyboardType="number-pad"
                        value={editForm.mediumSolved}
                        onChangeText={(val) => setEditForm(prev => ({ ...prev, mediumSolved: val }))}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Hard</Text>
                      <TextInput
                        style={styles.modalInput}
                        keyboardType="number-pad"
                        value={editForm.hardSolved}
                        onChangeText={(val) => setEditForm(prev => ({ ...prev, hardSolved: val }))}
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Contest Rating (optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    value={editForm.rating}
                    onChangeText={(val) => setEditForm(prev => ({ ...prev, rating: val }))}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Top Languages (comma separated)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Java, Python, C++, SQL"
                value={editForm.topLanguages}
                onChangeText={(val) => setEditForm(prev => ({ ...prev, topLanguages: val }))}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Stats</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
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
    paddingVertical: 7,
    borderRadius: 10,
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
    height: 44,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.text,
    marginRight: 8,
  },
  connectBtn: {
    backgroundColor: colors.primary,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  verifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 5,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
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
  handleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  profileHandle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  rankNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  statLbl: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  languagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  languagesLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginRight: 4,
  },
  langPill: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 5,
    marginTop: 2,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  modalBody: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CodingProfilesScreen;
