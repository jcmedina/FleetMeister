import React from 'react';
import { REPLACEMENT_KM, shoeTypeLabel } from '../analytics';

const TICKS = 20;

export default function ShoeCard({ shoe, onClick }) {
  const { replacement, paceTrend, paceImprovement } = shoe;
  const limitKm = shoe.customLimitKm || REPLACEMENT_KM;
  const ratio = Math.min((shoe.totalKm || 0) / limitKm, 1);
  const filled = Math.round(ratio * TICKS);
  const tickColor = replacement?.level === 'danger' ? 'var(--signal)'
    : replacement?.level === 'warning' || replacement?.level === 'caution' ? 'var(--amber)'
    : 'var(--moss)';
  const isDanger = replacement?.level === 'danger';

  const baseShadow = isDanger
    ? '5px 5px 0 var(--signal), 0 0 0 3px var(--signal)'
    : '5px 5px 0 var(--ink), 0 0 0 3px var(--ink)';
  const hoverShadow = isDanger
    ? '8px 8px 0 var(--signal), 0 0 0 3px var(--signal)'
    : '8px 8px 0 var(--ink), 0 0 0 3px var(--ink)';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        padding: '22px',
        boxShadow: baseShadow,
        transition: 'transform 0.08s, box-shadow 0.08s',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseOver={(e) => { e.currentTarget.style.boxShadow = hoverShadow; e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
      onMouseOut={(e)  => { e.currentTarget.style.boxShadow = baseShadow;  e.currentTarget.style.transform = 'none'; }}
    >
      {/* Replace now flag (danger only) */}
      {isDanger && (
        <div style={{
          position: 'absolute', top: -13, right: 16,
          background: 'var(--signal)', color: '#fff',
          border: '2px solid var(--ink)',
          padding: '2px 10px',
          fontSize: 11, fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          boxShadow: '3px 3px 0 var(--ink)',
          transform: 'rotate(2deg)',
        }}>Replace now</div>
      )}

      {/* Name */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 19, fontWeight: 800,
          letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {shoe.name || 'Unnamed Shoe'}
        </div>
        {shoe.shoeType && (
          <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
            {shoeTypeLabel(shoe.shoeType) || shoe.shoeType}
          </div>
        )}
        {shoe.retired && (
          <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Retired</span>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        margin: '18px 0',
        border: '2px solid var(--ink)',
      }}>
        <Stat num={shoe.totalKm?.toFixed(0) || '0'} label="Kilometres" />
        <Stat num={shoe.runCount || '0'} label="Runs" divider />
        <Stat num={shoe.medianPaceLabel || '—'} label="Avg pace" small divider />
      </div>

      {/* km counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
          <strong style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', fontWeight: 800 }}>{shoe.totalKm?.toFixed(0)}</strong>
          <span style={{ margin: '0 4px', color: 'var(--ink-4)' }}>/</span>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{limitKm} km</span>
        </span>
        {paceImprovement !== null && paceImprovement !== undefined && (
          <span style={{
            fontSize: 10, letterSpacing: '0.04em', fontWeight: 800,
            color: paceImprovement > 0 ? 'var(--moss)' : 'var(--ink-3)',
            textTransform: 'uppercase',
          }}>
            {paceImprovement > 0 ? '▼ faster' : '▲ slower'}
          </span>
        )}
      </div>

      {/* Tick bar + sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TICKS}, 1fr)`, gap: 2, flex: 1 }}>
          {Array.from({ length: TICKS }, (_, i) => (
            <div key={i} style={{
              height: 14,
              border: '1.5px solid var(--ink)',
              background: i < filled ? tickColor : 'var(--card)',
            }} />
          ))}
        </div>
        <Sparkline data={paceTrend} color={tickColor} />
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {shoe.shoeType && <Tag label={shoeTypeLabel(shoe.shoeType) || shoe.shoeType} accent />}
        {shoe.lastRunDate && <Tag label={`Last run · ${formatDate(shoe.lastRunDate)}`} plain />}
      </div>
    </div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, color }) {
  const paces = (data || []).slice(-10).map((p) => p.pace).filter(Boolean);
  if (paces.length < 3) return null;

  const W = 56, H = 18;
  const min = Math.min(...paces);
  const max = Math.max(...paces);
  const range = max - min || 1;

  const points = paces.map((v, i) => {
    const x = ((i / (paces.length - 1)) * W).toFixed(1);
    const y = (((v - min) / range) * H).toFixed(1);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0, display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ num, label, small, divider }) {
  return (
    <div style={{
      padding: '11px 12px',
      borderLeft: divider ? '2px solid var(--ink)' : 'none',
    }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: small ? 18 : 22,
        fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)',
        lineHeight: 1, display: 'block', marginBottom: 6,
      }}>{num}</span>
      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 800 }}>{label}</span>
    </div>
  );
}

function Tag({ label, plain, accent }) {
  return (
    <span style={{
      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
      padding: '4px 9px', fontWeight: 800,
      border: '1.5px solid var(--ink)',
      color: 'var(--ink)',
      background: accent ? 'var(--brand)' : plain ? 'var(--paper)' : 'var(--card)',
    }}>{label}</span>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
