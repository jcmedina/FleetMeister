import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import { REPLACEMENT_KM, formatPace } from '../analytics';

export default function ShoeDetail({ shoe, onBack }) {
  const [paceView, setPaceView] = useState('trend');

  const {
    name, brand_name, model_name, description,
    totalKm, runCount, medianPaceLabel, medianPace,
    paceTrend, dayOfWeek, distDist,
    paceImprovement, useType, replacement,
    fastestRun, longestRunKm, avgHeartRate,
    avgLongRunPaceLabel, avgSpeedRunPaceLabel,
    firstRunDate, lastRunDate, retired,
  } = shoe;

  const kmLeft = Math.max(0, REPLACEMENT_KM - totalKm);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '28px', marginBottom: 20,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700 }}>{name || 'Unnamed Shoe'}</h2>
              {retired && (
                <span style={{
                  background: 'var(--surface2)', color: 'var(--text-muted)',
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  border: '1px solid var(--border)',
                }}>Retired</span>
              )}
            </div>
            {(brand_name || model_name) && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {[brand_name, model_name].filter(Boolean).join(' ')}
              </p>
            )}
            {description && (
              <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 6 }}>{description}</p>
            )}
            {firstRunDate && (
              <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
                {firstRunDate} → {lastRunDate || 'now'}
              </p>
            )}
          </div>

          <div style={{
            background: `${replacement?.color}12`,
            border: `1px solid ${replacement?.color}33`,
            borderRadius: 12, padding: '16px 20px',
            textAlign: 'center', minWidth: 160,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: replacement?.color }}>
              {replacement?.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {kmLeft > 0 ? `~${kmLeft.toFixed(0)} km left` : 'Past recommended limit'}
            </div>
            <MileageBar pct={replacement?.pct} color={replacement?.color} />
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
              {totalKm?.toFixed(0)} / {REPLACEMENT_KM} km
            </div>
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        <StatCard label="Total Km" value={`${totalKm?.toFixed(1)}`} unit="km" />
        <StatCard label="Total Runs" value={runCount} />
        <StatCard label="Median Pace" value={medianPaceLabel} />
        <StatCard label="Longest Run" value={`${longestRunKm}`} unit="km" />
        {avgHeartRate && <StatCard label="Avg Heart Rate" value={`${avgHeartRate}`} unit="bpm" />}
        {fastestRun && <StatCard label="Fastest Pace" value={fastestRun.paceLabel} unit="/km" small />}
        {avgLongRunPaceLabel && <StatCard label="Long Run Pace" value={avgLongRunPaceLabel} small tooltip="Avg pace on runs > 10km" />}
        {avgSpeedRunPaceLabel && <StatCard label="Speed Session" value={avgSpeedRunPaceLabel} small tooltip="Avg pace on runs < 22km" />}
        <StatCard label="Use Type" value={useType} small />
        {paceImprovement !== null && (
          <StatCard
            label="Pace Change"
            value={paceImprovement > 0 ? `▼ ${formatPaceChange(paceImprovement)}` : `▲ ${formatPaceChange(-paceImprovement)}`}
            color={paceImprovement > 0 ? 'var(--green)' : 'var(--red)'}
            small
            tooltip="Difference between first 5 and last 5 runs"
          />
        )}
      </div>

      {/* Charts */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {[
            { key: 'trend', label: '📈 Pace Trend' },
            { key: 'dow',   label: '🗓 Day of Week' },
            { key: 'dist',  label: '📏 Distance' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPaceView(tab.key)}
              style={{
                background: 'transparent', border: 'none',
                borderBottom: paceView === tab.key ? '2px solid var(--orange)' : '2px solid transparent',
                color: paceView === tab.key ? 'var(--text)' : 'var(--text-muted)',
                padding: '14px 16px', fontSize: 13,
                fontWeight: paceView === tab.key ? 600 : 400,
                marginBottom: -1, cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px 20px' }}>
          {paceView === 'trend' && <PaceTrendChart data={paceTrend} medianPace={medianPace} />}
          {paceView === 'dow'   && <DayOfWeekChart data={dayOfWeek} />}
          {paceView === 'dist'  && <DistributionChart data={distDist} />}
        </div>
      </div>
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function PaceTrendChart({ data, medianPace }) {
  if (!data || data.length === 0) return <EmptyChart message="No pace data available" />;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13,
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name || `Run #${d.index}`}</div>
        <div style={{ color: 'var(--orange)' }}>Pace: {d.paceLabel} /km</div>
        <div style={{ color: 'var(--text-muted)' }}>{d.km} km · {d.date}</div>
        {d.heartrate && <div style={{ color: 'var(--text-muted)' }}>❤ {Math.round(d.heartrate)} bpm</div>}
      </div>
    );
  };

  const formatY = (val) => {
    const mins = Math.floor(val / 60);
    const secs = Math.round(val % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const paces = data.map((d) => d.pace).filter(Boolean);
  const minPace = Math.min(...paces) - 20;
  const maxPace = Math.max(...paces) + 20;

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Pace per run — lower = faster · Median: <strong style={{ color: 'var(--orange)' }}>{formatY(medianPace)} /km</strong>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="index"
            tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
            label={{ value: 'Run #', position: 'insideBottomRight', offset: -5, fill: 'var(--text-dim)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }} tickLine={false}
          />
          <YAxis
            domain={[minPace, maxPace]} reversed tickFormatter={formatY}
            tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
            axisLine={false} tickLine={false} width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          {medianPace && (
            <ReferenceLine y={medianPace} stroke="rgba(252,76,2,0.3)" strokeDasharray="4 4" />
          )}
          <Line
            type="monotone" dataKey="pace" stroke="var(--orange)" strokeWidth={2}
            dot={{ fill: 'var(--orange)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--orange-light)' }} connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DayOfWeekChart({ data }) {
  if (!data || data.every((d) => d.count === 0)) return <EmptyChart message="No day-of-week data available" />;
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Which days you most often run in these shoes
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
            axisLine={false} tickLine={false} width={28} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
            formatter={(v) => [`${v} runs`, '']}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.count === max ? 'var(--orange)' : 'var(--surface2)'}
                stroke={entry.count === max ? 'none' : 'var(--border)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DistributionChart({ data }) {
  if (!data || data.every((d) => d.count === 0)) return <EmptyChart message="No distance data available" />;
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        Distance distribution — how far you typically run in these shoes
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
            axisLine={false} tickLine={false} width={28} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
            formatter={(v) => [`${v} runs`, '']}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i}
                fill={entry.count === max ? 'var(--orange)' : 'var(--surface2)'}
                stroke={entry.count === max ? 'none' : 'var(--border)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, color, small, tooltip }) {
  return (
    <div title={tooltip} style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '14px 16px', boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: small ? 15 : 22, fontWeight: 700, color: color || 'var(--text)', lineHeight: 1.2 }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

function MileageBar({ pct, color }) {
  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 5, marginTop: 10, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(pct || 0, 1) * 100}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
      {message}
    </div>
  );
}

function formatPaceChange(secDiff) {
  const mins = Math.floor(Math.abs(secDiff) / 60);
  const secs = Math.round(Math.abs(secDiff) % 60);
  if (mins === 0) return `${secs}s /km`;
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}
