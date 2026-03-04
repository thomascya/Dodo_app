/**
 * DODO App - useBenefits Hook
 * Manages benefits data fetching with flexible filtering
 */

import { useState, useCallback, useEffect } from 'react';
import { getBenefitsByStore, getBenefitsByWallets, BenefitWithWallet } from '../services/supabaseService';

export interface UseBenefitsProps {
  storeId?: string;
  walletIds?: string[];
}

export interface UseBenefitsReturn {
  benefits: BenefitWithWallet[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing benefits data
 * @param props - Optional filters: storeId OR walletIds
 * @returns Object with benefits array, loading state, error, and refresh function
 */
export function useBenefits(props: UseBenefitsProps = {}): UseBenefitsReturn {
  const { storeId, walletIds } = props;

  const [benefits, setBenefits] = useState<BenefitWithWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load benefits based on provided filters
   */
  const loadBenefits = useCallback(async () => {
    // Don't load if no filter provided
    if (!storeId && (!walletIds || walletIds.length === 0)) {
      setBenefits([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data: BenefitWithWallet[];

      if (storeId) {
        // Load by store ID
        data = await getBenefitsByStore(storeId);
      } else if (walletIds && walletIds.length > 0) {
        // Load by wallet IDs
        data = await getBenefitsByWallets(walletIds);
      } else {
        data = [];
      }

      setBenefits(data);
    } catch (err) {
      console.error('Error in useBenefits.loadBenefits:', err);
      setError('אירעה שגיאה בטעינת ההטבות');
    } finally {
      setLoading(false);
    }
  }, [storeId, walletIds]);

  /**
   * Auto-load benefits when dependencies change
   */
  useEffect(() => {
    loadBenefits();
  }, [loadBenefits]);

  /**
   * Refresh benefits
   */
  const refresh = useCallback(async () => {
    await loadBenefits();
  }, [loadBenefits]);

  return {
    benefits,
    loading,
    error,
    refresh,
  };
}
