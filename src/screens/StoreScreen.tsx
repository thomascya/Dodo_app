import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { StoreScreenRouteProp } from '../types/navigation.types';
import BenefitCard from '../components/BenefitCard';
import CouponCard from '../components/CouponCard';
import ReportDialog, { ReportReason } from '../components/ReportDialog';

// Types
interface Store {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
}

interface Benefit {
  id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  description: string | null;
  redemption_type: 'online' | 'physical' | 'both';
  wallet: {
    name: string;
    type: 'credit_card' | 'club';
  };
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  description: string | null;
  redemption_type: 'online' | 'physical' | 'both';
  expires_at: string;
  user: {
    id: string;
    name: string;
    profile_image: string | null;
    is_verified: boolean;
  };
}

export default function StoreScreen() {
  const navigation = useNavigation();
  const route = useRoute<StoreScreenRouteProp>();
  const { storeId } = route.params;

  // State
  const [store, setStore] = useState<Store | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report dialog state
  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);

  // Fetch store data
  const fetchStoreData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch store info
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name, logo, website')
        .eq('id', storeId)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Fetch benefits (show all for now - will filter by user wallet later)
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('benefits')
        .select(`
          id,
          discount_type,
          discount_value,
          description,
          redemption_type,
          wallet:wallets(name, type)
        `)
        .eq('store_id', storeId)
        .eq('is_active', true);

      if (benefitsError) throw benefitsError;
      setBenefits(benefitsData || []);

      // Fetch coupons from influencers
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .select(`
          id,
          code,
          discount_type,
          discount_value,
          description,
          redemption_type,
          expires_at,
          user:users(id, name, profile_image, is_verified)
        `)
        .eq('store_id', storeId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (couponsError) throw couponsError;
      setCoupons(couponsData || []);

    } catch (err) {
      console.error('Error fetching store data:', err);
      setError('אירעה שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  // Handle report coupon
  const handleOpenReport = (couponId: string) => {
    setSelectedCouponId(couponId);
    setReportDialogVisible(true);
  };

  const handleSubmitReport = async (reason: ReportReason, details: string) => {
    if (!selectedCouponId) return;

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          coupon_id: selectedCouponId,
          user_id: null, // TODO: Add real user_id with Auth
          reason,
          details: details || null,
          status: 'pending',
        });

      if (error) throw error;

      Alert.alert('תודה!', 'הדיווח נשלח בהצלחה');
      setReportDialogVisible(false);
      setSelectedCouponId(null);
    } catch (err) {
      console.error('Error submitting report:', err);
      Alert.alert('שגיאה', 'לא ניתן לשלוח את הדיווח');
    }
  };

  // Handle share
  const handleShare = () => {
    Alert.alert('בקרוב...', 'שיתוף יהיה זמין בקרוב!');
  };

  // Handle user press (navigate to influencer profile)
  const handleUserPress = (userId: string) => {
    console.log('User pressed:', userId);
    // TODO: Navigate to InfluencerProfile in Prompt 6
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorText}>{error || 'החנות לא נמצאה'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchStoreData}
          >
            <Text style={styles.retryButtonText}>נסה שוב</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleShare}
        >
          <Text style={styles.shareIcon}>🔗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Info */}
        <View style={styles.storeInfoSection}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.storeLogo} />
          ) : (
            <View style={styles.storeLogoPlaceholder}>
              <Text style={styles.storeLogoIcon}>🏪</Text>
            </View>
          )}
          <Text style={styles.storeName}>{store.name}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ההטבות שלך</Text>
          {benefits.length > 0 ? (
            benefits.map((benefit) => (
              <BenefitCard
                key={benefit.id}
                discountType={benefit.discount_type}
                discountValue={benefit.discount_value}
                walletName={benefit.wallet.name}
                walletType={benefit.wallet.type}
                description={benefit.description}
                redemptionType={benefit.redemption_type}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>אין הטבות זמינות כרגע</Text>
            </View>
          )}
        </View>

        {/* Coupons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>קופונים מהקהילה</Text>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                couponId={coupon.id}
                userId={coupon.user.id}
                userName={coupon.user.name}
                userImage={coupon.user.profile_image}
                isVerified={coupon.user.is_verified}
                discountType={coupon.discount_type}
                discountValue={coupon.discount_value}
                code={coupon.code}
                expiresAt={coupon.expires_at}
                redemptionType={coupon.redemption_type}
                onReport={handleOpenReport}
                onUserPress={handleUserPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎟️</Text>
              <Text style={styles.emptyText}>אין קופונים פעילים כרגע</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Report Dialog */}
      <ReportDialog
        visible={reportDialogVisible}
        onClose={() => {
          setReportDialogVisible(false);
          setSelectedCouponId(null);
        }}
        onSubmit={handleSubmitReport}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#1A1A1A',
  },
  shareIcon: {
    fontSize: 20,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Heebo_400Regular',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },
  storeInfoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  storeLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  storeLogoIcon: {
    fontSize: 36,
  },
  storeName: {
    fontSize: 24,
    fontFamily: 'Heebo_700Bold',
    color: '#1A1A1A',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Heebo_700Bold',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#6B7280',
  },
});
