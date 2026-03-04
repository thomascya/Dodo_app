/**
 * DODO App - useStores Hook
 * Manages store data fetching and searching
 */

import { useState, useCallback } from 'react';
import { getStores, searchStores } from '../services/supabaseService';
import type { Database } from '../types/database.types';

type StoreRow = Database['public']['Tables']['stores']['Row'];

export interface UseStoresReturn {
  stores: StoreRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  search: (query: string) => Promise<void>;
}

/**
 * Hook for managing stores data
 * @returns Object with stores array, loading state, error, and utility functions
 */
export function useStores(): UseStoresReturn {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all active stores
   */
  const loadStores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      console.error('Error in useStores.loadStores:', err);
      setError('אירעה שגיאה בטעינת החנויות');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search stores by query
   */
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setStores([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchStores(query);
      setStores(data);
    } catch (err) {
      console.error('Error in useStores.search:', err);
      setError('אירעה שגיאה בחיפוש');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh stores (reload all)
   */
  const refresh = useCallback(async () => {
    await loadStores();
  }, [loadStores]);

  return {
    stores,
    loading,
    error,
    refresh,
    search,
  };
}
