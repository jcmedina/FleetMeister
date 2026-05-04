import React from 'react';

export default function LoginPage({ onLogin, error }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: 32,
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 56, fontWeight: 500,
          letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1, marginBottom: 20,
        }}>
          Shoe<em style={{ fontStyle: 'italic', color: 'var(--brand)', fontWeight: 400 }}>411</em>
        </div>
        <p style={{
          fontSize: 16, color: 'var(--ink-3)', maxWidth: 380,
          lineHeight: 1.65, margin: '0 auto',
        }}>
          Know your fleet. Track performance, usage patterns, and when it's time for a new pair — powered by your Strava data.
        </p>
      </div>

      {/* Feature row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)',
        borderRadius: 8, overflow: 'hidden', maxWidth: 580, width: '100%', marginBottom: 48,
      }}>
        {[
          { label: 'Pace Trends', desc: 'Track performance over time per shoe' },
          { label: 'Usage Patterns', desc: 'When & how far you run in each pair' },
          { label: 'Replace Alerts', desc: 'Know when your shoes are worn out' },
        ].map((f) => (
          <div key={f.label} style={{ background: 'var(--paper)', padding: '22px 20px' }}>
            <div style={{
              fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500,
              color: 'var(--ink)', marginBottom: 6,
            }}>{f.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'var(--signal-soft)', border: '1px solid var(--signal)',
          color: 'var(--signal)', borderRadius: 6, padding: '10px 18px',
          fontSize: 13, marginBottom: 20, maxWidth: 400, textAlign: 'center',
        }}>{error}</div>
      )}

      <button
        onClick={onLogin}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--brand)', color: '#fff', border: 'none',
          borderRadius: 7, padding: '13px 26px', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', transition: 'opacity 0.15s, transform 0.1s',
          boxShadow: '0 4px 16px rgba(217,74,31,0.28)',
        }}
        onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connect with Strava
      </button>

      <p style={{ color: 'var(--ink-4)', fontSize: 12, marginTop: 14 }}>
        Read-only access · Your data stays on your machine
      </p>
    </div>
  );
}
