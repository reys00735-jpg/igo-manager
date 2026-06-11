import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function IGOSlider({ label, value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}: {value}
      </Text>

      <Slider
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontWeight: '700',
    marginBottom: 6,
  },
});