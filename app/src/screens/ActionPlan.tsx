import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { scheduleDeadlineAlerts, requestNotificationPermissions } from '../lib/NotificationHandler';
import { createUserActionPlan } from '../lib/supabase';

export default function ActionPlan() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initiative = route.params?.initiative;
  const [deadline, setDeadline] = useState('');
  const [budget, setBudget] = useState('');
  const [allies, setAllies] = useState('');
  const [status, setStatus] = useState('Pendiente');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const savePlan = async () => {
    setSaving(true);
    setError('');

    try {
      const plan = await createUserActionPlan({
        iniciativa_id: initiative?.id || null,
        deadline,
        presupuesto: Number(budget || 0),
        aliados: allies,
        estado: status,
      });

      if (!plan) {
        setError('No pudimos guardar el plan. Intenta de nuevo.');
        setSaving(false);
        return;
      }

      await requestNotificationPermissions();
      await scheduleDeadlineAlerts(deadline, 'Tu plan de acción');
      navigation.navigate('Home');
    } catch (err) {
      setError('No pudimos guardar el plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Plan de acción</Text>
        <Text style={styles.title}>Convierte prioridades en ejecución</Text>
        <Text style={styles.subtitle}>Define fechas, presupuesto, responsables y estado para llevar la idea hacia adelante.</Text>
        <TextInput style={styles.input} placeholder="Fecha límite (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} />
        <TextInput style={styles.input} placeholder="Presupuesto estimado" value={budget} onChangeText={setBudget} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Aliados / responsables" value={allies} onChangeText={setAllies} />
        <TextInput style={styles.input} placeholder="Estado" value={status} onChangeText={setStatus} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={savePlan} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar plan'}</Text>
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
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: 'crimson', marginBottom: 8 },
});
