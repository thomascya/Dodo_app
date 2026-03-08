import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { api } from '../config/api';
import { getStores } from '../services/apiClient';
import type { Database } from '../types/database.types';
import {
  BRAND_PRIMARY,
  BG_PRIMARY,
  BG_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_MEDIUM,
  BORDER_LIGHT,
  ERROR,
  SUCCESS,
} from '../constants/colors';

type StoreRow = Database['public']['Tables']['stores']['Row'];
type DiscountType = 'percentage' | 'fixed';
type RedemptionType = 'online' | 'physical' | 'both';

export default function AddCouponScreen() {
  const navigation = useNavigation();

  // Store selection
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [storeQuery, setStoreQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [redemptionType, setRedemptionType] = useState<RedemptionType>('both');
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load stores for autocomplete
  useEffect(() => {
    getStores().then(setStores).catch(() => {});
  }, []);

  const filteredStores = storeQuery.trim()
    ? stores.filter(s => s.name.toLowerCase().includes(storeQuery.toLowerCase()))
    : stores;

  const handleSelectStore = useCallback((store: StoreRow) => {
    setSelectedStore(store);
    setStoreQuery(store.name);
    setShowStoreDropdown(false);
    setErrors(prev => ({ ...prev, store: '' }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedStore) newErrors.store = 'יש לבחור חנות';
    if (!code.trim()) newErrors.code = 'יש להזין קוד קופון';
    if (!discountValue.trim() || Number(discountValue) <= 0) {
      newErrors.discountValue = 'יש להזין סכום/אחוז הנחה תקין';
    }
    if (!expiresAt.trim()) {
      newErrors.expiresAt = 'יש להזין תאריך תפוגה (DD/MM/YYYY)';
    } else {
      const parts = expiresAt.split('/');
      if (parts.length !== 3) {
        newErrors.expiresAt = 'פורמט: DD/MM/YYYY';
      } else {
        const parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (isNaN(parsed.getTime())) {
          newErrors.expiresAt = 'תאריך לא תקין';
        } else if (parsed <= new Date()) {
          newErrors.expiresAt = 'התאריך חייב להיות בעתיד';
        }
      }
    }
    if (description.length > 100) newErrors.description = 'עד 100 תווים';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedStore, code, discountValue, expiresAt, description]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const parts = expiresAt.split('/');
    const isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59Z`).toISOString();

    setSubmitting(true);
    try {
      await api.post('/coupons', {
        store_id: selectedStore!.id,
        code: code.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        description: description.trim() || null,
        redemption_type: redemptionType,
        expires_at: isoDate,
      });

      Alert.alert('הקוד פורסם!', 'הקוד מופיע כעת בעמוד החנות', [
        { text: 'מעולה', onPress: () => navigation.goBack() },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'לא ניתן לפרסם את הקוד';
      Alert.alert('שגיאה', msg);
    } finally {
      setSubmitting(false);
    }
  }, [validate, selectedStore, code, discountType, discountValue, description, redemptionType, expiresAt, navigation]);

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
          <Text style={styles.title}>הוספת קוד חדש</Text>

          {/* Store autocomplete */}
          <Text style={styles.label}>שם החנות *</Text>
          <TextInput
            style={[styles.input, errors.store ? styles.inputError : null]}
            value={storeQuery}
            onChangeText={text => {
              setStoreQuery(text);
              setSelectedStore(null);
              setShowStoreDropdown(true);
            }}
            onFocus={() => setShowStoreDropdown(true)}
            placeholder="חפש חנות..."
            placeholderTextColor={TEXT_TERTIARY}
            textAlign="right"
          />
          {errors.store ? <Text style={styles.errorText}>{errors.store}</Text> : null}

          {showStoreDropdown && filteredStores.length > 0 && !selectedStore && (
            <View style={styles.dropdown}>
              {filteredStores.slice(0, 5).map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectStore(s)}
                >
                  <Text style={styles.dropdownText}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Discount */}
          <Text style={styles.label}>הנחה *</Text>
          <View style={styles.discountRow}>
            <TextInput
              style={[styles.input, styles.discountInput, errors.discountValue ? styles.inputError : null]}
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="numeric"
              placeholder="סכום"
              placeholderTextColor={TEXT_TERTIARY}
              textAlign="right"
            />
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, discountType === 'percentage' && styles.toggleActive]}
                onPress={() => setDiscountType('percentage')}
              >
                <Text style={[styles.toggleText, discountType === 'percentage' && styles.toggleTextActive]}>%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, discountType === 'fixed' && styles.toggleActive]}
                onPress={() => setDiscountType('fixed')}
              >
                <Text style={[styles.toggleText, discountType === 'fixed' && styles.toggleTextActive]}>₪</Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.discountValue ? <Text style={styles.errorText}>{errors.discountValue}</Text> : null}

          {/* Code */}
          <Text style={styles.label}>קוד הקופון *</Text>
          <TextInput
            style={[styles.input, errors.code ? styles.inputError : null]}
            value={code}
            onChangeText={setCode}
            placeholder="למשל: SAVE20"
            placeholderTextColor={TEXT_TERTIARY}
            autoCapitalize="characters"
            textAlign="right"
          />
          {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}

          {/* Redemption type */}
          <Text style={styles.label}>סוג מימוש *</Text>
          <View style={styles.toggleRow}>
            {([
              { key: 'online' as RedemptionType, label: '🌐 אונליין' },
              { key: 'physical' as RedemptionType, label: '🏪 פיזי' },
              { key: 'both' as RedemptionType, label: '🌐🏪 שניהם' },
            ]).map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.toggleButton, styles.toggleWide, redemptionType === opt.key && styles.toggleActive]}
                onPress={() => setRedemptionType(opt.key)}
              >
                <Text style={[styles.toggleText, redemptionType === opt.key && styles.toggleTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expiry */}
          <Text style={styles.label}>תאריך תפוגה *</Text>
          <TextInput
            style={[styles.input, errors.expiresAt ? styles.inputError : null]}
            value={expiresAt}
            onChangeText={setExpiresAt}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={TEXT_TERTIARY}
            keyboardType="numeric"
            textAlign="right"
          />
          {errors.expiresAt ? <Text style={styles.errorText}>{errors.expiresAt}</Text> : null}

          {/* Description */}
          <Text style={styles.label}>תיאור (אופציונלי)</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
            value={description}
            onChangeText={setDescription}
            placeholder="פרטים נוספים על הקוד..."
            placeholderTextColor={TEXT_TERTIARY}
            multiline
            maxLength={100}
            textAlign="right"
          />
          <Text style={styles.charCount}>{description.length}/100</Text>
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>פרסם קוד</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>ביטול</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
    marginBottom: 24,
  },

  // Labels & inputs
  label: {
    fontSize: 14,
    fontFamily: 'Heebo_700Bold',
    color: TEXT_PRIMARY,
    textAlign: 'right',
    marginBottom: 6,
    marginTop: 16,
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
  },
  inputError: {
    borderColor: ERROR,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Heebo_400Regular',
    color: ERROR,
    textAlign: 'right',
    marginTop: 4,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_TERTIARY,
    textAlign: 'left',
    marginTop: 2,
  },

  // Store dropdown
  dropdown: {
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    borderRadius: 8,
    backgroundColor: BG_PRIMARY,
    marginTop: -4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_PRIMARY,
    textAlign: 'right',
  },

  // Discount row
  discountRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  discountInput: {
    flex: 1,
  },

  // Toggle buttons
  toggleRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 4,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: BORDER_MEDIUM,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  toggleWide: {
    flex: 1,
  },
  toggleActive: {
    backgroundColor: BRAND_PRIMARY,
    borderColor: BRAND_PRIMARY,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_PRIMARY,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Heebo_700Bold',
  },

  // Buttons
  submitButton: {
    backgroundColor: BRAND_PRIMARY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
});
