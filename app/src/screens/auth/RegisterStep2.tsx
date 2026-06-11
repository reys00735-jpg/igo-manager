import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { hasSupabaseConfig, setDemoSession, supabase } from '../../lib/supabase';

const sectors = ['Agro', 'Calzado/Moda', 'Tecnología', 'Servicios', 'Comercio', 'Salud', 'Turismo', 'Educación', 'Otro'];
const sizes = ['Idea', 'Micro <10', 'Pequeña <50', 'Mediana <200', 'Grande'];
const ages = ['18-25', '26-35', '36-45', '46-55', '+56'];
const genders = ['Masculino', 'Femenino', 'Otro'];

const retryAutoLogin = async (email: string, password: string) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      return { success: true, session: data.session };
    }
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return { success: false };
};

export default function RegisterStep2() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { form } = route.params;
  const [profile, setProfile] = useState({ sector: sectors[0], tamano: sizes[0], edad: ages[0], genero: genders[0] });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!accepted) return;

    setLoading(true);
    setError('');

    try {
      if (!hasSupabaseConfig()) {
        await setDemoSession({ id: 'demo-user', email: form.correo });
        setLoading(false);
        navigation.replace('Home');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
      });

      if (authError) {
        setLoading(false);
        setError(authError.message || 'No se pudo crear la cuenta.');
        return;
      }

      let signedIn = Boolean(authData.session);
      if (!signedIn) {
        const autoLogin = await retryAutoLogin(form.correo, form.password);
        signedIn = autoLogin.success;
      }

      const authUserId = authData.user?.id;
      if (authUserId) {
        const { error: profileError } = await supabase.from('users').insert({
          auth_user_id: authUserId,
          nombre: form.nombre,
          empresa: form.empresa,
          correo: form.correo,
          celular: form.celular,
          sector: profile.sector,
          tamano: profile.tamano,
          edad: profile.edad,
          genero: profile.genero,
          rol: 'emprendedor',
        });

        if (profileError) {
          console.warn(profileError.message);
        }
      }

      setLoading(false);
      if (signedIn) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login', {
          registeredEmail: form.correo,
          registeredPassword: form.password,
          registrationSuccess: true,
        });
      }
    } catch (err) {
      setLoading(false);
      setError('Ocurrió un problema inesperado. Intenta de nuevo.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Paso 2 de 2</Text>
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.subtitle}>Perfil empresarial</Text>
        <Text style={styles.label}>Sector económico</Text>
        <View style={styles.optionWrap}>{sectors.map((item) => <TouchableOpacity key={item} style={[styles.option, profile.sector === item && styles.optionActive]} onPress={() => setProfile({ ...profile, sector: item })}><Text style={profile.sector === item ? styles.optionTextActive : styles.optionText}>{item}</Text></TouchableOpacity>)}</View>
        <Text style={styles.label}>Tamaño de empresa</Text>
        <View style={styles.optionWrap}>{sizes.map((item) => <TouchableOpacity key={item} style={[styles.option, profile.tamano === item && styles.optionActive]} onPress={() => setProfile({ ...profile, tamano: item })}><Text style={profile.tamano === item ? styles.optionTextActive : styles.optionText}>{item}</Text></TouchableOpacity>)}</View>
        <Text style={styles.label}>Rango de edad</Text>
        <View style={styles.optionWrap}>{ages.map((item) => <TouchableOpacity key={item} style={[styles.option, profile.edad === item && styles.optionActive]} onPress={() => setProfile({ ...profile, edad: item })}><Text style={profile.edad === item ? styles.optionTextActive : styles.optionText}>{item}</Text></TouchableOpacity>)}</View>
        <Text style={styles.label}>Género</Text>
        <View style={styles.optionWrap}>{genders.map((item) => <TouchableOpacity key={item} style={[styles.option, profile.genero === item && styles.optionActive]} onPress={() => setProfile({ ...profile, genero: item })}><Text style={profile.genero === item ? styles.optionTextActive : styles.optionText}>{item}</Text></TouchableOpacity>)}</View>
        <View style={styles.termsRow}><Switch value={accepted} onValueChange={setAccepted} /><Text style={styles.termsText}>Acepto el tratamiento de datos y términos.</Text></View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={[styles.button, !accepted && styles.buttonDisabled]} onPress={handleSubmit} disabled={!accepted || loading}>
          <Text style={styles.buttonText}>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Volver</Text>
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
  subtitle: { fontSize: 14, color: '#4B5B7A', marginBottom: 16 },
  label: { fontWeight: '700', color: '#071D3A', marginTop: 10, marginBottom: 8 },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: '#DDE6F6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  optionActive: { backgroundColor: '#2458C5', borderColor: '#2458C5' },
  optionText: { color: '#071D3A' },
  optionTextActive: { color: '#fff' },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 12, backgroundColor: '#F7FAFF', padding: 12, borderRadius: 14 },
  termsText: { marginLeft: 10, color: '#4B5B7A', flex: 1 },
  button: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#93A9CF' },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: 'crimson', marginBottom: 8 },
  linkButton: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#2458C5', fontWeight: '600' },
});
