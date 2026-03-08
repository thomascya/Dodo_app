# DODO App - Project Status

**Last Updated:** 08.03.2026
**Location:** `C:\projects\Dodo_app`
**Overall Status:** In Development - MVP ~55%

---

## Architecture (Post-Refactor)

The app was refactored from a single Expo + direct-Supabase architecture to a proper frontend/backend split:

```
Dodo_app/
├── backend/                      # FastAPI (Python)
│   ├── app/
│   │   ├── main.py               # FastAPI app + scheduler
│   │   ├── config.py             # Settings (env vars)
│   │   ├── middleware/auth.py    # JWT auth middleware
│   │   ├── routers/              # 9 route modules
│   │   ├── services/             # Business logic + Supabase queries
│   │   ├── models/schemas.py    # Pydantic request/response schemas
│   │   └── tasks/background.py  # Coupon expiry + report auto-resolve
│   ├── tests/                    # 70 tests (all passing)
│   └── .env                      # SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET
│
└── frontend/                     # React Native (Expo)
    ├── App.tsx                   # Entry point + auth gate
    └── src/
        ├── config/api.ts         # HTTP client (JWT + auto refresh)
        ├── context/AuthContext.tsx # Auth state (email, Google, guest)
        ├── hooks/                # useAuth, useStores, useBenefits, useCoupons
        ├── services/
        │   ├── apiClient.ts      # Typed API functions → FastAPI
        │   ├── supabaseService.ts # Compat shim (re-exports apiClient)
        │   └── authService.ts    # Non-React auth helpers
        ├── navigation/
        │   ├── BottomTabNavigator.tsx  # 4 tabs (RTL)
        │   ├── HomeStackNavigator.tsx  # Home → Store stack
        │   └── AuthNavigator.tsx       # Login → Onboarding stack [feature branch]
        ├── screens/
        │   ├── HomeScreen.tsx          # Working (benefits hardcoded)
        │   ├── StoreScreen.tsx         # Working
        │   ├── FollowingScreen.tsx     # Placeholder
        │   ├── AddCouponScreen.tsx     # Placeholder
        │   ├── ProfileScreen.tsx       # Full impl [feature branch]
        │   └── auth/
        │       ├── LoginScreen.tsx     # Email/password + guest [feature branch]
        │       └── OnboardingScreen.tsx # Wallet picker [feature branch]
        ├── components/           # SearchBar, FilterIcons, BenefitBubble, etc.
        ├── constants/            # colors.ts, strings.ts
        ├── types/                # database.types.ts, navigation.types.ts
        └── utils/                # formatters.ts
```

---

## Backend Status

### API Endpoints (All Implemented)

| Module | Endpoints | Auth | Status |
|--------|-----------|------|--------|
| Auth | signup/email, signin/email, signin/social, guest, refresh, me, signout | - | Done |
| Stores | GET /, GET /:id, GET /search | Public | Done |
| Benefits | GET /store/:id, GET /wallets | Public | Done |
| Coupons | GET /store/:id, GET /following, GET /me, POST, PUT, DELETE | Mixed | Done |
| Wallets | GET /, GET /me, PUT /me | Mixed | Done |
| Users | GET /me, PUT /me, GET /:id | Mixed | Done |
| Follows | POST /:id, DELETE /:id, GET /following, GET /:id/followers/count | Auth | Done |
| Reports | POST | Auth | Done |
| Notifications | POST /register, DELETE /register | Auth | Done |

### Backend Tests: **70/70 passing**

### Background Tasks
- Deactivate expired coupons (hourly)
- Auto-resolve reported coupons (hourly)

---

## Frontend Status

### Screens

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| HomeScreen | `screens/HomeScreen.tsx` | Working | Benefits hardcoded (needs auth to unhardcode) |
| StoreScreen | `screens/StoreScreen.tsx` | Working | Benefits + coupons from API |
| FollowingScreen | `screens/FollowingScreen.tsx` | Placeholder | Needs `getCouponsByFollowing()` wiring |
| AddCouponScreen | `screens/AddCouponScreen.tsx` | Placeholder | Needs form UI + POST /coupons |
| ProfileScreen | `screens/ProfileScreen.tsx` | **Done** | On `feature/profile-screen` branch |
| LoginScreen | `screens/auth/LoginScreen.tsx` | **Done** | On `feature/auth-screens` branch |
| OnboardingScreen | `screens/auth/OnboardingScreen.tsx` | **Done** | On `feature/auth-screens` branch |

### Components (All Done)

SearchBar, FilterIcons, BenefitBubble, StoreCard, BenefitCard, CouponCard, ReportDialog

### Infrastructure (All Done)

- API client with JWT auth + auto token refresh
- AuthContext (email/password, Google placeholder, guest)
- Auth gate in App.tsx (spinner → login or tabs)
- Custom hooks (useAuth, useStores, useBenefits, useCoupons)
- Constants (colors, strings), Utils (formatters)
- RTL + Heebo font + Android crash fix (`enableScreens(false)`)

---

## Git Branches

| Branch | Status | Contains |
|--------|--------|----------|
| `main` | Stable | Initial release |
| `develop` | Base | Refactored backend + frontend infra |
| `feature/profile-screen` | Pushed, not merged | ProfileScreen + GET /coupons/me + apiClient additions |
| `feature/auth-screens` | Pushed, not merged | LoginScreen, OnboardingScreen, AuthNavigator, auth gate |

---

## What Works End-to-End

- HomeScreen search → StoreScreen with benefits + coupons
- Backend: all 9 API modules with auth middleware + tests
- Frontend: HTTP client with JWT + refresh tokens
- AuthContext: email sign in/up, guest, signout (wired to backend)

## What's Missing (Priority Order)

### Must Have for MVP
1. **Merge feature branches** to `develop`
2. **Unhardcode HomeScreen benefits** — use `useBenefits` with user's wallet IDs (blocked on auth merge)
3. **FollowingScreen** — wire `getCouponsByFollowing()` (endpoint exists)
4. **AddCouponScreen** — form UI for influencers to upload coupons
5. **Google OAuth** — button exists, needs `expo-auth-session` setup (free)

### Nice to Have
6. Error boundaries
7. Skeleton loading screens
8. Push notifications (backend ready, frontend needs expo-notifications)
9. Analytics
10. Deep links

---

## Database (Supabase)

**URL:** `https://qxempvnxmcvbyrnatmeo.supabase.co`
**Tables:** users, wallets, user_wallets, stores, benefits, coupons, follows, reports, influencer_requests
**RLS:** Enabled on all tables
**Access:** Backend uses service key (bypasses RLS); frontend never calls Supabase directly

---

## Known Issues

1. **Android native screens crash** — mitigated with `enableScreens(false)` + JS-based stack navigator
2. **HomeScreen benefits hardcoded** — waiting on auth merge to connect to real data
3. **Apple Sign In removed** — requires $99/yr Apple Developer account (free services only)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo SDK 54), TypeScript |
| Backend | FastAPI (Python), Pydantic |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | JWT (backend-issued), AsyncStorage |
| Font | Heebo (Hebrew) |
| Navigation | React Navigation v7 (JS stack) |
| Testing | pytest (70 tests) |

---

**Version:** 2.0.0
**Last Updated:** 08.03.2026
