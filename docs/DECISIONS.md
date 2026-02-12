# Architecture & Design Decisions - DODO App

## Purpose:
Document WHY we made certain technical decisions.

---

## [2026-02-11] Hooks + Services Architecture

**Decision:**
Split data fetching into Hooks + Services pattern.

**Why:**
1. Reusability - Same logic across multiple screens
2. Testability - Easy to test services separately
3. Type Safety - TypeScript interfaces for all data
4. Maintainability - Change DB queries in ONE place

**Structure:**
```
src/services/supabaseService.ts  ← Raw DB queries
src/hooks/useStores.ts           ← React hooks wrapping services
src/screens/HomeScreen.tsx       ← Uses hooks (not services directly)
```

**Trade-offs:**
- More files (but cleaner code)
- Learning curve for new developers

---

## [2026-02-04] Use Supabase (not Firebase)

**Decision:**
Use Supabase as backend.

**Why:**
1. PostgreSQL - Better for relational data (stores, benefits, wallets)
2. Built-in Auth with Google/Apple
3. Free tier is generous
4. SQL > NoSQL for this app's data model

**Alternative Considered:**
Firebase - Rejected because NoSQL is awkward for our many-to-many relationships.

---

## [Future Decision Template]

**Decision:**

**Why:**

**Trade-offs:**

**Alternatives Considered:**
```
