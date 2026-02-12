import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'חפש חנות או מותג...',
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        textAlign="right"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 18,
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Heebo_400Regular',
    color: '#1A1A1A',
    height: '100%',
  },
});
