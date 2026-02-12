# DODO App - Hooks + Services Architecture Guide

See the complete architecture documentation for:
- How to use hooks (useStores, useBenefits, useCoupons)
- How to use constants (colors, strings)
- How to use formatters (formatDiscount, formatDate)
- Migration examples (HomeScreen, StoreScreen)
- Best practices and patterns

## Quick Reference

### Hooks
- `useStores()` - Store management + search
- `useBenefits({ storeId?, walletIds? })` - Benefits by store or wallets
- `useCoupons({ storeId? })` - Coupons + clipboard copy

### Constants
- `BRAND_PRIMARY, TEXT_SECONDARY, etc.` from `constants/colors.ts`
- `STRINGS.homeNoResults, etc.` from `constants/strings.ts`

### Utilities
- `formatDiscount(type, value)` - Format discount display
- `formatDate(dateString)` - Format date to Hebrew locale
- `formatExpiration(dateString)` - Format expiration with label

## Example Usage

```typescript
import { useStores } from '../hooks/useStores';
import { STRINGS } from '../constants/strings';
import { BRAND_PRIMARY } from '../constants/colors';

const { stores, loading, search } = useStores();
```

For complete documentation with detailed examples, see the files:
- src/services/supabaseService.ts
- src/hooks/*.ts
- src/constants/*.ts
- src/utils/formatters.ts
