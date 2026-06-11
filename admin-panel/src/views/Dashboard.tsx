import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Target, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stats {
  users: number;
  initiatives: number;
  plans: number;
  sectors: Record<string, number>;
  ages: Record<string, number>;
  sizes: Record<string, number>;
}

interface InitiativeItem {
  id: string;
  titulo: string;
  cuadrante?: string;
  importancia?: number;
  descripcion?: string;
}

const AUTH_KEY = 'igo-admin-auth';
const demoStats: Stats = {
  users: 128,
  initiatives: 47,
  plans: 19,
  sectors: { Agro: 22, Tecnología: 18, Servicios: 15, Comercio: 12, Otro: 11 },
  ages: { '18-25': 18, '26-35': 41, '36-45': 34, '+56': 15 },
  sizes: { Idea: 24, 'Micro <10': 37, 'Pequeña <50': 31, 'Mediana <200': 20 },
};

const demoInitiatives: InitiativeItem[] = [
  { id: '1', titulo: 'Expansión de e-commerce', cuadrante: 'I', importancia: 9, descripcion: 'Nuevo canal digital para ventas' },
  { id: '2', titulo: 'Sistema de seguimiento de clientes', cuadrante: 'II', importancia: 8, descripcion: 'Mejor experiencia postventa' },
  { id: '3', titulo: 'Capacitación comercial', cuadrante: 'III', importancia: 6, descripcion: 'Fortalecer habilidades del equipo' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(demoStats);
  const [initiatives, setInitiatives] = useState<InitiativeItem[]>(demoInitiatives);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersCountRes, usersRes, initiativesRes, plansRes] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('sector, tamano, edad'),
          supabase.from('iniciativas').select('id, titulo, cuadrante, importancia, descripcion').order('created_at', { ascending: false }).limit(5),
          supabase.from('planes_accion').select('*', { count: 'exact', head: true }),
        ]);

        const sectors: Record<string, number> = {};
        const sizes: Record<string, number> = {};
        const ages: Record<string, number> = {};

        usersRes.data?.forEach((user: any) => {
          sectors[user.sector || 'Otro'] = (sectors[user.sector || 'Otro'] || 0) + 1;
          sizes[user.tamano || 'Otro'] = (sizes[user.tamano || 'Otro'] || 0) + 1;
          ages[user.edad || 'Otro'] = (ages[user.edad || 'Otro'] || 0) + 1;
        });

        setStats({
          users: usersCountRes.count || 0,
          initiatives: initiativesRes.data?.length || 0,
          plans: plansRes.count || 0,
          sectors: Object.keys(sectors).length ? sectors : demoStats.sectors,
          ages: Object.keys(ages).length ? ages : demoStats.ages,
          sizes: Object.keys(sizes).length ? sizes : demoStats.sizes,
        });
        setInitiatives(initiativesRes.data?.length ? initiativesRes.data as InitiativeItem[] : demoInitiatives);
      } catch {
        setStats(demoStats);
        setInitiatives(demoInitiatives);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const topSectors = useMemo(() => Object.entries(stats.sectors).slice(0, 3), [stats.sectors]);
  const topAges = useMemo(() => Object.entries(stats.ages).slice(0, 3), [stats.ages]);

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FF', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, color: '#2458C5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>Dashboard</p>
          <h1 style={{ margin: '4px 0 0', color: '#071D3A' }}>Métricas de negocio</h1>
          <p style={{ margin: '6px 0 0', color: '#4B5B7A' }}>{loading ? 'Cargando datos...' : 'Vista operativa de emprendedores, iniciativas y planes.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/wordcloud" style={{ background: '#2458C5', color: '#fff', padding: '10px 14px', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>Mapa de calor</a>
          <button onClick={logout} style={{ background: '#071D3A', color: '#fff', padding: '10px 14px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <MetricCard icon={<Users size={18} />} title="Usuarios registrados" value={stats.users} hint="Perfiles activos" />
        <MetricCard icon={<Target size={18} />} title="Iniciativas" value={stats.initiatives} hint="Ideas priorizadas" />
        <MetricCard icon={<ClipboardList size={18} />} title="Planes de acción" value={stats.plans} hint="Acciones en curso" />
        <MetricCard icon={<TrendingUp size={18} />} title="Sectores dominantes" value={topSectors[0]?.[1] || 0} hint={topSectors.map(([name, value]) => `${name}: ${value}`).join(' • ')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: 16 }}>
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 12, color: '#071D3A' }}>Iniciativas recientes</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {initiatives.map((item) => (
              <div key={item.id} style={{ background: '#F7FAFF', borderRadius: 14, padding: 12, border: '1px solid #E6EDF8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ color: '#071D3A' }}>{item.titulo}</strong>
                  <span style={{ color: '#2458C5', fontWeight: 700 }}>Q{item.cuadrante || 'I'}</span>
                </div>
                <p style={{ margin: '6px 0 0', color: '#4B5B7A', fontSize: 13 }}>{item.descripcion || 'Sin descripción'}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0, marginBottom: 12, color: '#071D3A' }}>Resumen por segmento</h3>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', color: '#2458C5', fontWeight: 700 }}>Sectores</p>
            <p style={{ margin: 0, color: '#4B5B7A' }}>{topSectors.map(([name, value]) => `${name}: ${value}`).join(' • ')}</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', color: '#2458C5', fontWeight: 700 }}>Edades</p>
            <p style={{ margin: 0, color: '#4B5B7A' }}>{topAges.map(([name, value]) => `${name}: ${value}`).join(' • ')}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 6px', color: '#2458C5', fontWeight: 700 }}>Tamaños</p>
            <p style={{ margin: 0, color: '#4B5B7A' }}>{Object.entries(stats.sizes).slice(0, 3).map(([name, value]) => `${name}: ${value}`).join(' • ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, hint }: { icon: React.ReactNode; title: string; value: number; hint: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2458C5', fontWeight: 700 }}>{icon}{title}</div>
      <p style={{ fontSize: 30, fontWeight: 800, color: '#071D3A', margin: '8px 0 4px' }}>{value}</p>
      <p style={{ margin: 0, color: '#4B5B7A', fontSize: 13 }}>{hint}</p>
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 12px 30px rgba(7,29,58,0.08)' };
const panelStyle: React.CSSProperties = { background: '#fff', borderRadius: 20, padding: 18, boxShadow: '0 12px 30px rgba(7,29,58,0.08)' };
