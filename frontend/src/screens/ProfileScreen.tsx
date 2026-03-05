import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { getUserWallets, getMyCoupons, getFollowerCount } from '../services/apiClient';
import type { Wallet } from '../types/database.types';
import type { CouponWithUser } from '../services/apiClient';
import {
  BRAND_PRIMARY,
  BG_PRIMARY,
  BG_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_LIGHT,
  ERROR,
  SUCCESS,
} from '../constants/colors';

// ─── Sub-components ────────────────────────────────────────────────────────

function ProfileHeader({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const isVerifiedInfluencer = user.is_influencer && user.is_verified;
  return (
    <View style={styles.header}>
      {user.profile_image ? (
        <Image source={{ uri: user.profile_image }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {user.name ? user.name[0].toUpperCase() : '?'}
          </Text>
        </View>
      )}
      <Text style={styles.userName}>{user.name ?? 'משתמש'}</Text>
      {isVerifiedInfluencer && (
        <View style={styles.influencerBadge}>
          <Text style={styles.influencerBadgeText}>✓ משפיען מאומת</Text>
        </View>
      )}
    </View>
  );
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  const icon = wallet.type === 'credit_card' ? '💳' : '🏷️';
  return (
    <View style={styles.walletCard}>
      <Text style={styles.walletIcon}>{icon}</Text>
      <Text style={styles.walletName}>{wallet.name}</Text>
      <Text style={styles.walletType}>
        {wallet.type === 'credit_card' ? 'כרטיס' : 'מועדון'}
      </Text>
    </View>
  );
}

function CouponRow({
  coupon,
  onDelete,
}: {
  coupon: CouponWithUser;
  onDelete: (id: string) => void;
}) {
  const isExpired = !coupon.is_active || new Date(coupon.expires_at) < new Date();
  const discount =
    coupon.discount_type === 'percentage'
      ? `${coupon.discount_value}% הנחה`
      : `₪${coupon.discount_value} הנחה`;

  const handleDelete = () => {
    Alert.alert('מחיקת קוד', 'האם אתה בטוח שברצונך למחוק את הקוד?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => onDelete(coupon.id) },
    ]);
  };

  return (
    <View style={styles.couponRow}>
      <View style={styles.couponInfo}>
        <Text style={styles.couponCode}>{coupon.code}</Text>
        <Text style={styles.couponDiscount}>{discount}</Text>
        <View style={[styles.statusBadge, isExpired ? styles.statusExpired : styles.statusActive]}>
          <Text style={[styles.statusText, isExpired ? styles.statusTextExpired : styles.statusTextActive]}>
            {isExpired ? 'פג תוקף' : 'פעיל'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [myCoupons, setMyCoupons] = useState<CouponWithUser[]>([]);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isInfluencer = user?.is_influencer && user?.is_verified;

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [walletsData, couponsData] = await Promise.all([
        getUserWallets(),
        isInfluencer ? getMyCoupons() : Promise.resolve([]),
      ]);
      setWallets(walletsData);
      setMyCoupons(couponsData);

      if (isInfluencer) {
        const count = await getFollowerCount(user.id);
        setFollowerCount(count);
      }
    } catch (err) {
      console.error('ProfileScreen loadData error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isInfluencer]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleDeleteCoupon = useCallback(async (couponId: string) => {
    try {
      const { api } = await import('../config/api');
      await api.delete(`/coupons/${couponId}`);
      setMyCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch {
      Alert.alert('שגיאה', 'לא ניתן למחוק את הקוד');
    }
  }, []);

  const handleSignOut = useCallback(() => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'התנתק', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert('מחיקת חשבון', 'פונקציה זו תהיה זמינה בקרוב.', [{ text: 'סגור' }]);
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>יש להתחבר כדי לצפות בפרופיל</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND_PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BRAND_PRIMARY}
          />
        }
      >
        <ProfileHeader user={user} />

        {/* My Wallet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הארנק שלי</Text>
          {wallets.length === 0 ? (
            <Text style={styles.emptyText}>לא נבחרו ארנקים עדיין</Text>
          ) : (
            <View style={styles.walletList}>
              {wallets.map(w => (
                <WalletCard key={w.id} wallet={w} />
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>ערוך ארנק</Text>
          </TouchableOpacity>
        </View>

        {/* My Codes — influencers only */}
        {isInfluencer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>הקודים שלי</Text>
            {myCoupons.length === 0 ? (
              <Text style={styles.emptyText}>לא העלית קודים עדיין</Text>
            ) : (
              myCoupons.map(c => (
                <CouponRow key={c.id} coupon={c} onDelete={handleDeleteCoupon} />
              ))
            )}
          </View>
        )}

        {/* Statistics — influencers only */}
        {isInfluencer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>סטטיסטיקות</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {followerCount !== null ? followerCount : '—'}
                </Text>
                <Text style={styles.statLabel}>עוקבים</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {myCoupons.filter(c => c.is_active).length}
                </Text>
                <Text style={styles.statLabel}>קודים פעילים</Text>
              </View>
            </View>
          </View>
        )}

        {/* Become Influencer — regular users only */}
        {!isInfluencer && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.influencerRequestButton}>
              <Text style={styles.influencerRequestText}>רוצה להיות משפיען? ✨</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הגדרות</Text>
          <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut}>
            <Text style={styles.settingsRowText}>יציאה מהחשבון</Text>
            <Text style={styles.settingsRowArrow}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsRow, styles.settingsRowLast]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.settingsRowText, styles.settingsRowTextDanger]}>מחיקת חשבון</Text>
            <Text style={[styles.settingsRowArrow, styles.settingsRowTextDanger]}>←</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_SECONDARY,
  },
  scroll: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    backgroundColor: BG_PRIMARY,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: BRAND_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 36,
    color: '#FFFFFF',
    fontFamily: 'Heebo_700Bold',
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  influencerBadge: {
    marginTop: 6,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  influencerBadgeText: {
    fontSize: 13,
    fontFamily: 'Heebo_700Bold',
    color: BRAND_PRIMARY,
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
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Wallet
  walletList: {
    marginBottom: 12,
  },
  walletCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  walletIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  walletName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
  },
  walletType: {
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
  },

  // Coupon row
  couponRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  couponInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  couponCode: {
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    letterSpacing: 1,
  },
  couponDiscount: {
    fontSize: 13,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusExpired: { backgroundColor: '#FEE2E2' },
  statusText: {
    fontSize: 11,
    fontFamily: 'Heebo_700Bold',
  },
  statusTextActive: { color: SUCCESS },
  statusTextExpired: { color: ERROR },
  deleteButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButtonText: { fontSize: 18 },

  // Stats
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 28,
    fontFamily: 'Heebo_700Bold',
    color: BRAND_PRIMARY,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  // Become influencer
  influencerRequestButton: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  influencerRequestText: {
    fontSize: 15,
    fontFamily: 'Heebo_700Bold',
    color: BRAND_PRIMARY,
  },

  // Settings
  settingsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  settingsRowLast: { borderBottomWidth: 0 },
  settingsRowText: {
    fontSize: 15,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_PRIMARY,
  },
  settingsRowTextDanger: { color: ERROR },
  settingsRowArrow: {
    fontSize: 16,
    color: TEXT_TERTIARY,
  },

  // Secondary button
  secondaryButton: {
    borderWidth: 1,
    borderColor: BRAND_PRIMARY,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_700Bold',
    color: BRAND_PRIMARY,
  },
});
