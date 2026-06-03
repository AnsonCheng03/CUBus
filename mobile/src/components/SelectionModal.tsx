import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type SelectionOption = {
  label: string;
  value: string;
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

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const lowered = query.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lowered));
  }, [options, query, searchable]);

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
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
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.option}
              onPress={() => {
                onSelect(item.value);
                setQuery('');
                onClose();
              }}
            >
              <Text style={styles.optionLabel}>{item.label}</Text>
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
    paddingVertical: 16,
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
  optionLabel: {
    color: '#21463e',
    fontSize: 16,
    fontWeight: '600',
  },
});
