import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import WordCloud from './views/WordCloud';

const AUTH_KEY = 'igo-admin-auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    setAuthed(Boolean(saved));
    setReady(true);
  }, []);

  if (!ready) return null;
  return authed ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/wordcloud" element={<ProtectedRoute><WordCloud /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
