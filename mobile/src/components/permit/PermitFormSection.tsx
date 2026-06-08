import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { PermitFormValue } from '../../types/mobile';

const FIELDS: Array<[string, keyof PermitFormValue, string]> = [
  ['School_Bus_Permit_Name', 'name', 'Vanessa'],
  ['School_Bus_Permit_SID', 'sid', '1155123456'],
  ['School_Bus_Permit_Major', 'major', 'CSCIN'],
  ['School_Bus_Permit_Exp', 'expiry', '4/1989'],
];

export function PermitFormSection({
  form,
  t,
  onChangeField,
  onSave,
  showCancel,
  onCancel,
}: {
  form: PermitFormValue;
  t: (key: string) => string;
  onChangeField: (field: keyof PermitFormValue, value: string) => void;
  onSave: () => void;
  showCancel: boolean;
  onCancel: () => void;
}) {
  return (
    <View style={styles.formPage}>
      <View style={styles.formCard}>
        {FIELDS.map(([key, field, placeholder], index, array) => (
          <View
            key={field}
            style={[styles.inputRow, index !== array.length - 1 && styles.inputRowDivider]}
          >
            <Text style={styles.inputLabel}>{t(key)}</Text>
            <TextInput
              value={form[field]}
              onChangeText={(value) => onChangeField(field, value)}
              placeholder={placeholder}
              placeholderTextColor="#9c8f88"
              style={styles.input}
            />
          </View>
        ))}
      </View>

      <View style={styles.buttonColumn}>
        <Pressable style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>{t('Permit_Save')}</Text>
        </Pressable>
        {showCancel ? (
          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>{t('Cancel')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formPage: {
    flex: 1,
    gap: 16,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#4d1c22',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  inputRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  inputRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#efe7e1',
  },
  inputLabel: {
    color: '#7f655a',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  input: {
    color: '#111',
    fontSize: 18,
    paddingVertical: 2,
  },
  buttonColumn: {
    gap: 10,
    marginTop: 'auto',
    paddingTop: 4,
  },
  primaryButton: {
    backgroundColor: '#630a10',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#630a10',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#efe4dc',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6e5348',
    fontWeight: '700',
    fontSize: 15,
  },
});
