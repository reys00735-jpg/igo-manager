import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserInitiative } from '../lib/supabase';

export default function CreateInitiative() {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Agrega un título para continuar.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const initiative = await createUserInitiative({
        titulo: title.trim(),
        descripcion: description.trim(),
        importancia: 5,
        gobernabilidad: 5,
      });

      if (!initiative) {
        setError('No pudimos guardar la iniciativa. Intenta de nuevo.');
        setSubmitting(false);
        return;
      }

      navigation.navigate('Prioritization', { initiative });
    } catch (err) {
      setError('Ocurrió un problema inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Nueva idea</Text>
        <Text style={styles.title}>Nueva iniciativa</Text>
        <Text style={styles.subtitle}>Captura tus ideas de forma rápida y conviértelas en una ruta clara.</Text>
        <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={(value) => { setTitle(value); setError(''); }} />
        <TextInput style={[styles.input, styles.textarea]} multiline placeholder="Descripción" value={description} onChangeText={setDescription} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Guardando...' : 'Guardar e ir a priorizar'}</Text>
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
  input: { backgroundColor: '#F7FAFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DDE6F6' },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: 'crimson', marginBottom: 8 },
});
