import React from 'react';

export default function LoginPage({ onLogin, error }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', padding: 32,
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 64, fontWeight: 900,
          letterSpacing: '-0.04em', color: 'var(--ink)', lineHeight: 1, marginBottom: 18,
        }}>
          Fleet<span style={{
            background: 'var(--brand)',
            border: '4px solid var(--ink)',
            boxShadow: '6px 6px 0 var(--ink)',
            padding: '0 14px',
            display: 'inline-block',
            transform: 'rotate(-1.5deg)',
            marginLeft: 6,
          }}>Meister</span>
        </div>
        <p style={{
          fontSize: 16, color: 'var(--ink-2)', maxWidth: 420,
          lineHeight: 1.6, margin: '0 auto', fontWeight: 500,
        }}>
          Know your fleet. Track performance, usage patterns, and when it's time for a new pair —
          powered by your Strava data.
        </p>
      </div>

      {/* Feature row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        border: '3px solid var(--ink)', background: 'var(--ink)', gap: 2,
        boxShadow: '5px 5px 0 var(--ink)', maxWidth: 580, width: '100%', marginBottom: 40,
      }}>
        {[
          { label: 'Pace Trends',    desc: 'Track performance over time per shoe' },
          { label: 'Usage Patterns', desc: 'When & how far you run in each pair' },
          { label: 'Replace Alerts', desc: 'Know when your shoes are worn out' },
        ].map((f) => (
          <div key={f.label} style={{ background: 'var(--card)', padding: '22px 20px' }}>
            <div style={{
              fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 800,
              color: 'var(--ink)', marginBottom: 6,
            }}>{f.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, fontWeight: 500 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'var(--signal)', color: '#fff',
          border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)',
          padding: '10px 18px',
          fontSize: 13, fontWeight: 700, marginBottom: 20, maxWidth: 400, textAlign: 'center',
        }}>{error}</div>
      )}

      <button
        onClick={onLogin}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FC4C02', color: '#fff', border: '3px solid var(--ink)',
          padding: '14px 28px', fontSize: 16, fontFamily: 'var(--sans)', fontWeight: 800,
          letterSpacing: '0.02em',
          cursor: 'pointer', boxShadow: '5px 5px 0 var(--ink)',
          transition: 'transform 0.08s, box-shadow 0.08s',
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = '2px 2px 0 var(--ink)'; }}
        onMouseUp={(e)   => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--ink)'; }}
        onMouseOut={(e)  => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '5px 5px 0 var(--ink)'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
        </svg>
        Connect with Strava
      </button>

      <p style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 16, fontWeight: 600 }}>
        Read-only access · Your data stays on your machine
      </p>
    </div>
  );
}
