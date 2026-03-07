import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export type OnboardingScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

// Home Stack (Search tab)
export type HomeStackParamList = {
  HomeMain: undefined;
  Store: { storeId: string };
  InfluencerProfile: { userId: string }; // For future use
};

// Bottom Tab Navigator
export type BottomTabParamList = {
  Home: undefined;
  Following: undefined;
  AddCoupon: undefined;
  Profile: undefined;
};

// Navigation prop types
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<BottomTabParamList>
>;

export type StoreScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'Store'
>;

// Route prop types
export type StoreScreenRouteProp = RouteProp<HomeStackParamList, 'Store'>;
