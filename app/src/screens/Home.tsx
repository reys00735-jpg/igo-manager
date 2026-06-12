import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { listUserInitiatives } from '../lib/supabase';

export default function Home() {
  const navigation = useNavigation<any>();
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listUserInitiatives();
        setInitiatives(data || []);
      } catch (error) {
        console.warn('Unable to load initiatives', error);
        setInitiatives([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.heroCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrow}>Mis iniciativas</Text>
            <Text style={styles.title}>Prioriza con claridad</Text>
            <Text style={styles.subtitle}>
              Gestiona tus ideas y conviértelas en acciones.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateInitiative')}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 BOTÓN NUEVO: GRAFICOS */}
        <TouchableOpacity
          style={styles.graphButton}
          onPress={() => navigation.navigate('Graficos')}
        >
          <Text style={styles.graphButtonText}>Ver gráficos IGO 📊</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      {loading ? (
        <ActivityIndicator size="large" color="#2458C5" style={{ marginTop: 24 }} />
      ) : initiatives.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Aún no tienes iniciativas</Text>
          <Text style={styles.emptyText}>
            Crea la primera para empezar a priorizar y planificar.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateInitiative')}
          >
            <Text style={styles.primaryButtonText}>Crear iniciativa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingTop: 8 }}
          data={initiatives}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('Prioritization', { initiative: item })
              }
            >
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardText}>
                {item.descripcion || 'Sin descripción'}
              </Text>
              <Text style={styles.cardMeta}>
                Cuadrante {item.cuadrante || 'I'} • Importancia{' '}
                {item.importancia}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
    padding: 20,
  },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    color: '#2458C5',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#071D3A',
  },

  subtitle: {
    fontSize: 13,
    color: '#4B5B7A',
    marginTop: 4,
  },

  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2458C5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
  },

  /* 🔥 NUEVO BOTÓN GRAFICOS */
  graphButton: {
    marginTop: 12,
    backgroundColor: '#EAF1FF',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },

  graphButtonText: {
    color: '#2458C5',
    fontWeight: '700',
  },

  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6EDF8',
    marginTop: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#071D3A',
    marginBottom: 6,
  },

  emptyText: {
    color: '#4B5B7A',
    marginBottom: 14,
  },

  primaryButton: {
    backgroundColor: '#2458C5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EDF8',
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#071D3A',
    marginBottom: 6,
  },

  cardText: {
    color: '#4B5B7A',
    marginBottom: 6,
  },

  cardMeta: {
    color: '#2458C5',
    fontWeight: '600',
  },
});