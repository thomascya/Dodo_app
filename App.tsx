import { useCallback } from 'react';
import { View, I18nManager, StyleSheet } from 'react-native';
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

// Force RTL layout for Hebrew
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

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
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
