import React from 'react';

export default function Header({ athlete, onLogout, onBack, title }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--rule)',
      background: 'rgba(250,247,242,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {onBack && (
            <button onClick={onBack} style={{
              border: '1px solid var(--rule)', background: 'transparent',
              padding: '6px 12px', borderRadius: 6, fontSize: 13,
              color: 'var(--ink-2)', transition: 'all 0.15s',
            }}>← Back</button>
          )}
          <span style={{
            fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 20,
            letterSpacing: '-0.02em', color: 'var(--ink)',
          }}>
            Shoe<em style={{ fontStyle: 'italic', color: 'var(--brand)', fontWeight: 500 }}>411</em>
          </span>
          {onBack && title && (
            <span style={{ color: 'var(--ink-3)', fontSize: 14 }}>/ {title}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {athlete && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
              {athlete.profile ? (
                <img src={athlete.profile} alt="Avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f4d2b8, #d99c6a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontWeight: 600, color: 'white', fontSize: 11,
                }}>
                  {athlete.firstname?.[0]}{athlete.lastname?.[0]}
                </div>
              )}
              <span>{athlete.firstname} {athlete.lastname}</span>
            </div>
          )}
          <button onClick={onLogout} style={{
            border: '1px solid var(--rule)', background: 'transparent',
            padding: '7px 14px', borderRadius: 6, fontSize: 13,
            color: 'var(--ink-2)', transition: 'all 0.15s',
          }}>Sign out</button>
        </div>
      </div>
    </header>
  );
}
