/**
 * DODO App - Supabase Service
 * Centralized data fetching layer for all Supabase operations
 */

import { supabase } from '../config/supabase';
import type { Database } from '../types/database.types';
import type { Wallet } from '../types/database.types';

// Type aliases for cleaner code
type StoreRow = Database['public']['Tables']['stores']['Row'];
type BenefitRow = Database['public']['Tables']['benefits']['Row'];
type CouponRow = Database['public']['Tables']['coupons']['Row'];

// Extended types with joins
export interface BenefitWithWallet extends BenefitRow {
  wallet: Pick<Wallet, 'name' | 'type'>;
}

export interface CouponWithUser extends CouponRow {
  user: {
    id: string;
    name: string;
    profile_image: string | null;
    is_verified: boolean;
  };
}

// ===== STORES =====

/**
 * Fetch all active stores
 * @returns Array of active stores ordered by name
 */
export async function getStores(): Promise<StoreRow[]> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, logo, website, is_active, created_at')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
}

/**
 * Fetch a single store by ID
 * @param storeId - UUID of the store
 * @returns Store object or null
 */
export async function getStoreById(storeId: string): Promise<StoreRow | null> {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, name, logo, website, is_active, created_at')
      .eq('id', storeId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    throw error;
  }
}

/**
 * Search stores by name (case-insensitive)
 * @param query - Search query string
 * @returns Array of matching stores
 */
export async function searchStores(query: string): Promise<StoreRow[]> {
  try {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('stores')
      .select('id, name, logo, website, is_active, created_at')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching stores:', error);
    throw error;
  }
}

// ===== BENEFITS =====

/**
 * Fetch benefits for a specific store with wallet information
 * @param storeId - UUID of the store
 * @returns Array of benefits with wallet details
 */
export async function getBenefitsByStore(storeId: string): Promise<BenefitWithWallet[]> {
  try {
    const { data, error } = await supabase
      .from('benefits')
      .select(`
        id,
        store_id,
        wallet_id,
        discount_type,
        discount_value,
        description,
        redemption_type,
        start_date,
        end_date,
        is_active,
        created_at,
        wallet:wallets(name, type)
      `)
      .eq('store_id', storeId)
      .eq('is_active', true);

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Error fetching benefits by store:', error);
    throw error;
  }
}

/**
 * Fetch benefits by user's wallet IDs (for personalized benefits)
 * @param walletIds - Array of wallet UUIDs the user owns
 * @returns Array of benefits matching user's wallets
 */
export async function getBenefitsByWallets(walletIds: string[]): Promise<BenefitWithWallet[]> {
  try {
    if (!walletIds.length) return [];

    const { data, error } = await supabase
      .from('benefits')
      .select(`
        id,
        store_id,
        wallet_id,
        discount_type,
        discount_value,
        description,
        redemption_type,
        start_date,
        end_date,
        is_active,
        created_at,
        wallet:wallets(name, type)
      `)
      .in('wallet_id', walletIds)
      .eq('is_active', true)
      .order('discount_value', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Error fetching benefits by wallets:', error);
    throw error;
  }
}

// ===== COUPONS =====

/**
 * Fetch active coupons for a specific store with user information
 * @param storeId - UUID of the store
 * @returns Array of active coupons with user details
 */
export async function getCouponsByStore(storeId: string): Promise<CouponWithUser[]> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        id,
        user_id,
        store_id,
        code,
        discount_type,
        discount_value,
        description,
        redemption_type,
        expires_at,
        is_active,
        created_at,
        user:users(id, name, profile_image, is_verified)
      `)
      .eq('store_id', storeId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  } catch (error) {
    console.error('Error fetching coupons by store:', error);
    throw error;
  }
}

/**
 * Fetch coupons from users that the current user follows
 * TODO: Implement when auth is ready
 * @param userId - UUID of the current user
 * @returns Array of coupons from followed users
 */
export async function getCouponsByFollowing(userId: string): Promise<CouponWithUser[]> {
  // Placeholder for future implementation
  console.warn('getCouponsByFollowing not yet implemented - requires auth');
  return [];
}
