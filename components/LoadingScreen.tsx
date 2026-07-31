import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import AnimatedBookIcon from './AnimatedBookIcon';

type Props = {
  appName?: string;
};

export default function LoadingScreen({ appName = 'StudyBuddy' }: Props) {
  const [showLabel, setShowLabel] = useState(false);

  return (
    <View style={styles.container}>
      <AnimatedBookIcon size={160} onDrawComplete={() => setShowLabel(true)} loop />
      {showLabel && (
        <Animated.Text entering={FadeIn.duration(400)} style={styles.label}>
          {appName}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14100E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 20,
    color: '#E8A854',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
