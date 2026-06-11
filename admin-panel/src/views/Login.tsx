import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AUTH_KEY = 'igo-admin-auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY)) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const demoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (demoMode) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ email, password, demo: true }));
      navigate('/dashboard');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('No fue posible acceder. Revisa tus credenciales o usa el modo demo.');
      return;
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify({ email, password }));
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#071D3A,#2458C5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h2 style={{ marginBottom: 8, color: '#071D3A' }}>Panel administrativo</h2>
        <p style={{ marginBottom: 20, color: '#4B5B7A' }}>Acceso exclusivo para Dinámica del Oriente</p>
        <form onSubmit={handleLogin}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={inputStyle} />
          {error ? <p style={{ color: 'crimson', marginBottom: 12 }}>{error}</p> : null}
          <button type="submit" style={{ width: '100%', background: '#2458C5', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>Entrar</button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #DDE6F6', marginBottom: 12, fontSize: 15 };
