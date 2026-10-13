import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../services/api';
import Header from '../components/Header';
import colors from '../theme/colors';

const SUGGESTIONS = [
  'How to prepare for TCS / Enterprise technical rounds?',
  'What full-stack projects should I build to boost my resume?',
  'How can I improve my ATS score to 90%?',
  'Explain Spring Boot annotations commonly asked in interviews',
];

const AIGuidanceScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Hello! I am your AI Career Mentor powered by Gemini AI and your Career Twin profile. Ask me anything about placement readiness, interview prep, or tech roadmap guidance!',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await aiApi.getGuidance({ query, prompt: query });
      const payload = res?.data || res;
      const aiReply = payload?.guidance || payload?.response || payload?.message || 'I reviewed your Career Twin profile. Keep focusing on hands-on project implementations and data structures.';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      Alert.alert('AI Mentor Offline', err.message || 'Could not communicate with AI Guidance service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header
        title="AI Career Mentor"
        subtitle="Powered by Google Gemini & Career Twin"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatScroll}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Suggestion Chips */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestHeader}>Quick Career Prompts:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUGGESTIONS.map((sug, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestChip}
                onPress={() => handleSend(sug)}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.suggestText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Messages */}
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View key={m.id} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}>
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color="#ffffff" />
                </View>
              )}
              <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAi]}>
                <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAi]}>
                  {m.text}
                </Text>
                <Text style={[styles.msgTime, isUser ? styles.msgTimeUser : styles.msgTimeAi]}>
                  {m.timestamp}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={[styles.msgRow, styles.msgRowAi]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={16} color="#ffffff" />
            </View>
            <View style={[styles.msgBubble, styles.msgBubbleAi, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Gemini AI is analyzing your career profile...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          placeholder="Ask AI Career Mentor anything..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 20,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  suggestText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 14,
  },
  msgBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  msgBubbleAi: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: '#ffffff',
  },
  msgTextAi: {
    color: colors.text,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
  },
  msgTimeUser: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  msgTimeAi: {
    color: colors.textMuted,
    textAlign: 'left',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default AIGuidanceScreen;
