import React, { useState, useEffect, useCallback } from 'react';
import { analyzeShoes } from './analytics';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ShoeDetail from './components/ShoeDetail';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';

const API = '';

export default function App() {
  const [auth, setAuth] = useState(null); // null = unknown, false = not authed, object = athlete
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [error, setError] = useState(null);

  // Check auth status on mount and after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      window.history.replaceState({}, '', '/');
    }
    if (params.get('error')) {
      setError('Strava authentication failed. Please try again.');
      window.history.replaceState({}, '', '/');
    }
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API}/api/status`, { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) {
        setAuth(data.athlete);
        await loadData();
      } else {
        setAuth(false);
        setLoading(false);
      }
    } catch {
      setAuth(false);
      setLoading(false);
    }
  };

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [gearRes, activitiesRes] = await Promise.all([
        fetch(`${API}/api/gear`, { credentials: 'include' }),
        fetch(`${API}/api/activities`, { credentials: 'include' }),
      ]);

      if (!gearRes.ok || !activitiesRes.ok) {
        throw new Error('Failed to load Strava data');
      }

      const [gear, activities] = await Promise.all([
        gearRes.json(),
        activitiesRes.json(),
      ]);

      const analyzed = analyzeShoes(gear, activities);
      // Sort: most recently used first
      analyzed.sort((a, b) => {
        if (!a.lastRunDate) return 1;
        if (!b.lastRunDate) return -1;
        return new Date(b.lastRunDate) - new Date(a.lastRunDate);
      });
      setShoes(analyzed);
    } catch (err) {
      setError(err.message);
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    setAuth(false);
    setShoes([]);
    setSelectedShoe(null);
  };

  const handleLogin = () => {
    window.location.href = `${API}/auth/strava`;
  };

  if (loading) return <LoadingScreen />;

  if (!auth) {
    return <LoginPage onLogin={handleLogin} error={error} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        athlete={auth}
        onLogout={handleLogout}
        onBack={selectedShoe ? () => setSelectedShoe(null) : null}
        title={selectedShoe ? selectedShoe.name || 'Shoe Detail' : 'Shoe411'}
      />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.15)',
            border: '1px solid rgba(231,76,60,0.4)',
            color: '#E74C3C',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {dataLoading ? (
          <LoadingScreen message="Syncing your Strava data…" inline />
        ) : selectedShoe ? (
          <ShoeDetail shoe={selectedShoe} onBack={() => setSelectedShoe(null)} />
        ) : (
          <Dashboard
            shoes={shoes}
            onSelectShoe={setSelectedShoe}
            onRefresh={loadData}
          />
        )}
      </main>
    </div>
  );
}
