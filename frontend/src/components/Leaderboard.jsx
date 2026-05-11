import React from 'react';
import { Zap, HeartPulse, Mountain, Medal, Sparkles } from 'lucide-react';

// ─── LeaderboardBoards ────────────────────────────────────────────────────────

export function LeaderboardBoards({ shoes, onSelectShoe }) {
  const active = shoes.filter((s) => !s.retired && s.runCount >= 3);

  const top5Fastest = [...active]
    .filter((s) => s.medianPace)
    .sort((a, b) => a.medianPace - b.medianPace)
    .slice(0, 5);

  const top5Relaxing = [...active]
    .filter((s) => s.avgHeartRate)
    .sort((a, b) => a.avgHeartRate - b.avgHeartRate)
    .slice(0, 5);

  if (!top5Fastest.length && !top5Relaxing.length) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
          The <em style={{ fontStyle: 'italic', fontWeight: 400 }}>leaderboard</em>
        </h2>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>By the numbers</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: top5Fastest.length && top5Relaxing.length ? '1fr 1fr' : '1fr',
        gap: 32,
      }}>
        {top5Fastest.length > 0 && (
          <Board
            icon={<Zap size={16} />}
            title="Fastest Shoes"
            sub="Median pace · lower is faster"
            rows={top5Fastest.map((s, i) => ({ rank: i + 1, name: s.name, stat: s.medianPaceLabel, shoe: s }))}
            onSelect={onSelectShoe}
          />
        )}
        {top5Relaxing.length > 0 && (
          <Board
            icon={<HeartPulse size={16} />}
            title="Most Relaxing"
            sub="Avg heart rate · lower is calmer"
            rows={top5Relaxing.map((s, i) => ({ rank: i + 1, name: s.name, stat: `${s.avgHeartRate} bpm`, shoe: s }))}
            onSelect={onSelectShoe}
          />
        )}
      </div>
    </div>
  );
}

// ─── LeaderboardAwards ────────────────────────────────────────────────────────

export function LeaderboardAwards({ shoes, onSelectShoe }) {
  const active = shoes.filter((s) => !s.retired && s.runCount >= 3);

  const bestLongRun = [...active]
    .filter((s) => s.avgLongRunPace && s.longRunCount >= 2)
    .sort((a, b) => a.avgLongRunPace - b.avgLongRunPace)[0] || null;

  const bestSpeed = [...active]
    .filter((s) => s.avgSpeedRunPace && s.speedRunCount >= 2)
    .sort((a, b) => a.avgSpeedRunPace - b.avgSpeedRunPace)[0] || null;

  const mostUsed = [...active].sort((a, b) => b.runCount - a.runCount)[0] || null;
  const freshest = [...active].sort((a, b) => a.totalKm - b.totalKm)[0] || null;

  const awards = [
    bestLongRun && { icon: Mountain, label: 'Long Run King', title: bestLongRun.name, sub: 'Best avg pace, runs > 10 km', stat: bestLongRun.avgLongRunPaceLabel, shoe: bestLongRun },
    bestSpeed   && { icon: Zap,      label: 'Speed Demon',   title: bestSpeed.name,   sub: 'Best avg pace, runs < 22 km', stat: bestSpeed.avgSpeedRunPaceLabel,   shoe: bestSpeed },
    mostUsed    && { icon: Medal,     label: 'Most Reliable', title: mostUsed.name,    sub: 'Your most-used shoe',         stat: `${mostUsed.runCount} runs`,        shoe: mostUsed },
    freshest    && { icon: Sparkles,  label: 'Freshest Legs', title: freshest.name,    sub: 'Fewest km logged',            stat: `${freshest.totalKm} km`,           shoe: freshest },
  ].filter(Boolean);

  if (!awards.length) return null;

  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>Awards</em>
        </h2>
        <span style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Standing distinctions</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(awards.length, 4)}, 1fr)`,
        gap: '1px', background: 'var(--rule)',
        border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden',
      }}>
        {awards.map((a) => (
          <AwardCell key={a.label} award={a} onSelect={onSelectShoe} />
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Board({ icon, title, sub, rows, onSelect }) {
  return (
    <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div style={{
          fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 17,
          color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'var(--ink-3)' }}>{icon}</span> {title}
        </div>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sub}</span>
      </div>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rows.map((row, i) => (
          <li
            key={i}
            onClick={() => onSelect(row.shoe)}
            style={{
              display: 'grid', gridTemplateColumns: '24px 1fr auto',
              alignItems: 'center', padding: '11px 0',
              borderBottom: i < rows.length - 1 ? '1px solid var(--rule-2)' : 'none',
              gap: 12, cursor: 'pointer',
            }}
          >
            <span style={{
              fontFamily: 'var(--serif)', fontStyle: i > 0 ? 'italic' : 'normal',
              fontWeight: i === 0 ? 600 : 500, fontSize: 16,
              color: i === 0 ? 'var(--brand)' : 'var(--ink-4)',
            }}>{row.rank}</span>
            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{row.name || 'Unnamed'}</span>
            <span style={{
              fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 16,
              color: i === 0 ? 'var(--brand)' : 'var(--ink)',
              letterSpacing: '-0.01em',
            }}>{row.stat}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AwardCell({ award, onSelect }) {
  const Icon = award.icon;
  return (
    <div
      onClick={() => onSelect(award.shoe)}
      style={{
        background: 'var(--paper)', padding: '22px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        cursor: 'pointer', transition: 'background 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'var(--paper-2)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'var(--paper)'}
    >
      <div style={{ color: 'var(--ink-2)' }}><Icon size={22} strokeWidth={1.5} /></div>
      <div>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4 }}>
          {award.label}
        </div>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500,
          letterSpacing: '-0.01em', color: 'var(--ink)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {award.title || 'Unknown'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{award.sub}</div>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500,
          color: 'var(--brand)', letterSpacing: '-0.02em', marginTop: 10,
        }}>
          {award.stat}
        </div>
      </div>
    </div>
  );
}

// ─── Default export (combined, kept for compatibility) ─────────────────────────

export default function Leaderboard({ shoes, onSelectShoe }) {
  return (
    <>
      <LeaderboardBoards shoes={shoes} onSelectShoe={onSelectShoe} />
      <LeaderboardAwards shoes={shoes} onSelectShoe={onSelectShoe} />
    </>
  );
}
