import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RegisterStep1() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({ nombre: '', empresa: '', correo: '', celular: '', password: '' });
  const valid = form.nombre && form.empresa && /.+@.+\..+/.test(form.correo) && form.celular && form.password.length >= 6;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Paso 1 de 2</Text>
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.subtitle}>Tu perfil emprendedor</Text>
        <TextInput style={styles.input} placeholder="Nombre del emprendedor" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
        <TextInput style={styles.input} placeholder="Empresa o idea" value={form.empresa} onChangeText={(v) => setForm({ ...form, empresa: v })} />
        <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" value={form.correo} onChangeText={(v) => setForm({ ...form, correo: v })} />
        <TextInput style={styles.input} placeholder="Celular" keyboardType="phone-pad" value={form.celular} onChangeText={(v) => setForm({ ...form, celular: v })} />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />
        <TouchableOpacity style={[styles.button, !valid && styles.buttonDisabled]} onPress={() => navigation.navigate('RegisterStep2', { form })} disabled={!valid}>
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F5F8FF' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  eyebrow: { color: '#2458C5', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { fontSize: 24, fontWeight: '800', color: '#071D3A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5B7A', marginBottom: 20 },
  input: { backgroundColor: '#F7FAFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DDE6F6' },
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#93A9CF' },
  buttonText: { color: '#fff', fontWeight: '700' },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#2458C5', fontWeight: '600' },
});
