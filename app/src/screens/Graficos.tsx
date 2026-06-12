import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { listUserInitiatives } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

export default function Graficos() {
  const [initiatives, setInitiatives] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await listUserInitiatives();
      setInitiatives(data || []);
    };
    load();
  }, []);

  // 🥧 Datos para PIE CHART (por cuadrante)
  const cuadrantes: Record<string, number> = {
  'Hacer ya': 0,
  'Estrategia': 0,
  'Rutina': 0,
  'Descartar': 0,
};

  initiatives.forEach((i) => {
    const imp = i.importancia || 0;
    const gov = i.gobernabilidad || 0;

    let cuadrante = 'Descartar';

    if (imp >= 6 && gov >= 6) cuadrante = 'Hacer ya';
    else if (imp >= 6) cuadrante = 'Estrategia';
    else if (gov >= 6) cuadrante = 'Rutina';

    cuadrantes[cuadrante] = (cuadrantes[cuadrante] || 0) + 1;
  });

  const pieData = [
    {
      name: 'Hacer ya',
      population: cuadrantes['Hacer ya'],
      color: '#2ecc71',
      legendFontColor: '#333',
    },
    {
      name: 'Estrategia',
      population: cuadrantes['Estrategia'],
      color: '#3498db',
      legendFontColor: '#333',
    },
    {
      name: 'Rutina',
      population: cuadrantes['Rutina'],
      color: '#f1c40f',
      legendFontColor: '#333',
    },
    {
      name: 'Descartar',
      population: cuadrantes['Descartar'],
      color: '#e74c3c',
      legendFontColor: '#333',
    },
  ];

  // 📊 BAR CHART (importancia promedio)
  const avgImportance =
    initiatives.reduce((acc, i) => acc + (i.importancia || 0), 0) /
    (initiatives.length || 1);

  const barData = {
    labels: ['Importancia', 'Gobernabilidad'],
    datasets: [
      {
        data: [
          avgImportance,
          initiatives.reduce((a, i) => a + (i.gobernabilidad || 0), 0) /
            (initiatives.length || 1),
        ],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Dashboard IGO</Text>

      {/* 🥧 PIE CHART */}
      <Text style={styles.subtitle}>Distribución por cuadrantes</Text>

      <PieChart
        data={pieData}
        width={screenWidth - 30}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        chartConfig={{
          color: () => '#000',
        }}
      />

      {/* 📊 BAR CHART */}
      <Text style={styles.subtitle}>Promedios IGO</Text>

      <BarChart
        data={barData}
        width={screenWidth - 30}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: () => '#2458C5',
          labelColor: () => '#333',
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
});