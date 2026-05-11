import React from 'react';
import ShoeCard from './ShoeCard';
import { LeaderboardBoards, LeaderboardAwards } from './Leaderboard';

export default function Dashboard({ shoes, onSelectShoe, onRefresh }) {
  const activeShoes  = shoes.filter((s) => !s.retired);
  const retiredShoes = shoes.filter((s) => s.retired);
  const nudgeShoes   = activeShoes.filter((s) => s.needsNudge);
  const dangerShoes  = activeShoes.filter((s) => s.replacement?.level === 'danger');
  const totalKm      = shoes.reduce((s, shoe) => s + (shoe.totalKm || 0), 0);
  const totalRuns    = shoes.reduce((s, shoe) => s + (shoe.runCount || 0), 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', position: 'relative', zIndex: 1 }}>

      {/* Marquee */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 24,
        padding: '36px 0 28px', borderBottom: '1px solid var(--rule)', marginBottom: 48,
        flexWrap: 'wrap',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 500,
          letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)',
        }}>
          It's a good day for a <em style={{ fontStyle: 'italic', color: 'var(--brand)', fontWeight: 400 }}>run</em>.
        </h1>
        <div style={{ display: 'flex', gap: 28, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <MarqueeStat num={activeShoes.length} label="Active pairs" />
          <MarqueeStat num={totalKm.toFixed(0)} label="Total km" />
          <MarqueeStat num={totalRuns} label="Total runs" />
        </div>
      </div>

      {/* ── 1. Your Shoes ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
            Your <em style={{ fontStyle: 'italic', fontWeight: 400 }}>shoes</em>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, fontSize: 13, color: 'var(--ink-3)' }}>
            <span>{activeShoes.length} active pair{activeShoes.length !== 1 ? 's' : ''} via Strava</span>
            {dangerShoes.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--signal-soft)', color: 'var(--signal)',
                padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500,
              }}>
                ⚠ {dangerShoes.length} need{dangerShoes.length === 1 ? 's' : ''} replacement
              </span>
            )}
          </div>
        </div>
        <button onClick={onRefresh} style={{
          border: '1px solid var(--rule)', background: 'transparent',
          padding: '7px 14px', borderRadius: 6, fontSize: 13,
          color: 'var(--ink-2)', transition: 'all 0.15s', cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {activeShoes.length === 0 ? <EmptyState /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 64 }}>
          {activeShoes.map((shoe) => (
            <ShoeCard key={shoe.id} shoe={shoe} onClick={() => onSelectShoe(shoe)} />
          ))}
        </div>
      )}

      {/* ── 2. Hall of Fame ────────────────────────────────────────────────────── */}
      {retiredShoes.length > 0 && (
        <HallOfFame shoes={retiredShoes} onSelectShoe={onSelectShoe} />
      )}

      {/* ── 3. Needs a Run ─────────────────────────────────────────────────────── */}
      {nudgeShoes.length > 0 && (
        <NudgeSection shoes={nudgeShoes} onSelectShoe={onSelectShoe} />
      )}

      {/* ── 4. Leaderboard ─────────────────────────────────────────────────────── */}
      {activeShoes.length > 0 && <LeaderboardBoards shoes={activeShoes} onSelectShoe={onSelectShoe} />}

      {/* ── 5. Awards ──────────────────────────────────────────────────────────── */}
      {activeShoes.length > 0 && <LeaderboardAwards shoes={activeShoes} onSelectShoe={onSelectShoe} />}

    </div>
  );
}

// ─── Marquee stat ─────────────────────────────────────────────────────────────

function MarqueeStat({ num, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{num}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Hall of Fame ─────────────────────────────────────────────────────────────

const HOF_PREVIEW = 3;

function HallOfFame({ shoes, onSelectShoe }) {
  const [expanded, setExpanded] = React.useState(false);
  const visible   = expanded ? shoes : shoes.slice(0, HOF_PREVIEW);
  const moreCount = shoes.length - HOF_PREVIEW;

  return (
    <div style={{ marginBottom: 64, borderTop: '1px solid var(--rule)', paddingTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.02em', color: 'var(--ink-2)',
        }}>
          Hall of <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Fame</em>
        </h2>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', fontWeight: 600 }}>
          {shoes.length} retired pair{shoes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {visible.map((shoe) => {
          const photoUrl = shoe.photo ? `/uploads/${shoe.photo}` : null;
          return (
            <div
              key={shoe.id}
              onClick={() => onSelectShoe(shoe)}
              style={{
                background: 'var(--paper)', border: '1px solid var(--rule)',
                borderRadius: 8, padding: '20px 24px', cursor: 'pointer',
                opacity: 0.75, transition: 'opacity 0.15s',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
            >
              {/* Mini tombstone */}
              <div style={{
                width: 52, height: 60, flexShrink: 0,
                borderRadius: '52px 52px 4px 4px',
                border: '1.5px solid var(--ink-4)',
                overflow: 'hidden',
                background: photoUrl ? 'transparent' : 'var(--rule)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {photoUrl
                  ? <img src={photoUrl} alt={shoe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <span style={{ fontSize: 18, opacity: 0.4 }}>👟</span>
                }
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {shoe.name}
                    </div>
                    {(shoe.brand_name || shoe.model_name) && (
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                        {[shoe.brand_name, shoe.model_name].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--ink-4)', border: '1px solid var(--rule)',
                    padding: '3px 8px', borderRadius: 100, fontWeight: 600, flexShrink: 0, marginLeft: 8,
                  }}>Retired</span>
                </div>

                <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                  <StatMini num={`${shoe.totalKm?.toFixed(0)} km`} label="Distance" />
                  <StatMini num={shoe.runCount} label="Runs" />
                  {shoe.medianPaceLabel && <StatMini num={shoe.medianPaceLabel} label="Pace" />}
                </div>

                {shoe.retirementNote && (
                  <p style={{
                    fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--serif)',
                    fontStyle: 'italic', borderTop: '1px solid var(--rule)', paddingTop: 10, margin: 0,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    "{shoe.retirementNote}"
                  </p>
                )}
                {shoe.firstRunDate && (
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: shoe.retirementNote ? 6 : 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {shoe.firstRunDate} → {shoe.lastRunDate || '—'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {moreCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            marginTop: 16, background: 'transparent', border: 'none',
            padding: 0, cursor: 'pointer', fontSize: 13,
            color: 'var(--ink-3)', fontFamily: 'inherit',
          }}
        >
          {expanded ? '↑ Show less' : `+ ${moreCount} more`}
        </button>
      )}
    </div>
  );
}

function StatMini({ num, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink-2)' }}>{num}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ─── Needs a Run — minimalist ─────────────────────────────────────────────────

function NudgeSection({ shoes, onSelectShoe }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      padding: '12px 0', marginBottom: 56,
      borderTop: '2px solid var(--amber)',
    }}>
      <span style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--amber)', fontWeight: 700, flexShrink: 0,
      }}>
        Needs a run
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {shoes.map((shoe) => (
          <button
            key={shoe.id}
            onClick={() => onSelectShoe(shoe)}
            style={{
              background: 'transparent', border: '1px solid var(--rule)',
              borderRadius: 100, padding: '4px 12px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--ink-2)', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--amber)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--rule)'}
          >
            <span style={{ fontFamily: 'var(--serif)', fontWeight: 500 }}>{shoe.name}</span>
            <span style={{ color: 'var(--amber)', fontWeight: 600, fontSize: 11 }}>{shoe.daysSinceLastRun}d</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-3)' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 500, marginBottom: 12 }}>No shoes yet</div>
      <p style={{ fontSize: 14, maxWidth: 340, margin: '0 auto 20px' }}>
        Add shoes in Strava and log a run with a shoe selected to get started.
      </p>
      <a href="https://www.strava.com/settings/gear" target="_blank" rel="noopener noreferrer"
        style={{ color: 'var(--brand)', fontSize: 14, fontWeight: 500 }}>
        Manage gear on Strava →
      </a>
    </div>
  );
}
