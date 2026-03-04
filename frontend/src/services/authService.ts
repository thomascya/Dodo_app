/**
 * DODO App - Authentication Service
 *
 * For non-React contexts (e.g., background tasks).
 * In React components, prefer using the useAuth() hook instead.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../config/api';

export async function signOut(): Promise<void> {
  try {
    await api.post('/auth/signout');
  } catch {
    // Best-effort
  }
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
}

export async function getCurrentUser() {
  try {
    return await api.get('/auth/me');
  } catch {
    return null;
  }
}
