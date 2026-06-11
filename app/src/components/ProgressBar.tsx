import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  progress: number;
}

export default function ProgressBar({
  progress,
}: Props) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.fill,
          { width: `${progress}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: '#DDE6F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2458C5',
  },
});