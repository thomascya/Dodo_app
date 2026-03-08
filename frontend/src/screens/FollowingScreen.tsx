import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { getCouponsByFollowing, submitReport } from '../services/apiClient';
import type { CouponWithUser } from '../services/apiClient';
import CouponCard from '../components/CouponCard';
import ReportDialog, { ReportReason } from '../components/ReportDialog';
import {
  BRAND_PRIMARY,
  BG_PRIMARY,
  BG_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../constants/colors';
import { STRINGS } from '../constants/strings';

export default function FollowingScreen() {
  const { isAuthenticated, isGuest } = useAuth();
  const navigation = useNavigation();

  const [coupons, setCoupons] = useState<CouponWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Report dialog state
  const [reportCouponId, setReportCouponId] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    if (!isAuthenticated || isGuest) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await getCouponsByFollowing();
      setCoupons(data);
    } catch (err) {
      console.error('FollowingScreen loadCoupons error:', err);
      setError(STRINGS.errorLoadingCoupons);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadCoupons();
  }, [loadCoupons]);

  const handleReport = useCallback((couponId: string) => {
    setReportCouponId(couponId);
  }, []);

  const handleReportSubmit = useCallback(async (reason: ReportReason, details: string) => {
    if (!reportCouponId) return;
    await submitReport(reportCouponId, reason, details || null);
    setReportCouponId(null);
  }, [reportCouponId]);

  const handleGoToSearch = useCallback(() => {
    // Navigate to the Home/Search tab
    (navigation as any).navigate('Home');
  }, [navigation]);

  // Guest / not authenticated
  if (!isAuthenticated || isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>יש להתחבר כדי לעקוב אחרי משפיענים</Text>
          <Text style={styles.emptySubtext}>התחבר כדי לראות קופונים ממשפיענים שאתה עוקב אחריהם</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND_PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCoupons}>
            <Text style={styles.retryButtonText}>{STRINGS.retry}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state — no follows or no coupons from follows
  if (coupons.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>{STRINGS.followingEmpty}</Text>
          <Text style={styles.emptySubtext}>{STRINGS.followingEmptySubtext}</Text>
          <TouchableOpacity style={styles.searchButton} onPress={handleGoToSearch}>
            <Text style={styles.searchButtonText}>חפש משפיענים</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{STRINGS.followingTitle}</Text>
      </View>

      <FlatList
        data={coupons}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BRAND_PRIMARY}
          />
        }
        renderItem={({ item }) => (
          <CouponCard
            couponId={item.id}
            userId={item.user.id}
            userName={item.user.name}
            userImage={item.user.profile_image}
            isVerified={item.user.is_verified}
            discountType={item.discount_type}
            discountValue={item.discount_value}
            code={item.code}
            expiresAt={item.expires_at}
            redemptionType={item.redemption_type}
            onReport={handleReport}
          />
        )}
      />

      {/* Report Dialog */}
      <ReportDialog
        visible={reportCouponId !== null}
        onClose={() => setReportCouponId(null)}
        onSubmit={handleReportSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_SECONDARY,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  // Header
  header: {
    backgroundColor: BG_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
  },

  // List
  list: {
    padding: 16,
    paddingBottom: 32,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  searchButtonText: {
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },

  // Error
  errorText: {
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },
});
