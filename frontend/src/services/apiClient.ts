/**
 * DODO App - API Client
 * Typed API functions that call the backend instead of Supabase directly.
 * Drop-in replacement for supabaseService.ts
 */

import { api } from '../config/api';
import type { Database } from '../types/database.types';
import type { Wallet } from '../types/database.types';

// Type aliases (same as supabaseService.ts)
type StoreRow = Database['public']['Tables']['stores']['Row'];

// Extended types with joins (same as supabaseService.ts)
export interface BenefitWithWallet {
  id: string;
  store_id: string;
  wallet_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  description: string | null;
  redemption_type: 'online' | 'physical' | 'both';
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  wallet: Pick<Wallet, 'name' | 'type'>;
}

export interface CouponWithUser {
  id: string;
  user_id: string;
  store_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  description: string | null;
  redemption_type: 'online' | 'physical' | 'both';
  expires_at: string;
  is_active: boolean;
  created_at: string;
  user: {
    id: string;
    name: string;
    profile_image: string | null;
    is_verified: boolean;
  };
}

// ===== STORES =====

export async function getStores(): Promise<StoreRow[]> {
  return api.get<StoreRow[]>('/stores');
}

export async function getStoreById(storeId: string): Promise<StoreRow | null> {
  return api.get<StoreRow | null>(`/stores/${storeId}`);
}

export async function searchStores(query: string): Promise<StoreRow[]> {
  if (!query.trim()) return [];
  return api.get<StoreRow[]>(`/stores/search?q=${encodeURIComponent(query)}`);
}

// ===== BENEFITS =====

export async function getBenefitsByStore(storeId: string): Promise<BenefitWithWallet[]> {
  return api.get<BenefitWithWallet[]>(`/benefits/store/${storeId}`);
}

export async function getBenefitsByWallets(walletIds: string[]): Promise<BenefitWithWallet[]> {
  if (!walletIds.length) return [];
  return api.get<BenefitWithWallet[]>(`/benefits/wallets?ids=${walletIds.join(',')}`);
}

// ===== COUPONS =====

export async function getCouponsByStore(storeId: string): Promise<CouponWithUser[]> {
  return api.get<CouponWithUser[]>(`/coupons/store/${storeId}`);
}

export async function getCouponsByFollowing(): Promise<CouponWithUser[]> {
  return api.get<CouponWithUser[]>('/coupons/following');
}

export async function getMyCoupons(): Promise<CouponWithUser[]> {
  return api.get<CouponWithUser[]>('/coupons/me');
}

// ===== WALLETS =====

export async function getUserWallets(): Promise<Wallet[]> {
  return api.get<Wallet[]>('/wallets/me');
}

// ===== FOLLOWS =====

export async function getFollowerCount(userId: string): Promise<number> {
  const data = await api.get<{ count: number }>(`/follows/${userId}/followers/count`);
  return data.count;
}

// ===== REPORTS =====

export async function submitReport(
  couponId: string,
  reason: string,
  details: string | null,
): Promise<void> {
  await api.post('/reports', { coupon_id: couponId, reason, details });
}
