import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';

export default function OnboardingStep3({ navigation, route }) {
  const [tuitions, setTuitions] = useState([]);

  const addTuition = () => {
    setTuitions([...tuitions, { subject: '', start: '', startAmPm: 'PM', end: '', endAmPm: 'PM' }]);
  };

  const updateTuition = (index, field, value) => {
    const updated = [...tuitions];
    updated[index][field] = value;
    setTuitions(updated);
  };

  const removeTuition = (index) => {
    setTuitions(tuitions.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const formattedTuitions = tuitions.filter(t => t.subject).map(t => ({
      subject: t.subject,
      start: `${t.start.trim()} ${t.startAmPm}`,
      end: `${t.end.trim()} ${t.endAmPm}`
    }));
    const data = { ...(route.params?.data || {}), tuitions: formattedTuitions };
    navigation.navigate('Onboarding4', { data });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepIndicator}>STEP 03 / 05</Text>
      <View style={styles.headerSection}>
        <Text style={styles.heading}>Any tuition or academy classes?</Text>
        <Text style={styles.subtitle}>Optional — add as many as you need.</Text>
      </View>
      {tuitions.map((tuit, index) => (
        <View key={index} style={styles.tuitionRow}>
          <TouchableOpacity style={styles.closeButton} onPress={() => removeTuition(index)}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SUBJECT</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Physics"
              placeholderTextColor={colors.outlineVariant}
              value={tuit.subject}
              onChangeText={v => updateTuition(index, 'subject', v)}
            />
            <View style={styles.fieldUnderline} />
          </View>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>STARTS</Text>
              <View style={styles.inputWithToggle}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  placeholder="06:00"
                  placeholderTextColor={colors.outlineVariant}
                  value={tuit.start}
                  onChangeText={v => updateTuition(index, 'start', v)}
                />
                <View style={styles.amPmToggle}>
                  <TouchableOpacity onPress={() => updateTuition(index, 'startAmPm', 'AM')} style={[styles.toggleBtn, tuit.startAmPm === 'AM' && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleBtnText, tuit.startAmPm === 'AM' && styles.toggleBtnTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateTuition(index, 'startAmPm', 'PM')} style={[styles.toggleBtn, tuit.startAmPm === 'PM' && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleBtnText, tuit.startAmPm === 'PM' && styles.toggleBtnTextActive]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.fieldUnderline} />
            </View>
            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>ENDS</Text>
              <View style={styles.inputWithToggle}>
                <TextInput
                  style={[styles.fieldInput, { flex: 1 }]}
                  placeholder="08:00"
                  placeholderTextColor={colors.outlineVariant}
                  value={tuit.end}
                  onChangeText={v => updateTuition(index, 'end', v)}
                />
                <View style={styles.amPmToggle}>
                  <TouchableOpacity onPress={() => updateTuition(index, 'endAmPm', 'AM')} style={[styles.toggleBtn, tuit.endAmPm === 'AM' && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleBtnText, tuit.endAmPm === 'AM' && styles.toggleBtnTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => updateTuition(index, 'endAmPm', 'PM')} style={[styles.toggleBtn, tuit.endAmPm === 'PM' && styles.toggleBtnActive]}>
                    <Text style={[styles.toggleBtnText, tuit.endAmPm === 'PM' && styles.toggleBtnTextActive]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.fieldUnderline} />
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addTuition}>
        <Text style={styles.addIcon}>+</Text>
        <Text style={styles.addButtonText}> Add tuition</Text>
      </TouchableOpacity>
      <View style={styles.postit}>
        <Text style={styles.postitText}>
          Tuition times are automatically excluded from your "Focus Blocks" to prevent scheduling conflicts.
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body, fontSize: 15, color: colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  tuitionRow: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { fontSize: 16, color: colors.onSurfaceVariant },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold, fontSize: 10, color: colors.primary,
    marginBottom: 2, letterSpacing: 1,
  },
  fieldInput: {
    fontFamily: fonts.body, fontSize: 16, color: colors.onSurface,
    padding: 0, margin: 0, paddingVertical: spacing.xs,
  },
  fieldUnderline: { height: 1, backgroundColor: colors.outlineVariant, marginTop: 2 },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  timeField: { flex: 1 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed',
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.xl,
  },
  addIcon: { fontSize: 18, color: colors.primary, fontFamily: fonts.bodyBold },
  addButtonText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.primary },
  postit: {
    backgroundColor: colors.surfaceContainerHigh,
    borderTopWidth: 3, borderTopColor: colors.primary,
    padding: spacing.md, borderRadius: borderRadius.sm,
    transform: [{ rotate: '-1deg' }],
    alignSelf: 'flex-start', maxWidth: '85%',
    marginBottom: spacing.lg,
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
    flex: 6, height: 48, backgroundColor: colors.primaryContainer,
    borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.bodyBold, fontSize: 12, color: colors.onPrimaryContainer,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  inputWithToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  amPmToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  toggleBtnTextActive: {
    color: colors.onPrimary,
  },
});
