import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { resumeApi, atsApi } from '../services/api';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const ResumeUploadScreen = ({ navigation }) => {
  const [resumes, setResumes] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadResumes = useCallback(async () => {
    try {
      const res = await resumeApi.getHistory();
      const payload = res?.data || res;
      if (Array.isArray(payload)) {
        setResumes(payload);
        if (payload.length > 0) {
          setLatestResume(payload[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load resume history:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (err) {
      Alert.alert('File Selection Failed', err.message || 'Could not access file picker.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please choose a PDF resume first.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name || 'resume.pdf',
        type: selectedFile.mimeType || 'application/pdf',
      });

      const res = await resumeApi.uploadResume(formData);
      const uploaded = res?.data || res;
      Alert.alert('Success', `Resume version V${uploaded.versionNumber} uploaded and parsed successfully!`);
      setSelectedFile(null);
      await loadResumes();
      // Navigate to ATS view
      navigation.navigate('AtsAnalysis', { resumeId: uploaded.id });
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload PDF resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Resume Management"
        subtitle="Upload & Version Tracking"
        rightIcon="refresh"
        rightAction={() => { setRefreshing(true); loadResumes(); }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadResumes(); }} colors={[colors.primary]} />}
      >
        {/* Upload Action Box */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconWrapper}>
            <Ionicons name="cloud-upload" size={32} color={colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload PDF Resume</Text>
          <Text style={styles.uploadSubtitle}>
            Our Apache PDFBox parser extracts skills, projects, and contact details for ATS scoring.
          </Text>

          {selectedFile ? (
            <View style={styles.selectedFileBox}>
              <Ionicons name="document-text" size={24} color={colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fileNameText} numberOfLines={1}>{selectedFile.name}</Text>
                <Text style={styles.fileSizeText}>
                  {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready to upload'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickBtn} onPress={handlePickDocument} activeOpacity={0.8}>
              <Ionicons name="folder-open-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.pickBtnText}>Select PDF File</Text>
            </TouchableOpacity>
          )}

          {selectedFile ? (
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handleUpload}
              disabled={uploading}
              activeOpacity={0.8}
            >
              {uploading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.uploadBtnText}>Analyze & Save Version</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Current Latest Resume Overview */}
        {latestResume ? (
          <View style={styles.activeResumeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.vBadge}>
                <Text style={styles.vBadgeText}>V{latestResume.versionNumber} ACTIVE</Text>
              </View>
              <TouchableOpacity
                style={styles.atsPillBtn}
                onPress={() => navigation.navigate('AtsAnalysis', { resumeId: latestResume.id })}
              >
                <Text style={styles.atsPillText}>View ATS Score</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            <Text style={styles.activeFileName}>{latestResume.fileName}</Text>

            {/* Extracted Skills Preview */}
            <Text style={styles.extractedLabel}>EXTRACTED SKILLS ({latestResume.extractedSkills?.length || 0})</Text>
            <View style={styles.tagsWrap}>
              {latestResume.extractedSkills?.slice(0, 10).map((skill, idx) => (
                <View key={idx} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
              {(latestResume.extractedSkills?.length || 0) > 10 ? (
                <View style={[styles.skillTag, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.skillTagText, { color: colors.textSecondary }]}>
                    +{latestResume.extractedSkills.length - 10} more
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : !loading ? (
          <EmptyState
            icon="document-text-outline"
            title="No Resume Uploaded"
            description="Upload your resume PDF to receive ATS scores and recruiter-grade feedback."
            actionText="Choose PDF File"
            onAction={handlePickDocument}
          />
        ) : null}

        {/* Resume Version History */}
        {resumes.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Resume Version History ({resumes.length})</Text>
            {resumes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.historyRow}
                onPress={() => navigation.navigate('AtsAnalysis', { resumeId: r.id })}
                activeOpacity={0.7}
              >
                <View style={styles.vCircle}>
                  <Text style={styles.vCircleText}>V{r.versionNumber}</Text>
                </View>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.histFileName} numberOfLines={1}>{r.fileName}</Text>
                  <Text style={styles.histDate}>
                    {r.isLatest ? '🟢 Current Active • ' : ''}
                    {r.extractedSkills?.length || 0} skills detected
                  </Text>
                </View>
                <View style={styles.inspectBtn}>
                  <Text style={styles.inspectBtnText}>ATS Score</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
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
  uploadCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  uploadIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  pickBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  fileSizeText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 12,
    width: '100%',
  },
  uploadBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  activeResumeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successDark,
  },
  atsPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  atsPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  activeFileName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
  },
  extractedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  historySection: {
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 8,
  },
  vCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  histFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  histDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  inspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inspectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
});

export default ResumeUploadScreen;
