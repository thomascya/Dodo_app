-- ==========================================
-- DODO App - Database Setup
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    profile_image TEXT,
    bio TEXT CHECK (length(bio) <= 100),
    is_influencer BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. WALLETS TABLE (Credit Cards & Clubs)
-- ==========================================
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit_card', 'club')),
    logo TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. USER_WALLETS TABLE (Junction)
-- ==========================================
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_id)
);

-- ==========================================
-- 4. STORES TABLE
-- ==========================================
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. BENEFITS TABLE (From Wallets)
-- ==========================================
CREATE TABLE benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    description TEXT,
    redemption_type TEXT NOT NULL CHECK (redemption_type IN ('online', 'physical', 'both')),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. COUPONS TABLE (From Influencers)
-- ==========================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    description TEXT CHECK (length(description) <= 100),
    redemption_type TEXT NOT NULL CHECK (redemption_type IN ('online', 'physical', 'both')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- IMPORTANT: Prevent Duplicate Coupons
-- ==========================================
-- Create immutable function for timestamp comparison
CREATE OR REPLACE FUNCTION is_future_timestamp(ts TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN ts > NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Partial unique index: same store + same discount = duplicate
-- BUT only for ACTIVE coupons
CREATE UNIQUE INDEX idx_unique_active_coupons 
ON coupons (store_id, discount_type, discount_value)
WHERE is_active = TRUE AND is_future_timestamp(expires_at);

-- ==========================================
-- 7. FOLLOWS TABLE
-- ==========================================
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- ==========================================
-- 8. REPORTS TABLE
-- ==========================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('not_working', 'expired', 'inappropriate', 'other')),
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 9. INFLUENCER_REQUESTS TABLE
-- ==========================================
CREATE TABLE influencer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instagram_url TEXT NOT NULL,
    followers_count INTEGER NOT NULL,
    interests TEXT[],
    motivation TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_requests ENABLE ROW LEVEL SECURITY;

-- USERS: Anyone can read, users can update their own
CREATE POLICY "Anyone can view profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- WALLETS: Anyone can read
CREATE POLICY "Anyone can view wallets" ON wallets FOR SELECT USING (true);

-- USER_WALLETS: Users can only see/manage their own
CREATE POLICY "Users can view own wallets" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallets" ON user_wallets FOR DELETE USING (auth.uid() = user_id);

-- STORES: Anyone can read
CREATE POLICY "Anyone can view stores" ON stores FOR SELECT USING (true);

-- BENEFITS: Anyone can read active benefits
CREATE POLICY "Anyone can view active benefits" ON benefits FOR SELECT USING (is_active = true);

-- COUPONS: Anyone can read active, influencers can manage their own
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Influencers can insert own coupons" ON coupons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Influencers can update own coupons" ON coupons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Influencers can delete own coupons" ON coupons FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS: Users can read their follows and manage where they're the follower
CREATE POLICY "Users can view own follows" ON follows FOR SELECT USING (auth.uid() = follower_id);
CREATE POLICY "Users can insert follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- REPORTS: Users can insert and view their own reports
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);

-- INFLUENCER_REQUESTS: Users can view/insert their own request
CREATE POLICY "Users can view own request" ON influencer_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own request" ON influencer_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- SAMPLE DATA
-- ==========================================

-- Insert Wallets (Hebrew names)
INSERT INTO wallets (name, type) VALUES
('מקס', 'credit_card'),
('כאל', 'credit_card'),
('ישראכרט', 'credit_card'),
('לאומי קארד', 'credit_card'),
('בהצדעה', 'club'),
('חבר', 'club'),
('שלך', 'club'),
('לייף סטייל', 'club');

-- Insert Stores (mix of Hebrew and English)
INSERT INTO stores (name, logo, website) VALUES
('Nike', null, 'https://nike.com'),
('ZARA', null, 'https://zara.com'),
('Fox', null, 'https://fox.co.il'),
('Castro', null, 'https://castro.co.il'),
('H&M', null, 'https://hm.com'),
('Terminal X', null, 'https://terminalx.com'),
('KSP', null, 'https://ksp.co.il'),
('iDigital', null, 'https://idigital.co.il'),
('מקדונלד''ס', null, 'https://mcdonalds.co.il'),
('קפה קפה', null, 'https://cafe-cafe.co.il');

-- Insert Benefits (link stores to wallets)
INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 10, 'both'
FROM stores s, wallets w
WHERE s.name = 'Nike' AND w.name = 'מקס';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 15, 'both'
FROM stores s, wallets w
WHERE s.name = 'Nike' AND w.name = 'בהצדעה';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 5, 'online'
FROM stores s, wallets w
WHERE s.name = 'ZARA' AND w.name = 'כאל';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 10, 'both'
FROM stores s, wallets w
WHERE s.name = 'ZARA' AND w.name = 'חבר';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 7, 'physical'
FROM stores s, wallets w
WHERE s.name = 'Fox' AND w.name = 'ישראכרט';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 10, 'both'
FROM stores s, wallets w
WHERE s.name = 'Castro' AND w.name = 'לאומי קארד';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 8, 'online'
FROM stores s, wallets w
WHERE s.name = 'H&M' AND w.name = 'שלך';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 12, 'online'
FROM stores s, wallets w
WHERE s.name = 'Terminal X' AND w.name = 'מקס';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 5, 'both'
FROM stores s, wallets w
WHERE s.name = 'KSP' AND w.name = 'כאל';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 15, 'physical'
FROM stores s, wallets w
WHERE s.name = 'מקדונלד''ס' AND w.name = 'חבר';

INSERT INTO benefits (store_id, wallet_id, discount_type, discount_value, redemption_type)
SELECT 
    s.id, w.id, 'percentage', 20, 'physical'
FROM stores s, wallets w
WHERE s.name = 'קפה קפה' AND w.name = 'לייף סטייל';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
END $$;