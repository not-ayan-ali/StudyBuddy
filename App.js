import { useState, useEffect, useCallback } from 'react';
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
import AnimatedSplash from './components/AnimatedSplash';

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
  const [appState, setAppState] = useState('splash');
  const [initialRoute, setInitialRoute] = useState('Login');

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
      try {
        const data = await getOnboardingData();
        if (data) {
          setInitialRoute('Main');
        }
      } catch {
        // ignore
      } finally {
        setAppState('ready');
      }
    }
    if (fontsLoaded || fontError) {
      prepare();
    }
  }, [fontsLoaded, fontError]);

  const onSplashDone = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  if (appState === 'splash') {
    return <AnimatedSplash onReady={onSplashDone} />;
  }

  return (
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
  );
}
