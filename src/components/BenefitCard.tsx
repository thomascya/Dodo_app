import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface BenefitCardProps {
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  walletName: string;
  walletType: 'credit_card' | 'club';
  description?: string | null;
  redemptionType: 'online' | 'physical' | 'both';
}

export default function BenefitCard({
  discountType,
  discountValue,
  walletName,
  walletType,
  description,
  redemptionType,
}: BenefitCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const discountText = discountType === 'percentage'
    ? `${discountValue}% הנחה`
    : `₪${discountValue} הנחה`;

  const sourceLabel = walletType === 'credit_card' ? 'כרטיס' : 'מועדון';

  const redemptionIcon = redemptionType === 'online'
    ? '🌐'
    : redemptionType === 'physical'
      ? '🏪'
      : '🌐🏪';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.discountContainer}>
          <Text style={styles.discountText}>{discountText}</Text>
          <Text style={styles.redemptionIcon}>{redemptionIcon}</Text>
        </View>
      </View>

      <Text style={styles.sourceText}>
        {sourceLabel} {walletName}
      </Text>

      {description && showDetails && (
        <Text style={styles.descriptionText}>{description}</Text>
      )}

      {description && (
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailsButtonText}>
            {showDetails ? 'הסתר פרטים' : 'פרטים נוספים'}
          </Text>
        </TouchableOpacity>
      )}
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
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  discountText: {
    fontSize: 20,
    fontFamily: 'Heebo_700Bold',
    color: '#7C3AED',
  },
  redemptionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sourceText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#1A1A1A',
    textAlign: 'right',
    marginTop: 12,
    lineHeight: 20,
  },
  detailsButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#7C3AED',
  },
});
