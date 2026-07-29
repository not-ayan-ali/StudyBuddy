import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts, spacing } from '../theme/tokens';

export default function AnimatedSplash({ onReady }) {
  const pulse = useSharedValue(0.92);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.92, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.sin) });

    if (onReady) {
      onReady();
    }
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrapper, iconStyle]}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.Text style={[styles.title, titleStyle]}>StudyBuddy</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 32,
    overflow: 'hidden',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.primary,
    letterSpacing: -0.5,
  },
});
