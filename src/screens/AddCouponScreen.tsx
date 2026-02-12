import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddCouponScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>הוספת קוד</Text>
      <Text style={styles.description}>
        כאן משפיענים יוכלו להעלות קודי קופון
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Heebo_700Bold',
    fontSize: 24,
    color: '#7C3AED', // Brand purple
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Heebo_400Regular',
    fontSize: 16,
    color: '#6B7280', // Gray
    textAlign: 'center',
    maxWidth: 300,
  },
});
