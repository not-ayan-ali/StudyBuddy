import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';

export default function OnboardingStep1({ navigation, route }) {
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolStartAmPm, setSchoolStartAmPm] = useState('AM');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [schoolEndAmPm, setSchoolEndAmPm] = useState('PM');

  const handleNext = () => {
    if (!schoolStart.trim() || !schoolEnd.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Required: Please enter both school start and end times.');
      } else {
        Alert.alert('Required', 'Please enter both school start and end times.');
      }
      return;
    }
    const fullSchoolStart = `${schoolStart.trim()} ${schoolStartAmPm}`;
    const fullSchoolEnd = `${schoolEnd.trim()} ${schoolEndAmPm}`;
    const data = { ...(route.params?.data || {}), schoolStart: fullSchoolStart, schoolEnd: fullSchoolEnd };
    navigation.navigate('Onboarding2', { data });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepIndicator}>STEP 01 / 05</Text>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>When are you in class?</Text>
        <Text style={styles.subtitle}>We'll build your study plan around your fixed school hours.</Text>
      </View>
      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SCHOOL STARTS</Text>
          <View style={styles.inputRow}>
            <Text style={styles.clockIcon}>🕐</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              placeholderTextColor={colors.outlineVariant}
              value={schoolStart}
              onChangeText={setSchoolStart}
            />
            <View style={styles.amPmToggle}>
              <TouchableOpacity onPress={() => setSchoolStartAmPm('AM')} style={[styles.toggleBtn, schoolStartAmPm === 'AM' && styles.toggleBtnActive]}>
                <Text style={[styles.toggleBtnText, schoolStartAmPm === 'AM' && styles.toggleBtnTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSchoolStartAmPm('PM')} style={[styles.toggleBtn, schoolStartAmPm === 'PM' && styles.toggleBtnActive]}>
                <Text style={[styles.toggleBtnText, schoolStartAmPm === 'PM' && styles.toggleBtnTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.underline} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SCHOOL ENDS</Text>
          <View style={styles.inputRow}>
            <Text style={styles.clockIcon}>⏳</Text>
            <TextInput
              style={styles.input}
              placeholder="03:30"
              placeholderTextColor={colors.outlineVariant}
              value={schoolEnd}
              onChangeText={setSchoolEnd}
            />
            <View style={styles.amPmToggle}>
              <TouchableOpacity onPress={() => setSchoolEndAmPm('AM')} style={[styles.toggleBtn, schoolEndAmPm === 'AM' && styles.toggleBtnActive]}>
                <Text style={[styles.toggleBtnText, schoolEndAmPm === 'AM' && styles.toggleBtnTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSchoolEndAmPm('PM')} style={[styles.toggleBtn, schoolEndAmPm === 'PM' && styles.toggleBtnActive]}>
                <Text style={[styles.toggleBtnText, schoolEndAmPm === 'PM' && styles.toggleBtnTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.underline} />
        </View>
      </View>
      <View style={styles.postit}>
        <Text style={styles.postitText}>
          Don't worry about lunch breaks or commuting yet, we'll refine those details in the next steps.
        </Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body, fontSize: 16, color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}20`,
  },
  inputGroup: { marginBottom: spacing.xl },
  label: {
    fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.onSurfaceVariant,
    letterSpacing: 1.5, marginBottom: spacing.xs,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  clockIcon: { fontSize: 20, color: colors.onSurfaceVariant },
  input: {
    flex: 1, fontFamily: fonts.body, fontSize: 18, color: colors.onSurface,
    padding: 0, margin: 0,
  },
  underline: { height: 1, backgroundColor: colors.outlineVariant },
  postit: {
    backgroundColor: colors.surfaceContainer,
    borderTopWidth: 3, borderTopColor: colors.primaryContainer,
    padding: spacing.md, borderRadius: borderRadius.sm,
    transform: [{ rotate: '-1deg' }],
    marginTop: spacing.lg, marginBottom: spacing.lg,
    alignSelf: 'flex-start', maxWidth: '85%',
  },
  postitText: {
    fontFamily: fonts.handwritten, fontSize: 16, color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  buttons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  backButton: {
    flex: 4, height: 48, borderWidth: 1, borderColor: colors.tertiary,
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.tertiary,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  button: {
    flex: 6, height: 48, backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodyBold, fontSize: 12, color: colors.onPrimaryContainer,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  amPmToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  toggleBtnTextActive: {
    color: colors.onPrimary,
  },
});
