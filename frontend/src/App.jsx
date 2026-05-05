import React, { useState, useEffect } from 'react';
import { analyzeShoes } from './analytics';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ShoeDetail from './components/ShoeDetail';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';

const API = '';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [error, setError] = useState(null);
  // Cache raw Strava data so settings saves don't need to re-fetch activities
  const rawCache = React.useRef({ gear: [], activities: [] });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') window.history.replaceState({}, '', '/');
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

  const loadData = async (forceRefresh = false) => {
    setDataLoading(true);
    const qs = forceRefresh ? '?refresh=true' : '';
    try {
      const [gearRes, activitiesRes, settingsRes] = await Promise.all([
        fetch(`${API}/api/gear${qs}`, { credentials: 'include' }),
        fetch(`${API}/api/activities${qs}`, { credentials: 'include' }),
        fetch(`${API}/api/settings`, { credentials: 'include' }),
      ]);
      if (!gearRes.ok || !activitiesRes.ok) throw new Error('Failed to load Strava data');
      const [gear, activities, settings] = await Promise.all([
        gearRes.json(),
        activitiesRes.json(),
        settingsRes.ok ? settingsRes.json() : Promise.resolve({}),
      ]);
      rawCache.current = { gear, activities };
      const analyzed = analyzeShoes(gear, activities, settings);
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

  const saveSettings = async (gearId, fields) => {
    const res = await fetch(`${API}/api/settings/${gearId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error('Failed to save settings');

    // Only re-fetch settings (fast) — reuse cached gear & activities
    const settingsRes = await fetch(`${API}/api/settings`, { credentials: 'include' });
    const settings = settingsRes.ok ? await settingsRes.json() : {};
    const { gear, activities } = rawCache.current;
    const analyzed = analyzeShoes(gear, activities, settings);
    analyzed.sort((a, b) => {
      if (!a.lastRunDate) return 1;
      if (!b.lastRunDate) return -1;
      return new Date(b.lastRunDate) - new Date(a.lastRunDate);
    });
    setShoes(analyzed);
    // Keep the selected shoe in sync with updated data
    if (gearId) {
      const updated = analyzed.find((s) => s.id === gearId);
      if (updated) setSelectedShoe(updated);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    setAuth(false); setShoes([]); setSelectedShoe(null);
  };

  if (loading) return <LoadingScreen />;
  if (!auth) return <LoginPage onLogin={() => { window.location.href = `${API}/auth/strava`; }} error={error} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header
        athlete={auth}
        onLogout={handleLogout}
        onBack={selectedShoe ? () => setSelectedShoe(null) : null}
        title={selectedShoe?.name}
      />

      {error && (
        <div style={{
          maxWidth: 1200, margin: '16px auto 0',
          background: 'var(--signal-soft)', border: '1px solid var(--signal)',
          color: 'var(--signal)', borderRadius: 6, padding: '12px 32px', fontSize: 13,
        }}>{error}</div>
      )}

      {dataLoading ? (
        <LoadingScreen message="Syncing your Strava data…" inline />
      ) : selectedShoe ? (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px' }}>
          <ShoeDetail shoe={selectedShoe} onBack={() => setSelectedShoe(null)} onSaveSettings={saveSettings} />
        </div>
      ) : (
        <Dashboard shoes={shoes} onSelectShoe={setSelectedShoe} onRefresh={() => loadData(true)} />
      )}
    </div>
  );
}
