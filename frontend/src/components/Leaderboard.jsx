import React from 'react';
import { Zap, HeartPulse, Mountain, Medal, Sparkles } from 'lucide-react';
import { SectionHeading, Em } from './Dashboard';

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
    <div style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
        <SectionHeading>The <Em>leaderboard</Em></SectionHeading>
        <span style={{
          fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 800,
          border: '2px solid var(--ink)', padding: '4px 10px', background: 'var(--card)',
        }}>By the numbers</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: top5Fastest.length && top5Relaxing.length ? '1fr 1fr' : '1fr',
        gap: 28,
      }}>
        {top5Fastest.length > 0 && (
          <Board
            icon={<Zap size={18} />}
            title="Fastest Shoes"
            sub="Median pace · lower is faster"
            rows={top5Fastest.map((s, i) => ({ rank: i + 1, name: s.name, stat: s.medianPaceLabel, shoe: s }))}
            onSelect={onSelectShoe}
          />
        )}
        {top5Relaxing.length > 0 && (
          <Board
            icon={<HeartPulse size={18} />}
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
    bestLongRun && { icon: Mountain,  label: 'Long Run King', title: bestLongRun.name, sub: 'Best avg pace, runs > 10 km', stat: bestLongRun.avgLongRunPaceLabel, shoe: bestLongRun, bg: 'var(--card)' },
    bestSpeed   && { icon: Zap,       label: 'Speed Demon',   title: bestSpeed.name,   sub: 'Best avg pace, runs < 22 km', stat: bestSpeed.avgSpeedRunPaceLabel,   shoe: bestSpeed,   bg: 'var(--secondary-soft)' },
    mostUsed    && { icon: Medal,     label: 'Most Reliable', title: mostUsed.name,    sub: 'Your most-used shoe',         stat: `${mostUsed.runCount} runs`,      shoe: mostUsed,    bg: 'var(--brand-soft)' },
    freshest    && { icon: Sparkles,  label: 'Freshest Legs', title: freshest.name,    sub: 'Fewest km logged',            stat: `${freshest.totalKm} km`,         shoe: freshest,    bg: 'var(--card)' },
  ].filter(Boolean);

  if (!awards.length) return null;

  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <SectionHeading><Em>Awards</Em></SectionHeading>
        <span style={{
          fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 800,
          border: '2px solid var(--ink)', padding: '4px 10px', background: 'var(--card)',
        }}>Standing distinctions</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(awards.length, 4)}, 1fr)`,
        border: '3px solid var(--ink)', boxShadow: '5px 5px 0 var(--ink)',
      }}>
        {awards.map((a, i) => (
          <AwardCell key={a.label} award={a} index={i} total={awards.length} onSelect={onSelectShoe} />
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Board({ icon, title, sub, rows, onSelect }) {
  return (
    <div style={{ border: '3px solid var(--ink)', background: 'var(--card)', boxShadow: '5px 5px 0 var(--ink)' }}>
      <div style={{
        background: 'var(--ink)', color: 'var(--paper)',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{
          fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 17,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'inline-flex', color: 'var(--brand)' }}>{icon}</span> {title}
        </div>
        <span style={{ fontSize: 10, color: '#c9cdd6', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{sub}</span>
      </div>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {rows.map((row, i) => (
          <li
            key={i}
            onClick={() => onSelect(row.shoe)}
            style={{
              display: 'grid', gridTemplateColumns: '38px 1fr auto',
              alignItems: 'center', padding: '13px 18px',
              borderBottom: i < rows.length - 1 ? '2px solid var(--ink)' : 'none',
              gap: 12, cursor: 'pointer',
              background: i === 0 ? 'var(--brand-soft)' : 'var(--card)',
            }}
          >
            <span style={{
              fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 16, textAlign: 'center',
              border: i === 0 ? '2px solid var(--ink)' : 'none',
              background: i === 0 ? 'var(--brand)' : 'transparent',
              color: 'var(--ink)', padding: i === 0 ? '2px 0' : 0,
            }}>{row.rank}</span>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{row.name || 'Unnamed'}</span>
            <span style={{
              fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 16,
              color: i === 0 ? 'var(--secondary)' : 'var(--ink)',
              letterSpacing: '-0.01em',
            }}>{row.stat}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AwardCell({ award, index, total, onSelect }) {
  const Icon = award.icon;
  const isLast = index === total - 1;
  return (
    <div
      onClick={() => onSelect(award.shoe)}
      style={{
        background: award.bg, padding: '22px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        cursor: 'pointer',
        borderRight: isLast ? 'none' : '2px solid var(--ink)',
      }}
    >
      <div style={{
        width: 44, height: 44, border: '2px solid var(--ink)',
        background: 'var(--card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon size={22} strokeWidth={2} color="var(--ink)" /></div>
      <div>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 900, marginBottom: 4 }}>
          {award.label}
        </div>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 800,
          letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.15,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {award.title || 'Unknown'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, fontWeight: 600 }}>{award.sub}</div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 800,
          color: 'var(--secondary)', letterSpacing: '-0.02em', marginTop: 12,
        }}>
          {award.stat}
        </div>
      </div>
    </div>
  );
}

// ─── Default export (kept for compatibility) ─────────────────────────────────

export default function Leaderboard({ shoes, onSelectShoe }) {
  return (
    <>
      <LeaderboardBoards shoes={shoes} onSelectShoe={onSelectShoe} />
      <LeaderboardAwards shoes={shoes} onSelectShoe={onSelectShoe} />
    </>
  );
}
