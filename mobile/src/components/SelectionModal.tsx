import React, { useContext, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';

export type SelectionOption = {
  label: string;
  value: string;
  subtitle?: string;
};

export function SelectionModal({
  title,
  visible,
  onClose,
  onSelect,
  options,
  searchable = false,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: SelectionOption[];
  searchable?: boolean;
}) {
  const [query, setQuery] = useState('');
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const lowered = query.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lowered));
  }, [options, query, searchable]);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        {searchable ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            style={styles.input}
            placeholderTextColor="#7b8d87"
          />
        ) : null}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.value}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          renderItem={({ item }) => (
            <Pressable
              style={styles.option}
              onPress={() => {
                onSelect(item.value);
                setQuery('');
                onClose();
              }}
            >
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.subtitle ? <Text style={styles.optionSubtitle}>{item.subtitle}</Text> : null}
              </View>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3efe4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#183a33',
  },
  close: {
    color: '#0f766e',
    fontWeight: '700',
  },
  input: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#d8d1c1',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#183a33',
  },
  list: {
    padding: 20,
    gap: 10,
  },
  option: {
    backgroundColor: '#fffdf8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd5c4',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionLabel: {
    flex: 1,
    color: '#21463e',
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: '#6c7f79',
    fontSize: 13,
    textAlign: 'right',
  },
});
