import React from 'react';

export default function Header({ athlete, onLogout, onBack, title }) {
  return (
    <header style={{
      borderBottom: '3px solid var(--ink)',
      background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {onBack && <BrutalistButton onClick={onBack}>← Back</BrutalistButton>}
          <span style={{
            fontFamily: 'var(--sans)', fontWeight: 900, fontSize: 22,
            letterSpacing: '-0.02em', color: 'var(--ink)',
          }}>
            FleetMeister
          </span>
          {onBack && title && (
            <span style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>
              / <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{title}</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {athlete && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink)', fontWeight: 700 }}>
              {athlete.profile ? (
                <img src={athlete.profile} alt="Avatar" style={{
                  width: 34, height: 34, objectFit: 'cover',
                  border: '2px solid var(--ink)',
                }} />
              ) : (
                <div style={{
                  width: 34, height: 34,
                  border: '2px solid var(--ink)',
                  background: 'linear-gradient(135deg, var(--brand), var(--amber))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--sans)', fontWeight: 800, color: 'var(--ink)', fontSize: 12,
                }}>
                  {athlete.firstname?.[0]}{athlete.lastname?.[0]}
                </div>
              )}
              <span>{athlete.firstname} {athlete.lastname}</span>
            </div>
          )}
          <BrutalistButton onClick={onLogout}>Sign out</BrutalistButton>
        </div>
      </div>
    </header>
  );
}

// ─── Reusable brutalist button (header-local; kept here to avoid a new file) ──
function BrutalistButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: '2px solid var(--ink)', background: 'var(--card)',
        padding: '8px 14px', fontSize: 13, fontWeight: 700,
        color: 'var(--ink)', fontFamily: 'var(--sans)',
        boxShadow: '3px 3px 0 var(--ink)',
        transition: 'transform 0.08s, box-shadow 0.08s',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 var(--ink)'; }}
      onMouseUp={(e)   => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)'; }}
      onMouseOut={(e)  => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)'; }}
    >{children}</button>
  );
}
