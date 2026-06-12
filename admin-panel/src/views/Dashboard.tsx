import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ScatterChart, Scatter, ReferenceLine, Label,
} from 'recharts';
import { supabase } from '../lib/supabase';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface UserRow   { sector?: string; tamano?: string; edad?: string; created_at: string; }
interface IGOPoint  { importancia: number; gobernabilidad: number; }
interface MonthPoint { mes: string; total: number; }

interface Stats {
  totalUsers: number;
  totalInitiatives: number;
  totalPlans: number;
  sectors: { name: string; value: number }[];
  sizes:   { name: string; value: number }[];
  ages:    { name: string; value: number }[];
  usersByMonth: MonthPoint[];
  igoAvg: IGOPoint | null;
  igoPoints: IGOPoint[];
}

// ─── Datos demo (se usan cuando Supabase no tiene datos reales) ───────────────

const DEMO: Stats = {
  totalUsers: 128,
  totalInitiatives: 312,
  totalPlans: 87,
  sectors: [
    { name: 'Tecnología', value: 34 },
    { name: 'Servicios',  value: 28 },
    { name: 'Agro',       value: 22 },
    { name: 'Comercio',   value: 19 },
    { name: 'Salud',      value: 14 },
    { name: 'Otro',       value: 11 },
  ],
  sizes: [
    { name: 'Idea',          value: 24 },
    { name: 'Micro <10',     value: 37 },
    { name: 'Pequeña <50',   value: 31 },
    { name: 'Mediana <200',  value: 20 },
    { name: 'Grande',        value: 16 },
  ],
  ages: [
    { name: '18-25', value: 18 },
    { name: '26-35', value: 41 },
    { name: '36-45', value: 34 },
    { name: '46-55', value: 20 },
    { name: '+56',   value: 15 },
  ],
  usersByMonth: [
    { mes: 'Ene', total: 8  },
    { mes: 'Feb', total: 15 },
    { mes: 'Mar', total: 22 },
    { mes: 'Abr', total: 31 },
    { mes: 'May', total: 44 },
    { mes: 'Jun', total: 58 },
    { mes: 'Jul', total: 72 },
    { mes: 'Ago', total: 89 },
    { mes: 'Sep', total: 104 },
    { mes: 'Oct', total: 116 },
    { mes: 'Nov', total: 122 },
    { mes: 'Dic', total: 128 },
  ],
  igoAvg: { importancia: 6.4, gobernabilidad: 5.8 },
  igoPoints: [
    { importancia: 8, gobernabilidad: 7 },
    { importancia: 9, gobernabilidad: 3 },
    { importancia: 3, gobernabilidad: 8 },
    { importancia: 2, gobernabilidad: 2 },
    { importancia: 7, gobernabilidad: 6 },
    { importancia: 5, gobernabilidad: 9 },
    { importancia: 6, gobernabilidad: 4 },
  ],
};

// ─── Paleta ───────────────────────────────────────────────────────────────────

const COLORS = ['#2458C5', '#1D9E75', '#D85A30', '#7F77DD', '#BA7517', '#185FA5'];
const AUTH_KEY = 'igo-admin-auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupBy(rows: any[], key: string): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  rows.forEach(r => {
    const k = r[key] || 'Otro';
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function groupByMonth(rows: { created_at: string }[]): MonthPoint[] {
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const map: Record<string, number> = {};
  rows.forEach(r => {
    const d = new Date(r.created_at);
    const k = MESES[d.getMonth()];
    map[k] = (map[k] || 0) + 1;
  });
  return MESES.filter(m => map[m]).map(m => ({ mes: m, total: map[m] }));
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

// ─── Componentes pequeños ─────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={s.kpi}>
      <p style={s.kpiLabel}>{label}</p>
      <p style={s.kpiValue}>{value}</p>
      {sub && <p style={s.kpiSub}>{sub}</p>}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.card}>
      <p style={s.cardTitle}>{title}</p>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '0.5px solid #ccc', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ margin: 0, color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate  = useNavigate();
  const [stats, setStats]     = useState<Stats>(DEMO);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [
          { count: totalUsers },
          { count: totalInitiatives },
          { count: totalPlans },
          { data: userRows },
          { data: igoRows },
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('iniciativas').select('*', { count: 'exact', head: true }),
          supabase.from('planes_accion').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('sector, tamano, edad, created_at'),
          supabase.from('iniciativas_anonimas').select('importancia, gobernabilidad'),
        ]);

        const rows = (userRows as UserRow[]) ?? [];
        const igo  = (igoRows as IGOPoint[]) ?? [];

        const igoAvg: IGOPoint | null = igo.length
          ? { importancia: avg(igo.map(r => r.importancia)), gobernabilidad: avg(igo.map(r => r.gobernabilidad)) }
          : null;

        const real: Stats = {
          totalUsers:       totalUsers       ?? 0,
          totalInitiatives: totalInitiatives ?? 0,
          totalPlans:       totalPlans       ?? 0,
          sectors:     groupBy(rows, 'sector'),
          sizes:        groupBy(rows, 'tamano'),
          ages:          groupBy(rows, 'edad'),
          usersByMonth: groupByMonth(rows),
          igoAvg,
          igoPoints: igo,
        };

        const hasData = real.totalUsers > 0;
        setIsDemo(!hasData);
        setStats(hasData ? real : DEMO);
      } catch {
        setIsDemo(true);
        setStats(DEMO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => { localStorage.removeItem(AUTH_KEY); navigate('/login'); };

  // Punto promedio para la matriz IGO
  const avgPoint = useMemo(() =>
    stats.igoAvg ? [{ x: stats.igoAvg.gobernabilidad, y: stats.igoAvg.importancia }] : [],
    [stats.igoAvg]
  );
  const allPoints = useMemo(() =>
    stats.igoPoints.map(p => ({ x: p.gobernabilidad, y: p.importancia })),
    [stats.igoPoints]
  );

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <p style={s.eyebrow}>Panel administrativo</p>
          <h1 style={s.h1}>Métricas de negocio</h1>
          <p style={s.subtitle}>
            {loading ? 'Cargando datos…' : isDemo
              ? '⚠ Datos de ejemplo — conecta Supabase para ver datos reales'
              : 'Inteligencia de negocio en tiempo real de todos los emprendedores registrados.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/wordcloud" style={s.btnPrimary}>Mapa de calor</a>
          <button onClick={logout} style={s.btnSecondary}>Salir</button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={s.kpiGrid}>
        <KpiCard label="Usuarios registrados"   value={stats.totalUsers}       sub="Perfiles activos" />
        <KpiCard label="Iniciativas creadas"     value={stats.totalInitiatives} sub="Total acumulado" />
        <KpiCard label="Planes de acción"        value={stats.totalPlans}       sub="Acciones en curso" />
        <KpiCard label="Sector dominante"        value={stats.sectors[0]?.name ?? '—'} sub={`${stats.sectors[0]?.value ?? 0} emprendedores`} />
      </div>

      {/* ── Usuarios por mes ── */}
      <SectionCard title="Usuarios registrados por mes">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats.usersByMonth} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#4B5B7A' }} />
            <YAxis tick={{ fontSize: 12, fill: '#4B5B7A' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              name="Usuarios"
              stroke="#2458C5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2458C5' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Tres gráficas de torta ── */}
      <div style={s.pieRow}>
        <PieCard title="Sector económico"  data={stats.sectors} />
        <PieCard title="Tamaño de empresa" data={stats.sizes} />
        <PieCard title="Rango de edad"     data={stats.ages} />
      </div>

      {/* ── Matriz IGO Agregada ── */}
      <SectionCard title="Matriz IGO agregada — dónde se concentran las iniciativas">
        <p style={{ fontSize: 13, color: '#4B5B7A', marginBottom: 12, marginTop: -4 }}>
          Cada punto es una iniciativa (anonimizada). El punto azul grande es el promedio global
          — Importancia {stats.igoAvg?.importancia ?? '—'} / Gobernabilidad {stats.igoAvg?.gobernabilidad ?? '—'}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 12, color: '#4B5B7A', gap: 4, marginBottom: 10 }}>
          <span>↑ Alta Imp / Baja Gob → <strong>Estratégico/Aliados</strong></span>
          <span style={{ textAlign: 'right' }}>↑ Alta Imp / Alta Gob → <strong>¡Hacer ya!</strong></span>
          <span>↓ Baja Imp / Baja Gob → <strong>Descarte</strong></span>
          <span style={{ textAlign: 'right' }}>↓ Baja Imp / Alta Gob → <strong>Rutina</strong></span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 8, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F8" />
            <XAxis type="number" dataKey="x" domain={[0, 10]} name="Gobernabilidad" tick={{ fontSize: 12, fill: '#4B5B7A' }}>
              <Label value="Gobernabilidad →" position="insideBottom" offset={-10} style={{ fontSize: 12, fill: '#4B5B7A' }} />
            </XAxis>
            <YAxis type="number" dataKey="y" domain={[0, 10]} name="Importancia" tick={{ fontSize: 12, fill: '#4B5B7A' }}>
              <Label value="Importancia →" angle={-90} position="insideLeft" style={{ fontSize: 12, fill: '#4B5B7A' }} />
            </YAxis>
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: '#fff', border: '0.5px solid #ccc', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                  <p style={{ margin: 0 }}>Importancia: {d?.y}</p>
                  <p style={{ margin: 0 }}>Gobernabilidad: {d?.x}</p>
                </div>
              );
            }} />
            {/* líneas de corte de cuadrantes */}
            <ReferenceLine x={5} stroke="#CBD5E0" strokeDasharray="4 3" />
            <ReferenceLine y={5} stroke="#CBD5E0" strokeDasharray="4 3" />
            {/* todas las iniciativas */}
            <Scatter data={allPoints}  fill="#B5D4F4" opacity={0.7} name="Iniciativa" />
            {/* promedio global */}
            <Scatter data={avgPoint}   fill="#2458C5" name="Promedio" shape={(props: any) => {
              const { cx, cy } = props;
              return <circle cx={cx} cy={cy} r={9} fill="#2458C5" stroke="#fff" strokeWidth={2} />;
            }} />
          </ScatterChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

// ─── PieCard ──────────────────────────────────────────────────────────────────

function PieCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div style={s.card}>
      <p style={s.cardTitle}>{title}</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={45} outerRadius={72}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v} (${Math.round(v / total * 100)}%)`, '']} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, color: '#4B5B7A' }}>{d.name}</span>
            <span style={{ fontWeight: 500, color: '#071D3A' }}>{Math.round(d.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page:      { minHeight: '100vh', background: '#F5F8FF', padding: '24px 24px 48px', fontFamily: 'system-ui, sans-serif' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 12, flexWrap: 'wrap' },
  eyebrow:   { margin: 0, color: '#2458C5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 12 },
  h1:        { margin: '4px 0 0', color: '#071D3A', fontSize: 24, fontWeight: 700 },
  subtitle:  { margin: '6px 0 0', color: '#4B5B7A', fontSize: 14 },
  btnPrimary:   { background: '#2458C5', color: '#fff', padding: '10px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
  btnSecondary: { background: '#071D3A', color: '#fff', padding: '10px 16px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  kpiGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 },
  kpi:       { background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 4px 20px rgba(7,29,58,0.07)' },
  kpiLabel:  { margin: 0, color: '#4B5B7A', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue:  { margin: '8px 0 4px', color: '#071D3A', fontSize: 28, fontWeight: 800 },
  kpiSub:    { margin: 0, color: '#8A9AB8', fontSize: 12 },
  card:      { background: '#fff', borderRadius: 18, padding: '18px 20px', boxShadow: '0 4px 20px rgba(7,29,58,0.07)', marginBottom: 16 },
  cardTitle: { margin: '0 0 14px', color: '#071D3A', fontSize: 15, fontWeight: 700 },
  pieRow:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 0 },
};
