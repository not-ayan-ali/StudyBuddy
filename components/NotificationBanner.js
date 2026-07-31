import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../theme/tokens';

const NotificationContext = createContext(null);

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const show = useCallback((message, type = 'error', duration = 4000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotification({ message, type });
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotification(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ show, dismiss, notification }}>
      {children}
      {notification && <NotificationBanner notification={notification} onDismiss={dismiss} />}
    </NotificationContext.Provider>
  );
}

function NotificationBanner({ notification, onDismiss }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 100, duration: 200, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  const icon = notification.type === 'error' ? 'error-outline' : notification.type === 'warning' ? 'warning-amber' : 'info-outline';
  const bgColor = notification.type === 'error' ? '#93000a' : notification.type === 'warning' ? '#5b3912' : '#3d4b37';

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: bgColor,
          paddingBottom: insets.bottom + spacing.md,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.bannerContent}>
        <MaterialIcons name={icon} size={20} color="#fff" />
        <Text style={styles.bannerText}>{notification.message}</Text>
      </View>
      <Pressable onPress={handleDismiss} hitSlop={8}>
        <MaterialIcons name="close" size={20} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 9999,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
    gap: spacing.sm,
  },
  bannerText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#fff',
    flex: 1,
    lineHeight: 20,
  },
});
