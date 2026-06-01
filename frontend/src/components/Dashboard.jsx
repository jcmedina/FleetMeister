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
        display: 'flex', alignItems: 'flex-end', gap: 28,
        padding: '44px 0 32px', borderBottom: '3px solid var(--ink)', marginBottom: 44,
        flexWrap: 'wrap',
      }}>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 52, fontWeight: 900,
          letterSpacing: '-0.04em', lineHeight: 0.95, color: 'var(--ink)',
        }}>
          It's a good day<br />for a{' '}
          <span style={{
            background: 'var(--brand)',
            border: '3px solid var(--ink)',
            boxShadow: '3px 3px 0 var(--ink)',
            padding: '0 12px',
            display: 'inline-block',
            transform: 'rotate(-1.5deg)',
            marginTop: 8,
          }}>run</span>.
        </h1>
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
          <MarqueeStat num={activeShoes.length} label="Active pairs" />
          <MarqueeStat num={totalKm.toFixed(0)} label="Total km" />
          <MarqueeStat num={totalRuns} label="Total runs" last />
        </div>
      </div>

      {/* ── 1. Your Shoes ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <SectionHeading>Your <Em>shoes</Em></SectionHeading>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {dangerShoes.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'var(--signal)', color: '#fff',
              border: '2px solid var(--ink)',
              padding: '5px 10px',
              fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              ⚠ {dangerShoes.length} need{dangerShoes.length === 1 ? 's' : ''} replacement
            </span>
          )}
          <BrutalistButton onClick={onRefresh} accent>↻ Refresh</BrutalistButton>
        </div>
      </div>

      {activeShoes.length === 0 ? <EmptyState /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 24, marginBottom: 64 }}>
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

// ─── Section heading with optional ink-highlight emphasis ────────────────────

export function SectionHeading({ children }) {
  return (
    <h2 style={{
      fontFamily: 'var(--sans)', fontSize: 28, fontWeight: 900,
      letterSpacing: '-0.03em', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {children}
    </h2>
  );
}
export function Em({ children }) {
  return (
    <span style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '0 8px' }}>
      {children}
    </span>
  );
}

// ─── Marquee stat (joined-block strip) ────────────────────────────────────────

function MarqueeStat({ num, label, last }) {
  return (
    <div style={{
      border: '2px solid var(--ink)', borderRight: last ? '2px solid var(--ink)' : 'none',
      background: 'var(--card)', padding: '14px 22px', minWidth: 100,
      boxShadow: last ? '3px 3px 0 var(--ink)' : 'none',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 800,
        color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1,
      }}>{num}</div>
      <div style={{
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--ink-3)', fontWeight: 800, marginTop: 6,
      }}>{label}</div>
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
    <div style={{ marginBottom: 64, borderTop: '3px solid var(--ink)', paddingTop: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <SectionHeading>Hall of <Em>Fame</Em></SectionHeading>
        <span style={{
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--ink-3)', fontWeight: 800,
          border: '2px solid var(--ink)', padding: '4px 10px', background: 'var(--card)',
        }}>
          {shoes.length} retired pair{shoes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {visible.map((shoe) => {
          const photoUrl = shoe.photo ? `/uploads/${shoe.photo}` : null;
          return (
            <div
              key={shoe.id}
              onClick={() => onSelectShoe(shoe)}
              style={{
                background: 'var(--paper-2)',
                border: '3px solid var(--ink)',
                boxShadow: '3px 3px 0 var(--ink)',
                padding: 20,
                cursor: 'pointer',
                transition: 'transform 0.08s, box-shadow 0.08s',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = '6px 6px 0 var(--ink)'; e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
              onMouseOut={(e)  => { e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Mini tombstone */}
              <div style={{
                width: 56, height: 66, flexShrink: 0,
                borderRadius: '56px 56px 0 0',
                border: '2px solid var(--ink)',
                background: photoUrl ? 'transparent' : 'var(--ink)',
                color: 'var(--brand)',
                overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {photoUrl
                  ? <img src={photoUrl} alt={shoe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <span style={{ fontSize: 22 }}>👟</span>
                }
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 800,
                      color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {shoe.name}
                    </div>
                    {(shoe.brand_name || shoe.model_name) && (
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, fontWeight: 600 }}>
                        {[shoe.brand_name, shoe.model_name].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--ink)', border: '1.5px solid var(--ink)',
                    padding: '3px 8px', fontWeight: 800, flexShrink: 0, background: 'var(--card)',
                  }}>Retired</span>
                </div>

                <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
                  <StatMini num={`${shoe.totalKm?.toFixed(0)} km`} label="Distance" />
                  <StatMini num={shoe.runCount} label="Runs" />
                  {shoe.medianPaceLabel && <StatMini num={shoe.medianPaceLabel} label="Pace" />}
                </div>

                {shoe.retirementNote && (
                  <p style={{
                    fontSize: 12, color: 'var(--ink)', fontStyle: 'italic',
                    borderTop: '2px solid var(--ink)', paddingTop: 10, margin: 0,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    "{shoe.retirementNote}"
                  </p>
                )}
                {shoe.firstRunDate && (
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)',
                    marginTop: shoe.retirementNote ? 6 : 0,
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700,
                  }}>
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
            marginTop: 18, background: 'transparent',
            border: '2px solid var(--ink)', padding: '6px 12px',
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
            color: 'var(--ink)', fontFamily: 'var(--sans)',
            boxShadow: '3px 3px 0 var(--ink)',
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
      <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{num}</div>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 800 }}>{label}</div>
    </div>
  );
}

// ─── Needs a Run ──────────────────────────────────────────────────────────────

function NudgeSection({ shoes, onSelectShoe }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      padding: '16px 20px', marginBottom: 56,
      border: '3px solid var(--ink)', borderLeft: '10px solid var(--amber)',
      background: 'var(--amber-soft)',
      boxShadow: '3px 3px 0 var(--ink)',
    }}>
      <span style={{
        fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'var(--amber)', fontWeight: 900, flexShrink: 0,
      }}>
        Needs a run
      </span>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {shoes.map((shoe) => (
          <button
            key={shoe.id}
            onClick={() => onSelectShoe(shoe)}
            style={{
              background: 'var(--card)', border: '2px solid var(--ink)',
              padding: '5px 12px', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)', fontWeight: 700,
            }}
          >
            <span>{shoe.name}</span>
            <span style={{ color: 'var(--amber)', fontWeight: 800, fontSize: 12, fontFamily: 'var(--mono)' }}>{shoe.daysSinceLastRun}d</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '80px 20px', color: 'var(--ink-3)',
      border: '3px solid var(--ink)', background: 'var(--card)',
      marginBottom: 64,
    }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 32, fontWeight: 900, marginBottom: 12, color: 'var(--ink)' }}>No shoes yet</div>
      <p style={{ fontSize: 14, maxWidth: 340, margin: '0 auto 20px', fontWeight: 500 }}>
        Add shoes in Strava and log a run with a shoe selected to get started.
      </p>
      <a href="https://www.strava.com/settings/gear" target="_blank" rel="noopener noreferrer"
        style={{
          display: 'inline-block', color: 'var(--ink)', fontSize: 14, fontWeight: 800,
          background: 'var(--brand)', border: '2px solid var(--ink)',
          padding: '8px 16px', boxShadow: '3px 3px 0 var(--ink)',
        }}>
        Manage gear on Strava →
      </a>
    </div>
  );
}

// ─── Brutalist button (local, also exposed via re-export pattern) ─────────────

function BrutalistButton({ onClick, children, accent }) {
  const base = accent
    ? { background: 'var(--brand)' }
    : { background: 'var(--card)' };
  return (
    <button
      onClick={onClick}
      style={{
        border: '2px solid var(--ink)', padding: '8px 14px',
        fontSize: 13, fontWeight: 800, color: 'var(--ink)',
        fontFamily: 'var(--sans)',
        boxShadow: '3px 3px 0 var(--ink)',
        transition: 'transform 0.08s, box-shadow 0.08s',
        ...base,
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '1px 1px 0 var(--ink)'; }}
      onMouseUp={(e)   => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)'; }}
      onMouseOut={(e)  => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--ink)'; }}
    >{children}</button>
  );
}
