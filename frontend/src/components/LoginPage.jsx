import React from 'react';

export default function LoginPage({ onLogin, error }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: 24,
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>👟</div>
        <h1 style={{
          fontSize: 42, fontWeight: 700, color: 'var(--text)',
          letterSpacing: '-1px', marginBottom: 8,
        }}>
          Shoe<span style={{ color: 'var(--orange)' }}>411</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
          Know your kicks. Track performance, usage patterns, and when it's time for new shoes — powered by your Strava data.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16, marginBottom: 48, maxWidth: 560, width: '100%',
      }}>
        {[
          { icon: '📈', label: 'Pace Trends', desc: 'Track performance over time per shoe' },
          { icon: '🗓', label: 'Usage Patterns', desc: 'When & how far you run in each pair' },
          { icon: '⚠️', label: 'Replace Alerts', desc: 'Know when your shoes are worn out' },
        ].map((f) => (
          <div key={f.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 16px', textAlign: 'center',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          color: 'var(--red)', background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.25)', borderRadius: 8,
          padding: '10px 18px', fontSize: 14, marginBottom: 20,
          maxWidth: 400, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={onLogin}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--orange)', color: '#fff', border: 'none',
          borderRadius: 10, padding: '14px 28px', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', transition: 'opacity 0.15s, transform 0.1s',
          boxShadow: '0 4px 20px rgba(252,76,2,0.30)',
        }}
        onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connect with Strava
      </button>

      <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 16 }}>
        Read-only access · Your data stays on your machine
      </p>
    </div>
  );
}
