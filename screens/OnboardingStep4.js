import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';

const CADENCES = [
  {
    key: 'daily', label: 'Daily',
    description: 'A fresh plan for just today',
    icon: '📅',
  },
  {
    key: 'weekly', label: 'Weekly',
    description: 'A full week mapped out, the recommended default',
    icon: '📋', recommended: true,
  },
  {
    key: 'monthly', label: 'Monthly',
    description: 'A broader view, focus areas instead of hours',
    icon: '🗓️',
  },
];

export default function OnboardingStep4({ navigation, route }) {
  const [selected, setSelected] = useState('weekly');

  const handleNext = () => {
    const data = { ...(route.params?.data || {}), cadence: selected };
    navigation.navigate('Onboarding5', { data });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepIndicator}>STEP 04 / 05</Text>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>How often should we plan?</Text>
        <Text style={styles.subtitle}>You can regenerate this anytime from your Home screen.</Text>
      </View>
      {CADENCES.map(item => {
        const isSelected = selected === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => setSelected(item.key)}
            activeOpacity={0.8}
          >
            {item.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <Text style={[styles.cardIcon, isSelected && styles.cardIconSelected]}>{item.icon}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {item.label}
                </Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={styles.postit}>
        <Text style={styles.postitText}>
          Weekly planning is statistically shown to reduce decision fatigue by 40%.
        </Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next →</Text>
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
  },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    position: 'relative',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLow,
  },
  recommendedBadge: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  recommendedBadgeText: {
    fontFamily: fonts.bodyBold, fontSize: 10, color: colors.primary,
    letterSpacing: 1,
  },
  cardContent: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, gap: spacing.md,
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  iconContainerSelected: { backgroundColor: `${colors.primaryContainer}30` },
  cardIcon: { fontSize: 24 },
  cardIconSelected: { color: colors.primary },
  cardText: { flex: 1 },
  cardLabel: {
    fontFamily: fonts.heading, fontSize: 18, color: colors.onSurface,
    marginBottom: 2,
  },
  cardLabelSelected: { color: colors.primary },
  cardDescription: {
    fontFamily: fonts.body, fontSize: 13, color: colors.onSurfaceVariant,
  },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleSelected: {
    borderColor: colors.primary, backgroundColor: colors.primary,
  },
  checkMark: {
    fontFamily: fonts.bodyBold, fontSize: 13, color: colors.onPrimary,
  },
  postit: {
    backgroundColor: colors.surfaceContainer,
    borderTopWidth: 3, borderTopColor: colors.primary,
    padding: spacing.md, borderRadius: borderRadius.sm,
    transform: [{ rotate: '-2deg' }],
    alignSelf: 'flex-start', maxWidth: '80%',
    marginTop: spacing.md, marginBottom: spacing.xl,
  },
  postitText: {
    fontFamily: fonts.handwritten, fontSize: 15, color: colors.onSurface,
    opacity: 0.9,
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
  button: {
    flex: 6, height: 48, backgroundColor: colors.primary,
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodyBold, fontSize: 12, color: colors.onPrimary,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
});
