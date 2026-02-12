import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from '../types/navigation.types';
import HomeScreen from '../screens/HomeScreen';
import StoreScreen from '../screens/StoreScreen';

// Using JS-based stack navigator to avoid react-native-screens Android crash
const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Store" component={StoreScreen} />
    </Stack.Navigator>
  );
}
