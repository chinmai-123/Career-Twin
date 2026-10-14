import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { assessmentApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const MCQ_CATEGORIES = ['ALL', 'JAVA', 'SPRING_BOOT', 'SQL', 'DSA'];
const CODING_CATEGORIES = ['ALL', 'DSA', 'BACKEND', 'SQL', 'FRONTEND'];

const AssessmentScreen = ({ navigation }) => {
  // Mode: 'MCQ' or 'CODING'
  const [activeTab, setActiveTab] = useState('MCQ');

  // MCQ State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [mcqCategory, setMcqCategory] = useState('ALL');
  const [mcqLoading, setMcqLoading] = useState(true);
  const [submittingMcq, setSubmittingMcq] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [quizActive, setQuizActive] = useState(false);
  const timerRef = useRef(null);

  // Coding Challenges State
  const [codingChallenges, setCodingChallenges] = useState([]);
  const [codingCategory, setCodingCategory] = useState('ALL');
  const [codingLoading, setCodingLoading] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [userCode, setUserCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  // Load MCQ Questions
  const fetchQuestions = useCallback(async (cat) => {
    try {
      setMcqLoading(true);
      const res = await assessmentApi.getQuestions(cat);
      const payload = res?.data || res;
      if (Array.isArray(payload) && payload.length > 0) {
        setQuestions(payload);
        setSelectedAnswers({});
        setCurrentIndex(0);
        setTimeLeft(600);
        setQuizActive(true);
      } else {
        setQuestions([]);
        setQuizActive(false);
      }
    } catch (err) {
      console.warn('Could not load assessment questions:', err.message);
      setQuestions([]);
      setQuizActive(false);
    } finally {
      setMcqLoading(false);
    }
  }, []);

  // Load Coding Challenges
  const fetchCodingChallenges = useCallback(async (cat) => {
    try {
      setCodingLoading(true);
      const res = await assessmentApi.getCodingChallenges(cat === 'ALL' ? '' : cat);
      const payload = res?.data || res;
      if (Array.isArray(payload)) {
        setCodingChallenges(payload);
      }
    } catch (err) {
      console.warn('Could not load coding challenges:', err.message);
    } finally {
      setCodingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'MCQ') {
      fetchQuestions(mcqCategory);
    } else {
      fetchCodingChallenges(codingCategory);
    }
  }, [activeTab, mcqCategory, codingCategory, fetchQuestions, fetchCodingChallenges]);

  // Timer countdown for MCQ
  useEffect(() => {
    if (activeTab === 'MCQ' && quizActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitMcq();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeTab, quizActive, timeLeft]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitMcq = async () => {
    clearInterval(timerRef.current);
    try {
      setSubmittingMcq(true);
      const res = await assessmentApi.submitAssessment({
        category: mcqCategory,
        answers: selectedAnswers,
        timeTakenSeconds: 600 - timeLeft,
      });

      const payload = res?.data || res;
      await careerTwinApi.recalculate();
      setQuizActive(false);

      navigation.navigate('AssessmentResult', {
        result: payload,
      });
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Could not submit quiz answers.');
    } finally {
      setSubmittingMcq(false);
    }
  };

  // Open coding challenge
  const handleOpenChallenge = (challenge) => {
    setActiveChallenge(challenge);
    const lang = challenge.starterCode?.java ? 'java' : Object.keys(challenge.starterCode || {})[0] || 'javascript';
    setSelectedLanguage(lang);
    setUserCode(challenge.starterCode?.[lang] || '');
    setExecutionResult(null);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (activeChallenge?.starterCode?.[lang]) {
      setUserCode(activeChallenge.starterCode[lang]);
    }
  };

  const handleRunCode = async () => {
    if (!activeChallenge || !userCode.trim()) return;
    try {
      setRunningCode(true);
      const res = await assessmentApi.runCoding({
        challengeId: activeChallenge.id,
        language: selectedLanguage,
        code: userCode,
      });
      const payload = res?.data || res;
      setExecutionResult(payload);
      setResultModalVisible(true);
    } catch (err) {
      Alert.alert('Run Error', err.message || 'Could not execute code against test cases.');
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!activeChallenge || !userCode.trim()) return;
    try {
      setSubmittingCode(true);
      const res = await assessmentApi.submitCoding({
        challengeId: activeChallenge.id,
        language: selectedLanguage,
        code: userCode,
      });
      const payload = res?.data || res;
      setExecutionResult(payload);
      setResultModalVisible(true);
      await careerTwinApi.recalculate();
    } catch (err) {
      Alert.alert('Submit Error', err.message || 'Could not evaluate coding submission.');
    } finally {
      setSubmittingCode(false);
    }
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <View style={styles.container}>
      <Header
        title="Skill Verification"
        subtitle="Role-Based Exams & Coding Challenges"
        onBack={() => {
          if (activeChallenge) {
            setActiveChallenge(null);
          } else {
            navigation.goBack();
          }
        }}
        rightIcon="refresh"
        rightAction={() => {
          if (activeTab === 'MCQ') fetchQuestions(mcqCategory);
          else fetchCodingChallenges(codingCategory);
        }}
      />

      {/* Top Main Mode Switcher: MCQ vs Coding */}
      {!activeChallenge && (
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === 'MCQ' && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab('MCQ')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="school-outline"
              size={16}
              color={activeTab === 'MCQ' ? '#ffffff' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabToggleText, activeTab === 'MCQ' && styles.tabToggleTextActive]}>
              MCQ Quizzes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === 'CODING' && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab('CODING')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="code-slash-outline"
              size={16}
              color={activeTab === 'CODING' ? '#ffffff' : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabToggleText, activeTab === 'CODING' && styles.tabToggleTextActive]}>
              Coding Challenges
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========================================= */}
      {/* MODE 1: MCQ ASSESSMENTS                   */}
      {/* ========================================= */}
      {activeTab === 'MCQ' && !activeChallenge && (
        <>
          {/* MCQ Category Bar */}
          <View style={styles.categoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MCQ_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, mcqCategory === cat && styles.catChipActive]}
                  onPress={() => setMcqCategory(cat)}
                >
                  <Text style={[styles.catChipText, mcqCategory === cat && styles.catChipTextActive]}>
                    {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {mcqLoading ? (
            <LoadingSpinner message="Loading placement questions..." />
          ) : questions.length > 0 && currentQ ? (
            <ScrollView contentContainerStyle={styles.content}>
              {/* Status Bar: Timer + Progress */}
              <View style={styles.statusBar}>
                <View style={styles.timerWrapper}>
                  <Ionicons name="timer-outline" size={18} color={timeLeft < 60 ? colors.danger : colors.primary} />
                  <Text style={[styles.timerText, timeLeft < 60 && { color: colors.danger }]}>
                    {formatTimer(timeLeft)}
                  </Text>
                </View>

                <View style={styles.progressPill}>
                  <Text style={styles.progressPillText}>
                    {answeredCount}/{questions.length} Answered
                  </Text>
                </View>
              </View>

              {/* Question Card */}
              <View style={styles.card}>
                <View style={styles.qNumBadge}>
                  <Text style={styles.qNumText}>
                    QUESTION {currentIndex + 1} OF {questions.length} • {currentQ.category || mcqCategory}
                  </Text>
                </View>

                <Text style={styles.questionTitle}>{currentQ.questionText}</Text>

                {/* Options A, B, C, D (Accurate Multi-Choice UI) */}
                <View style={styles.optionsWrap}>
                  {[
                    { key: 'A', text: currentQ.optionA || (currentQ.options && currentQ.options[0]) },
                    { key: 'B', text: currentQ.optionB || (currentQ.options && currentQ.options[1]) },
                    { key: 'C', text: currentQ.optionC || (currentQ.options && currentQ.options[2]) },
                    { key: 'D', text: currentQ.optionD || (currentQ.options && currentQ.options[3]) },
                  ]
                    .filter((opt) => Boolean(opt.text))
                    .map((opt) => {
                      const isSelected = selectedAnswers[currentQ.id] === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                          onPress={() => handleSelectOption(currentQ.id, opt.key)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.optionKeyCircle, isSelected && styles.optionKeyCircleSelected]}>
                            <Text style={[styles.optionKeyText, isSelected && styles.optionKeyTextSelected]}>
                              {opt.key}
                            </Text>
                          </View>
                          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                            {opt.text}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={{ marginLeft: 6 }} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>

              {/* Navigation & Submit Controls */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
                  onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                  <Text style={styles.navBtnText}>Previous</Text>
                </TouchableOpacity>

                {currentIndex < questions.length - 1 ? (
                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  >
                    <Text style={styles.nextBtnText}>Next</Text>
                    <Ionicons name="chevron-forward" size={18} color="#ffffff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmitMcq}
                    disabled={submittingMcq}
                  >
                    {submittingMcq ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>Submit Quiz</Text>
                        <Ionicons name="checkmark-done" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          ) : (
            <EmptyState
              icon="help-circle-outline"
              title="No Questions Available"
              description="Switch categories to load questions from the verified question bank."
              actionText="Reload All Questions"
              onAction={() => setMcqCategory('ALL')}
            />
          )}
        </>
      )}

      {/* ========================================= */}
      {/* MODE 2: CODING CHALLENGES LIST            */}
      {/* ========================================= */}
      {activeTab === 'CODING' && !activeChallenge && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Coding Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {CODING_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, codingCategory === cat && styles.catChipActive]}
                onPress={() => setCodingCategory(cat)}
              >
                <Text style={[styles.catChipText, codingCategory === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {codingLoading ? (
            <LoadingSpinner message="Loading coding challenges..." />
          ) : codingChallenges.length > 0 ? (
            codingChallenges.map((challenge) => {
              const isEasy = challenge.difficulty === 'EASY';
              return (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <Text style={styles.challengeRole}>
                        Target Role: {challenge.roleCategory || 'Software Engineer'}
                      </Text>
                    </View>
                    <View style={[styles.diffBadge, { backgroundColor: isEasy ? colors.successLight : colors.warningLight }]}>
                      <Text style={[styles.diffText, { color: isEasy ? colors.successDark : colors.warningDark }]}>
                        {challenge.difficulty}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.challengeDesc} numberOfLines={3}>
                    {challenge.description}
                  </Text>

                  <View style={styles.sampleBox}>
                    <Text style={styles.sampleLabel}>Example Input:</Text>
                    <Text style={styles.sampleVal} numberOfLines={1}>{challenge.sampleInput}</Text>
                    <Text style={[styles.sampleLabel, { marginTop: 4 }]}>Expected Output:</Text>
                    <Text style={styles.sampleVal} numberOfLines={1}>{challenge.sampleOutput}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.openCodeBtn}
                    onPress={() => handleOpenChallenge(challenge)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="code-slash" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.openCodeBtnText}>Open Challenge & Code</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <EmptyState
              icon="code-slash-outline"
              title="No Coding Challenges"
              description="Select 'ALL' to see placement problems tailored to your target role."
              actionText="View All Challenges"
              onAction={() => setCodingCategory('ALL')}
            />
          )}
        </ScrollView>
      )}

      {/* ========================================= */}
      {/* ACTIVE CODING CHALLENGE EDITOR            */}
      {/* ========================================= */}
      {activeChallenge && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.codeEditorContent}>
            {/* Challenge Header & Back */}
            <View style={styles.challengeDetailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeTitle}>{activeChallenge.title}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  <View style={styles.catPill}>
                    <Text style={styles.catPillText}>{activeChallenge.category}</Text>
                  </View>
                  <View style={[styles.diffBadge, { backgroundColor: activeChallenge.difficulty === 'EASY' ? colors.successLight : colors.warningLight }]}>
                    <Text style={[styles.diffText, { color: activeChallenge.difficulty === 'EASY' ? colors.successDark : colors.warningDark }]}>
                      {activeChallenge.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeChallengeBtn}
                onPress={() => setActiveChallenge(null)}
              >
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Problem Statement */}
            <View style={styles.card}>
              <Text style={styles.sectionHeaderTitle}>Problem Statement</Text>
              <Text style={styles.problemBodyText}>{activeChallenge.description}</Text>

              {activeChallenge.constraints && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.constraintsTitle}>Constraints:</Text>
                  {activeChallenge.constraints.map((c, idx) => (
                    <Text key={idx} style={styles.constraintItem}>• {c}</Text>
                  ))}
                </View>
              )}
            </View>

            {/* Language Selection Chips */}
            <View style={styles.langSelectorRow}>
              <Text style={styles.langLabel}>Language: </Text>
              {['java', 'python', 'javascript'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langChip, selectedLanguage === lang && styles.langChipActive]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text style={[styles.langChipText, selectedLanguage === lang && styles.langChipTextActive]}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Monospaced Code Editor */}
            <View style={styles.codeContainer}>
              <View style={styles.codeHeaderBar}>
                <Text style={styles.codeHeaderTitle}>SOLUTION EDITOR ({selectedLanguage.toUpperCase()})</Text>
                <TouchableOpacity
                  onPress={() => setUserCode(activeChallenge.starterCode?.[selectedLanguage] || '')}
                >
                  <Text style={styles.resetCodeText}>Reset Code</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.codeEditorInput}
                multiline
                value={userCode}
                onChangeText={setUserCode}
                autoCapitalize="none"
                autoCorrect={false}
                textAlignVertical="top"
                placeholder="// Write your algorithmic solution here..."
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Run & Submit Bar */}
            <View style={styles.codeActionsBar}>
              <TouchableOpacity
                style={styles.runCodeBtn}
                onPress={handleRunCode}
                disabled={runningCode || submittingCode}
                activeOpacity={0.8}
              >
                {runningCode ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="play" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.runCodeBtnText}>Run Sample Tests</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitCodeBtn}
                onPress={handleSubmitCode}
                disabled={runningCode || submittingCode}
                activeOpacity={0.8}
              >
                {submittingCode ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.submitCodeBtnText}>Submit & Verify</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Execution Results Modal */}
      <Modal
        visible={resultModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name={executionResult?.passed ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={executionResult?.passed ? colors.success : colors.danger}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.modalTitle}>
                  {executionResult?.passed ? 'Solution Accepted!' : 'Test Cases Incomplete'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setResultModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.statusMessageText}>{executionResult?.statusMessage}</Text>
              <Text style={styles.feedbackText}>{executionResult?.feedback}</Text>

              <View style={styles.statsSummaryRow}>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryVal}>{executionResult?.passedTestCases}/{executionResult?.totalTestCases}</Text>
                  <Text style={styles.summaryLbl}>Passed</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryVal}>{Math.round(executionResult?.scorePercentage || 0)}%</Text>
                  <Text style={styles.summaryLbl}>Score</Text>
                </View>
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryVal}>{executionResult?.executionTimeMs || 25}ms</Text>
                  <Text style={styles.summaryLbl}>Runtime</Text>
                </View>
              </View>

              {/* Individual Test Cases */}
              <Text style={[styles.sectionHeaderTitle, { marginTop: 12 }]}>Test Case Breakdown:</Text>
              {executionResult?.testCaseResults?.map((tc, idx) => (
                <View key={idx} style={[styles.tcRow, { borderColor: tc.passed ? colors.success : colors.danger }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.tcTitle}>Case {tc.testCaseIndex || idx + 1}: {tc.input}</Text>
                    <Text style={[styles.tcStatus, { color: tc.passed ? colors.successDark : colors.dangerDark }]}>
                      {tc.passed ? 'PASSED' : 'FAILED'}
                    </Text>
                  </View>
                  <Text style={styles.tcDetails}>Expected: {tc.expectedOutput}</Text>
                  <Text style={styles.tcDetails}>Actual: {tc.actualOutput}</Text>
                  {tc.errorMessage && (
                    <Text style={styles.tcError}>{tc.errorMessage}</Text>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setResultModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Continue Practicing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  tabToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabToggleTextActive: {
    color: '#ffffff',
  },
  categoryBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: colors.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6,
  },
  progressPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  qNumBadge: {
    marginBottom: 10,
  },
  qNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
    marginBottom: 18,
  },
  optionsWrap: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionKeyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionKeyCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionKeyText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  optionKeyTextSelected: {
    color: '#ffffff',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 4,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  challengeCard: {
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
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  challengeRole: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '800',
  },
  challengeDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  sampleBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  sampleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  sampleVal: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.text,
    marginTop: 1,
  },
  openCodeBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  openCodeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  codeEditorContent: {
    padding: 16,
    paddingBottom: 40,
  },
  challengeDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  catPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  closeChallengeBtn: {
    padding: 4,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  problemBodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  constraintsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  constraintItem: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  langSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  langLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 6,
  },
  langChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langChipTextActive: {
    color: '#ffffff',
  },
  codeContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  codeHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  codeHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  resetCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38bdf8',
  },
  codeEditorInput: {
    minHeight: 200,
    padding: 12,
    color: '#f8fafc',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  codeActionsBar: {
    flexDirection: 'row',
    gap: 10,
  },
  runCodeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  runCodeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  submitCodeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitCodeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  modalBody: {
    marginBottom: 16,
  },
  statusMessageText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  summaryLbl: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tcRow: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  tcTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  tcStatus: {
    fontSize: 10,
    fontWeight: '800',
  },
  tcDetails: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  tcError: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AssessmentScreen;
