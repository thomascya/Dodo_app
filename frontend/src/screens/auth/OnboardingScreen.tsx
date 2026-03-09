import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import type { Wallet } from '../../types/database.types';
import {
  BRAND_PRIMARY,
  BG_PRIMARY,
  BG_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BORDER_LIGHT,
  BORDER_MEDIUM,
} from '../../constants/colors';

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Wallet[]>('/wallets')
      .then(data => setWallets(data))
      .catch(() => {/* show empty list, user can skip */})
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDone = useCallback(async () => {
    setSaving(true);
    try {
      await api.put('/wallets/me', { wallet_ids: Array.from(selected) });
    } catch {
      Alert.alert('שגיאה', 'לא ניתן לשמור את הארנק, אבל אפשר לעדכן אחר כך מהפרופיל');
    } finally {
      setSaving(false);
      // Clear onboarding flag — App.tsx auth gate will swap to BottomTabNavigator
      completeOnboarding();
    }
  }, [selected, completeOnboarding]);

  const creditCards = wallets.filter(w => w.type === 'credit_card');
  const clubs = wallets.filter(w => w.type === 'club');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>מה יש לך בארנק?</Text>
          <Text style={styles.subtitle}>
            סמן את כל מה שברשותך כדי שנציג לך את ההטבות הרלוונטיות
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={BRAND_PRIMARY} style={styles.loader} />
        ) : (
          <>
            {creditCards.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 כרטיסי אשראי</Text>
                {creditCards.map(w => (
                  <WalletRow
                    key={w.id}
                    wallet={w}
                    checked={selected.has(w.id)}
                    onToggle={toggle}
                  />
                ))}
              </View>
            )}

            {clubs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏷️ מועדונים</Text>
                {clubs.map(w => (
                  <WalletRow
                    key={w.id}
                    wallet={w}
                    checked={selected.has(w.id)}
                    onToggle={toggle}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, saving && styles.buttonDisabled]}
          onPress={handleDone}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.doneButtonText}>זהו, אני מוכן! 🎉</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleDone} disabled={saving}>
          <Text style={styles.skipButtonText}>דלג לעכשיו</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function WalletRow({
  wallet,
  checked,
  onToggle,
}: {
  wallet: Wallet;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.walletRow, checked && styles.walletRowChecked]}
      onPress={() => onToggle(wallet.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.walletName}>{wallet.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_SECONDARY,
  },
  scroll: {
    paddingBottom: 16,
  },
  loader: {
    marginTop: 48,
  },

  // Header
  header: {
    backgroundColor: BG_PRIMARY,
    padding: 24,
    paddingTop: 32,
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Section
  section: {
    backgroundColor: BG_PRIMARY,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
    marginBottom: 12,
  },

  // Wallet row
  walletRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  walletRowChecked: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  walletName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_PRIMARY,
    textAlign: 'right',
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER_MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkboxChecked: {
    backgroundColor: BRAND_PRIMARY,
    borderColor: BRAND_PRIMARY,
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Heebo_700Bold',
  },

  // Footer
  footer: {
    backgroundColor: BG_PRIMARY,
    padding: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
  },
  doneButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
});
