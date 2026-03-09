import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import {
  BRAND_PRIMARY,
  BG_PRIMARY,
  BG_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_MEDIUM,
  ERROR,
} from '../../constants/colors';

type Tab = 'signin' | 'signup';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError('יש למלא אימייל וסיסמה');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (activeTab === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      // Auth gate in App.tsx handles navigation:
      // - signin → isAuthenticated=true → shows tabs
      // - signup → needsOnboarding=true → stays in AuthNavigator, shows Onboarding
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'אירעה שגיאה';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, email, password, signInWithEmail, signUpWithEmail]);

  const handleGuest = useCallback(async () => {
    setLoading(true);
    try {
      await continueAsGuest();
    } catch {
      Alert.alert('שגיאה', 'לא ניתן להמשיך כאורח כרגע');
    } finally {
      setLoading(false);
    }
  }, [continueAsGuest]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Title */}
          <View style={styles.heroSection}>
            <Text style={styles.logo}>🐦</Text>
            <Text style={styles.title}>ברוכים הבאים ל-DODO</Text>
            <Text style={styles.subtitle}>כל ההטבות שלך במקום אחד</Text>
          </View>

          {/* Tab toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signin' && styles.tabActive]}
              onPress={() => { setActiveTab('signin'); setError(null); }}
            >
              <Text style={[styles.tabText, activeTab === 'signin' && styles.tabTextActive]}>
                התחברות
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
              onPress={() => { setActiveTab('signup'); setError(null); }}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                הרשמה
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="אימייל"
              placeholderTextColor={TEXT_TERTIARY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textAlign="right"
            />
            <TextInput
              style={styles.input}
              placeholder="סיסמה"
              placeholderTextColor={TEXT_TERTIARY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
              textAlign="right"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {activeTab === 'signin' ? 'התחבר' : 'הירשם'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>או</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons — Google only (free); Apple requires $99/yr developer account */}
          <View style={styles.socialSection}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Alert.alert('בקרוב', 'התחברות עם Google תהיה זמינה בקרוב')}
            >
              <Text style={styles.socialButtonText}>🔵 התחברות עם Google</Text>
            </TouchableOpacity>
          </View>

          {/* Guest link */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuest} disabled={loading}>
            <Text style={styles.guestButtonText}>המשך כאורח</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: BG_PRIMARY,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row-reverse',
    backgroundColor: BG_SECONDARY,
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: BG_PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
  },
  tabTextActive: {
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
  },

  // Form
  form: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_MEDIUM,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_PRIMARY,
    backgroundColor: BG_PRIMARY,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Heebo_400Regular',
    color: ERROR,
    textAlign: 'right',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER_MEDIUM,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_TERTIARY,
  },

  // Social
  socialSection: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: BORDER_MEDIUM,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_PRIMARY,
  },

  // Guest
  guestButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
});
