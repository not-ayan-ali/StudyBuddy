import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCallback, useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Literata_400Regular, Literata_700Bold } from '@expo-google-fonts/literata';
import { SourceSans3_400Regular, SourceSans3_600SemiBold, SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3';
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';

import { getOnboardingData } from './services/storageService';
import { colors, fonts } from './theme/tokens';
import { NotificationProvider } from './components/NotificationBanner';
import LoadingScreen from './components/LoadingScreen';

import LoginScreen from './screens/LoginScreen';
import OnboardingStep1 from './screens/OnboardingStep1';
import OnboardingStep2 from './screens/OnboardingStep2';
import OnboardingStep3 from './screens/OnboardingStep3';
import OnboardingStep4 from './screens/OnboardingStep4';
import OnboardingStep5 from './screens/OnboardingStep5';
import HomeScreen from './screens/HomeScreen';
import TutorScreen from './screens/TutorScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surfaceContainer, borderTopColor: colors.outlineVariant, paddingTop: 6 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: fonts.bodySemiBold, fontSize: 11, marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tutor"
        component={TutorScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="school" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');
  const hasPrepared = useRef(false);

  const [fontsLoaded, fontError] = useFonts({
    Literata_400Regular,
    Literata_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
    Caveat_400Regular,
    Caveat_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (hasPrepared.current) return;
      hasPrepared.current = true;
      try {
        const data = await getOnboardingData();
        if (data) {
          setInitialRoute('Main');
        }
      } catch {
        // ignore
      } finally {
        // Ensure minimum display time so the draw-in animation isn't cut off
        await new Promise((resolve) => setTimeout(resolve, 1800));
        setAppIsReady(true);
      }
    }
    if (fontsLoaded || fontError) {
      prepare();
    }
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!appIsReady) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <LoadingScreen appName="StudyBuddy" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <NotificationProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Onboarding1" component={OnboardingStep1} />
              <Stack.Screen name="Onboarding2" component={OnboardingStep2} />
              <Stack.Screen name="Onboarding3" component={OnboardingStep3} />
              <Stack.Screen name="Onboarding4" component={OnboardingStep4} />
              <Stack.Screen name="Onboarding5" component={OnboardingStep5} />
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </SafeAreaProvider>
    </View>
  );
}
