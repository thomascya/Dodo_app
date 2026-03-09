import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

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
export type HomeStackNavigationProp = StackNavigationProp<HomeStackParamList>;

export type HomeScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<BottomTabParamList>
>;

export type StoreScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'Store'
>;

// Route prop types
export type StoreScreenRouteProp = RouteProp<HomeStackParamList, 'Store'>;
