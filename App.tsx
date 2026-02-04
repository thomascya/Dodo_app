import { useCallback } from 'react';
import { StyleSheet, Text, View, I18nManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Heebo_400Regular, Heebo_700Bold } from '@expo-google-fonts/heebo';
import * as SplashScreen from 'expo-splash-screen';

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
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={styles.title}>DODO</Text>
      <Text style={styles.subtitle}>קופונים והטבות</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Heebo_700Bold',
    fontSize: 48,
    color: '#7C3AED',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Heebo_400Regular',
    fontSize: 18,
    color: '#6B7280',
  },
});
