import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function FilterPill({
  label,
  active,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        active && styles.active,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          active && styles.activeText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9EEF8',
    marginRight: 8,
  },
  active: {
    backgroundColor: '#2458C5',
  },
  text: {
    color: '#071D3A',
  },
  activeText: {
    color: '#fff',
  },
});