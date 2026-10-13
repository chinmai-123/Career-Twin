import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { assessmentApi, careerTwinApi } from '../services/api';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import colors from '../theme/colors';

const CATEGORIES = ['ALL', 'JAVA', 'SPRING', 'SQL', 'DSA', 'OOP'];

const AssessmentScreen = ({ navigation }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [quizActive, setQuizActive] = useState(false);
  const timerRef = useRef(null);

  const fetchQuestions = useCallback(async (cat) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions(category);
  }, [category, fetchQuestions]);

  // Timer countdown
  useEffect(() => {
    if (quizActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizActive, timeLeft]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    try {
      setSubmitting(true);
      const answersList = Object.entries(selectedAnswers).map(([qId, ans]) => ({
        questionId: parseInt(qId, 10),
        selectedOption: ans,
      }));

      const res = await assessmentApi.submitAssessment({
        category,
        answers: answersList,
        timeTakenSeconds: 600 - timeLeft,
      });

      const payload = res?.data || res;
      await careerTwinApi.recalculate();
      setQuizActive(false);

      navigation.navigate('AssessmentResult', {
        result: payload,
      });
    } catch (err) {
      Alert.alert('Submission Failed', err.message || 'Could not submit answers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading verified assessment questions..." />;
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <View style={styles.container}>
      <Header
        title="Skill Verification"
        subtitle="Role-Based Technical Quiz"
        onBack={() => navigation.goBack()}
        rightIcon="refresh"
        rightAction={() => fetchQuestions(category)}
      />

      {/* Category Filter Chips */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {questions.length > 0 && currentQ ? (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Quiz Status Bar: Timer + Progress */}
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
                QUESTION {currentIndex + 1} OF {questions.length} • {currentQ.category || category}
              </Text>
            </View>

            <Text style={styles.questionTitle}>{currentQ.questionText}</Text>

            {/* Options */}
            <View style={styles.optionsWrap}>
              {currentQ.options?.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                return (
                  <TouchableOpacity
                    key={optIdx}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => handleSelectOption(currentQ.id, optIdx)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt}
                    </Text>
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
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
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
          description="Try switching categories or refresh to reload questions from the assessment database."
          actionText="Reload ALL Category"
          onAction={() => setCategory('ALL')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    padding: 20,
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
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: 6,
  },
  progressPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  progressPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  qNumBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  qNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 23,
    marginBottom: 18,
  },
  optionsWrap: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 19,
  },
  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default AssessmentScreen;
