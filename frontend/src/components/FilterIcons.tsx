import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type FilterType = 'stores' | 'people' | 'products' | 'locations';

interface FilterIconsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface FilterItem {
  id: FilterType;
  icon: string;
  label: string;
}

const filters: FilterItem[] = [
  { id: 'stores', icon: '🏪', label: 'חנויות' },
  { id: 'people', icon: '👤', label: 'אנשים' },
  { id: 'products', icon: '📦', label: 'מוצרים' },
  { id: 'locations', icon: '📍', label: 'מיקומים' },
];

export default function FilterIcons({
  activeFilter,
  onFilterChange,
}: FilterIconsProps) {
  return (
    <View style={styles.container}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              isActive && styles.filterButtonActive,
            ]}
            onPress={() => onFilterChange(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text
              style={[
                styles.filterLabel,
                isActive && styles.filterLabelActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  filterButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    minWidth: 70,
  },
  filterButtonActive: {
    backgroundColor: '#7C3AED',
  },
  filterIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    color: '#6B7280',
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Heebo_700Bold',
  },
});
