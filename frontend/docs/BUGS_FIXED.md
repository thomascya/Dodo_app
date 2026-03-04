# Bugs Fixed - DODO App

## Format:
Each bug entry includes:
- **Date:** When it was fixed
- **Bug:** Description
- **Root Cause:** Why it happened
- **Solution:** How it was fixed
- **Files Changed:** Which files were modified
- **Keywords:** For easy search

---

## [2026-02-11] Android Crash - "cannot cast String to Boolean" ✅ PERMANENTLY FIXED

**Bug Description:**
App crashes on Android with error:
```
java.lang.String cannot be cast to java.lang.Boolean
```

**Root Cause:**
**VERSION MISMATCH!** `react-native-screens@4.22.0` was installed, but Expo SDK 54 requires `~4.16.0`. The newer version has a bug with React Native 0.81 where boolean props are incorrectly passed to native Android code.

**THE PERMANENT SOLUTION:**

**Step 1: Install the CORRECT version (CRITICAL!)**
```bash
# Remove incompatible versions
npm uninstall react-native-screens @react-navigation/native-stack

# Install Expo SDK 54 compatible version
npx expo install react-native-screens@~4.16.0
```

**Step 2: Disable native screens in App.tsx**
```typescript
import { enableScreens } from 'react-native-screens';

// MUST be called BEFORE any navigation imports
enableScreens(false);

// Then import navigation components
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
```

**Step 3: Use JS-based stack instead of native-stack**
```typescript
// ❌ WRONG - causes crash:
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

// ✅ CORRECT - use this instead:
import { createStackNavigator } from '@react-navigation/stack';
const Stack = createStackNavigator();
```

**Complete App.tsx setup:**
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
    
      
        ...
      
    
  );
}
```

**Files Changed:**
- `package.json` - Downgraded `react-native-screens` to `~4.16.0`, removed `@react-navigation/native-stack`
- `App.tsx` - Added `enableScreens(false)` BEFORE navigation imports
- `src/navigation/HomeStackNavigator.tsx` - Using `createStackNavigator` (not native-stack)

**Required Dependencies (in package.json):**
```json
{
  "dependencies": {
    "@react-navigation/stack": "^7.7.1",
    "react-native-screens": "~4.16.0"
  }
}
```

**⚠️ DO NOT install these packages:**
- ❌ `@react-navigation/native-stack` (removed - causes crash)
- ❌ `react-native-screens@4.22.0` (too new - incompatible with Expo SDK 54)

**Trade-offs:**
- ❌ Lost native screen optimizations (slightly slower transitions)
- ❌ No native gestures and animations
- ✅ BUT: App works perfectly on Android!

**Prevention for Future:**
Always run this command after installing packages:
```bash
npx expo install --check
```
This verifies all package versions match Expo SDK requirements.

**Keywords:** `android`, `crash`, `screens`, `navigation`, `boolean`, `react-navigation`, `native-stack`, `version-mismatch`, `expo-sdk-54`

---

## [2026-02-11] Metro Bundler Error - "Unable to resolve module useIsomorphicLayoutEffect" ✅ FIXED

**Bug Description:**
Metro bundler fails with error 500:
```
UnableToResolveError: Unable to resolve module ../../../../useIsomorphicLayoutEffect
from C:\projects\Dodo_app\node_modules\react-native-gesture-handler\src\handlers\gestures\GestureDetector\index.tsx
```

**Root Cause:**
**VERSION MISMATCH!** `react-native-gesture-handler@2.30.0` was installed (came as dependency of `@react-navigation/stack`), but Expo SDK 54 requires `~2.28.0`. The newer version has incompatible internal module structure.

**THE SOLUTION:**

**Option 1: Quick Fix (Try this first)**
```bash
npx expo install react-native-gesture-handler
npm start -- --clear
```

**Option 2: Nuclear Fix (If Option 1 doesn't work - THIS WORKED!)**
```bash
# Stop the server (Ctrl+C)
rm -rf node_modules
npm install
npm start -- --clear
```

This completely reinstalls all dependencies with correct versions.

**Files Changed:**
- `package.json` - Downgraded `react-native-gesture-handler` from 2.30.0 to `~2.28.0`

**Required Dependencies (in package.json):**
```json
{
  "dependencies": {
    "react-native-gesture-handler": "~2.28.0"
  }
}
```

**Why this happened:**
When we removed `@react-navigation/native-stack`, npm didn't automatically update the transitive dependency `react-native-gesture-handler` to the correct version for Expo SDK 54. Sometimes `node_modules` gets corrupted and needs a full reinstall.

**What actually worked:**
Full `node_modules` reinstall was required to completely resolve the issue.

**Prevention for Future:**
After removing packages or changing navigation dependencies:
```bash
npx expo install --check
# If issues persist:
rm -rf node_modules && npm install && npm start -- --clear
```

**Keywords:** `metro`, `bundler`, `error-500`, `unable-to-resolve`, `gesture-handler`, `version-mismatch`, `expo-sdk-54`, `module-resolution`

---

## [Future Bug Template]

**Bug Description:**

**Root Cause:**

**Solution:**

**Files Changed:**

**Keywords:**