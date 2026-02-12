# Example Usage

## Invoke the skill:

```
/plan-feature Add wallet balance display to profile
```

## What happens:

1. **I explore** the codebase to understand existing patterns
2. **I ask you** structured questions with clear options
3. **You choose** from presented options (or provide custom answers)
4. **I create** a detailed implementation plan
5. **You approve** the plan before I start coding
6. **I implement** the feature following the approved plan

## Sample Questions You'll See:

**Where should this feature live?**
- Modify existing ProfileScreen (Recommended)
- Create new WalletDetailsScreen
- Add as reusable component in src/components/

**Which Supabase tables should we use?**
- user_wallets (Recommended - already has balance data)
- Create new wallet_transactions table
- Both tables

**Follow existing design patterns?**
- Yes - use same card style as other profile sections (Recommended)
- No - create custom design

## Benefits:

✅ Ensures we're aligned before coding
✅ Prevents wasted effort on wrong approaches
✅ Captures your preferences for future features
✅ Creates a clear plan you can review
✅ Follows DODO app conventions automatically
