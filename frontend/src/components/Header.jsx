import React from 'react';

export default function Header({ athlete, onLogout, onBack, title }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 20px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ← Back
            </button>
          )}
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>
            {onBack ? title : (
              <>Shoe<span style={{ color: 'var(--orange)' }}>411</span></>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {athlete && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {athlete.profile && (
                <img
                  src={athlete.profile}
                  alt="Profile"
                  style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {athlete.firstname} {athlete.lastname}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 13,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
