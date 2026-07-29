import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';
import { saveStudentName, getOnboardingData } from '../services/storageService';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');

  const handleContinue = async () => {
    if (!name.trim()) return;
    await saveStudentName(name.trim());
    const onboardingData = await getOnboardingData();
    if (onboardingData) {
      navigation.replace('Main');
    } else {
      navigation.replace('Onboarding1');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.schoolIcon}>🎓</Text>
        <Text style={styles.heading}>StudyBuddy</Text>
        <Text style={styles.subtitle}>Your AI study planner</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>YOUR NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name to begin..."
          placeholderTextColor={colors.outlineVariant}
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={handleContinue}
        />

        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>
            "An investment in knowledge always pays the best interest."
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Academic Focus</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  schoolIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 34,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.onSurface,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  quoteContainer: {
    alignItems: 'center',
    opacity: 0.4,
    marginTop: spacing.xl,
  },
  quote: {
    fontFamily: fonts.handwritten,
    fontSize: 20,
    color: colors.onSurface,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    gap: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.onPrimary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    height: 1,
    width: 48,
    backgroundColor: colors.outlineVariant,
  },
  dividerText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.outline,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
