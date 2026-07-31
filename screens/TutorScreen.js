import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Animated, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';
import { askTutor } from '../services/aiService';
import { getOnboardingData, getStudentName, getChatHistory, saveChatHistory, clearAll } from '../services/storageService';
import { useNotification } from '../components/NotificationBanner';

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : 'S';
}

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  const notify = useNotification();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [studentClass, setStudentClass] = useState('');
  const [studentName, setStudentName] = useState('Scholar');
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    async function load() {
      const data = await getOnboardingData();
      if (data?.studentClass) setStudentClass(data.studentClass);
      const name = await getStudentName();
      if (name) setStudentName(name);
      const history = await getChatHistory();
      if (Array.isArray(history)) {
        if (history.length > 0 && !history[0].messages) {
          setChatHistory([{ messages: history }]);
        } else {
          setChatHistory(history);
        }
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (studentClass && messages.length === 0) {
      const greeting = {
        id: '0',
        type: 'ai',
        text: `Hi! I'm your StudyBuddy tutor. I'm here to help you with your ${studentClass} studies. What would you like to learn about today?`,
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [studentClass]);

  const saveHistory = useCallback(async (newMessages) => {
    try {
      const session = { messages: newMessages };
      await saveChatHistory([session]);
      setChatHistory([session]);
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, []);

  const sendTextMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { id: Date.now().toString(), type: 'user', text: text.trim(), timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await askTutor(text.trim(), studentClass);
      const aiMsg = { id: (Date.now() + 1).toString(), type: 'ai', text: response, timestamp: new Date() };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
    } catch {
      const aiMsg = {
        id: (Date.now() + 1).toString(), type: 'ai',
        text: "The library scrolls seem to have tangled for a moment. Could you ask that again? I'm ready when you are.",
        timestamp: new Date(),
      };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, studentClass, messages, saveHistory]);

  const sendMessage = useCallback(async () => {
    await sendTextMessage(inputText);
    setInputText('');
  }, [inputText, sendTextMessage]);

  const renderMessage = ({ item }) => {
    const isAI = item.type === 'ai';
    return (
      <View style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}>
        {isAI && (
          <View style={styles.aiIcon}>
            <MaterialCommunityIcons name="robot" size={20} color={colors.onTertiaryContainer} />
          </View>
        )}
        <View style={[styles.messageContent, isAI ? styles.aiContent : styles.userContent]}>
          <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
            <Text style={[styles.bubbleText, isAI ? styles.aiBubbleText : styles.userBubbleText]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timestamp, isAI ? styles.aiTimestamp : styles.userTimestamp]}>
            {isAI ? 'AI TUTOR' : 'SENT'} • {formatTime(item.timestamp)}
          </Text>
        </View>
        {!isAI && (
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>{getInitials(studentName)}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderHistorySession = ({ item }) => {
    const firstUserMsg = item.messages.find(m => m.type === 'user');
    const preview = firstUserMsg ? firstUserMsg.text.substring(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '') : 'Empty session';
    const date = new Date(item.messages[0]?.timestamp || Date.now());
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return (
      <View>
        <TouchableOpacity style={styles.historyItem} onPress={() => {
          setMessages(item.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
          setShowHistory(false);
        }}>
          <View style={styles.historyItemContent}>
            <Text style={styles.historyPreview}>{preview}</Text>
            <Text style={styles.historyDate}>{dateStr}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
        <Pressable style={styles.clearHistoryBtn} onPress={() => {
          Alert.alert(
            'Clear Chat History',
            'Are you sure you want to delete all your chat history? This cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Clear', 
                style: 'destructive', 
                onPress: async () => {
                  try {
                    await clearAll();
                    setChatHistory([]);
                    if (messages.length > 0) {
                      setMessages([{ id: '0', type: 'ai', text: `Hi! I'm your StudyBuddy tutor. I'm here to help you with your ${studentClass} studies. What would you like to learn about today?`, timestamp: new Date() }]);
                    }
                  } catch (e) {
                    console.error('Failed to clear history', e);
                    Alert.alert('Error', 'Could not clear chat history');
                  }
                }
              }
            ]
          );
        }}>
          <MaterialIcons name="delete-outline" size={20} color={colors.error} />
          <Text style={styles.clearHistoryText}>Clear History</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="school" size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Tutor</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.headerIconBtn} onPress={() => setShowHistory(true)}>
              <MaterialIcons name="history" size={24} color={colors.onSurfaceVariant} />
            </Pressable>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(studentName)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sessionPillContainer}>
          <View style={styles.sessionPill}>
            <Text style={styles.sessionPillText}>Session: {studentClass || 'Academic'} Tutoring</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator studentName={studentName} /> : null}
        />

        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask StudyBuddy anything..."
              placeholderTextColor={colors.onSurfaceVariant + '66'}
              value={inputText}
              onChangeText={setInputText}
              multiline
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
          </View>
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
          >
            <MaterialIcons name="send" size={20} color={colors.onPrimaryContainer} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showHistory} animationType="slide" transparent={true} onRequestClose={() => setShowHistory(false)}>
        <View style={styles.modalOverlay} onStartShouldSetResponder={() => true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat History</Text>
              <Pressable style={styles.modalCloseBtn} onPress={() => setShowHistory(false)}>
                <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
            {chatHistory.length === 0 ? (
              <View style={styles.emptyHistory}>
                <MaterialCommunityIcons name="history" size={48} color={colors.onSurfaceVariant} />
                <Text style={styles.emptyHistoryText}>No chat history yet</Text>
                <Text style={styles.emptyHistorySubtext}>Start a conversation with your tutor to see it here</Text>
              </View>
            ) : (
              <FlatList
                data={chatHistory}
                renderItem={renderHistorySession}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={styles.historyListContent}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function TypingIndicator({ studentName }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      { iterations: -1 }
    );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.typingRow}>
      <View style={styles.aiIcon}>
        <MaterialCommunityIcons name="robot" size={20} color={colors.onTertiaryContainer} />
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 64,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconBtn: {
    padding: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  avatarText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  sessionPillContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  sessionPill: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  sessionPillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.outline,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  messageContent: {
    maxWidth: '80%',
  },
  aiContent: {
    marginRight: spacing.xxl,
  },
  userContent: {
    marginLeft: spacing.xxl,
  },
  bubble: {
    padding: spacing.lg,
  },
  aiBubble: {
    backgroundColor: colors.surfaceContainer,
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  userBubble: {
    backgroundColor: colors.primaryContainer,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  aiBubbleText: {
    color: colors.onSurface,
  },
  userBubbleText: {
    color: colors.onPrimaryContainer,
  },
  timestamp: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  aiTimestamp: {
    color: colors.onSurfaceVariant,
    opacity: 0.6,
  },
  userTimestamp: {
    color: colors.onSurfaceVariant,
    opacity: 0.6,
    textAlign: 'right',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typingBubble: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  modalTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.onSurface,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyHistoryText: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.onSurface,
    marginTop: spacing.md,
  },
  emptyHistorySubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  historyListContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  historyItemContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  historyPreview: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  historyDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
