import React, { useEffect } from 'react';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

// Large enough to cover the full length of every path below.
const DASH_LENGTH = 1200;

const COLORS = {
  book: '#E8A854',
  check: '#9CAF88',
};

type Props = {
  size?: number;
  onDrawComplete?: () => void;
  loop?: boolean; // breathing pulse once fully drawn
};

export default function AnimatedBookIcon({
  size = 160,
  onDrawComplete,
  loop = true,
}: Props) {
  // one shared progress value per stroke group, all driven 1200 -> 0
  const outlineOffset = useSharedValue(DASH_LENGTH);
  const spineOffset = useSharedValue(DASH_LENGTH);
  const line1Offset = useSharedValue(DASH_LENGTH);
  const line2Offset = useSharedValue(DASH_LENGTH);
  const line3Offset = useSharedValue(DASH_LENGTH);
  const checkOffset = useSharedValue(DASH_LENGTH);
  const checkScale = useSharedValue(0.85);
  const groupOpacity = useSharedValue(1);

  useEffect(() => {
    const drawEase = Easing.out(Easing.cubic);

    // 1. Book outline draws in (0 -> 600ms)
    outlineOffset.value = withTiming(0, { duration: 600, easing: drawEase });
    spineOffset.value = withDelay(
      450,
      withTiming(0, { duration: 250, easing: drawEase }),
    );

    // 2. Three lines draw in, staggered ~100ms apart, starting after outline
    line1Offset.value = withDelay(700, withTiming(0, { duration: 220, easing: drawEase }));
    line2Offset.value = withDelay(800, withTiming(0, { duration: 220, easing: drawEase }));
    line3Offset.value = withDelay(900, withTiming(0, { duration: 220, easing: drawEase }));

    // 3. Checkmark draws in with a small bounce/pop at the end
    checkOffset.value = withDelay(1100, withTiming(0, { duration: 300, easing: drawEase }));
    checkScale.value = withDelay(
      1100,
      withSequence(
        withTiming(1.15, { duration: 220, easing: Easing.out(Easing.back(2)) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) }, (finished) => {
          if (finished && onDrawComplete) runOnJS(onDrawComplete)();
        }),
      ),
    );

    // 4. Breathing pulse loop once the draw-in has finished
    if (loop) {
      groupOpacity.value = withDelay(
        1600,
        withRepeat(
          withSequence(
            withTiming(0.5, { duration: 750, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        ),
      );
    }
  }, []);

  const outlineProps = useAnimatedProps(() => ({
    strokeDashoffset: outlineOffset.value,
  }));
  const spineProps = useAnimatedProps(() => ({
    strokeDashoffset: spineOffset.value,
  }));
  const line1Props = useAnimatedProps(() => ({ strokeDashoffset: line1Offset.value }));
  const line2Props = useAnimatedProps(() => ({ strokeDashoffset: line2Offset.value }));
  const line3Props = useAnimatedProps(() => ({ strokeDashoffset: line3Offset.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: checkOffset.value }));

  // Checkmark center is ~ (135, 122) in the 200x220 viewBox — scale around that point.
  const checkGroupProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 135 },
      { translateY: 122 },
      { scale: checkScale.value },
      { translateX: -135 },
      { translateY: -122 },
    ] as any,
  }));

  const groupStyle = useAnimatedStyle(() => ({
    opacity: groupOpacity.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, groupStyle]}>
      <Svg width={size} height={size} viewBox="0 0 200 220" fill="none">
        {/* Book outline */}
        <AnimatedPath
          d="M40,55 Q70,45 100,85 Q130,45 160,55 L165,140 Q165,155 150,158 Q125,162 100,180 Q75,162 50,158 Q35,155 35,140 Z"
          stroke={COLORS.book}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={DASH_LENGTH}
          animatedProps={outlineProps}
        />
        {/* Spine crease */}
        <AnimatedPath
          d="M100,85 L100,180"
          stroke={COLORS.book}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={DASH_LENGTH}
          animatedProps={spineProps}
        />
        {/* Left page lines */}
        <AnimatedPath
          d="M55,100 L90,100"
          stroke={COLORS.book}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={DASH_LENGTH}
          animatedProps={line1Props}
        />
        <AnimatedPath
          d="M55,120 L90,120"
          stroke={COLORS.book}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={DASH_LENGTH}
          animatedProps={line2Props}
        />
        <AnimatedPath
          d="M55,140 L90,140"
          stroke={COLORS.book}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={DASH_LENGTH}
          animatedProps={line3Props}
        />
        {/* Checkmark on right page */}
        <AnimatedG animatedProps={checkGroupProps as any}>
          <AnimatedPath
            d="M115,122 L130,137 L155,107"
            stroke={COLORS.check}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={DASH_LENGTH}
            animatedProps={checkProps}
          />
        </AnimatedG>
        {/* Bookmark ribbon */}
        <Path
          d="M90,178 L90,212 L100,201 L110,212 L110,178"
          stroke={COLORS.book}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
