import React from 'react';
import { formatPace } from '../analytics';

export default function Leaderboard({ shoes, onSelectShoe }) {
  // Only consider non-retired shoes with at least 3 runs for rankings
  const active = shoes.filter((s) => !s.retired && s.runCount >= 3);

  // ── Top 5 Fastest (by median pace, ascending = faster) ───────────────────
  const top5Fastest = [...active]
    .filter((s) => s.medianPace)
    .sort((a, b) => a.medianPace - b.medianPace)
    .slice(0, 5);

  // ── Most Relaxing (by avg heart rate, ascending = lowest HR) ─────────────
  const top5Relaxing = [...active]
    .filter((s) => s.avgHeartRate)
    .sort((a, b) => a.avgHeartRate - b.avgHeartRate)
    .slice(0, 5);

  // ── Awards ────────────────────────────────────────────────────────────────
  const bestLongRun = [...active]
    .filter((s) => s.avgLongRunPace && s.longRunCount >= 2)
    .sort((a, b) => a.avgLongRunPace - b.avgLongRunPace)[0] || null;

  const bestSpeedSession = [...active]
    .filter((s) => s.avgSpeedRunPace && s.speedRunCount >= 2)
    .sort((a, b) => a.avgSpeedRunPace - b.avgSpeedRunPace)[0] || null;

  const mostUsed = [...active]
    .sort((a, b) => b.runCount - a.runCount)[0] || null;

  const freshest = [...active]
    .sort((a, b) => a.totalKm - b.totalKm)[0] || null;

  const awards = [
    bestLongRun && {
      icon: '🏔',
      title: 'Long Run King',
      desc: 'Best avg pace on runs > 10km',
      shoe: bestLongRun,
      stat: bestLongRun.avgLongRunPaceLabel,
    },
    bestSpeedSession && {
      icon: '⚡',
      title: 'Speed Demon',
      desc: 'Best avg pace on runs < 22km',
      shoe: bestSpeedSession,
      stat: bestSpeedSession.avgSpeedRunPaceLabel,
    },
    mostUsed && {
      icon: '🏅',
      title: 'Most Reliable',
      desc: 'Your most-used shoe',
      shoe: mostUsed,
      stat: `${mostUsed.runCount} runs`,
    },
    freshest && {
      icon: '✨',
      title: 'Freshest Legs',
      desc: 'Fewest km logged',
      shoe: freshest,
      stat: `${freshest.totalKm} km`,
    },
  ].filter(Boolean);

  const hasData = top5Fastest.length > 0 || top5Relaxing.length > 0 || awards.length > 0;
  if (!hasData) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Leaderboard
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Top 5 Fastest */}
        {top5Fastest.length > 0 && (
          <RankingCard
            title="🏃 Fastest Shoes"
            subtitle="By median pace (lower = faster)"
            rows={top5Fastest.map((s, i) => ({
              rank: i + 1,
              label: s.name || 'Unnamed',
              value: s.medianPaceLabel,
              shoe: s,
            }))}
            onSelect={onSelectShoe}
          />
        )}

        {/* Most Relaxing */}
        {top5Relaxing.length > 0 && (
          <RankingCard
            title="😌 Most Relaxing"
            subtitle="By avg heart rate (lower = more relaxed)"
            rows={top5Relaxing.map((s, i) => ({
              rank: i + 1,
              label: s.name || 'Unnamed',
              value: `${s.avgHeartRate} bpm`,
              shoe: s,
            }))}
            onSelect={onSelectShoe}
          />
        )}
      </div>

      {/* Awards */}
      {awards.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Awards
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {awards.map((award) => (
              <AwardCard key={award.title} award={award} onSelect={onSelectShoe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RankingCard({ title, subtitle, rows, onSelect }) {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>
      </div>
      <div>
        {rows.map((row, i) => (
          <div
            key={i}
            onClick={() => onSelect(row.shoe)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '11px 18px',
              borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ fontSize: 18, width: 28, flexShrink: 0 }}>
              {medals[i] || <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>{i + 1}</span>}
            </span>
            <span style={{
              flex: 1, fontSize: 14, fontWeight: i === 0 ? 600 : 400,
              color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {row.label}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: i === 0 ? 'var(--orange)' : 'var(--text-muted)',
              flexShrink: 0, marginLeft: 8,
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AwardCard({ award, onSelect }) {
  return (
    <div
      onClick={() => onSelect(award.shoe)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.12s, transform 0.12s',
        boxShadow: 'var(--shadow)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{award.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{award.title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{award.desc}</div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: 'var(--orange)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {award.shoe.name || 'Unnamed'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
        {award.stat}
      </div>
    </div>
  );
}
