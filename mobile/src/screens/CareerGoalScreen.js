import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { careerGoalApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import colors from '../theme/colors';

const SUGGESTED_ROLES = [
  'Software Engineer',
  'Software Engineer at TCS company',
  'Backend Developer',
  'Full Stack Developer',
  'Frontend Developer',
  'Data Analyst',
  'AI / Machine Learning Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
];

const CareerGoalScreen = ({ navigation }) => {
  const [roleInput, setRoleInput] = useState('');
  const [currentGoal, setCurrentGoal] = useState(null);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingSkills, setFetchingSkills] = useState(false);

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const res = await careerGoalApi.getGoal();
      const payload = res?.data || res;
      if (payload?.targetRole) {
        setCurrentGoal(payload);
        setRoleInput(payload.targetRole);
        loadRoleSkills(payload.targetRole);
      }
    } catch (err) {
      console.warn('Could not fetch current career goal:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleSkills = async (roleName) => {
    if (!roleName || !roleName.trim()) return;
    try {
      setFetchingSkills(true);
      const res = await careerGoalApi.getRoleSkills(roleName.trim());
      const skills = res?.data || res;
      if (Array.isArray(skills)) {
        setRequiredSkills(skills);
      }
    } catch (e) {
      console.warn('Failed to fetch role skills:', e.message);
    } finally {
      setFetchingSkills(false);
    }
  };

  const handleSelectRole = (r) => {
    setRoleInput(r);
    loadRoleSkills(r);
  };

  const handleSaveGoal = async () => {
    if (!roleInput.trim()) {
      Alert.alert('Role Required', 'Please enter or select a target career role.');
      return;
    }
    try {
      setSaving(true);
      await careerGoalApi.saveGoal({ targetRole: roleInput.trim() });
      await careerTwinApi.recalculate();
      Alert.alert('Career Goal Saved', `Target role updated to "${roleInput.trim()}". Career Twin readiness updated.`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Failed to Save', err.message || 'Could not update career goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Career Goal"
        subtitle="Define your target job profile"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Custom Role Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>TARGET ROLE / DREAM JOB</Text>
          <Text style={styles.cardSub}>
            Type any customized role (e.g., "Software Engineer at Google" or "Java Backend Developer"):
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Software Engineer at TCS"
              value={roleInput}
              onChangeText={(text) => {
                setRoleInput(text);
              }}
              onEndEditing={() => loadRoleSkills(roleInput)}
            />
          </View>

          {/* Quick suggestions */}
          <Text style={styles.suggestLabel}>Popular Target Roles:</Text>
          <View style={styles.chipsContainer}>
            {SUGGESTED_ROLES.map((r) => {
              const selected = roleInput.toLowerCase() === r.toLowerCase();
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => handleSelectRole(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveGoal}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Save & Align Career Twin</Text>
                <Ionicons name="checkmark-done" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Required Skills Taxonomy Preview */}
        <View style={styles.skillsCard}>
          <View style={styles.skillsHeader}>
            <View>
              <Text style={styles.skillsTitle}>Required Skills for Target Role</Text>
              <Text style={styles.skillsSub}>Automatically mapped by CareerTwin Taxonomy Engine</Text>
            </View>
            {fetchingSkills && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          <View style={styles.skillsWrap}>
            {requiredSkills.length > 0 ? (
              requiredSkills.map((s, idx) => (
                <View key={idx} style={styles.skillPill}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginRight: 4 }} />
                  <Text style={styles.skillPillText}>{s}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptySkillsText}>
                Type or select a target role above to preview industry skill expectations.
              </Text>
            )}
          </View>
        </View>
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
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  suggestLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  skillsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  skillsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  skillsSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.successDark,
  },
  emptySkillsText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});

export default CareerGoalScreen;
