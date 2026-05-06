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
        <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 20, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600,
                letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 6,
              }}>
                {name || 'Unnamed Shoe'}
              </h1>
              {(brand_name || model_name) && (
                <p style={{ color: 'var(--ink-3)', fontSize: 15 }}>{[brand_name, model_name].filter(Boolean).join(' ')}</p>
              )}
              {description && <p style={{ color: 'var(--ink-4)', fontSize: 13, marginTop: 6 }}>{description}</p>}
              {firstRunDate && (
                <p style={{ color: 'var(--ink-4)', fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {firstRunDate} → {lastRunDate || 'now'}
                </p>
              )}
            </div>

            {/* Replacement status */}
            <div style={{ minWidth: 180 }}>
              <div style={{
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20,
                fontWeight: 500, color: tickColor, marginBottom: 6,
              }}>
                {replacement?.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TICKS}, 1fr)`, gap: 3, marginBottom: 8 }}>
                {Array.from({ length: TICKS }, (_, i) => (
                  <div key={i} style={{ height: 6, borderRadius: 1, background: i < filled ? tickColor : 'var(--rule)' }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                <strong style={{ color: 'var(--ink-2)' }}>{totalKm?.toFixed(0)}</strong> / {limitKm} km
                {kmLeft > 0 && <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>· ~{kmLeft.toFixed(0)} km left</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key stats grid */}
      {retired && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-2)' }}>
            A life in numbers
          </span>
          {firstRunDate && lastRunDate && (
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-4)', fontWeight: 600 }}>
              {monthsBetween(firstRunDate, lastRunDate)} months · {runCount} outings
            </span>
          )}
        </div>
      )}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1px', background: 'var(--rule)', border: '1px solid var(--rule)',
        borderRadius: 4, overflow: 'hidden', marginBottom: 36,
      }}>
        {statsGrid.map((s, i) => (
          <div key={i} style={{ background: 'var(--paper)', padding: '18px 20px' }}>
            <div style={{
              fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500,
              letterSpacing: '-0.02em', color: s.color || 'var(--ink)',
              lineHeight: 1.1, marginBottom: 6,
            }}>{s.num}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', fontWeight: 600 }}>
              {s.label}{s.sub && <span style={{ color: 'var(--ink-4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> {s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Settings tabs */}
      <div>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--rule)', marginBottom: 24 }}>
          {[
            { key: 'trend',    label: 'Pace Trend' },
            { key: 'dow',      label: 'Day of Week' },
            { key: 'dist',     label: 'Distance' },
            { key: 'settings', label: 'Settings' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: 'transparent', border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--brand)' : '2px solid transparent',
              color: tab === t.key ? 'var(--ink)' : 'var(--ink-3)',
              padding: '10px 20px', fontSize: 13,
              fontWeight: tab === t.key ? 600 : 400,
              fontFamily: tab === t.key ? 'var(--serif)' : 'var(--sans)',
              cursor: 'pointer', marginBottom: -1,
            }}>{t.label}</button>
          ))}
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
    <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 40, marginBottom: 0 }}>

      {/* "In Memoriam" eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--ink-4)' }} />
        <span style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12,
          letterSpacing: '0.14em', color: 'var(--ink-4)', textTransform: 'lowercase',
          whiteSpace: 'nowrap',
        }}>
          in memoriam
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--ink-4)' }} />
      </div>

      {/* Centered tombstone */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
        {/* Arch */}
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          onMouseEnter={() => setHoverTomb(true)}
          onMouseLeave={() => setHoverTomb(false)}
          style={{
            width: 300,
            height: 345,
            borderRadius: '300px 300px 8px 8px',
            background: photoUrl ? 'transparent' : 'var(--rule)',
            border: `2px solid ${hoverTomb ? 'var(--ink-2)' : 'var(--ink-4)'}`,
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
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
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8,
                }}>
                  <span style={{ fontSize: 28 }}>📷</span>
                  <span style={{ color: '#fff', fontSize: 12, fontFamily: 'var(--sans)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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
              gap: 12,
            }}>
              <span style={{ fontSize: 14, color: 'var(--ink-4)', fontWeight: 300, lineHeight: 1 }}>+</span>
              <span style={{
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: 14, color: 'var(--ink-4)', letterSpacing: '0.02em',
              }}>
                {uploading ? 'Uploading…' : 'Add a final portrait'}
              </span>
              {/* engraving */}
              <span style={{
                position: 'absolute', bottom: 22,
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.08em',
              }}>
                — rest in pace —
              </span>
            </div>
          )}
        </div>

        {/* Ground line */}
        <div style={{ width: 360, borderTop: '1.5px dashed var(--ink-4)', marginTop: 0 }} />

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {uploadError && (
          <p style={{ fontSize: 12, color: 'var(--signal)', marginTop: 12, textAlign: 'center', maxWidth: 340 }}>
            {uploadError}
          </p>
        )}
      </div>

      {/* Name, epitaph, dates — all centered */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 600,
          letterSpacing: '-0.025em', color: 'var(--ink)',
          lineHeight: 1.05, marginBottom: 16,
        }}>
          {name || 'Unnamed Shoe'}
        </h1>

        {retirementNote && (
          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.7,
            marginBottom: 20, maxWidth: 520, margin: '0 auto 20px',
          }}>
            {retirementNote}
          </p>
        )}

        {(firstRunDate || lastRunDate) && (
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-3)',
            letterSpacing: '0.04em', marginBottom: 24,
          }}>
            {firstRunDate && <span style={{ fontStyle: 'italic', color: 'var(--ink-4)', marginRight: 4 }}>b.</span>}
            {firstRunDate && <span>{fmtDate(firstRunDate)}</span>}
            {firstRunDate && lastRunDate && (
              <span style={{ margin: '0 12px', color: 'var(--ink-4)' }}>✦</span>
            )}
            {lastRunDate && <span style={{ fontStyle: 'italic', color: 'var(--ink-4)', marginRight: 4 }}>d.</span>}
            {lastRunDate && <span>{fmtDate(lastRunDate)}</span>}
          </p>
        )}

        {/* Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: 'var(--ink)', color: 'var(--paper)',
            fontFamily: 'var(--sans)', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>🪦 Retired</span>
          {useType && (
            <span style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
              border: '1px solid var(--rule)', color: 'var(--ink-3)',
              fontFamily: 'var(--sans)', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>⚡ {useType}</span>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--rule)', marginBottom: 36 }} />
    </div>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

function PaceTrendChart({ data, medianPace }) {
  if (!data?.length) return <EmptyChart message="No pace data available" />;

  const fmt = (v) => { const m = Math.floor(v/60); const s = Math.round(v%60); return `${m}:${s.toString().padStart(2,'0')}`; };
  const paces = data.map(d => d.pace).filter(Boolean);
  const domain = [Math.min(...paces)-20, Math.max(...paces)+20];

  const Tip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 6, padding: '10px 14px', fontSize: 13 }}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 600, marginBottom: 4 }}>{d.name || `Run #${d.index}`}</div>
        <div style={{ color: 'var(--brand)' }}>{d.paceLabel} /km</div>
        <div style={{ color: 'var(--ink-3)' }}>{d.km} km · {d.date}</div>
        {d.heartrate && <div style={{ color: 'var(--ink-3)' }}>❤ {Math.round(d.heartrate)} bpm</div>}
      </div>
    );
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
        Pace per run · lower = faster · Median: <strong style={{ fontFamily: 'var(--serif)', color: 'var(--brand)' }}>{fmt(medianPace)} /km</strong>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="index" tick={{ fill: 'var(--ink-4)', fontSize: 11 }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
          <YAxis domain={domain} reversed tickFormatter={fmt} tick={{ fill: 'var(--ink-4)', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<Tip />} />
          {medianPace && <ReferenceLine y={medianPace} stroke="rgba(217,74,31,0.3)" strokeDasharray="4 4" />}
          <Line type="monotone" dataKey="pace" stroke="var(--brand)" strokeWidth={2}
            dot={{ fill: 'var(--brand)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--brand)' }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DayOfWeekChart({ data }) {
  if (!data?.length || data.every(d => d.count === 0)) return <EmptyChart message="No data" />;
  const max = Math.max(...data.map(d => d.count));
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Which days you most often ran in these shoes</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="day" tick={{ fill: 'var(--ink-3)', fontSize: 12 }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--ink-4)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 6, fontSize: 13 }}
            formatter={(v) => [`${v} runs`, '']} labelStyle={{ fontFamily: 'var(--serif)', fontWeight: 600 }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((e, i) => <Cell key={i} fill={e.count === max ? 'var(--brand)' : 'var(--rule)'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DistributionChart({ data }) {
  if (!data?.length || data.every(d => d.count === 0)) return <EmptyChart message="No data" />;
  const max = Math.max(...data.map(d => d.count));
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Distance distribution — how far you typically ran in these shoes</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="label" tick={{ fill: 'var(--ink-3)', fontSize: 12 }} axisLine={{ stroke: 'var(--rule)' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--ink-4)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--rule)', borderRadius: 6, fontSize: 13 }}
            formatter={(v) => [`${v} runs`, '']} labelStyle={{ fontFamily: 'var(--serif)', fontWeight: 600 }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((e, i) => <Cell key={i} fill={e.count === max ? 'var(--brand)' : 'var(--rule)'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>
      {message}
    </div>
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
    border: '1px solid var(--rule)', borderRadius: 6,
    background: 'var(--paper)', color: 'var(--ink)',
    fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, textTransform: 'uppercase',
    letterSpacing: '0.08em', fontWeight: 600, color: 'var(--ink-3)',
    marginBottom: 8,
  };

  return (
    <div style={{ maxWidth: 480 }}>
      {/* Shoe type */}
      <div style={{ marginBottom: 28 }}>
        <label style={labelStyle}>Shoe Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SHOE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(type === t.value ? '' : t.value)}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: type === t.value ? '1.5px solid var(--brand)' : '1.5px solid var(--rule)',
                background: type === t.value ? 'var(--brand)' : 'var(--paper)',
                color: type === t.value ? '#fff' : 'var(--ink-2)',
                fontFamily: 'var(--sans)', fontWeight: type === t.value ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
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
        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 6 }}>
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
        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 6 }}>
          Get an alert on the dashboard if this shoe goes unused for this many days.
        </p>
      </div>

      {/* Retirement note (only shown if shoe is retired) */}
      {shoe.retired && (
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Retirement Note / Epitaph</label>
          <textarea
            rows={3}
            placeholder="Why did you retire these? What made them great?"
            value={retirementNote}
            onChange={(e) => setRetirementNote(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
          />
          <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 6 }}>
            This appears as the epitaph on the memorial page.
          </p>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '11px 28px', background: saving ? 'var(--ink-4)' : 'var(--brand)',
          color: '#fff', border: 'none', borderRadius: 6, fontSize: 14,
          fontFamily: 'var(--sans)', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
      </button>
      {saveError && <p style={{ color: 'var(--signal)', fontSize: 13, marginTop: 10 }}>{saveError}</p>}
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
