import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updateUserInitiative } from '../lib/supabase';

export default function Prioritization() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initiative = route.params?.initiative;
  const [importance, setImportance] = useState(initiative?.importancia || 5);
  const [governability, setGovernability] = useState(initiative?.gobernabilidad || 5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveScores = async () => {
    if (!initiative?.id) return;
    setSaving(true);
    setError('');

    const updated = await updateUserInitiative(initiative.id, { importancia: importance, gobernabilidad: governability });

    setSaving(false);

    if (!updated) {
      setError('No pudimos guardar la evaluación. Intenta de nuevo.');
      return;
    }

    navigation.navigate('Quadrants', { initiative: { ...initiative, importancia: importance, gobernabilidad: governability } });
  };

  const previewLabel = importance >= 6 && governability >= 6
    ? '¡Hacer ya!'
    : importance >= 6
      ? 'Estrategia'
      : governability >= 6
        ? 'Rutina'
        : 'Descartar';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Motor IGO</Text>
        <Text style={styles.title}>Prioriza con impacto</Text>
        <Text style={styles.subtitle}>Califica impacto y gobernabilidad para ubicar la iniciativa en el mejor cuadrante.</Text>
        <View style={styles.panel}>
          <Text style={styles.label}>Importancia: {importance}</Text>
          <Slider value={importance} onValueChange={setImportance} minimumValue={1} maximumValue={10} step={1} minimumTrackTintColor="#2458C5" maximumTrackTintColor="#DDE6F6" />
          <Text style={styles.label}>Gobernabilidad: {governability}</Text>
          <Slider value={governability} onValueChange={setGovernability} minimumValue={1} maximumValue={10} step={1} minimumTrackTintColor="#2458C5" maximumTrackTintColor="#DDE6F6" />
        </View>
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Vista previa</Text>
          <Text style={styles.previewText}>Tu iniciativa podría encajar mejor en el cuadrante {previewLabel}.</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={saveScores} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar evaluación'}</Text>
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
  panel: { backgroundColor: '#F7FAFF', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#E6EDF8', marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '700', color: '#071D3A', marginBottom: 8 },
  preview: { backgroundColor: '#EAF1FF', borderRadius: 18, padding: 16, marginBottom: 16 },
  previewTitle: { fontSize: 16, fontWeight: '700', color: '#2458C5', marginBottom: 4 },
  previewText: { color: '#4B5B7A' },
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: 'crimson', marginBottom: 8 },
});
