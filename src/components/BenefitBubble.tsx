import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BenefitBubbleProps {
  storeName: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  onPress?: () => void;
}

export default function BenefitBubble({
  storeName,
  discount,
  discountType,
  onPress,
}: BenefitBubbleProps) {
  const discountText = discountType === 'percentage'
    ? `${discount}%`
    : `₪${discount}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#7C3AED', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.discountText}>{discountText}</Text>
        <Text style={styles.storeName} numberOfLines={1}>
          {storeName}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 100,
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  discountText: {
    fontSize: 24,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
