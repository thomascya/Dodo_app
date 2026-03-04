import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface CouponCardProps {
  couponId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  isVerified: boolean;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  expiresAt: string;
  redemptionType: 'online' | 'physical' | 'both';
  onReport: (couponId: string) => void;
  onUserPress?: (userId: string) => void;
}

export default function CouponCard({
  couponId,
  userId,
  userName,
  isVerified,
  discountType,
  discountValue,
  code,
  expiresAt,
  redemptionType,
  onReport,
  onUserPress,
}: CouponCardProps) {
  const [showFullCode, setShowFullCode] = useState(false);

  // Reset code visibility after 3 seconds
  useEffect(() => {
    if (showFullCode) {
      const timer = setTimeout(() => {
        setShowFullCode(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showFullCode]);

  const discountText = discountType === 'percentage'
    ? `${discountValue}% הנחה`
    : `₪${discountValue} הנחה`;

  const maskedCode = code.length > 4
    ? `${code.slice(0, 4)}***`
    : `${code.slice(0, 2)}***`;

  const displayCode = showFullCode ? code : maskedCode;

  const redemptionIcon = redemptionType === 'online'
    ? '🌐'
    : redemptionType === 'physical'
      ? '🏪'
      : '🌐🏪';

  // Format expiry date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setShowFullCode(true);
      Alert.alert('הקוד הועתק!', `הקוד ${code} הועתק ללוח`);
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן להעתיק את הקוד');
    }
  };

  const handleUserPress = () => {
    if (onUserPress) {
      onUserPress(userId);
    } else {
      console.log('User tapped:', userName, userId);
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info Row */}
      <TouchableOpacity
        style={styles.userRow}
        onPress={handleUserPress}
        activeOpacity={0.7}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
        </View>
        <Text style={styles.redemptionIcon}>{redemptionIcon}</Text>
      </TouchableOpacity>

      {/* Discount */}
      <Text style={styles.discountText}>{discountText}</Text>

      {/* Code Display */}
      <View style={styles.codeRow}>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{displayCode}</Text>
        </View>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyCode}
          activeOpacity={0.7}
        >
          <Text style={styles.copyButtonText}>העתק קוד</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.expiryText}>
          פג תוקף: {formatDate(expiresAt)}
        </Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => onReport(couponId)}
          activeOpacity={0.7}
        >
          <Text style={styles.reportIcon}>🚩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  avatarIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Heebo_700Bold',
    color: '#1A1A1A',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#7C3AED',
    marginRight: 4,
    fontWeight: 'bold',
  },
  redemptionIcon: {
    fontSize: 16,
  },
  discountText: {
    fontSize: 20,
    fontFamily: 'Heebo_700Bold',
    color: '#7C3AED',
    textAlign: 'right',
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  copyButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    color: '#6B7280',
  },
  reportButton: {
    padding: 4,
  },
  reportIcon: {
    fontSize: 16,
  },
});
