/**
 * DODO App - Authentication Service
 * Handles user authentication and session management
 *
 * NOTE: All functions are placeholders for future implementation (Phase 2)
 */

import { supabase } from '../config/supabase';

/**
 * Sign in with Google OAuth
 * TODO: Implement in Phase 2 (Authentication)
 */
export async function signInWithGoogle(): Promise<void> {
  console.warn('signInWithGoogle not yet implemented');
  throw new Error('Authentication not yet implemented');
}

/**
 * Sign in with Apple OAuth
 * TODO: Implement in Phase 2 (Authentication)
 */
export async function signInWithApple(): Promise<void> {
  console.warn('signInWithApple not yet implemented');
  throw new Error('Authentication not yet implemented');
}

/**
 * Continue as guest (anonymous session)
 * TODO: Implement in Phase 2 (Authentication)
 */
export async function continueAsGuest(): Promise<void> {
  console.warn('continueAsGuest not yet implemented');
  throw new Error('Authentication not yet implemented');
}

/**
 * Sign out current user
 * TODO: Implement in Phase 2 (Authentication)
 */
export async function signOut(): Promise<void> {
  console.warn('signOut not yet implemented');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get current user session
 * TODO: Implement in Phase 2 (Authentication)
 */
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
