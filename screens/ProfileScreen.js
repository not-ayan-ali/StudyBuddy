import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, TextInput, Alert } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';
import { getStudentName, saveStudentName, getOnboardingData, saveOnboardingData } from '../services/storageService';

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalClass, setOriginalClass] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const savedName = await getStudentName();
      const onboarding = await getOnboardingData();
      setName(savedName || '');
      setOriginalName(savedName || '');
      setStudentClass(onboarding?.studentClass || '');
      setOriginalClass(onboarding?.studentClass || '');
    }
    loadProfile();
  }, []);

  const handleSave = useCallback(async () => {
    try {
      if (name !== originalName) {
        await saveStudentName(name);
      }
      if (studentClass !== originalClass) {
        const onboarding = await getOnboardingData();
        await saveOnboardingData({ ...onboarding, studentClass });
      }
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save profile:', e);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  }, [name, studentClass, originalName, originalClass, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={spacing.sm}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Class</Text>
        <TextInput
          style={styles.input}
          value={studentClass}
          onChangeText={setStudentClass}
          placeholder="e.g., 10th Grade, FSc Part I"
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDim,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 64,
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  backButton: {
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.primary,
  },
  headerTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.onSurface,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurface,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  saveButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onPrimary,
  },
  profileText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.onSurface,
  },
});