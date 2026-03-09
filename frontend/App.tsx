import { useCallback } from 'react';
import { View, I18nManager, StyleSheet, ActivityIndicator } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Heebo_400Regular, Heebo_700Bold } from '@expo-google-fonts/heebo';
import * as SplashScreen from 'expo-splash-screen';

// ⚠️ CRITICAL: Disable native screens BEFORE importing navigation components
// This must happen before ANY navigation imports to prevent Android crash
enableScreens(false);

// Import navigation components AFTER enableScreens(false)
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import { BRAND_PRIMARY } from './src/constants/colors';

// Force RTL layout for Hebrew
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isGuest, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_PRIMARY} />
      </View>
    );
  }

  // Show auth screens if not authenticated, or if newly signed up and needs onboarding
  if (!isAuthenticated && !isGuest) return <AuthNavigator />;
  if (needsOnboarding) return <AuthNavigator />;
  return <BottomTabNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Heebo_400Regular,
    Heebo_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <View style={styles.container} onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
