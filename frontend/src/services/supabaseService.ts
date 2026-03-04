/**
 * DODO App - Supabase Service (compatibility shim)
 *
 * Re-exports all functions from apiClient.ts so existing hooks
 * (useStores, useBenefits, useCoupons) work without import changes.
 */

export {
  getStores,
  getStoreById,
  searchStores,
  getBenefitsByStore,
  getBenefitsByWallets,
  getCouponsByStore,
  getCouponsByFollowing,
  submitReport,
} from './apiClient';

export type { BenefitWithWallet, CouponWithUser } from './apiClient';
