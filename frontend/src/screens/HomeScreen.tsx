import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { HomeStackNavigationProp } from '../types/navigation.types';
import SearchBar from '../components/SearchBar';
import FilterIcons, { FilterType } from '../components/FilterIcons';
import BenefitBubble from '../components/BenefitBubble';
import StoreCard from '../components/StoreCard';

// Hooks + Constants
import { useStores } from '../hooks/useStores';
import { BRAND_PRIMARY, TEXT_PRIMARY, TEXT_SECONDARY } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import type { Database } from '../types/database.types';

// Type from database
type StoreRow = Database['public']['Tables']['stores']['Row'];

// Hardcoded benefits for now (will be dynamic when auth is ready)
// TODO: Replace with useBenefits({ walletIds: userWalletIds }) once auth is implemented
const FEATURED_BENEFITS = [
  { storeName: 'ZARA', discount: 40, discountType: 'percentage' as const },
  { storeName: 'Nike', discount: 25, discountType: 'percentage' as const },
  { storeName: 'Fox', discount: 15, discountType: 'percentage' as const },
  { storeName: 'H&M', discount: 10, discountType: 'percentage' as const },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeStackNavigationProp>();

  // Use new hooks architecture
  const { stores, loading, error, search } = useStores();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('stores');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (activeFilter === 'stores') {
      debounceTimer.current = setTimeout(() => {
        if (searchQuery.trim()) {
          search(searchQuery);
          setHasSearched(true);
        } else {
          setHasSearched(false);
        }
      }, 500);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, activeFilter, search]);

  // Handle filter change
  const handleFilterChange = (filter: FilterType) => {
    if (filter !== 'stores') {
      Alert.alert(STRINGS.comingSoon, STRINGS.filterFeatureSoonMessage);
      return;
    }
    setActiveFilter(filter);
  };

  // Handle store press - navigate to Store screen
  const handleStorePress = (store: StoreRow) => {
    navigation.navigate('Store', { storeId: store.id });
  };

  // Handle benefit bubble press
  // TODO: Connect to real store IDs when benefits are dynamic
  const handleBenefitPress = (storeName: string) => {
    Alert.alert(storeName, 'חפש את החנות כדי לראות את כל ההטבות');
  };

  // Render search results
  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={BRAND_PRIMARY} />
          <Text style={styles.loadingText}>{STRINGS.homeSearching}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Text style={styles.emptySubtext}>{STRINGS.retry}</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>{STRINGS.emptySearchIcon}</Text>
          <Text style={styles.emptyText}>{STRINGS.homeStartSearching}</Text>
        </View>
      );
    }

    if (stores.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>{STRINGS.emptyNoResultsIcon}</Text>
          <Text style={styles.emptyText}>{STRINGS.homeNoResults}</Text>
          <Text style={styles.emptySubtext}>{STRINGS.homeNoResultsSubtext}</Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>{STRINGS.homeSearchResults}</Text>
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            id={store.id}
            name={store.name}
            logo={store.logo}
            onPress={() => handleStorePress(store)}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Icons */}
        <View style={styles.filterSection}>
          <FilterIcons
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </View>

        {/* Benefits Bubbles */}
        <View style={styles.bubblesSection}>
          <Text style={styles.sectionTitle}>{STRINGS.homeFeaturedBenefits}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bubblesContainer}
            style={styles.bubblesScroll}
          >
            {FEATURED_BENEFITS.map((benefit, index) => (
              <View key={index} style={styles.bubbleWrapper}>
                <BenefitBubble
                  storeName={benefit.storeName}
                  discount={benefit.discount}
                  discountType={benefit.discountType}
                  onPress={() => handleBenefitPress(benefit.storeName)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Search Results */}
        <View style={styles.resultsSection}>
          {renderSearchResults()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  bubblesSection: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  bubblesScroll: {
    flexDirection: 'row-reverse',
  },
  bubblesContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row-reverse',
  },
  bubbleWrapper: {
    marginLeft: 12,
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 200,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
    marginBottom: 12,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },
});
