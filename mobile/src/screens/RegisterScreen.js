import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    year: '3rd Year',
    graduationYear: '2026',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Missing Details', 'Full name, email, and password are required.');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        graduationYear: parseInt(formData.graduationYear, 10) || 2026,
      });
      Alert.alert('Account Created', 'Registration successful! You are now logged in.');
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Could not register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Row */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serverConfigBtn}
            onPress={() => navigation.navigate('ServerConfig')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.serverConfigText}>Server IP</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Create Student Account</Text>
        <Text style={styles.subtitle}>Join CareerTwin to track your placement readiness</Text>

        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chinmai Dharmana"
              placeholderTextColor={colors.textMuted}
              value={formData.fullName}
              onChangeText={(t) => updateField('fullName', t)}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>College Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="student@college.edu"
              placeholderTextColor={colors.textMuted}
              value={formData.email}
              onChangeText={(t) => updateField('email', t)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password (min 6 chars) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Create secure password"
              placeholderTextColor={colors.textMuted}
              value={formData.password}
              onChangeText={(t) => updateField('password', t)}
              secureTextEntry
            />
          </View>

          {/* College */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>College / University</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Anurag University"
              placeholderTextColor={colors.textMuted}
              value={formData.college}
              onChangeText={(t) => updateField('college', t)}
            />
          </View>

          {/* Branch & Year in Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Branch</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. CSE / IT"
                placeholderTextColor={colors.textMuted}
                value={formData.branch}
                onChangeText={(t) => updateField('branch', t)}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Graduation Year</Text>
              <TextInput
                style={styles.input}
                placeholder="2026"
                placeholderTextColor={colors.textMuted}
                value={formData.graduationYear}
                onChangeText={(t) => updateField('graduationYear', t)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.registerBtnText}>Create Account</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  serverConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
  },
  serverConfigText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    marginTop: 10,
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default RegisterScreen;
