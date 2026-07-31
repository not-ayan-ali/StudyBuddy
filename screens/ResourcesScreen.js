import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';
import { generateResources } from '../services/aiService';
import { getOnboardingData } from '../services/storageService';
import { SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonBase, FadeIn } from '../components/Skeleton';

const FILTERS = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'];

const TYPE_CONFIG = {
  video: {
    label: 'VIDEO',
    symbol: '\u25B6',
    color: colors.secondary,
    bgColor: colors.secondaryContainer,
  },
  notes: {
    label: 'NOTES',
    symbol: '\u2756',
    color: colors.tertiary,
    bgColor: colors.tertiaryContainer,
  },
  'past-paper': {
    label: 'PAST PAPER',
    symbol: '\u2713',
    color: colors.primary,
    bgColor: colors.primaryContainer,
  },
};

function LoadingDots() {
  const opacities = useRef([new Animated.Value(0.3), new Animated.Value(0.3), new Animated.Value(0.3)]).current;

  useEffect(() => {
    const animations = opacities.map((op, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(op, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {opacities.map((op, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: op }]} />
      ))}
    </View>
  );
}

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredResources = useMemo(() => {
    if (selectedFilter === 'All') return resources;
    return resources.filter((r) => r.subject === selectedFilter);
  }, [selectedFilter, resources]);

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const onboarding = await getOnboardingData();
      if (!onboarding) {
        setError('No class data found. Please complete onboarding first.');
        return;
      }
      const { studentClass, subjects } = onboarding;
      if (!studentClass || !subjects?.length) {
        setError('Missing class or subject information.');
        return;
      }

      const result = await generateResources(studentClass, subjects);
      console.log('Generated Resources:', result);
      setResources(result);
    } catch (e) {
      console.error('Error loading resources:', e);
      setError(e.message || 'Something went wrong while fetching resources.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenLink = useCallback(async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);


  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.loadingHeaderTitle}>Resources</Text>
        </View>
        <View style={styles.chipsRowWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
            {FILTERS.map((filter) => (
              <TouchableOpacity key={filter} style={[styles.chip, selectedFilter === filter && styles.chipActive]} onPress={() => setSelectedFilter(filter)} activeOpacity={0.7}>
                <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentCards}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} delay={i * 60} style={{ padding: spacing.lg, marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                <SkeletonAvatar size={48} delay={i * 60} />
                <SkeletonBase delay={i * 60} style={{ width: 80, height: 26, borderRadius: 4 }} />
              </View>
              <SkeletonText lines={1} width="85%" lineHeight={28} delay={i * 60 + 20} />
              <SkeletonText lines={1} width="60%" lineHeight={24} delay={i * 60 + 40} style={{ marginBottom: spacing.md }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.outlineVariant + '33', paddingTop: spacing.md }}>
                <SkeletonBase delay={i * 60} style={{ width: 70, height: 12, borderRadius: 2 }} />
                <SkeletonBase delay={i * 60} style={{ width: 50, height: 12, borderRadius: 2 }} />
              </View>
            </SkeletonCard>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Resources</Text>
          <Text style={styles.headerSubtitle}>
            Access your curated collection of lectures, research papers, and collaborative notes.
          </Text>
        </View>
        <View style={styles.chipsRowWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
            {FILTERS.map((filter) => (
              <TouchableOpacity key={filter} style={[styles.chip, selectedFilter === filter && styles.chipActive]} onPress={() => setSelectedFilter(filter)} activeOpacity={0.7}>
                <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Text style={styles.errorIcon}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Couldn't load resources</Text>
            <Text style={styles.errorSubtitle}>
              Your saved resources are safe — just couldn't fetch new ones right now. Check your connection.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadResources} activeOpacity={0.7}>
              <Text style={styles.retryButtonText}>RETRY</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorNote}>
            <Text style={styles.errorNoteText}>Pro tip: Try refreshing the app if this persists.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <FadeIn>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Resource Library</Text>
          <Text style={styles.headerSubtitle}>
            Access your curated collection of lectures, research papers, and collaborative notes.
          </Text>
        </View>
      </View>

      <View style={styles.chipsRowWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chipsContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, selectedFilter === filter && styles.chipActive]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedFilter === filter && styles.chipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={
          filteredResources.length === 0 ? styles.contentEmpty : styles.contentCards
        }
      >
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => {
            const config = TYPE_CONFIG[resource.type] || TYPE_CONFIG.notes;
            return (
              <TouchableOpacity
                key={resource.id}
                style={styles.card}
                onPress={() => handleOpenLink(resource.url)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.cardIcon, { backgroundColor: config.bgColor + '33' }]}>
                    <Text style={[styles.cardIconText, { color: config.color }]}>
                      {config.symbol}
                    </Text>
                  </View>
                  <View style={[styles.cardBadge, { borderColor: colors.outlineVariant + '4D' }]}>
                    <Text style={styles.cardBadgeText}>{resource.type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{resource.title}</Text>
                <Text style={styles.cardSubject}>{resource.subject}</Text>
                <View style={[styles.cardFooter, { borderTopColor: colors.outlineVariant + '33' }]}>
                  <Text style={[styles.cardFooterLabel, { color: config.color }]}>
                    {config.label}
                  </Text>
                  <Text style={styles.cardFooterDate}>
                    {resource.subject.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <View style={styles.emptyIconShadow} />
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconSymbol}>{'\uD83D\uDCD6'}</Text>
              </View>
            </View>
            <Text style={styles.emptyTitle}>No resources found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different subject or filter. Your academic materials will appear here once added.
            </Text>
            <View style={styles.emptyNote}>
              <Text style={styles.emptyNoteText}>
                "Maybe check the Physics archive? I remember seeing a set of lecture notes there earlier this week."
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  loadingHeaderTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  chipsRow: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '4D',
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  chipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: colors.onPrimaryContainer,
  },
  content: {
    flex: 1,
  },
  contentCards: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  contentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '33',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 20,
  },
  cardTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 20,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  cardSubject: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  cardFooterLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  cardFooterDate: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.onSurfaceVariant,
  },
  cardBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cardBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  chipsRowWrapper: {
    marginBottom: spacing.lg,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.primary + '66',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  refreshBtnLoading: {
    opacity: 0.6,
    backgroundColor: colors.primaryContainer,
  },
  refreshBtnText: {
    fontSize: 20,
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },
  loadingCard: {
    backgroundColor: colors.surfaceContainerHigh,
    width: '100%',
    maxWidth: 360,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  loadingTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  loadingSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  loadingNote: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    alignSelf: 'flex-end',
    maxWidth: 180,
    transform: [{ rotate: '-2deg' }],
  },
  loadingNoteText: {
    fontFamily: fonts.handwritten,
    fontSize: 18,
    color: colors.primary,
  },
  loadingStatus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.outline,
    textTransform: 'uppercase',
    marginTop: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },
  errorCard: {
    backgroundColor: colors.surfaceContainer,
    width: '100%',
    maxWidth: 360,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorContainer + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  errorIcon: {
    fontSize: 36,
    color: colors.error,
    fontWeight: '700',
  },
  errorTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.onPrimary,
    textTransform: 'uppercase',
  },
  errorNote: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
    maxWidth: 220,
    transform: [{ rotate: '-2deg' }],
  },
  errorNoteText: {
    fontFamily: fonts.handwritten,
    fontSize: 18,
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIconWrapper: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  emptyIconShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 96,
    height: 96,
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.xl,
    transform: [{ rotate: '3deg' }],
    opacity: 0.5,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '1A',
  },
  emptyIconSymbol: {
    fontSize: 40,
    color: colors.onSurfaceVariant,
  },
  emptyTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  emptyNote: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyNoteText: {
    fontFamily: fonts.handwritten,
    fontSize: 18,
    color: colors.onSecondaryContainer,
    transform: [{ rotate: '-1deg' }],
    lineHeight: 24,
  },
});
