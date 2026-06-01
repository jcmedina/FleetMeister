import React from 'react';

export default function LoadingScreen({ message = 'Loading…', inline = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 18,
      ...(inline ? { padding: '80px 20px' } : { minHeight: '100vh' }),
    }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid var(--ink)',
        borderTopColor: 'var(--brand)',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '3px 3px 0 var(--ink)',
      }} />
      <p style={{
        color: 'var(--ink)', fontSize: 13, fontFamily: 'var(--sans)', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
