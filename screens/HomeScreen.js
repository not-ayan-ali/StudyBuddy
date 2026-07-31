import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView, Alert, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';
import { generateStudyPlan } from '../services/aiService';
import {
  getStudentName, getOnboardingData, getCurrentPlan,
  savePlanCompletion, getPlanCompletion, clearAll
} from '../services/storageService';
import { SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonBase, SkeletonPostIt, FadeIn } from '../components/Skeleton';
import { useNotification } from '../components/NotificationBanner';

const CUSTOM_ERROR = '#C1613F';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : 'S';
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getBlockDuration(block) {
  if (!block.start || !block.end) return 0;
  const [sh, sm] = block.start.split(':').map(Number);
  const [eh, em] = block.end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function getDateForDay(dayName) {
  const idx = DAY_NAMES.indexOf(dayName);
  if (idx === -1) return null;
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const offset = idx === 0 ? 6 : idx - 1;
  const date = new Date(monday);
  date.setDate(monday.getDate() + offset);
  return date.getDate();
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const notify = useNotification();
  const [planState, setPlanState] = useState('loading');
  const [name, setName] = useState('Scholar');
  const [plan, setPlan] = useState(null);
  const [cadence, setCadence] = useState('weekly');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [completion, setCompletion] = useState({});
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const dayScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const buildPlan = useCallback(async () => {
    setPlanState('loading');
    try {
      const studentName = await getStudentName();
      if (studentName) setName(studentName);

      let currentPlan = await getCurrentPlan();
      if (!currentPlan) {
        const onboardingData = await getOnboardingData();
        if (!onboardingData) { setPlanState('error'); return; }
        const result = await generateStudyPlan(onboardingData);
        if (result?.error) { setPlanState('error'); notify?.('Could not build your study plan. Check your connection.', 'error'); return; }
        currentPlan = result;
      }

      if (currentPlan) {
        const savedCompletion = await getPlanCompletion();
        setPlan(currentPlan);
        setCadence(currentPlan.cadence || 'weekly');
        setCompletion(savedCompletion || {});
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const days = currentPlan.days || [];
        const todayIdx = days.findIndex(d => d.day === todayName);
        setSelectedDayIndex(todayIdx >= 0 ? todayIdx : 0);
        setPlanState('ready');
      }
    } catch { setPlanState('error'); }
  }, []);

  useEffect(() => { buildPlan(); }, [buildPlan]);

  useEffect(() => {
    dayScale.setValue(0.85);
    Animated.spring(dayScale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [selectedDayIndex]);

  const notifiedBlocksRef = useRef(new Set());

  useEffect(() => {
    if (planState !== 'ready' || !plan?.days) return;

    const checkSchedule = () => {
      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayBlock = plan.days.find(d => d.day === todayName);
      if (!todayBlock?.blocks) return;

      const now = new Date();
      const currentMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      todayBlock.blocks.forEach((block) => {
        const key = block.start + block.subject;
        if (block.start === currentMin && !notifiedBlocksRef.current.has(key)) {
          notifiedBlocksRef.current.add(key);
          notify?.(`Focus time! Time to study ${block.subject}: ${block.activity}`, 'info', 6000);
        }
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [planState, plan, notify]);

  const toggleBlock = useCallback(async (blockIndex) => {
    const key = `${selectedDayIndex}-${blockIndex}`;
    const updated = { ...completion, [key]: !completion[key] };
    setCompletion(updated);
    await savePlanCompletion(updated);
  }, [selectedDayIndex, completion]);

  const handleDeletePlan = useCallback(async () => {
    const doDelete = async () => {
      console.log('Delete plan pressed, clearing all data...');
      try {
        await clearAll();
        console.log('Storage cleared, navigating...');
        if (navigation) {
          navigation.navigate('Onboarding1');
        }
      } catch (e) {
        console.error('Delete failed:', e);
        if (Platform.OS === 'web') {
          window.alert('Failed to delete plan. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to delete plan. Please try again.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure? This will erase your saved plan and onboarding data, returning you to the beginning.')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Are you sure?',
        'This will erase your saved plan and onboarding data, returning you to the beginning.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: doDelete,
          },
        ]
      );
    }
  }, [navigation]);

  if (planState === 'loading') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {renderHeader(name, navigation)}

          <View style={styles.greetingSection}>
            <SkeletonText lines={1} width="55%" lineHeight={36} style={{ marginBottom: 4 }} />
            <SkeletonText lines={1} width="75%" lineHeight={24} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow} contentContainerStyle={styles.dayRowContent}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonBase key={i} delay={i * 40} style={{ width: 56, height: 96, borderRadius: 28, borderWidth: 1, borderColor: colors.outlineVariant }} />
            ))}
          </ScrollView>

          <SkeletonCard delay={100} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <SkeletonText lines={1} width="70%" lineHeight={28} style={{ marginBottom: 8 }} />
              <SkeletonText lines={1} width="50%" lineHeight={20} style={{ marginBottom: 12 }} />
              <SkeletonBase delay={100} style={{ width: 80, height: 22, borderRadius: 999 }} />
            </View>
            <SkeletonBase delay={100} style={{ width: 88, height: 88, borderRadius: 44 }} />
          </SkeletonCard>

          <View style={styles.scheduleSection}>
            <View style={styles.scheduleHeader}>
              <SkeletonText lines={1} width={120} lineHeight={28} />
            </View>
            <View style={styles.scheduleList}>
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} delay={i * 60 + 150} style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderLeftWidth: 4, borderLeftColor: colors.outlineVariant }}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <SkeletonBase delay={i * 60 + 150} style={{ width: 100, height: 14, borderRadius: 2, marginBottom: 8 }} />
                    <SkeletonText lines={1} width="85%" lineHeight={24} style={{ marginBottom: 4 }} />
                    <SkeletonBase delay={i * 60 + 150} style={{ width: "65%", height: 16, borderRadius: 2 }} />
                  </View>
                  <SkeletonBase delay={i * 60 + 150} style={{ width: 28, height: 28, borderRadius: 6, marginTop: 4 }} />
                </SkeletonCard>
              ))}

              <View style={styles.postitNote}>
                <Text style={styles.postitText}>Curating your personalized study schedule...</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (planState === 'error') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderHeader(name, navigation)}
        <View style={styles.centerContent}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconRow}>
              <View style={styles.errorIconCircle}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
            </View>
            <Text style={styles.errorHeading}>Couldn't build your plan</Text>
            <Text style={styles.errorMessage}>
              Check your connection and try again. Your academic schedule is safe; we just need a
              moment to reconnect to the library.
            </Text>
            <Pressable style={styles.retryButton} onPress={buildPlan}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (cadence === 'monthly') {
    return (
      <FadeIn>
        {renderMonthlyView(name, plan, handleDeletePlan, navigation, insets)}
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      {renderDailyWeeklyView(name, plan, selectedDayIndex, setSelectedDayIndex, completion, toggleBlock, handleDeletePlan, dayScale, navigation, insets)}
    </FadeIn>
  );
}

function renderHeader(name, navigation) {
  return (
    <View style={styles.header}>
      <Text style={styles.appTitle} numberOfLines={1}>StudyBuddy</Text>
      <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatar} hitSlop={spacing.sm}>
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      </Pressable>
    </View>
  );
}

function renderDailyWeeklyView(name, plan, selectedDayIndex, setSelectedDayIndex, completion, toggleBlock, handleDeletePlan, dayScale, navigation, insets) {
  const days = plan?.days || [];
  const currentDayBlocks = days[selectedDayIndex]?.blocks || [];
  const blockCount = currentDayBlocks.length;
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isToday = days[selectedDayIndex]?.day === todayName;
  const sessionWord = blockCount === 1 ? 'session' : 'sessions';
  const subtitle = isToday
    ? `You have ${blockCount} study ${sessionWord} scheduled for today.`
    : `${days[selectedDayIndex]?.day} — ${blockCount} study ${sessionWord}`;

  const totalMins = currentDayBlocks.reduce((sum, b) => sum + getBlockDuration(b), 0);
  const completedMins = currentDayBlocks.reduce((sum, b, i) =>
    completion[`${selectedDayIndex}-${i}`] ? sum + getBlockDuration(b) : sum, 0);
  const progressPct = totalMins > 0 ? (completedMins / totalMins) * 100 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderHeader(name, navigation)}

        <View style={styles.greetingSection}>
          <Text style={styles.greetingName}>Hi, {name}</Text>
          <Text style={styles.greetingSubtitle}>{subtitle}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow} contentContainerStyle={styles.dayRowContent}>
          {days.map((day, i) => {
            const dateNum = getDateForDay(day.day);
            return (
              <Pressable key={i} onPress={() => setSelectedDayIndex(i)}>
                <Animated.View style={[styles.dayPill, selectedDayIndex === i && styles.dayPillActive, selectedDayIndex === i && { transform: [{ scale: dayScale }] }]}>
                  <Text style={[styles.dayPillAbbr, selectedDayIndex === i && styles.dayPillAbbrActive]}>
                    {day.day.substring(0, 3).toUpperCase()}
                  </Text>
                  <Text style={[styles.dayPillDate, selectedDayIndex === i && styles.dayPillDateActive]}>
                    {dateNum || ''}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.progressCard}>
          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>Daily Progress</Text>
            <Text style={styles.progressText}>{completedMins} / {totalMins} mins focused</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>ON TRACK</Text>
            </View>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressCircleText}>{Math.round(progressPct)}%</Text>
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Schedule</Text>
          </View>
          <View style={styles.scheduleList}>
            {currentDayBlocks.map((block, i) => {
              const isDone = completion[`${selectedDayIndex}-${i}`];
              return (
                <View key={i} style={[styles.scheduleBlock, isDone && styles.scheduleBlockDone]}>
                  <View style={styles.blockLeft}>
                    <Text style={[styles.blockTime, isDone && styles.blockTimeDone]}>{formatTime(block.start)} — {formatTime(block.end)}</Text>
                    <Text style={[styles.blockSubject, isDone && styles.blockSubjectDone]}>{block.subject}</Text>
                    <Text style={styles.blockActivity}>{block.activity}</Text>
                  </View>
                  <Pressable onPress={() => toggleBlock(i)} style={styles.checkbox} hitSlop={8}>
                    {isDone ? (
                      <View style={styles.checkboxChecked}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.checkboxUnchecked} />
                    )}
                  </Pressable>
                </View>
              );
            })}
            {currentDayBlocks.length === 0 && (
              <Text style={styles.emptyDayText}>No study sessions scheduled for this day.</Text>
            )}
            <View style={styles.postitNote}>
              <Text style={styles.postitText}>Keep up the great work — every session adds up!</Text>
            </View>
          </View>
        </View>

        <View style={styles.deleteSection}>
          <Pressable onPress={handleDeletePlan} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete plan / start over</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function renderMonthlyView(name, plan, handleDeletePlan, navigation, insets) {
  const weeks = plan?.weeks || [];
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const monthName = today.toLocaleDateString('en-US', { month: 'long' });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.monthlyHeaderRow}>
          <View style={styles.monthlyHeaderLeft}>
            <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </Pressable>
            <View>
              <Text style={styles.monthlyGreeting}>Hi, {name}</Text>
              <Text style={styles.monthlyDate}>{dateStr}</Text>
            </View>
          </View>
        </View>

        <View style={styles.monthlyHeader}>
          <Text style={styles.monthlyTitle}>Monthly Focus</Text>
          <Text style={styles.monthlySub}>Strategic overview for {monthName} Academic Goals</Text>
        </View>

        <View style={styles.weekCardsContainer}>
          {weeks.map((week, i) => (
            <View key={i} style={[styles.weekCard, i >= weeks.length - 2 && styles.weekCardDim]}>
              <View style={styles.weekCardHeader}>
                <Text style={styles.weekTitle}>Week {week.week}</Text>
                <Text style={styles.weekDateRange}>{week.dateRange}</Text>
              </View>
              <View style={styles.focusList}>
                {(week.focus || []).map((item, j) => (
                  <View key={j} style={styles.focusItem}>
                    <View style={[styles.focusDot, { backgroundColor: getDotColor(j) }]} />
                    <View style={styles.focusInfo}>
                      <Text style={styles.focusSubject}>{item.subject}</Text>
                      {item.note ? <Text style={styles.focusNote}>{item.note}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.deleteSection}>
          <Pressable onPress={handleDeletePlan} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete plan / start over</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function getDotColor(index) {
  const dotColors = [colors.primary, colors.tertiary, colors.secondary];
  return dotColors[index % dotColors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 64,
  },
  appTitle: {
    flex: 1,
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80, 69, 59, 0.2)',
  },
  avatarText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  greetingText: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.primary,
  },
  monthlyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 80,
  },
  monthlyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthlyGreeting: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.primary,
  },
  monthlyDate: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: -2,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  ringWrapper: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  outerRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  innerRing: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.2,
  },
  loadingHeading: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  loadingSubtext: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    opacity: 0.8,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    borderTopWidth: 2,
    borderTopColor: `${CUSTOM_ERROR}30`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
  },
  errorIconRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${CUSTOM_ERROR}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: {
    fontSize: 28,
    fontFamily: fonts.bodyBold,
    color: CUSTOM_ERROR,
  },
  errorHeading: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  retryButton: {
    width: '100%',
    backgroundColor: colors.primaryContainer,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.onPrimaryContainer,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + 40,
  },
  greetingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  greetingName: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  greetingSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  dayRow: {
    marginBottom: spacing.lg,
  },
  dayRowContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dayPill: {
    width: 56,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillActive: {
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    backgroundColor: colors.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dayPillAbbr: {
    fontFamily: fonts.handwritten,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  dayPillAbbrActive: {
    color: colors.primaryContainer,
  },
  dayPillDate: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.onSurface,
  },
  dayPillDateActive: {
    color: colors.primary,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(80, 69, 59, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  progressContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  progressTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  progressBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.secondaryContainer,
    borderRadius: borderRadius.full,
  },
  progressBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.onSecondaryContainer,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  progressCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleText: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.primary,
  },
  scheduleSection: {
    paddingHorizontal: spacing.lg,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  scheduleTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.onSurface,
  },
  scheduleList: {
    gap: spacing.md,
  },
  scheduleBlock: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.outlineVariant,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  scheduleBlockDone: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryContainer,
  },
  blockLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  blockTime: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  blockTimeDone: {
    color: colors.primaryContainer,
  },
  blockSubject: {
    fontFamily: fonts.headingBold,
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: 2,
  },
  blockSubjectDone: {
    color: colors.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  blockActivity: {
    fontFamily: fonts.handwritten,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  checkboxUnchecked: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: colors.onPrimaryContainer,
    fontSize: 16,
    fontFamily: fonts.bodyBold,
  },
  emptyDayText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: spacing.xl,
    opacity: 0.6,
  },
  postitNote: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderTopWidth: 4,
    borderTopColor: colors.primaryContainer,
    maxWidth: 220,
    marginTop: spacing.md,
    transform: [{ rotate: '2deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  postitText: {
    fontFamily: fonts.handwritten,
    fontSize: 16,
    color: colors.primary,
    lineHeight: 20,
  },
  monthlyHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  monthlyTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  monthlySub: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  weekCardsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  weekCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(80, 69, 59, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  weekCardDim: {
    opacity: 0.6,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  weekTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.onSurface,
  },
  weekDateRange: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  focusList: {
    gap: spacing.md,
  },
  focusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  focusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  focusInfo: {
    flex: 1,
  },
  focusSubject: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  focusNote: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  deleteSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${CUSTOM_ERROR}15`,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: `${CUSTOM_ERROR}30`,
  },
  deleteButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: CUSTOM_ERROR,
    letterSpacing: 0.5,
  },
});
