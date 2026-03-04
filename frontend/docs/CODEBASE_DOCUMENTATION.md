# DODO - Codebase Documentation

## 1. Project Overview

**DODO** is a social-consumer application designed for the Israeli market. It aggregates benefits from credit cards and consumer clubs, alongside influencer coupon codes, into a single platform.

### Core Value Proposition
-   **Smart Wallet**: Centralizes benefits (Max, Hever, etc.).
-   **Influencer Hub**: Persistent storage for influencer coupons.
-   **Community Driven**: Reporting system for broken/expired codes.
-   **Search & Discovery**: Find discounts by store or brand.

## 2. Architecture & Tech Stack

### Tech Stack
-   **Database**: PostgreSQL (via Supabase)
-   **Authentication**: Supabase Auth
-   **Backend Logic**: Supabase (RLS, Triggers, Functions)
-   **Frontend**: (Planned: React Native / Flutter / Web - TBD)

### Project Structure
```
c:\projects\Dodo_app\
├── DODO_App_Specification (1).md   # Full Functional Specification
├── DODO_Prompt_01_Database_Setup.md # Initial Prompt for Database Setup
├── supabase_setup.sql               # SQL Script for Database creation & seeding
└── CODEBASE_DOCUMENTATION.md        # This file
```

## 3. Database Schema

The database is hosted on **Supabase**. All UUIDs are generated using `gen_random_uuid()`.

### Tables

#### `users`
Extends `auth.users` with application-specific data.
-   `id`: UUID (FK to auth.users)
-   `is_influencer`: Boolean (Verified influencers can post coupons)
-   `is_verified`: Boolean

#### `wallets`
Catalog of supported credit cards and consumer clubs.
-   **Types**: `credit_card`, `club`
-   **Examples**: Max, Hever, Shelah, Life Style

#### `user_wallets`
Junction table linking Users to their specific Wallets.
-   Allows the app to show personalized benefits.

#### `stores`
Brands and shops (e.g., Nike, Zara, KSP).

#### `benefits`
Official benefits provided by Wallets for specific Stores.
-   e.g., "10% at Nike for Max cardholders".

#### `coupons`
User-generated content (by Influencers).
-   **Constraint**: Partial unique index prevents duplicate active coupons (Same store + same discount).
-   **RLS**: Influencers can only manage their own coupons.

#### `follows`
Social graph: Users following Influencers.

#### `reports`
Community moderation tool. Users report non-working or expired coupons.

#### `influencer_requests`
Application form for users wanting to become verified influencers.

### Security (RLS)
Row Level Security is enabled on **ALL** tables.
-   **Public Read**: Stores, Wallets, Active Benefits, Active Coupons.
-   **User Private**: Profile updates, Personal Wallet connections, Follows.
-   **Creator Private**: Influencers manage only their created coupons.

## 4. Setup Instructions

1.  **Supabase Project**: Create a new project on Supabase.
2.  **SQL Setup**:
    -   Open the Supabase SQL Editor.
    -   Copy the content of `supabase_setup.sql`.
    -   Run the script.
    -   This creates all tables, policies, and seeds initial data (Wallets, Stores, Sample Benefits).
3.  **Verification**:
    -   Check the Table Editor to see populated `wallets` and `stores`.

## 5. Development Workflow

-   **Database Changes**: ALWAYS update `supabase_setup.sql` or create a new migration file for schema changes.
-   **Documentation**: Update this file when adding new modules or changing relationships.
