import React, { useState, useEffect } from 'react';
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
import {
  getBaseUrl,
  setCustomBaseUrl,
  resetBaseUrlToDefault,
  PRESETS,
} from '../config/apiConfig';
import axios from 'axios';
import colors from '../theme/colors';

const ServerConfigScreen = ({ navigation }) => {
  const [currentUrl, setCurrentUrl] = useState(getBaseUrl());
  const [customInput, setCustomInput] = useState(getBaseUrl());
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const url = getBaseUrl();
    setCurrentUrl(url);
    setCustomInput(url);
  }, []);

  const handleApply = async (newUrl) => {
    const applied = await setCustomBaseUrl(newUrl);
    if (applied) {
      setCurrentUrl(applied);
      setCustomInput(applied);
      testConnectivity(applied);
    } else {
      Alert.alert('Error', 'Invalid API server URL format.');
    }
  };

  const testConnectivity = async (urlToTest) => {
    try {
      setTesting(true);
      setStatusMessage(null);
      const target = (urlToTest || currentUrl).replace(/\/+$/, '') + '/auth/demo-credentials';
      const res = await axios.get(target, { timeout: 6000 });
      if (res.data) {
        setStatusMessage({
          success: true,
          text: 'Connected successfully to Spring Boot Backend!',
        });
      }
    } catch (err) {
      setStatusMessage({
        success: false,
        text: `Connection failed: ${err.message}. Make sure your PC and phone are on the same Wi-Fi and Spring Boot is running on port 8085.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = async () => {
    const resetUrl = await resetBaseUrlToDefault();
    setCurrentUrl(resetUrl);
    setCustomInput(resetUrl);
    testConnectivity(resetUrl);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Backend Connection</Text>
      <Text style={styles.subtitle}>
        Configure where the mobile app connects to your Spring Boot REST server.
      </Text>

      {/* Current Active URL Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ACTIVE API BASE URL</Text>
        <Text style={styles.activeUrlText}>{currentUrl}</Text>

        {testing ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.testingText}>Testing connection to Spring Boot...</Text>
          </View>
        ) : statusMessage ? (
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: statusMessage.success ? colors.successLight : colors.dangerLight },
            ]}
          >
            <Ionicons
              name={statusMessage.success ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={statusMessage.success ? colors.successDark : colors.dangerDark}
            />
            <Text
              style={[
                styles.statusText,
                { color: statusMessage.success ? colors.successDark : colors.dangerDark },
              ]}
            >
              {statusMessage.text}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => testConnectivity(currentUrl)}
          disabled={testing}
        >
          <Ionicons name="pulse-outline" size={18} color={colors.primary} />
          <Text style={styles.testBtnText}>Test Server Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Presets */}
      <Text style={styles.sectionHeading}>Quick Connection Presets</Text>

      <TouchableOpacity
        style={styles.presetCard}
        onPress={() => handleApply(PRESETS.PHYSICAL_DEVICE)}
      >
        <View style={styles.presetIcon}>
          <Ionicons name="phone-portrait-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.presetInfo}>
          <Text style={styles.presetTitle}>Physical Phone (Wi-Fi)</Text>
          <Text style={styles.presetSub}>{PRESETS.PHYSICAL_DEVICE}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.presetCard}
        onPress={() => handleApply(PRESETS.ANDROID_EMULATOR)}
      >
        <View style={styles.presetIcon}>
          <Ionicons name="hardware-chip-outline" size={22} color={colors.secondary} />
        </View>
        <View style={styles.presetInfo}>
          <Text style={styles.presetTitle}>Android Emulator (10.0.2.2)</Text>
          <Text style={styles.presetSub}>{PRESETS.ANDROID_EMULATOR}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.presetCard}
        onPress={() => handleApply(PRESETS.LOCALHOST)}
      >
        <View style={styles.presetIcon}>
          <Ionicons name="laptop-outline" size={22} color={colors.accent} />
        </View>
        <View style={styles.presetInfo}>
          <Text style={styles.presetTitle}>Localhost (Web / Desktop)</Text>
          <Text style={styles.presetSub}>{PRESETS.LOCALHOST}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Custom IP Entry */}
      <Text style={styles.sectionHeading}>Custom Server URL</Text>
      <View style={styles.customCard}>
        <TextInput
          style={styles.customInput}
          placeholder="http://192.168.1.XX:8085/api"
          value={customInput}
          onChangeText={setCustomInput}
          autoCapitalize="none"
        />
        <View style={styles.customActions}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => handleApply(customInput)}
          >
            <Text style={styles.applyBtnText}>Apply & Test</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 36,
  },
  backBtn: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  activeUrlText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 6,
    marginBottom: 14,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  testBtnText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  presetIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  presetInfo: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  presetSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  customCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  customInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  customActions: {
    flexDirection: 'row',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ServerConfigScreen;
