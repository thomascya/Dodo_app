/**
 * DODO App - useCoupons Hook
 * Manages coupons data fetching and copying
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getCouponsByStore, CouponWithUser } from '../services/supabaseService';

export interface UseCouponsProps {
  storeId?: string;
}

export interface UseCouponsReturn {
  coupons: CouponWithUser[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  copyCoupon: (code: string) => Promise<void>;
}

/**
 * Hook for managing coupons data
 * @param props - Optional storeId filter
 * @returns Object with coupons array, loading state, error, and utility functions
 */
export function useCoupons(props: UseCouponsProps = {}): UseCouponsReturn {
  const { storeId } = props;

  const [coupons, setCoupons] = useState<CouponWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load coupons for a store
   */
  const loadCoupons = useCallback(async () => {
    if (!storeId) {
      setCoupons([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCouponsByStore(storeId);
      setCoupons(data);
    } catch (err) {
      console.error('Error in useCoupons.loadCoupons:', err);
      setError('אירעה שגיאה בטעינת הקופונים');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  /**
   * Auto-load coupons when storeId changes
   */
  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  /**
   * Copy coupon code to clipboard
   * Reuses logic from CouponCard.tsx
   */
  const copyCoupon = useCallback(async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('הקוד הועתק!', `הקוד ${code} הועתק ללוח`);
    } catch (err) {
      console.error('Error copying coupon code:', err);
      Alert.alert('שגיאה', 'לא ניתן להעתיק את הקוד');
    }
  }, []);

  /**
   * Refresh coupons
   */
  const refresh = useCallback(async () => {
    await loadCoupons();
  }, [loadCoupons]);

  return {
    coupons,
    loading,
    error,
    refresh,
    copyCoupon,
  };
}
