import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface WordItem { word: string; weight: number; }

const demoWords: WordItem[] = [
  { word: 'innovación', weight: 8 },
  { word: 'mercado', weight: 7 },
  { word: 'tecnología', weight: 6 },
  { word: 'priorizar', weight: 6 },
  { word: 'crecimiento', weight: 5 },
  { word: 'gobernabilidad', weight: 5 },
  { word: 'clientes', weight: 4 },
  { word: 'estrategia', weight: 4 },
  { word: 'ejecución', weight: 3 },
  { word: 'liderazgo', weight: 3 },
];

export default function WordCloud() {
  const navigate = useNavigate();
  const [words, setWords] = useState<WordItem[]>(demoWords);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('iniciativas').select('titulo');
        const counts: Record<string, number> = {};
        data?.forEach((item: { titulo?: string }) => {
          item.titulo?.split(/\s+/).forEach((w: string) => {
            const word = w.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
            if (word.length > 3) counts[word] = (counts[word] || 0) + 1;
          });
        });
        const prepared = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 16)
          .map(([word, weight]) => ({ word, weight }));
        if (prepared.length) {
          setWords(prepared);
        }
      } catch {
        setWords(demoWords);
      }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FF', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, color: '#2458C5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Mapa de calor</p>
          <h1 style={{ margin: '4px 0 0', color: '#071D3A' }}>Términos más repetidos</h1>
          <p style={{ margin: '6px 0 0', color: '#4B5B7A' }}>Visualiza las ideas que más se repiten en tus iniciativas.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: '#2458C5', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>Volver al dashboard</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 12px 30px rgba(7,29,58,0.08)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {words.map((item) => (
            <span key={item.word} style={{ fontSize: 12 + item.weight * 1.3, background: '#2458C5', color: '#fff', padding: '8px 12px', borderRadius: 999, fontWeight: 700 }}>
              {item.word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
