import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Welcome() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Dinámica del Oriente</Text>
        </View>
        <Text style={styles.title}>IGO Manager</Text>
        <Text style={styles.subtitle}>Transforma ideas en prioridades claras, planes accionables y decisiones más inteligentes.</Text>

        <View style={styles.featureRow}>
          <View style={styles.featurePill}><Text style={styles.featureText}>Prioriza</Text></View>
          <View style={styles.featurePill}><Text style={styles.featureText}>Organiza</Text></View>
          <View style={styles.featurePill}><Text style={styles.featureText}>Ejecuta</Text></View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('RegisterStep1')}>
          <Text style={styles.primaryText}>Comenzar registro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#071D3A', padding: 24 },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  badge: { backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, alignSelf: 'flex-start', marginBottom: 12 },
  badgeText: { color: '#2458C5', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.1, fontSize: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#071D3A', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#4B5B7A', marginBottom: 20, lineHeight: 22 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 8 },
  featurePill: { backgroundColor: '#F5F8FF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  featureText: { color: '#2458C5', fontWeight: '700' },
  primaryButton: { backgroundColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: '#2458C5', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  secondaryText: { color: '#2458C5', fontWeight: '700' },
});
