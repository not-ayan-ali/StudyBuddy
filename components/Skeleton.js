import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fonts } from '../theme/tokens';

export function SkeletonBase({ style, delay = 0, children }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let timeoutId;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ])
    );

    if (delay > 0) {
      timeoutId = setTimeout(() => {
        animation.start();
      }, delay);
    } else {
      animation.start();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      animation.stop();
    };
  }, [anim, delay]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceContainerHigh, '#393430'],
  });

  return (
    <Animated.View style={[{ backgroundColor }, style]}>
      {children}
    </Animated.View>
  );
}

export function SkeletonText({ lines = 1, width = '85%', lineHeight = 32, style, delay = 0 }) {
  const getLineWidth = (index) => {
    if (Array.isArray(width)) {
      return width[index % width.length];
    }
    if (lines === 1) return width;
    const variations = [85, 72, 90, 78, 80];
    const val = variations[(index + Math.floor(Math.random() * 3)) % variations.length];
    return `${val}%`;
  };

  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={[styles.textLineWrapper, { height: lineHeight }]}>
          <SkeletonBase
            delay={delay + index * 50}
            style={[
              styles.textLine,
              { width: getLineWidth(index) }
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export function SkeletonCard({ style, children, delay = 0 }) {
  return (
    <SkeletonBase
      delay={delay}
      style={[styles.card, style]}
    >
      {children}
    </SkeletonBase>
  );
}

export function SkeletonAvatar({ size = 48, style, delay = 0 }) {
  return (
    <SkeletonBase
      delay={delay}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

export function SkeletonListItem({ style, delay = 0 }) {
  return (
    <View style={[styles.listItem, style]}>
      <SkeletonText lines={1} width="75%" delay={delay} />
      <View style={styles.divider} />
    </View>
  );
}

export function SkeletonPostIt({ style, children }) {
  // Static placeholder (no animation) to retain non-digital, handwritten feel
  return (
    <View style={[styles.postIt, style]}>
      {children || <Text style={styles.postItText}>...</Text>}
    </View>
  );
}

export function FadeIn({ children, duration = 200, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity, flex: 1 }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '33',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    width: '100%',
  },
  textLineWrapper: {
    justifyContent: 'center',
  },
  textLine: {
    height: 2,
    borderRadius: 1,
  },
  avatar: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  listItem: {
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant + '33',
    marginTop: spacing.sm,
  },
  postIt: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderTopWidth: 4,
    borderTopColor: colors.primaryContainer,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  postItText: {
    fontFamily: fonts.handwritten,
    fontSize: 16,
    color: colors.primary,
  },
});
