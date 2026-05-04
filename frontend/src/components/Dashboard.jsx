import React from 'react';
import ShoeCard from './ShoeCard';
import Leaderboard from './Leaderboard';
import { REPLACEMENT_KM } from '../analytics';

export default function Dashboard({ shoes, onSelectShoe, onRefresh }) {
  const dangerShoes = shoes.filter((s) => s.replacement?.level === 'danger');
  const warningShoes = shoes.filter((s) => s.replacement?.level === 'warning');

  return (
    <div>
      {/* Leaderboard */}
      {shoes.length > 0 && (
        <Leaderboard shoes={shoes} onSelectShoe={onSelectShoe} />
      )}

      {/* Section divider */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 3 }}>Your Shoes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {shoes.length} pair{shoes.length !== 1 ? 's' : ''} tracked via Strava
            {dangerShoes.length > 0 && (
              <span style={{ color: 'var(--red)', marginLeft: 12, fontWeight: 600 }}>
                ⚠ {dangerShoes.length} need{dangerShoes.length === 1 ? 's' : ''} replacement
              </span>
            )}
            {warningShoes.length > 0 && !dangerShoes.length && (
              <span style={{ color: 'var(--yellow)', marginLeft: 12, fontWeight: 600 }}>
                ⚡ {warningShoes.length} approaching {REPLACEMENT_KM} km
              </span>
            )}
          </p>
        </div>
        <button
          onClick={onRefresh}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text)', borderRadius: 8, padding: '8px 16px', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow)',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {shoes.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}>
          {shoes.map((shoe) => (
            <ShoeCard key={shoe.id} shoe={shoe} onClick={() => onSelectShoe(shoe)} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👟</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
        No shoes found
      </p>
      <p style={{ fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
        Make sure you've added shoes in Strava and logged at least one run with a shoe selected.
      </p>
      <a
        href="https://www.strava.com/settings/gear"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', marginTop: 20, color: 'var(--orange)', fontSize: 14, fontWeight: 500 }}
      >
        Manage gear on Strava →
      </a>
    </div>
  );
}
