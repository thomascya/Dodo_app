// ==========================================
// DODO App - Database TypeScript Types
// Based on supabase_setup.sql schema
// ==========================================

// Enum types
export type DiscountType = 'percentage' | 'fixed';
export type RedemptionType = 'online' | 'physical' | 'both';
export type WalletType = 'credit_card' | 'club';
export type ReportReason = 'not_working' | 'expired' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';
export type InfluencerRequestStatus = 'pending' | 'approved' | 'rejected';

// Table types
export interface User {
  id: string;
  email: string;
  name: string | null;
  profile_image: string | null;
  bio: string | null;
  is_influencer: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  logo: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserWallet {
  id: string;
  user_id: string;
  wallet_id: string;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Benefit {
  id: string;
  store_id: string;
  wallet_id: string;
  discount_type: DiscountType;
  discount_value: number;
  description: string | null;
  redemption_type: RedemptionType;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  user_id: string;
  store_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  description: string | null;
  redemption_type: RedemptionType;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  coupon_id: string;
  user_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface InfluencerRequest {
  id: string;
  user_id: string;
  instagram_url: string;
  followers_count: number;
  interests: string[] | null;
  motivation: string | null;
  status: InfluencerRequestStatus;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id'>>;
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, 'id' | 'created_at' | 'is_active'> & {
          id?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Omit<Wallet, 'id'>>;
      };
      user_wallets: {
        Row: UserWallet;
        Insert: Omit<UserWallet, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserWallet, 'id'>>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, 'id' | 'created_at' | 'is_active'> & {
          id?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Omit<Store, 'id'>>;
      };
      benefits: {
        Row: Benefit;
        Insert: Omit<Benefit, 'id' | 'created_at' | 'is_active'> & {
          id?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Omit<Benefit, 'id'>>;
      };
      coupons: {
        Row: Coupon;
        Insert: Omit<Coupon, 'id' | 'created_at' | 'is_active'> & {
          id?: string;
          created_at?: string;
          is_active?: boolean;
        };
        Update: Partial<Omit<Coupon, 'id'>>;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Follow, 'id'>>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, 'id' | 'created_at' | 'status'> & {
          id?: string;
          created_at?: string;
          status?: ReportStatus;
        };
        Update: Partial<Omit<Report, 'id'>>;
      };
      influencer_requests: {
        Row: InfluencerRequest;
        Insert: Omit<InfluencerRequest, 'id' | 'created_at' | 'status' | 'reviewed_at'> & {
          id?: string;
          created_at?: string;
          status?: InfluencerRequestStatus;
          reviewed_at?: string | null;
        };
        Update: Partial<Omit<InfluencerRequest, 'id'>>;
      };
    };
  };
}
