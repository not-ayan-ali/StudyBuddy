import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';

const CLASSES = [
  { label: 'Matric 9th', value: '9th' },
  { label: 'Matric 10th', value: '10th' },
  { label: 'Inter 11th', value: '11th' },
  { label: 'Inter 12th', value: '12th' },
];
const ALL_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Urdu', 'Computer Science', 'Pakistan Studies', 'Islamiyat'];

export default function OnboardingStep2({ navigation, route }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const toggleSubject = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleNext = () => {
    if (!selectedClass || selectedSubjects.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Required: Please select your class and at least one subject.');
      } else {
        Alert.alert('Required', 'Please select your class and at least one subject.');
      }
      return;
    }
    const data = { ...(route.params?.data || {}), studentClass: selectedClass, subjects: selectedSubjects };
    navigation.navigate('Onboarding3', { data });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepIndicator}>STEP 02 / 05</Text>
      <Text style={styles.heading}>Class & Subjects</Text>
      <Text style={styles.sectionLabel}>Select your class</Text>
      <View style={styles.classRow}>
        {CLASSES.map(cls => (
          <TouchableOpacity
            key={cls.value}
            style={[styles.chip, selectedClass === cls.value && styles.chipSelected]}
            onPress={() => setSelectedClass(cls.value)}
          >
            <Text style={[styles.chipText, selectedClass === cls.value && styles.chipTextSelected]}>
              {cls.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionLabel}>Select your subjects</Text>
      {ALL_SUBJECTS.map(subject => (
        <TouchableOpacity
          key={subject}
          style={[styles.subjectRow, selectedSubjects.includes(subject) && styles.subjectRowSelected]}
          onPress={() => toggleSubject(subject)}
        >
          <View style={[styles.checkbox, selectedSubjects.includes(subject) && styles.checkboxSelected]}>
            {selectedSubjects.includes(subject) && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.subjectText, selectedSubjects.includes(subject) && styles.subjectTextSelected]}>
            {subject}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, (!selectedClass || selectedSubjects.length === 0) && styles.buttonDisabled]}
          onPress={handleNext}
        >
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
  heading: {
    fontFamily: fonts.headingBold, fontSize: 28, color: colors.onSurface,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.body, fontSize: 16, color: colors.onSurfaceVariant,
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  classRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}20` },
  chipText: { fontFamily: fonts.body, color: colors.onSurfaceVariant },
  chipTextSelected: { color: colors.primary, fontFamily: fonts.bodySemiBold },
  subjectRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
  },
  subjectRowSelected: { backgroundColor: `${colors.primary}10` },
  checkbox: {
    width: 22, height: 22, borderRadius: borderRadius.sm, borderWidth: 1.5,
    borderColor: colors.outlineVariant, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkmark: { fontFamily: fonts.bodyBold, color: colors.onPrimary, fontSize: 14 },
  subjectText: { fontFamily: fonts.body, fontSize: 16, color: colors.onSurface },
  subjectTextSelected: { color: colors.primary, fontFamily: fonts.bodySemiBold },
  buttons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
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
  buttonDisabled: { opacity: 0.4 },
  buttonText: {
    fontFamily: fonts.bodyBold, fontSize: 12, color: colors.onPrimaryContainer,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
});
