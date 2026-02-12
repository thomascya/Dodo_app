# DODO App - Project Guidelines

## Project Overview
**DODO** is a Hebrew (RTL) social coupons and benefits app for Israeli consumers. It aggregates credit card benefits, club memberships, and influencer coupon codes in one place.

**Location:** `C:\projects\Dodo_app`

---

## 📖 For AI Assistants: Required Reading

**CRITICAL: Before working on ANY task, read these files in order:**

| # | File | Purpose | When to Read |
|---|------|---------|--------------|
| 1 | `docs/CLAUDE.md` | Project guidelines | **Always first** |
| 2 | `docs/PROJECT_STATUS.md` | Current progress | **Every session** |
| 3 | `docs/DODO_App_Specification.md` | Full roadmap & all features | When asked "what's next?" |
| 4 | `docs/ARCHITECTURE_GUIDE.md` | Hooks/Services patterns | Before coding |
| 5 | `docs/BUGS_FIXED.md` | Solved bugs & solutions | Before debugging |
| 6 | `docs/DECISIONS.md` | Why we made choices | Before changing architecture |

**When user asks "what should I work on next?":**
1. ✅ Read `PROJECT_STATUS.md` → See what's completed
2. ✅ Read `DODO_App_Specification.md` (חלק 7: שלבי פיתוח) → See full roadmap
3. ✅ Suggest the next logical task from Phase 1 that isn't done yet

---

## Tech Stack
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native (Expo) | SDK 54 |
| Backend | Supabase | Latest |
| Language | TypeScript | 5.9.x |
| Navigation | React Navigation | v7 |
| React | React | 19.1.0 |
| React Native | React Native | 0.81.5 |

---

## Project Structure
```
src/
├── config/
│   └── supabase.ts          # Supabase client configuration
├── types/
│   └── database.types.ts    # Full DB types (Row/Insert/Update)
├── services/
│   └── supabaseService.ts   # Raw DB queries
├── hooks/
│   ├── useStores.ts         # Store management
│   ├── useBenefits.ts       # Benefits fetching
│   └── useCoupons.ts        # Coupons fetching
├── constants/
│   ├── colors.ts            # Color palette
│   └── strings.ts           # Hebrew strings
├── utils/
│   └── formatters.ts        # Date/discount formatters
├── navigation/
│   └── BottomTabNavigator.tsx  # 4-tab bottom navigation
├── screens/
│   ├── HomeScreen.tsx       # Search/home (✅ migrated)
│   ├── StoreScreen.tsx      # Store page (⏳ next)
│   ├── FollowingScreen.tsx  # Following feed
│   ├── AddCouponScreen.tsx  # Add coupon (influencers only)
│   └── ProfileScreen.tsx    # User profile
└── components/              # Reusable UI components
```

---

## Design System

### Colors (Use constants from `src/constants/colors.ts`)
| Usage | Constant Name | Hex |
|-------|--------------|-----|
| Brand (buttons, highlights) | `BRAND_PRIMARY` | `#7C3AED` |
| Background | `BACKGROUND_PRIMARY` | `#FFFFFF` |
| Secondary background | `BACKGROUND_SECONDARY` | `#F5F5F7` |
| Primary text | `TEXT_PRIMARY` | `#1A1A1A` |
| Secondary text | `TEXT_SECONDARY` | `#6B7280` |
| Success | `SUCCESS` | `#10B981` |
| Error | `ERROR` | `#EF4444` |

### Typography
- **Hebrew Font:** Heebo (400 Regular, 700 Bold)
- **Direction:** RTL (Right-to-Left)
- RTL enabled via `I18nManager.forceRTL(true)`

### Design Principles
- Premium, minimalist feel (like ASOS/Shein)
- Lots of white space
- Subtle animations
- NO loud colors (red, yellow, bright green)
- NO "HOT DEAL!!!" style text
- NO visual clutter

---

## Database (Supabase)

### Connection
- **URL:** `https://qxempvnxmcvbyrnatmeo.supabase.co`
- **RLS:** Enabled on all tables

### Tables
| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `wallets` | Credit cards and club memberships |
| `user_wallets` | User-wallet relationships |
| `stores` | Stores/brands |
| `benefits` | Wallet-based benefits |
| `coupons` | Influencer coupon codes |
| `follows` | User follows (social) |
| `reports` | Coupon reports |
| `influencer_requests` | Requests to become influencer |

### Schema Reference
See `docs/DODO_Prompt_01_Database_Setup.md` for complete schema with RLS policies and sample data.

---

## Bottom Navigation (4 Tabs)
| Icon | Label (Hebrew) | Screen | Notes |
|------|----------------|--------|-------|
| 🔍 | חיפוש | HomeScreen | Search stores/benefits |
| 👥 | במעקב | FollowingScreen | Following feed |
| ➕ | הוספה | AddCouponScreen | Influencers only |
| 👤 | פרופיל | ProfileScreen | User profile |

---

## Critical Rules

### React Native Basics
- **NEVER use HTML elements** (`<span>`, `<div>`, `<p>`, etc.)
- Always use React Native components:
  - `<Text>` for all text content (including emojis)
  - `<View>` for containers
  - `<ScrollView>` for scrollable content
  - `<TouchableOpacity>` for buttons

### Architecture Patterns
- **Use Hooks** (not direct service calls) in screens
- **Use Constants** for colors and strings (not hardcoded values)
- **Use Formatters** for dates and discounts
- See `docs/ARCHITECTURE_GUIDE.md` for full patterns

---

## Known Issues & Bugs

For detailed bug documentation, solutions, and workarounds, see:
👉 **`docs/BUGS_FIXED.md`**

### Critical Workarounds Currently Active:
⚠️ **Android Crash Fix:** Using JS Stack instead of Native Stack
📄 See `docs/BUGS_FIXED.md` for full details and implementation

---

## Required Setup

### App.tsx Setup
```typescript
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager } from 'react-native';

// 1. Disable native screens (Android crash fix)
enableScreens(false);

// 2. Force RTL for Hebrew
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        ...
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

### Dependencies
Required packages:
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `@react-navigation/stack` (use this instead of native-stack!)
- `react-native-screens`
- `react-native-safe-area-context`
- `@supabase/supabase-js`
- `react-native-url-polyfill`
- `@react-native-async-storage/async-storage`

### Supabase Setup
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## Development Roadmap

**For full details, see:** `docs/DODO_App_Specification.md` (חלק 7: שלבי פיתוח מומלצים)

### Phase 1: Core MVP ⏳ (Current - 4-6 weeks)
- [x] Project setup
- [x] Supabase + Database
- [x] Navigation
- [x] HomeScreen migrated to real data
- [ ] StoreScreen with benefits
- [ ] Authentication
- [ ] Onboarding
- [ ] Profile

### Phase 2: Social Features (3-4 weeks)
- [ ] Influencer system
- [ ] Coupon upload
- [ ] Follow system
- [ ] Following feed

### Phase 3: Polish (2-4 weeks)
- [ ] Push notifications
- [ ] Deep links
- [ ] Analytics

---

## Coding Conventions
- Use TypeScript for all files
- Use functional components with hooks
- Use `StyleSheet.create()` for styles
- Import colors from `src/constants/colors.ts`
- Import strings from `src/constants/strings.ts`
- Use formatters from `src/utils/formatters.ts`
- Keep components small and focused
- Use meaningful Hebrew labels for UI text
- Comment complex logic in English
