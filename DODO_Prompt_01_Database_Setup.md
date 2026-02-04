# DODO App - Prompt 1: Database Setup (Supabase)

## Instructions:
1. Copy everything below the line
2. Paste into Claude Code
3. Wait for completion
4. Run the SQL in Supabase SQL Editor
5. Verify tables were created in Table Editor

---

## Prompt:

I'm building a coupons and benefits app called DODO. The app is in Hebrew (RTL).

**My Supabase credentials:**
- Project URL: `https://qxempvnxmcvbyrnatmeo.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4ZW1wdm54bWN2YnlybmF0bWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjI2OTEsImV4cCI6MjA4NTY5ODY5MX0.7nmH6UG6Bh3ue-Wozcx1yerG7SnPHQES3NDg0EKISRU`

**Your task:**
Generate a complete SQL script that I can run in Supabase SQL Editor. The script should:

### 1. Create the following tables:

**users table:**
- id (UUID, Primary Key, references auth.users)
- email (text, unique, not null)
- name (text)
- profile_image (text, nullable)
- bio (text, nullable, max 100 chars)
- is_influencer (boolean, default false)
- is_verified (boolean, default false)
- created_at (timestamp with time zone, default now())
- updated_at (timestamp with time zone, default now())

**wallets table (credit cards and clubs):**
- id (UUID, Primary Key)
- name (text, not null)
- type (text, not null) - 'credit_card' or 'club'
- logo (text, nullable)
- is_active (boolean, default true)
- created_at (timestamp with time zone, default now())

**user_wallets table (junction between user and wallet):**
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- wallet_id (UUID, Foreign Key → wallets)
- created_at (timestamp with time zone, default now())
- Unique constraint on (user_id, wallet_id)

**stores table (brands/shops):**
- id (UUID, Primary Key)
- name (text, not null)
- logo (text, nullable)
- website (text, nullable)
- is_active (boolean, default true)
- created_at (timestamp with time zone, default now())

**benefits table (benefits from credit cards/clubs):**
- id (UUID, Primary Key)
- store_id (UUID, Foreign Key → stores)
- wallet_id (UUID, Foreign Key → wallets)
- discount_type (text, not null) - 'percentage' or 'fixed'
- discount_value (numeric, not null)
- description (text, nullable)
- redemption_type (text, not null) - 'online', 'physical', or 'both'
- start_date (date, nullable)
- end_date (date, nullable)
- is_active (boolean, default true)
- created_at (timestamp with time zone, default now())

**coupons table (coupons from influencers):**
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users) - the influencer who uploaded
- store_id (UUID, Foreign Key → stores)
- code (text, not null) - the coupon code
- discount_type (text, not null) - 'percentage' or 'fixed'
- discount_value (numeric, not null)
- description (text, nullable, max 100 chars)
- redemption_type (text, not null) - 'online', 'physical', or 'both'
- expires_at (timestamp with time zone, not null)
- is_active (boolean, default true)
- created_at (timestamp with time zone, default now())

**IMPORTANT - Duplicate prevention for coupons:**
Create a partial unique index (not a regular constraint) that prevents duplicate coupons:
- Same store + same discount_type + same discount_value = duplicate
- BUT only check against ACTIVE coupons (where is_active = true AND expires_at > now())
- This means: if an old coupon expired, a new influencer CAN upload a coupon with the same discount to the same store

**follows table (following influencers):**
- id (UUID, Primary Key)
- follower_id (UUID, Foreign Key → users)
- following_id (UUID, Foreign Key → users)
- created_at (timestamp with time zone, default now())
- Unique constraint on (follower_id, following_id)

**reports table (reports on coupons):**
- id (UUID, Primary Key)
- coupon_id (UUID, Foreign Key → coupons)
- user_id (UUID, Foreign Key → users) - the reporter
- reason (text, not null) - 'not_working', 'expired', 'inappropriate', 'other'
- details (text, nullable)
- status (text, default 'pending') - 'pending', 'reviewed', 'resolved'
- created_at (timestamp with time zone, default now())

**influencer_requests table:**
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- instagram_url (text, not null)
- followers_count (integer, not null)
- interests (text[], nullable)
- motivation (text, nullable)
- status (text, default 'pending') - 'pending', 'approved', 'rejected'
- admin_notes (text, nullable)
- created_at (timestamp with time zone, default now())
- reviewed_at (timestamp with time zone, nullable)

### 2. Set up Row Level Security (RLS):

**users:**
- Anyone can read all profiles (for viewing influencer profiles)
- Users can only update their own profile

**wallets:**
- Anyone can read (public list of credit cards/clubs)

**user_wallets:**
- Users can only read their own
- Users can only insert/delete their own

**stores:**
- Anyone can read

**benefits:**
- Anyone can read active benefits

**coupons:**
- Anyone can read active coupons
- Influencers can only insert/update/delete their own coupons

**follows:**
- Users can read their own follows
- Users can only insert/delete where follower_id = their user id

**reports:**
- Users can insert reports
- Users can only read their own reports

**influencer_requests:**
- Users can only read their own request
- Users can only insert one request

### 3. Insert sample data:

**Wallets (credit cards and clubs in Hebrew):**
- מקס (type: credit_card)
- כאל (type: credit_card)
- ישראכרט (type: credit_card)
- לאומי קארד (type: credit_card)
- בהצדעה (type: club)
- חבר (type: club)
- שלך (type: club)
- לייף סטייל (type: club)

**Stores (in Hebrew):**
- Nike
- ZARA
- Fox
- Castro
- H&M
- Terminal X
- KSP
- iDigital
- מקדונלד'ס
- קפה קפה

**Benefits (sample benefits linking stores to wallets):**
- Nike + מקס = 10% discount (both)
- Nike + בהצדעה = 15% discount (both)
- ZARA + כאל = 5% discount (online)
- ZARA + חבר = 10% discount (both)
- Fox + ישראכרט = 7% discount (physical)
- Castro + לאומי קארד = 10% discount (both)
- H&M + שלך = 8% discount (online)
- Terminal X + מקס = 12% discount (online)
- KSP + כאל = 5% discount (both)
- מקדונלד'ס + חבר = 15% discount (physical)
- קפה קפה + לייף סטייל = 20% discount (physical)

---

**Output format:**
Give me a single complete SQL file that I can copy and paste into Supabase SQL Editor.
Add comments explaining each section.
Make sure to enable RLS on all tables.
Use gen_random_uuid() for generating UUIDs.
