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
    position: 'relative',
  },
  label: {
    height: 0,
    opacity: 0,
    marginBottom: 0,
  },
  input: {
    width: '100%',
    fontSize: 20,
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 7,
    backgroundColor: 'transparent',
    color: '#111',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: -10,
    right: -10,
    zIndex: 99,
    maxHeight: 220,
    borderRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#a6adc9',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  suggestion: {
    paddingHorizontal: 35,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#630a10',
  },
  suggestionText: {
    color: '#111',
  },
});
