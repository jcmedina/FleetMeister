import React from 'react';
import { REPLACEMENT_KM } from '../analytics';

export default function ShoeCard({ shoe, onClick }) {
  const { replacement } = shoe;
  const pct = Math.min(replacement?.pct || 0, 1);
  const barColor = replacement?.color || '#16a34a';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${replacement?.level === 'danger' ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'transform 0.12s, box-shadow 0.12s',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      {shoe.retired && (
        <span style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--surface2)', color: 'var(--text-muted)',
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          border: '1px solid var(--border)',
        }}>
          Retired
        </span>
      )}

      <div style={{ marginBottom: 14, paddingRight: shoe.retired ? 60 : 0 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {shoe.name || 'Unnamed Shoe'}
        </h3>
        {(shoe.brand_name || shoe.model_name) && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {[shoe.brand_name, shoe.model_name].filter(Boolean).join(' ')}
          </p>
        )}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginBottom: 18,
      }}>
        <Stat label="Kilometres" value={shoe.totalKm?.toFixed(0) || '0'} />
        <Stat label="Runs" value={shoe.runCount || '0'} />
        <Stat label="Avg Pace" value={shoe.medianPaceLabel || '—'} />
      </div>

      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 12, color: 'var(--text-muted)', marginBottom: 6,
        }}>
          <span style={{ color: barColor, fontWeight: 600 }}>{replacement?.label}</span>
          <span>{shoe.totalKm?.toFixed(0)} / {REPLACEMENT_KM} km</span>
        </div>
        <div style={{
          background: 'var(--surface2)', borderRadius: 4, height: 6, overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct * 100}%`, height: '100%', background: barColor,
            borderRadius: 4, transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        {shoe.useType && <Tag label={shoe.useType} />}
        {shoe.lastRunDate && <Tag label={`Last run ${formatDate(shoe.lastRunDate)}`} dim />}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function Tag({ label, dim = false }) {
  return (
    <span style={{
      background: dim ? 'transparent' : 'var(--orange-dim)',
      color: dim ? 'var(--text-dim)' : 'var(--orange)',
      border: dim ? '1px solid var(--border)' : '1px solid rgba(252,76,2,0.2)',
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 500,
    }}>
      {label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
