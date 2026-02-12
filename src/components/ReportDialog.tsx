import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';

export type ReportReason = 'not_working' | 'expired' | 'inappropriate' | 'other';

interface ReportDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
}

const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: 'not_working', label: 'הקוד לא עובד' },
  { id: 'expired', label: 'הקוד פג תוקף' },
  { id: 'inappropriate', label: 'תוכן לא הולם' },
  { id: 'other', label: 'אחר' },
];

export default function ReportDialog({
  visible,
  onClose,
  onSubmit,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setLoading(true);
    try {
      await onSubmit(selectedReason, details);
      // Reset state
      setSelectedReason(null);
      setDetails('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>דיווח על קוד</Text>

          {/* Reason Selection */}
          <View style={styles.reasonsContainer}>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={styles.reasonRow}
                onPress={() => setSelectedReason(reason.id)}
                activeOpacity={0.7}
              >
                <View style={styles.radioContainer}>
                  <View style={styles.radioOuter}>
                    {selectedReason === reason.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.reasonText}>{reason.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Details Input */}
          <TextInput
            style={styles.detailsInput}
            placeholder="פרטים נוספים..."
            placeholderTextColor="#9CA3AF"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
            textAlign="right"
            textAlignVertical="top"
          />

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                !selectedReason && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>שלח דיווח</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Heebo_700Bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  reasonsContainer: {
    marginBottom: 16,
  },
  reasonRow: {
    paddingVertical: 12,
  },
  radioContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
  },
  reasonText: {
    fontSize: 16,
    fontFamily: 'Heebo_400Regular',
    color: '#1A1A1A',
  },
  detailsInput: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Heebo_400Regular',
    color: '#1A1A1A',
    minHeight: 80,
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#C4B5FD',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Heebo_700Bold',
    color: '#FFFFFF',
  },
});
