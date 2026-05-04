// ─── Unit helpers ─────────────────────────────────────────────────────────────

export const metersToKm = (m) => m / 1000;

// Speed in m/s → pace in min/km string "MM:SS"
export const speedToPacePerKm = (mps) => {
  if (!mps || mps === 0) return '—';
  const secsPerKm = 1000 / mps;
  const mins = Math.floor(secsPerKm / 60);
  const secs = Math.round(secsPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Speed in m/s → numeric pace value in sec/km (for charting)
export const speedToPaceValue = (mps) => {
  if (!mps || mps === 0) return null;
  return 1000 / mps; // seconds per km
};

// Format seconds-per-km as "MM:SS /km"
export const formatPace = (secPerKm) => {
  if (!secPerKm) return '—';
  const mins = Math.floor(secPerKm / 60);
  const secs = Math.round(secPerKm % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Replacement guidance ─────────────────────────────────────────────────────

export const REPLACEMENT_KM = 650; // standard recommendation in km

export function getReplacementStatus(totalKm) {
  const pct = totalKm / REPLACEMENT_KM;
  if (pct >= 1.0) return { label: 'Replace Now', color: '#E74C3C', level: 'danger', pct: Math.min(pct, 1) };
  if (pct >= 0.8) return { label: 'Replace Soon', color: '#F39C12', level: 'warning', pct };
  if (pct >= 0.6) return { label: 'Getting There', color: '#F1C40F', level: 'caution', pct };
  return { label: 'Good Shape', color: '#2ECC71', level: 'good', pct };
}

// ─── Main analytics function ──────────────────────────────────────────────────

/**
 * Given the list of shoes (from /api/gear) and activities (from /api/activities),
 * returns an enriched array of shoe objects with analytics attached.
 */
export function analyzeShoes(shoes, activities) {
  // Index activities by gear_id
  const byGear = {};
  for (const act of activities) {
    if (!act.gear_id) continue;
    if (!byGear[act.gear_id]) byGear[act.gear_id] = [];
    byGear[act.gear_id].push(act);
  }

  return shoes.map((shoe) => {
    const runs = (byGear[shoe.id] || []).sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );

    const totalKm = metersToKm(
      runs.reduce((sum, r) => sum + (r.distance || 0), 0)
    );
    const runCount = runs.length;

    // ── Pace trend (one data point per run) ──────────────────────────────────
    const paceTrend = runs
      .filter((r) => r.average_speed > 0)
      .map((r, i) => ({
        index: i + 1,
        date: r.start_date_local?.slice(0, 10) || r.start_date?.slice(0, 10),
        pace: speedToPaceValue(r.average_speed),        // sec/km (for chart)
        paceLabel: speedToPacePerKm(r.average_speed),   // "MM:SS"
        km: parseFloat(metersToKm(r.distance).toFixed(2)),
        name: r.name,
        heartrate: r.average_heartrate || null,
      }));

    // ── Average pace (median of all runs) ───────────────────────────────────
    const paceValues = paceTrend.map((p) => p.pace).filter(Boolean).sort((a, b) => a - b);
    const medianPace = paceValues.length
      ? paceValues[Math.floor(paceValues.length / 2)]
      : null;

    // ── Average heart rate ────────────────────────────────────────────────────
    const hrValues = runs.map((r) => r.average_heartrate).filter(Boolean);
    const avgHeartRate = hrValues.length
      ? Math.round(hrValues.reduce((s, v) => s + v, 0) / hrValues.length)
      : null;

    // ── Long run pace (runs > 10km) ───────────────────────────────────────────
    const longRuns = runs.filter((r) => r.distance > 10000 && r.average_speed > 0);
    const longRunPaceValues = longRuns.map((r) => speedToPaceValue(r.average_speed));
    const avgLongRunPace = longRunPaceValues.length
      ? longRunPaceValues.reduce((s, v) => s + v, 0) / longRunPaceValues.length
      : null;

    // ── Speed session pace (runs < 22km) ─────────────────────────────────────
    const speedRuns = runs.filter((r) => r.distance < 22000 && r.average_speed > 0);
    const speedRunPaceValues = speedRuns.map((r) => speedToPaceValue(r.average_speed));
    const avgSpeedRunPace = speedRunPaceValues.length
      ? speedRunPaceValues.reduce((s, v) => s + v, 0) / speedRunPaceValues.length
      : null;

    // ── Day-of-week distribution ─────────────────────────────────────────────
    const dowCounts = Array(7).fill(0);
    for (const r of runs) {
      const d = new Date(r.start_date_local || r.start_date);
      dowCounts[d.getDay()]++;
    }
    const dayOfWeek = DAYS.map((day, i) => ({ day, count: dowCounts[i] }));

    // ── Distance distribution (buckets in km) ────────────────────────────────
    const buckets = [
      { label: '< 5km',   min: 0,  max: 5 },
      { label: '5–10km',  min: 5,  max: 10 },
      { label: '10–16km', min: 10, max: 16 },
      { label: '16–25km', min: 16, max: 25 },
      { label: '25km+',   min: 25, max: Infinity },
    ];
    const distDist = buckets.map((b) => ({
      label: b.label,
      count: runs.filter((r) => {
        const km = metersToKm(r.distance);
        return km >= b.min && km < b.max;
      }).length,
    }));

    // ── Pace improvement (first 5 runs vs last 5 runs) ───────────────────────
    let paceImprovement = null;
    if (paceTrend.length >= 10) {
      const first5 = paceTrend.slice(0, 5).map((p) => p.pace);
      const last5 = paceTrend.slice(-5).map((p) => p.pace);
      const avgFirst = first5.reduce((s, v) => s + v, 0) / first5.length;
      const avgLast = last5.reduce((s, v) => s + v, 0) / last5.length;
      paceImprovement = avgFirst - avgLast; // positive means you got faster
    }

    // ── Most common use type (by avg distance) ───────────────────────────────
    const avgDist = runCount > 0
      ? metersToKm(runs.reduce((s, r) => s + r.distance, 0) / runCount)
      : 0;
    const useType =
      avgDist < 6  ? 'Short / Easy' :
      avgDist < 13 ? 'Moderate' :
      avgDist < 21 ? 'Long Run' : 'Ultra / Race';

    // ── Replacement status ────────────────────────────────────────────────────
    const replacement = getReplacementStatus(totalKm);

    // ── Best run ─────────────────────────────────────────────────────────────
    const fastestRun = paceTrend.length
      ? paceTrend.reduce((best, r) => (r.pace < (best?.pace || Infinity) ? r : best), null)
      : null;

    const longestRun = runs.length
      ? runs.reduce((best, r) => (r.distance > (best?.distance || 0) ? r : best), null)
      : null;

    return {
      ...shoe,
      totalKm: parseFloat(totalKm.toFixed(1)),
      runCount,
      medianPace,
      medianPaceLabel: formatPace(medianPace),
      avgHeartRate,
      avgLongRunPace,
      avgLongRunPaceLabel: avgLongRunPace ? formatPace(avgLongRunPace) : null,
      longRunCount: longRuns.length,
      avgSpeedRunPace,
      avgSpeedRunPaceLabel: avgSpeedRunPace ? formatPace(avgSpeedRunPace) : null,
      speedRunCount: speedRuns.length,
      paceTrend,
      dayOfWeek,
      distDist,
      paceImprovement,
      useType,
      replacement,
      fastestRun,
      longestRunKm: longestRun ? parseFloat(metersToKm(longestRun.distance).toFixed(1)) : 0,
      firstRunDate: runs[0]?.start_date_local?.slice(0, 10) || null,
      lastRunDate: runs[runs.length - 1]?.start_date_local?.slice(0, 10) || null,
    };
  });
}
