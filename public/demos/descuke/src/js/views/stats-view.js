import { $ } from '../utils/dom.js';
import { ST } from '../state/app-state.js';
import { DB } from '../data/database.js';
import { escapeHtml } from '../utils/html-utils.js';
import { initialsOf } from '../utils/format-utils.js';
import { mondayOf, addDaysISO, fmtWeekLabel, isoWeekNum } from '../utils/date-utils.js';

function buildWeekOptions(weeks = 4){
    const todayMonday = mondayOf(ST.today());
    const out = [];
    for(let i = weeks - 1; i >= 0; i--){
        const start = addDaysISO(todayMonday, -7 * i);
        const end   = addDaysISO(start, 6);
        out.push({ start, end });
    }
    return out;
}

function trendPoints(allRes, weeks){
    return weeks.map(w => allRes.filter(r => r.date >= w.start && r.date <= w.end).length);
}

export function setRankingMode(mode){
    ST.rankingMode = mode;
    renderStats($('main'));
}

export function selectStatsWeek(monday){
    ST.statsWeek = monday;
    renderStats($('main'));
}

export function renderStats(m){
    const all = DB.getR();
    const weeks = buildWeekOptions(4);
    const activeMonday = ST.statsWeek || weeks[weeks.length - 1].start;
    const active = weeks.find(w => w.start === activeMonday) || weeks[weeks.length - 1];

    const inRange = all.filter(r => r.date >= active.start && r.date <= active.end);
    const total = inRange.length;
    const conf  = inRange.filter(r => r.status === 'confirmed').length;
    const noShow = inRange.filter(r => r.status === 'nollegó').length;
    const rate = total ? Math.round((conf / total) * 100) : 0;
    const noShowPct = total ? Math.round((noShow / total) * 100) : 0;

    const dayIndices = [4, 5, 6, 0];
    const dayLabels  = ['Jue','Vie','Sáb','Dom'];
    const dayCounts  = dayIndices.map(di => inRange.filter(r => {
        const day = new Date(r.date + 'T12:00:00').getDay();
        return day === di;
    }).length);
    const dayMax = Math.max(1, ...dayCounts);

    const rpAgg = {};
    inRange.forEach(r => {
        const key = r.rpId || r.rpName || '?';
        if(!rpAgg[key]) rpAgg[key] = { name: r.rpName || key, total: 0, conf: 0 };
        rpAgg[key].total++;
        if(r.status === 'confirmed') rpAgg[key].conf++;
    });
    const sortKey = ST.rankingMode === 'confirmadas' ? 'conf' : 'total';
    const ranking = Object.values(rpAgg).sort((a, b) => b[sortKey] - a[sortKey]);

    const trendVals = trendPoints(all, weeks);
    const trendMax = Math.max(1, ...trendVals);
    const trendPath = trendVals.map((v, i) => {
        const x = 10 + i * (100 / (trendVals.length - 1 || 1));
        const y = 30 - (v / trendMax) * 25;
        return `${i===0?'M':'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const trendDots = trendVals.map((v, i) => {
        const x = 10 + i * (100 / (trendVals.length - 1 || 1));
        const y = 30 - (v / trendMax) * 25;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2"/>`;
    }).join('');

    m.innerHTML = `
<div class="stats-wrap">
  <div class="stats-head">
    <div>
      <span class="stats-kicker"><span class="pulse-dot"></span>En vivo · Dashboard</span>
      <h2>Panel de Estadísticas</h2>
      <p class="stats-subtitle">Descuke · ${fmtWeekLabel(active)}</p>
    </div>
    <div class="stats-trend">
      <div class="stats-trend-label">Tendencia 4 sem.</div>
      <svg class="stats-trend-svg" viewBox="0 0 110 40" xmlns="http://www.w3.org/2000/svg">
        <path d="${trendPath}"/>
        ${trendDots}
      </svg>
    </div>
  </div>

  <div class="week-chips">
    ${weeks.map(w => `
      <button class="week-chip${w.start===active.start?' active':''}" onclick="selectStatsWeek('${w.start}')">
        Sem ${isoWeekNum(w.start)} · ${fmtWeekLabel(w)}
      </button>`).join('')}
  </div>

  <div class="stats-main-grid">
    <div class="stat-card">
      <div class="stat-card-head">
        <span class="stat-card-label">Total de reservas</span>
        <span class="stat-card-icon">📋</span>
      </div>
      <div class="stat-card-num">${total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-head">
        <span class="stat-card-label">Reservas confirmadas</span>
        <span class="stat-card-icon">✅</span>
      </div>
      <div class="stat-card-num purple">${conf}</div>
      <div class="stat-card-bar">
        <div class="stat-card-bar-meta">
          <span>Tasa de asistencia</span>
          <span class="bold">${rate}%</span>
        </div>
        <div class="stat-card-bar-track"><div class="stat-card-bar-fill" style="width:${rate}%"></div></div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-card-head">
        <span class="stat-card-label">No shows</span>
      </div>
      <div class="stat-card-num red">${noShow}</div>
      <div class="stat-card-sub">${noShowPct}% de ausentismo</div>
    </div>
  </div>

  <div class="stats-bottom-grid">
    <div class="stats-chart-card">
      <span class="stats-subhead">Reservas por día</span>
      <div class="day-chart">
        ${dayCounts.map((c, i) => `
          <div class="day-bar-col">
            <span class="day-bar-val">${c}</span>
            <div class="day-bar-wrap" style="height:${Math.round((c/dayMax)*140)}px">
              <div class="day-bar" style="height:100%"></div>
            </div>
            <span class="day-bar-label">${dayLabels[i]}</span>
          </div>`).join('')}
      </div>
      <div class="chart-legend">
        <span class="leg-item"><span class="leg-sq"></span>Total</span>
        <span class="leg-item"><span class="leg-sq bright"></span>Reservas</span>
      </div>
    </div>

    <div class="stats-ranking-card">
      <div class="ranking-head">
        <span class="stats-subhead">Ranking de RPs</span>
        <div class="ranking-toggle">
          <button class="rtoggle${ST.rankingMode==='reservas'?' active':''}" onclick="setRankingMode('reservas')">Reservas</button>
          <button class="rtoggle${ST.rankingMode==='confirmadas'?' active':''}" onclick="setRankingMode('confirmadas')">Confirmadas</button>
        </div>
      </div>
      ${ranking.length ? `<div class="rank-list">
        ${ranking.map((r, i) => {
            const pct = r.total ? Math.round((r.conf / r.total) * 100) : 0;
            const maxVal = ranking[0][sortKey] || 1;
            const barPct = Math.round((r[sortKey] / maxVal) * 100);
            const medal = ['🥇','🥈','🥉'][i] || '';
            return `<div class="rank-row">
              <span class="${medal?'rank-medal':'rank-pos'}">${medal || (i+1)}</span>
              <span class="rank-avatar">${initialsOf(r.name)}</span>
              <div class="rank-info">
                <div class="rank-info-top">
                  <span class="rank-name">${escapeHtml(r.name)}</span>
                  <span class="rank-stats">${r.total} res. <b>${r.conf} conf.</b></span>
                </div>
                <div class="rank-bar-wrap"><div class="rank-bar-fill" style="width:${barPct}%"></div></div>
                <div class="rank-pct">${pct}%</div>
              </div>
            </div>`;
        }).join('')}
      </div>` : `<p style="color:var(--text3);text-align:center;padding:24px 0;font-size:13px">Sin datos para esta semana</p>`}
    </div>
  </div>
</div>`;
}
