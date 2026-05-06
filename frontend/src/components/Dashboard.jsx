import React from 'react';
import ShoeCard from './ShoeCard';
import Leaderboard from './Leaderboard';
import { REPLACEMENT_KM } from '../analytics';

export default function Dashboard({ shoes, onSelectShoe, onRefresh }) {
  const [hallOpen, setHallOpen] = React.useState(false);

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
          Your <em style={{ fontStyle: 'italic', color: 'var(--brand)', fontWeight: 400 }}>fleet</em>.
        </h1>
        <div style={{ display: 'flex', gap: 28, marginLeft: 'auto', flexWrap: 'wrap' }}>
          <MarqueeStat num={activeShoes.length} label="Active pairs" />
          <MarqueeStat num={totalKm.toFixed(0)} label="Total km" />
          <MarqueeStat num={totalRuns} label="Total runs" />
        </div>
      </div>

      {/* Nudge alerts */}
      {nudgeShoes.length > 0 && (
        <NudgeSection shoes={nudgeShoes} onSelectShoe={onSelectShoe} />
      )}

      {/* Leaderboard */}
      {activeShoes.length > 0 && <Leaderboard shoes={activeShoes} onSelectShoe={onSelectShoe} />}

      {/* Your Shoes section */}
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
          color: 'var(--ink-2)', transition: 'all 0.15s',
        }}>↻ Refresh</button>
      </div>

      {activeShoes.length === 0 ? <EmptyState /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {activeShoes.map((shoe) => (
            <ShoeCard key={shoe.id} shoe={shoe} onClick={() => onSelectShoe(shoe)} />
          ))}
        </div>
      )}

      {/* Hall of Fame */}
      {retiredShoes.length > 0 && (
        <HallOfFame shoes={retiredShoes} open={hallOpen} onToggle={() => setHallOpen((v) => !v)} onSelectShoe={onSelectShoe} />
      )}
    </div>
  );
}

function MarqueeStat({ num, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{num}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function NudgeSection({ shoes, onSelectShoe }) {
  return (
    <div style={{
      background: 'var(--amber-soft, #fffbf0)', border: '1px solid var(--amber)',
      borderRadius: 8, padding: '20px 24px', marginBottom: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>👟</span>
        <h3 style={{
          fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500,
          color: 'var(--ink)', letterSpacing: '-0.01em',
        }}>
          Needs a <em style={{ fontStyle: 'italic', fontWeight: 400 }}>run</em>
        </h3>
        <span style={{
          fontSize: 11, background: 'var(--amber)', color: '#fff',
          borderRadius: 100, padding: '2px 8px', fontWeight: 700,
          letterSpacing: '0.04em',
        }}>{shoes.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {shoes.map((shoe) => (
          <div
            key={shoe.id}
            onClick={() => onSelectShoe(shoe)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--paper)', border: '1px solid var(--rule)',
              borderRadius: 6, padding: '12px 16px', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>
                {shoe.name}
              </div>
              {(shoe.brand_name || shoe.model_name) && (
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
                  {[shoe.brand_name, shoe.model_name].filter(Boolean).join(' ')}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontFamily: 'var(--serif)', fontWeight: 500, color: 'var(--amber)' }}>
                {shoe.daysSinceLastRun}d
              </div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-4)' }}>
                since last run
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HallOfFame({ shoes, open, onToggle, onSelectShoe }) {
  return (
    <div style={{ marginTop: 64, borderTop: '1px solid var(--rule)', paddingTop: 32 }}>
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', marginBottom: open ? 28 : 0 }}
      >
        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500,
          letterSpacing: '-0.02em', color: 'var(--ink-2)',
        }}>
          Hall of <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Fame</em>
        </h2>
        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', fontWeight: 600 }}>
          {shoes.length} retired pair{shoes.length !== 1 ? 's' : ''}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 16, color: 'var(--ink-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </div>

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {shoes.map((shoe) => {
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
              {/* Mini tombstone photo */}
              <div style={{
                width: 52, height: 60, flexShrink: 0,
                borderRadius: '52px 52px 4px 4px',
                border: '1.5px solid var(--ink-4)',
                overflow: 'hidden',
                background: photoUrl ? 'transparent' : 'var(--rule)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {photoUrl ? (
                  <img src={photoUrl} alt={shoe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <span style={{ fontSize: 18, opacity: 0.4 }}>👟</span>
                )}
              </div>

              {/* Card content */}
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
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink-2)' }}>
                      {shoe.totalKm?.toFixed(0)} km
                    </div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', fontWeight: 600 }}>
                      Distance
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink-2)' }}>
                      {shoe.runCount}
                    </div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', fontWeight: 600 }}>
                      Runs
                    </div>
                  </div>
                  {shoe.medianPaceLabel && (
                    <div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ink-2)' }}>
                        {shoe.medianPaceLabel}
                      </div>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', fontWeight: 600 }}>
                        Pace
                      </div>
                    </div>
                  )}
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
          )})}
        </div>
      )}
    </div>
  );
}

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
