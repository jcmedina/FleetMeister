import React, { useState, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import { REPLACEMENT_KM, formatPace, SHOE_TYPES } from '../analytics';

const TICKS = 20;

export default function ShoeDetail({ shoe, onSaveSettings, onSavePhoto }) {
  const [tab, setTab] = useState('trend');
  const {
    name, brand_name, model_name, description,
    totalKm, runCount, medianPaceLabel, medianPace,
    paceTrend, dayOfWeek, distDist, paceImprovement,
    useType, replacement, fastestRun, longestRunKm,
    avgHeartRate, avgLongRunPaceLabel, avgSpeedRunPaceLabel,
    firstRunDate, lastRunDate, retired,
    shoeType, customLimitKm, nudgeDays, retirementNote, photo,
  } = shoe;

  const limitKm = customLimitKm || REPLACEMENT_KM;
  const ratio  = Math.min((totalKm || 0) / limitKm, 1);
  const filled = Math.round(ratio * TICKS);
  const tickColor = replacement?.level === 'danger' ? 'var(--signal)'
    : replacement?.level === 'warning' || replacement?.level === 'caution' ? 'var(--amber)'
    : 'var(--moss)';
  const kmLeft = Math.max(0, limitKm - totalKm);

  const statsGrid = [
    { num: `${totalKm?.toFixed(1)} km`, label: 'Total Distance' },
    { num: runCount, label: 'Total Runs' },
    { num: medianPaceLabel, label: 'Median Pace' },
    { num: `${longestRunKm} km`, label: 'Longest Run' },
    avgHeartRate && { num: `${avgHeartRate} bpm`, label: 'Avg Heart Rate' },
    fastestRun && { num: fastestRun.paceLabel, label: 'Fastest Pace' },
    avgLongRunPaceLabel && { num: avgLongRunPaceLabel, label: 'Long Run Pace', sub: '> 10 km' },
    avgSpeedRunPaceLabel && { num: avgSpeedRunPaceLabel, label: 'Speed Session', sub: '< 22 km' },
    { num: useType, label: 'Use Type' },
    paceImprovement !== null && {
      num: paceImprovement > 0 ? `▼ ${formatPaceChange(paceImprovement)}` : `▲ ${formatPaceChange(-paceImprovement)}`,
      label: 'Pace Change',
      color: paceImprovement > 0 ? 'var(--moss)' : 'var(--signal)',
    },
  ].filter(Boolean);

  return (
    <div>
      {retired ? (
        <MemorialHero shoe={shoe} onSavePhoto={onSavePhoto} />
      ) : (
        /* ── Active shoe hero ── */
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{
                fontFamily: 'var(--sans)', fontSize: 40, fontWeight: 900,
                letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 8, lineHeight: 1,
              }}>
                {name || 'Unnamed Shoe'}
              </h1>
              {(brand_name || model_name) && (
                <p style={{ color: 'var(--ink-2)', fontSize: 15, fontWeight: 600 }}>{[brand_name, model_name].filter(Boolean).join(' ')}</p>
              )}
              {description && <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>{description}</p>}
              {firstRunDate && (
                <p style={{
                  fontFamily: 'var(--mono)', color: 'var(--ink-3)', fontSize: 11,
                  marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700,
                }}>
                  {firstRunDate} → {lastRunDate || 'now'}
                </p>
              )}
            </div>

            {/* Replacement status */}
            <div style={{
              minWidth: 220,
              border: '3px solid var(--ink)', background: 'var(--card)',
              boxShadow: '5px 5px 0 var(--ink)', padding: '14px 16px',
            }}>
              <div style={{
                fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 900,
                color: tickColor, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {replacement?.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TICKS}, 1fr)`, gap: 2, marginBottom: 10 }}>
                {Array.from({ length: TICKS }, (_, i) => (
                  <div key={i} style={{
                    height: 12,
                    border: '1.5px solid var(--ink)',
                    background: i < filled ? tickColor : 'var(--card)',
                  }} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>
                <strong style={{ color: 'var(--ink)', fontWeight: 800 }}>{totalKm?.toFixed(0)}</strong> / {limitKm} km
                {kmLeft > 0 && <span style={{ color: 'var(--ink-3)', marginLeft: 6 }}>· ~{kmLeft.toFixed(0)} km left</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Life-in-numbers header (retired only) */}
      {retired && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            A life in <span style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '0 8px' }}>numbers</span>
          </h2>
          {firstRunDate && lastRunDate && (
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 800,
              border: '2px solid var(--ink)', padding: '4px 10px', background: 'var(--card)',
            }}>
              {monthsBetween(firstRunDate, lastRunDate)} months · {runCount} outings
            </span>
          )}
        </div>
      )}

      {/* Key stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        border: '3px solid var(--ink)', background: 'var(--card)',
        boxShadow: '5px 5px 0 var(--ink)',
        marginBottom: 40,
      }}>
        {statsGrid.map((s, i) => (
          <div key={i} style={{
            padding: '18px 18px',
            borderRight: '2px solid var(--ink)',
            borderBottom: '2px solid var(--ink)',
          }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.02em', color: s.color || 'var(--ink)',
              lineHeight: 1.0, marginBottom: 8,
            }}>{s.num}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 800 }}>
              {s.label}
              {s.sub && <span style={{ color: 'var(--ink-3)', fontWeight: 600, textTransform: 'none', letterSpacing: 0, marginLeft: 4 }}>{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Settings tabs */}
      <div>
        <div style={{ display: 'flex', borderBottom: '3px solid var(--ink)', marginBottom: 24, gap: 0 }}>
          {[
            { key: 'trend',    label: 'Pace Trend' },
            { key: 'dow',      label: 'Day of Week' },
            { key: 'dist',     label: 'Distance' },
            { key: 'settings', label: 'Settings' },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: active ? 'var(--brand)' : 'transparent',
                border: active ? '2px solid var(--ink)' : 'none',
                borderBottom: active ? '6px solid var(--ink)' : '6px solid transparent',
                color: 'var(--ink)',
                padding: '11px 22px', fontSize: 13,
                fontWeight: active ? 800 : 600,
                fontFamily: 'var(--sans)',
                cursor: 'pointer', marginBottom: -3,
                boxShadow: active ? '3px 3px 0 var(--ink)' : 'none',
              }}>{t.label}</button>
            );
          })}
        </div>

        {tab === 'trend'    && <PaceTrendChart data={paceTrend} medianPace={medianPace} />}
        {tab === 'dow'      && <DayOfWeekChart data={dayOfWeek} />}
        {tab === 'dist'     && <DistributionChart data={distDist} />}
        {tab === 'settings' && (
          <SettingsPanel
            shoe={shoe}
            initialType={shoeType}
            initialLimitKm={customLimitKm}
            initialNudgeDays={nudgeDays}
            initialRetirementNote={retirementNote}
            onSave={onSaveSettings}
          />
        )}
      </div>
    </div>
  );
}

// ─── Memorial Hero (retired shoes) ───────────────────────────────────────────

function MemorialHero({ shoe, onSavePhoto }) {
  const { name, brand_name, model_name, firstRunDate, lastRunDate, retirementNote, photo, useType, id } = shoe;
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [hoverTomb, setHoverTomb] = useState(false);

  const photoUrl = photo ? `/uploads/${photo}` : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !onSavePhoto) return;
    setUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onerror = () => { setUploadError('Could not read file.'); setUploading(false); };
    reader.onload = (ev) => {
      onSavePhoto(id, ev.target.result, file.type)
        .catch(() => setUploadError('Upload failed — check that PM2 is running and you\'re signed in.'))
        .finally(() => setUploading(false));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const fmtDate = (iso) => {
    if (!iso) return '?';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ paddingTop: 32, marginBottom: 0 }}>

      {/* In Memoriam eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <div style={{ flex: 1, height: 0, borderTop: '2px solid var(--ink)' }} />
        <span style={{
          fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 800,
          letterSpacing: '0.3em', color: 'var(--paper)', textTransform: 'uppercase',
          whiteSpace: 'nowrap', background: 'var(--ink)',
          border: '2px solid var(--ink)', padding: '5px 14px', boxShadow: '3px 3px 0 var(--ink)',
        }}>
          In Memoriam
        </span>
        <div style={{ flex: 1, height: 0, borderTop: '2px solid var(--ink)' }} />
      </div>

      {/* Centered tombstone */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onMouseEnter={() => setHoverTomb(true)}
          onMouseLeave={() => setHoverTomb(false)}
          style={{
            width: 300,
            height: 345,
            borderRadius: '300px 300px 0 0',
            background: photoUrl ? 'var(--card)' : 'var(--card)',
            border: '3px solid var(--ink)',
            boxShadow: hoverTomb ? '10px 10px 0 var(--ink)' : '8px 8px 0 var(--ink)',
            transform: hoverTomb ? 'translate(-2px,-2px)' : 'none',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
        >
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {hoverTomb && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(28,41,60,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                }}>
                  <span style={{ fontSize: 28 }}>📷</span>
                  <span style={{ color: '#fff', fontSize: 12, fontFamily: 'var(--sans)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Replace photo
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 14,
            }}>
              <span style={{ fontSize: 30, color: 'var(--ink)', fontWeight: 300, lineHeight: 1 }}>+</span>
              <span style={{
                fontFamily: 'var(--sans)', fontWeight: 800,
                fontSize: 12, color: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {uploading ? 'Uploading…' : 'Add a final portrait'}
              </span>
              <span style={{
                position: 'absolute', bottom: 28,
                fontFamily: 'var(--sans)', fontWeight: 700,
                fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>
                — rest in pace —
              </span>
            </div>
          )}
        </div>

        {/* Dirt mound */}
        <div style={{
          width: 380, height: 18, background: 'var(--ink)', marginTop: 4,
          clipPath: 'polygon(0 100%, 8% 30%, 18% 60%, 32% 20%, 50% 50%, 68% 25%, 82% 55%, 94% 30%, 100% 100%)',
        }} />
        {/* Ground line */}
        <div style={{ width: 440, borderTop: '6px dashed var(--ink)', marginTop: -2 }} />

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {uploadError && (
          <p style={{ fontSize: 12, color: 'var(--signal)', marginTop: 14, textAlign: 'center', maxWidth: 340, fontWeight: 700 }}>
            {uploadError}
          </p>
        )}
      </div>

      {/* Name, epitaph, dates */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--sans)', fontSize: 52, fontWeight: 900,
          letterSpacing: '-0.04em', color: 'var(--ink)',
          lineHeight: 1.0, marginBottom: 18, textTransform: 'uppercase',
        }}>
          {name || 'Unnamed Shoe'}
        </h1>

        {retirementNote && (
          <p style={{
            fontFamily: 'var(--sans)', fontStyle: 'italic',
            fontSize: 18, color: 'var(--ink)', lineHeight: 1.6, fontWeight: 500,
            marginBottom: 22, maxWidth: 540, margin: '0 auto 22px',
            borderLeft: '6px solid var(--ink)', borderRight: '6px solid var(--ink)',
            padding: '0 18px',
          }}>
            {retirementNote}
          </p>
        )}

        {(firstRunDate || lastRunDate) && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            border: '2px solid var(--ink)', background: 'var(--card)',
            boxShadow: '3px 3px 0 var(--ink)', padding: '8px 18px',
            fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 14,
            letterSpacing: '0.04em',
          }}>
            {firstRunDate && (
              <span>
                <span style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: 6 }}>b.</span>
                {fmtDate(firstRunDate)}
              </span>
            )}
            {firstRunDate && lastRunDate && <span style={{ color: 'var(--ink-3)' }}>✦</span>}
            {lastRunDate && (
              <span>
                <span style={{ color: 'var(--ink-3)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: 6 }}>d.</span>
                {fmtDate(lastRunDate)}
              </span>
            )}
          </div>
        )}

        {/* Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
          <span style={{
            padding: '5px 14px', fontSize: 11, fontWeight: 800,
            background: 'var(--ink)', color: 'var(--paper)',
            border: '2px solid var(--ink)',
            fontFamily: 'var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>🪦 Retired</span>
          {useType && (
            <span style={{
              padding: '5px 14px', fontSize: 11, fontWeight: 800,
              border: '2px solid var(--ink)', color: 'var(--ink)', background: 'var(--card)',
              fontFamily: 'var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>⚡ {useType}</span>
          )}
        </div>
      </div>

      <div style={{ borderTop: '3px solid var(--ink)', marginTop: 32, marginBottom: 32 }} />
    </div>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

function ChartFrame({ children }) {
  return (
    <div style={{
      border: '3px solid var(--ink)', background: 'var(--card)',
      boxShadow: '5px 5px 0 var(--ink)', padding: '22px 22px 18px',
    }}>{children}</div>
  );
}

function PaceTrendChart({ data, medianPace }) {
  if (!data?.length) return <EmptyChart message="No pace data available" />;

  const fmt = (v) => { const m = Math.floor(v/60); const s = Math.round(v%60); return `${m}:${s.toString().padStart(2,'0')}`; };
  const paces = data.map(d => d.pace).filter(Boolean);
  const domain = [Math.min(...paces)-20, Math.max(...paces)+20];

  const Tip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--card)', border: '2px solid var(--ink)',
        boxShadow: '3px 3px 0 var(--ink)', padding: '10px 14px', fontSize: 13,
      }}>
        <div style={{ fontFamily: 'var(--sans)', fontWeight: 800, marginBottom: 4 }}>{d.name || `Run #${d.index}`}</div>
        <div style={{ color: 'var(--secondary)', fontFamily: 'var(--mono)', fontWeight: 800 }}>{d.paceLabel} /km</div>
        <div style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{d.km} km · {d.date}</div>
        {d.heartrate && <div style={{ color: 'var(--ink-3)', fontWeight: 600 }}>❤ {Math.round(d.heartrate)} bpm</div>}
      </div>
    );
  };

  return (
    <ChartFrame>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, fontWeight: 600 }}>
        Pace per run · lower = faster · Median:{' '}
        <strong style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', fontWeight: 800 }}>{fmt(medianPace)} /km</strong>
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="index" tick={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: 'var(--ink)', strokeWidth: 2 }} tickLine={false} />
          <YAxis domain={domain} reversed tickFormatter={fmt} tick={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<Tip />} />
          {medianPace && <ReferenceLine y={medianPace} stroke="var(--brand)" strokeWidth={3} strokeDasharray="8 5" />}
          <Line type="monotone" dataKey="pace" stroke="var(--secondary)" strokeWidth={3}
            dot={{ fill: 'var(--secondary)', r: 3, strokeWidth: 1.5, stroke: 'var(--ink)' }}
            activeDot={{ r: 6, fill: 'var(--brand)', stroke: 'var(--ink)', strokeWidth: 2 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function DayOfWeekChart({ data }) {
  if (!data?.length || data.every(d => d.count === 0)) return <EmptyChart message="No data" />;
  const max = Math.max(...data.map(d => d.count));
  return (
    <ChartFrame>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, fontWeight: 600 }}>Which days you most often ran in these shoes</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="day" tick={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }} axisLine={{ stroke: 'var(--ink)', strokeWidth: 2 }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip cursor={{ fill: 'rgba(28,41,60,0.05)' }}
            contentStyle={{ background: 'var(--card)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', fontSize: 13, fontWeight: 700 }}
            formatter={(v) => [`${v} runs`, '']} labelStyle={{ fontFamily: 'var(--sans)', fontWeight: 800 }} />
          <Bar dataKey="count">
            {data.map((e, i) => <Cell key={i} fill={e.count === max ? 'var(--brand)' : 'var(--card)'} stroke="var(--ink)" strokeWidth={2} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function DistributionChart({ data }) {
  if (!data?.length || data.every(d => d.count === 0)) return <EmptyChart message="No data" />;
  const max = Math.max(...data.map(d => d.count));
  return (
    <ChartFrame>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, fontWeight: 600 }}>Distance distribution — how far you typically ran in these shoes</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="label" tick={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }} axisLine={{ stroke: 'var(--ink)', strokeWidth: 2 }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip cursor={{ fill: 'rgba(28,41,60,0.05)' }}
            contentStyle={{ background: 'var(--card)', border: '2px solid var(--ink)', boxShadow: '3px 3px 0 var(--ink)', fontSize: 13, fontWeight: 700 }}
            formatter={(v) => [`${v} runs`, '']} labelStyle={{ fontFamily: 'var(--sans)', fontWeight: 800 }} />
          <Bar dataKey="count">
            {data.map((e, i) => <Cell key={i} fill={e.count === max ? 'var(--brand)' : 'var(--card)'} stroke="var(--ink)" strokeWidth={2} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

function EmptyChart({ message }) {
  return (
    <ChartFrame>
      <div style={{
        height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-3)', fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {message}
      </div>
    </ChartFrame>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({ shoe, initialType, initialLimitKm, initialNudgeDays, initialRetirementNote, onSave }) {
  const [type, setType] = useState(initialType || '');
  const [limitKm, setLimitKm] = useState(initialLimitKm || '');
  const [nudgeDays, setNudgeDays] = useState(initialNudgeDays || '');
  const [retirementNote, setRetirementNote] = useState(initialRetirementNote || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true); setSaved(false); setSaveError(null);
    try {
      await onSave(shoe.id, {
        type: type || null,
        custom_limit_km: limitKm ? parseInt(limitKm) : null,
        nudge_days: nudgeDays ? parseInt(nudgeDays) : null,
        retirement_note: retirementNote || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '2px solid var(--ink)',
    background: 'var(--card)', color: 'var(--ink)',
    fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box',
    boxShadow: '3px 3px 0 var(--ink)',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.08em', fontWeight: 800, color: 'var(--ink)',
    marginBottom: 8,
  };

  return (
    <div style={{
      maxWidth: 520, border: '3px solid var(--ink)', background: 'var(--card)',
      boxShadow: '5px 5px 0 var(--ink)', padding: 24,
    }}>
      {/* Shoe type */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Shoe Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SHOE_TYPES.map((t) => {
            const selected = type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setType(selected ? '' : t.value)}
                style={{
                  padding: '7px 14px', fontSize: 13, cursor: 'pointer',
                  border: '2px solid var(--ink)',
                  background: selected ? 'var(--brand)' : 'var(--card)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--sans)', fontWeight: selected ? 800 : 600,
                  boxShadow: selected ? '3px 3px 0 var(--ink)' : 'none',
                  transition: 'all 0.08s',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom mileage limit */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Custom Mileage Limit (km)</label>
        <input
          type="number"
          min="1"
          placeholder={`Default: 650 km`}
          value={limitKm}
          onChange={(e) => setLimitKm(e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8, fontWeight: 500 }}>
          Override the standard 650 km replacement guide for this shoe.
        </p>
      </div>

      {/* Nudge days */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Nudge me after (days without a run)</label>
        <input
          type="number"
          min="1"
          placeholder="e.g. 14"
          value={nudgeDays}
          onChange={(e) => setNudgeDays(e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8, fontWeight: 500 }}>
          Get an alert on the dashboard if this shoe goes unused for this many days.
        </p>
      </div>

      {/* Retirement note */}
      {shoe.retired && (
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Retirement Note / Epitaph</label>
          <textarea
            rows={3}
            placeholder="Why did you retire these? What made them great?"
            value={retirementNote}
            onChange={(e) => setRetirementNote(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontStyle: 'italic' }}
          />
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8, fontWeight: 500 }}>
            This appears as the epitaph on the memorial page.
          </p>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '11px 28px', background: saving ? 'var(--ink-4)' : saved ? 'var(--moss)' : 'var(--brand)',
          color: 'var(--ink)', border: '2px solid var(--ink)',
          fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 800,
          cursor: saving ? 'default' : 'pointer',
          boxShadow: '4px 4px 0 var(--ink)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
      </button>
      {saveError && <p style={{ color: 'var(--signal)', fontSize: 13, marginTop: 10, fontWeight: 700 }}>{saveError}</p>}
    </div>
  );
}

function formatPaceChange(s) {
  const m = Math.floor(Math.abs(s)/60); const sec = Math.round(Math.abs(s)%60);
  return m === 0 ? `${sec}s /km` : `${m}:${sec.toString().padStart(2,'0')} /km`;
}

function monthsBetween(isoA, isoB) {
  if (!isoA || !isoB) return 0;
  const a = new Date(isoA), b = new Date(isoB);
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24 * 30.44)));
}
