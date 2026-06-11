import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InitiativeCard({ item }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.titulo}</Text>

      <Text>
        Estado: {item.estado || 'Pendiente'}
      </Text>

      <Text>
        Cuadrante: {item.cuadrante || '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
});