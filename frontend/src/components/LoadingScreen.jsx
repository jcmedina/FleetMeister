import React from 'react';

export default function LoadingScreen({ message = 'Loading…', inline = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16,
      ...(inline ? { padding: '80px 20px' } : { minHeight: '100vh' }),
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2px solid var(--rule)',
        borderTopColor: 'var(--brand)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: 'var(--ink-3)', fontSize: 14, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
