import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import Header from '../components/Header';
import colors from '../theme/colors';

const ProfileScreen = ({ navigation }) => {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    college: user?.college || '',
    branch: user?.branch || '',
    year: user?.year || '3rd Year',
    graduationYear: (user?.graduationYear || 2026).toString(),
  });
  const [saving, setSaving] = useState(false);

  // Change Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await profileApi.updateProfile({
        ...formData,
        graduationYear: parseInt(formData.graduationYear, 10) || 2026,
      });
      const payload = res?.data || res;
      updateUser(payload);
      setEditing(false);
      Alert.alert('Profile Updated', 'Student details updated successfully.');
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Missing Fields', 'Please enter your current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    try {
      setPasswordSaving(true);
      await profileApi.changePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
      Alert.alert('Success', 'Password changed successfully.');
    } catch (err) {
      Alert.alert('Password Change Failed', err.message || 'Could not change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of CareerTwin?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Student Profile"
        subtitle={user?.email || 'Account Details'}
        rightIcon="log-out-outline"
        rightColor={colors.danger}
        rightAction={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {(user?.fullName || 'S').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.fullName || 'Student'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>{user?.branch || 'CSE'}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>Class of {user?.graduationYear || 2026}</Text>
            </View>
          </View>
        </View>

        {/* Academic Profile Details */}
        <View style={styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitle}>Academic Information</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={formData.fullName}
                onChangeText={(t) => setFormData((p) => ({ ...p, fullName: t }))}
              />

              <Text style={styles.fieldLabel}>College / University</Text>
              <TextInput
                style={styles.fieldInput}
                value={formData.college}
                onChangeText={(t) => setFormData((p) => ({ ...p, college: t }))}
              />

              <Text style={styles.fieldLabel}>Branch / Department</Text>
              <TextInput
                style={styles.fieldInput}
                value={formData.branch}
                onChangeText={(t) => setFormData((p) => ({ ...p, branch: t }))}
              />

              <Text style={styles.fieldLabel}>Graduation Year</Text>
              <TextInput
                style={styles.fieldInput}
                value={formData.graduationYear}
                onChangeText={(t) => setFormData((p) => ({ ...p, graduationYear: t }))}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.infoList}>
              <InfoRow label="College" value={user?.college || 'Anurag University'} />
              <InfoRow label="Branch" value={user?.branch || 'Computer Science & Engineering'} />
              <InfoRow label="Year of Study" value={user?.year || '3rd Year'} />
              <InfoRow label="Graduation Year" value={user?.graduationYear?.toString() || '2026'} />
            </View>
          )}
        </View>

        {/* Server & Networking Settings */}
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate('ServerConfig')}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>Backend Connection & IP</Text>
            <Text style={styles.menuSub}>Configure Spring Boot server URL for phone or emulator</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Change Password Dropdown */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.cardTopRow}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="key-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Change Password</Text>
            </View>
            <Ionicons
              name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.passwordForm}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter current password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
              />

              <Text style={styles.fieldLabel}>New Password (min 6 characters)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleChangePassword}
                disabled={passwordSaving}
              >
                {passwordSaving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.logoutBtnText}>Sign Out of CareerTwin</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
  },
  metaBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  infoList: {
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  editForm: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  fieldInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  menuSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  passwordForm: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerLight,
    height: 48,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutBtnText: {
    color: colors.dangerDark,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;
