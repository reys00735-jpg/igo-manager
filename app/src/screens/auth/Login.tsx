import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCurrentUserProfile, hasSupabaseConfig, setDemoSession, supabase } from '../../lib/supabase';

export default function Login() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const registeredEmail = route.params?.registeredEmail || '';
    const registeredPassword = route.params?.registeredPassword || '';
    const registrationSuccess = route.params?.registrationSuccess || false;
    const registrationMessage = route.params?.registrationMessage || '';

    if (registeredEmail) {
      setEmail(registeredEmail);
    }
    if (registeredPassword) {
      setPassword(registeredPassword);
    }
    if (registrationSuccess) {
      setSuccessMessage(registrationMessage || 'Cuenta creada con éxito. Ya puedes iniciar sesión.');
    }
  }, [route.params?.registeredEmail, route.params?.registeredPassword, route.params?.registrationSuccess, route.params?.registrationMessage]);

  const handleLogin = async () => {
    setLoading(true);

    if (!hasSupabaseConfig()) {
      await setDemoSession({ id: 'demo-user', email });
      setLoading(false);
      navigation.replace('Home');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const isConfirmationError = /confirm|confirmed|verify|email/i.test(error.message || '');
      setError(
        isConfirmationError
          ? 'Tu cuenta se creó. Revisa tu correo para confirmar la cuenta y luego inicia sesión.'
          : error.message || 'Credenciales inválidas',
      );
      return;
    }
    if (data.session) {
      await getCurrentUserProfile();
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Bienvenido de nuevo</Text>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Accede a tu tablero y sigue trabajando tus iniciativas.</Text>
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        <TextInput style={styles.input} placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('RegisterStep1')}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F8FF' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  eyebrow: { color: '#2458C5', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.1 },
  title: { fontSize: 24, fontWeight: '800', color: '#071D3A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4B5B7A', marginBottom: 18 },
  input: { backgroundColor: '#F7FAFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#DDE6F6' },
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#2458C5', fontWeight: '600' },
  success: { color: '#1f8f53', marginBottom: 10, fontWeight: '600' },
  error: { color: 'crimson', marginBottom: 8 },
});
