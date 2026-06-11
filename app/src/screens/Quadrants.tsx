import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Quadrants() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initiative = route.params?.initiative;
  const importance = initiative?.importancia || 5;
  const governability = initiative?.gobernabilidad || 5;

  const quadrant = importance >= 6 && governability >= 6
    ? { title: '¡HACER YA!', description: 'Alta importancia + alta gobernabilidad' }
    : importance >= 6
      ? { title: 'ESTRATÉGICO', description: 'Alta importancia + baja gobernabilidad' }
      : governability >= 6
        ? { title: 'RUTINA', description: 'Baja importancia + alta gobernabilidad' }
        : { title: 'DESCARTE', description: 'Baja importancia + baja gobernabilidad' };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Matriz IGO</Text>
        <Text style={styles.title}>Tu iniciativa encaja aquí</Text>
        <Text style={styles.subtitle}>Tu iniciativa se ubica en el cuadrante correcto.</Text>
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>Tu resultado</Text>
          <Text style={styles.highlightQuadrant}>{quadrant.title}</Text>
          <Text style={styles.highlightText}>Importancia {importance} • Gobernabilidad {governability}</Text>
        </View>
        <View style={styles.matrix}>
          <View style={styles.quadrant}><Text style={styles.quadrantTitle}>¡HACER YA!</Text><Text style={styles.quadrantDesc}>Alta importancia + alta gobernabilidad</Text></View>
          <View style={styles.quadrant}><Text style={styles.quadrantTitle}>ESTRATÉGICO</Text><Text style={styles.quadrantDesc}>Alta importancia + baja gobernabilidad</Text></View>
          <View style={styles.quadrant}><Text style={styles.quadrantTitle}>RUTINA</Text><Text style={styles.quadrantDesc}>Baja importancia + alta gobernabilidad</Text></View>
          <View style={styles.quadrant}><Text style={styles.quadrantTitle}>DESCARTE</Text><Text style={styles.quadrantDesc}>Baja importancia + baja gobernabilidad</Text></View>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ActionPlan', { initiative })}>
          <Text style={styles.buttonText}>Crear plan de acción</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F5F8FF' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  eyebrow: { color: '#2458C5', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { fontSize: 24, fontWeight: '800', color: '#071D3A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5B7A', marginBottom: 18 },
  highlightCard: { backgroundColor: '#F7FAFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E6EDF8', marginBottom: 16 },
  highlightTitle: { color: '#2458C5', fontWeight: '700', marginBottom: 6 },
  highlightQuadrant: { fontSize: 18, fontWeight: '800', color: '#071D3A', marginBottom: 4 },
  highlightText: { color: '#4B5B7A' },
  matrix: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  quadrant: { width: '48%', backgroundColor: '#fff', padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E6EDF8' },
  quadrantTitle: { fontSize: 16, fontWeight: '800', color: '#2458C5', marginBottom: 6 },
  quadrantDesc: { color: '#4B5B7A' },
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
