import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';
import { saveOnboardingData, saveStudentName } from '../services/storageService';

const ALL_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Urdu', 'Computer Science', 'Pakistan Studies', 'Islamiyat'];
const TIMES = [
  { key: 'Morning', icon: '☀️' },
  { key: 'Evening', icon: '🌆' },
  { key: 'Night', icon: '🌙' },
];

export default function OnboardingStep5({ navigation, route }) {
  const [weakSubjects, setWeakSubjects] = useState([]);
  const [preferredTime, setPreferredTime] = useState(null);

  const toggleWeak = (subject) => {
    setWeakSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleGenerate = async () => {
    const existingData = route.params?.data || {};
    const fullData = { ...existingData, weakSubjects, preferredTime };
    if (fullData.name) {
      await saveStudentName(fullData.name);
    }
    await saveOnboardingData(fullData);
    navigation.replace('Main');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepIndicator}>STEP 05 / 05</Text>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>Last few things</Text>
        <Text style={styles.subtitle}>Both optional — skip if you're not sure yet.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Any subjects you're struggling with?</Text>
        <View style={styles.weakRow}>
          {ALL_SUBJECTS.map(subject => {
            const isWeak = weakSubjects.includes(subject);
            return (
              <TouchableOpacity
                key={subject}
                style={[styles.weakChip, isWeak && styles.weakChipSelected]}
                onPress={() => toggleWeak(subject)}
              >
                <Text style={[styles.weakChipText, isWeak && styles.weakChipTextSelected]}>
                  {subject}
                </Text>
                {isWeak && <View style={styles.weakDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>When do you focus best?</Text>
        <View style={styles.timeGrid}>
          {TIMES.map(item => {
            const isActive = preferredTime === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.timeCard, isActive && styles.timeCardSelected]}
                onPress={() => setPreferredTime(item.key)}
              >
                <Text style={[styles.timeIcon, isActive && styles.timeIconSelected]}>
                  {item.icon}
                </Text>
                <Text style={[styles.timeLabel, isActive && styles.timeLabelSelected]}>
                  {item.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.postit}>
        <Text style={styles.postitText}>
          I've always found that the quiet of the night helps me dive deeper into complex topics without distraction.
        </Text>
        <Text style={styles.postitAttribution}>— Sample Insight</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Text style={styles.generateIcon}>✨</Text>
          <Text style={styles.generateButtonText}> Generate my plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceDim },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  stepIndicator: {
    fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary,
    marginBottom: spacing.lg, letterSpacing: 2,
  },
  headerSection: { marginBottom: spacing.xl },
  heading: {
    fontFamily: fonts.headingBold, fontSize: 28, color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body, fontSize: 15, color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.onSurfaceVariant,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.md,
  },
  weakRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  weakChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: 'transparent',
    gap: spacing.xs,
  },
  weakChipSelected: {
    borderColor: '#C1613F',
    backgroundColor: `${colors.error}08`,
  },
  weakChipText: {
    fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.onSurface,
  },
  weakChipTextSelected: { color: '#C1613F' },
  weakDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#C1613F',
  },
  timeGrid: { flexDirection: 'row', gap: spacing.sm },
  timeCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: 'transparent',
    gap: spacing.sm,
  },
  timeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  timeIcon: { fontSize: 28 },
  timeIconSelected: { color: colors.primary },
  timeLabel: {
    fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.onSurface,
    letterSpacing: 0.5,
  },
  timeLabelSelected: { color: colors.primary },
  postit: {
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 3, borderTopColor: colors.primary,
    padding: spacing.md, borderRadius: borderRadius.sm,
    transform: [{ rotate: '-0.5deg' }],
    alignSelf: 'flex-start', maxWidth: '85%',
    marginTop: spacing.md, marginBottom: spacing.xl,
  },
  postitText: {
    fontFamily: fonts.handwritten, fontSize: 15, color: colors.onSurfaceVariant,
  },
  postitAttribution: {
    fontFamily: fonts.bodySemiBold, fontSize: 9, color: colors.primary,
    opacity: 0.6, marginTop: spacing.xs, letterSpacing: 0.5,
  },
  buttons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  backButton: {
    flex: 4, height: 48, borderWidth: 1, borderColor: colors.tertiary,
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.tertiary,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  generateButton: {
    flex: 6, height: 48, backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row',
  },
  generateIcon: { fontSize: 16 },
  generateButtonText: {
    fontFamily: fonts.bodyBold, fontSize: 12, color: colors.onPrimaryContainer,
    letterSpacing: 1, textTransform: 'uppercase',
  },
});
