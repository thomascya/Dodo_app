import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';

// Import navigators and screens
import HomeStackNavigator from './HomeStackNavigator';
import FollowingScreen from '../screens/FollowingScreen';
import AddCouponScreen from '../screens/AddCouponScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type BottomTabParamList = {
  Home: undefined;
  Following: undefined;
  AddCoupon: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  // TODO: Replace with real auth check from Supabase (Prompt 9)
  // Will check: user?.is_influencer && user?.is_verified
  const userIsInfluencer = false;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* Tab 1: Search/Home (with Stack Navigator) */}
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'חיפוש',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>🔍</Text>
          ),
        }}
      />

      {/* Tab 2: Following Feed */}
      <Tab.Screen
        name="Following"
        component={FollowingScreen}
        options={{
          tabBarLabel: 'במעקב',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>👥</Text>
          ),
        }}
      />

      {/* Tab 3: Add Coupon - Only visible to verified influencers */}
      {userIsInfluencer && (
        <Tab.Screen
          name="AddCoupon"
          component={AddCouponScreen}
          options={{
            tabBarLabel: 'הוספה',
            tabBarIcon: ({ color }) => (
              <Text style={[styles.tabIcon, { color }]}>➕</Text>
            ),
          }}
        />
      )}

      {/* Tab 4: Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'פרופיל',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F7',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontFamily: 'Heebo_700Bold',
    fontSize: 12,
  },
  tabIcon: {
    fontSize: 24,
  },
});
