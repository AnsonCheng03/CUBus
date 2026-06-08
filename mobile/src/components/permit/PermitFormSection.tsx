import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
    <ScrollView
      style={styles.formPage}
      contentContainerStyle={styles.formPageContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
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
              maxLength={20}
              placeholder={placeholder}
              placeholderTextColor="#ab9d95"
              selectionColor="#911f27"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formPage: {
    flex: 1,
  },
  formPageContent: {
    paddingTop: 24,
    paddingBottom: 6,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(90, 60, 50, 0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  inputRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f2ebe6',
  },
  inputLabel: {
    color: '#6d4d47',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 7,
  },
  input: {
    color: '#26201e',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonColumn: {
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#911f27',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
    shadowColor: '#630a10',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f7f1ed',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'center',
    width: '92%',
  },
  secondaryButtonText: {
    color: '#745b52',
    fontWeight: '700',
    fontSize: 15,
  },
});
