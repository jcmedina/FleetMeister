import React from 'react';
import { REPLACEMENT_KM, shoeTypeLabel } from '../analytics';

const TICKS = 20;

export default function ShoeCard({ shoe, onClick }) {
  const { replacement } = shoe;
  const limitKm = shoe.customLimitKm || REPLACEMENT_KM;
  const ratio = Math.min((shoe.totalKm || 0) / limitKm, 1);
  const filled = Math.round(ratio * TICKS);
  const tickColor = replacement?.level === 'danger' ? 'var(--signal)'
    : replacement?.level === 'warning' || replacement?.level === 'caution' ? 'var(--amber)'
    : 'var(--moss)';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        padding: '22px',
        boxShadow: replacement?.level === 'danger'
          ? `0 1px 0 rgba(0,0,0,0.02), 0 0 0 1px var(--signal)`
          : 'var(--shadow)',
        transition: 'all 0.2s',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseOver={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = replacement?.level === 'danger' ? `0 1px 0 rgba(0,0,0,0.02), 0 0 0 1px var(--signal)` : 'var(--shadow)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Replace flag */}
      {replacement?.level === 'danger' && (
        <div style={{
          position: 'absolute', top: 22, right: 22,
          fontFamily: 'var(--serif)', fontStyle: 'italic',
          fontSize: 12, color: 'var(--signal)', fontWeight: 500,
        }}>Replace now</div>
      )}

      {/* Name */}
      <div style={{ marginBottom: 18, paddingRight: replacement?.level === 'danger' ? 90 : 0 }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600,
          letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.25,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {shoe.name || 'Unnamed Shoe'}
        </div>
        {shoe.retired && (
          <span style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Retired</span>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 14, marginBottom: 18, paddingBottom: 18,
        borderBottom: '1px solid var(--rule-2)',
      }}>
        <Stat num={shoe.totalKm?.toFixed(0) || '0'} label="Kilometres" />
        <Stat num={shoe.runCount || '0'} label="Runs" />
        <Stat num={shoe.medianPaceLabel || '—'} label="Avg pace" small />
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, fontWeight: 500,
          color: tickColor,
        }}>
          {replacement?.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
          <strong style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{shoe.totalKm?.toFixed(0)}</strong> / {limitKm} km
        </span>
      </div>

      {/* Tick bar */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TICKS}, 1fr)`, gap: 3, marginBottom: 14 }}>
        {Array.from({ length: TICKS }, (_, i) => (
          <div key={i} style={{
            height: 6, borderRadius: 1,
            background: i < filled ? tickColor : 'var(--rule)',
          }} />
        ))}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {shoe.shoeType && <Tag label={shoeTypeLabel(shoe.shoeType) || shoe.shoeType} accent />}
        {shoe.needsNudge && (
          <Tag label={`${shoe.daysSinceLastRun}d idle`} warn />
        )}
        {shoe.lastRunDate && <Tag label={`Last run · ${formatDate(shoe.lastRunDate)}`} plain />}
      </div>
    </div>
  );
}

function Stat({ num, label, small }) {
  return (
    <div>
      <span style={{
        fontFamily: 'var(--serif)', fontSize: small ? 18 : 26,
        fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)',
        lineHeight: 1, display: 'block', marginBottom: 6,
      }}>{num}</span>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function Tag({ label, plain, accent, warn }) {
  const bg = warn ? 'var(--amber-soft)'
    : accent ? 'var(--brand-soft)'
    : plain ? 'transparent'
    : 'var(--paper-2)';
  const color = warn ? 'var(--amber)'
    : accent ? 'var(--brand)'
    : 'var(--ink-3)';
  const border = warn ? '1px solid var(--amber)'
    : accent ? '1px solid var(--brand)'
    : '1px solid var(--rule)';
  return (
    <span style={{
      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '4px 9px', borderRadius: 3, fontWeight: 600,
      border, color, background: bg,
    }}>{label}</span>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
