import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export function AutocompleteField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!value.trim()) return options.slice(0, 8);
    const lowered = value.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(lowered)).slice(0, 8);
  }, [options, value]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#7b8d87"
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
      />
      {focused && suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((option) => (
            <Pressable key={option} style={styles.suggestion} onPress={() => onChange(option)}>
              <Text style={styles.suggestionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: '#30534c',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#fffdf8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9d0be',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#173f35',
  },
  suggestions: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9d0be',
    backgroundColor: '#fffdf8',
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e1d3',
  },
  suggestionText: {
    color: '#264841',
  },
});
