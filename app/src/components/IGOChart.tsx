import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function IGOChart({
  importance,
  governability,
}: any) {
  const left = governability * 10;
  const top = 100 - importance * 10;

  return (
    <View style={styles.chart}>
      <View
        style={[
          styles.point,
          {
            left,
            top,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    width: 220,
    height: 220,
    borderWidth: 1,
    borderColor: '#DDD',
    alignSelf: 'center',
    marginVertical: 20,
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2458C5',
  },
});