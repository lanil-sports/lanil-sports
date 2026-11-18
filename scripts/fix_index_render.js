const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const statDefinitions = `
let ATHLETES = [...window.INITIAL_ATHLETES];
let currentView = 'directory';
let filterClass = 'all';
let filterSport = 'all';
let filterParish = 'all';
let searchTerm = '';
let statSort = 'nil';
let unlockedAthletes = new Set();

function getAthleteStatValue(a, sortKey) {
  const text = ((a.season_stats_summary || '') + ' ' + (a.bio || '')).toLowerCase();
  
  if (sortKey === 'nil') return a.est_nil_value || 0;
  
  if (sortKey === 'lanil_rating') {
    const m = text.match(/lanil\\s*rating:\\s*(\\d+)/i) || text.match(/rating:\\s*(\\d+)/i);
    if (m) return parseInt(m[1]);
    return (a.est_nil_value || 0) > 25000 ? 92 : (a.est_nil_value || 0) > 10000 ? 86 : 78;
  }
  
  if (sortKey === 'pass_yds') {
    const m = text.match(/([\\d,]+)\\s*(?:pass\\s*yds|passing\\s*yds)/i);
    return m ? parseInt(m[1].replace(/,/g, '')) : 0;
  }
  
  if (sortKey === 'rush_yds') {
    const m = text.match(/([\\d,]+)\\s*(?:rush\\s*yds|rushing\\s*yds)/i);
    return m ? parseInt(m[1].replace(/,/g, '')) : 0;
  }

  if (sortKey === 'rec_yds') {
    const m = text.match(/([\\d,]+)\\s*(?:rec(?:eiving)?\\s*yds)/i);
    return m ? parseInt(m[1].replace(/,/g, '')) : 0;
  }
  
  if (sortKey === 'tds') {
    const m = text.match(/(\\d+)\\s*(?:td|touchdowns?)/i);
    return m ? parseInt(m[1]) : 0;
  }

  if (sortKey === 'sacks') {
    const m = text.match(/([\\d.]+)\\s*sacks?/i);
    return m ? parseFloat(m[1]) : 0;
  }

  if (sortKey === 'points') {
    const m = text.match(/([\\d.]+)\\s*ppg/i) || text.match(/(\\d+)\\s*pts/i);
    return m ? parseFloat(m[1]) : 0;
  }

  if (sortKey === 'three_pt') {
    const m = text.match(/(\\d+)\\s*(?:3-?pt|three-?pointers?)/i);
    return m ? parseInt(m[1]) : 0;
  }

  if (sortKey === 'batting_avg') {
    const m = text.match(/\\.(\\d{3})\\s*(?:avg|batting)/i);
    return m ? parseInt(m[1]) : 0;
  }

  if (sortKey === 'home_runs') {
    const m = text.match(/(\\d+)\\s*hr/i);
    return m ? parseInt(m[1]) : 0;
  }

  if (sortKey === 'strikeouts') {
    const m = text.match(/(\\d+)\\s*(?:strikeouts|k\\b)/i);
    return m ? parseInt(m[1]) : 0;
  }

  if (sortKey === 'speed') {
    const m = text.match(/(?:laser\\s*)?(4\\.\\d{2})/i) || text.match(/(1[01]\\.\\d{1,2})s/i);
    return m ? (20 - parseFloat(m[1])) : -99;
  }

  if (sortKey === 'offers') {
    return (a.potential_colleges || []).length;
  }

  return a.est_nil_value || 0;
}

function updateStatSort(val) {
  statSort = val;
  render();
}

function renderStatPills(sport, activeSort) {
  const s = (sport || '').toLowerCase();
  let pills = [
    { label: '?? NIL Valuation', sort: 'nil', icon: 'fa-dollar-sign' },
    { label: '? LANIL 90+ Rating', sort: 'lanil_rating', icon: 'fa-star' },
    { label: '?? Top Touchdowns', sort: 'tds', icon: 'fa-fire' },
    { label: '? Speed Demons', sort: 'speed', icon: 'fa-bolt' },
    { label: '?? Most D-I Offers', sort: 'offers', icon: 'fa-trophy' }
  ];

  if (s.includes('football')) {
    pills = [
      { label: '?? NIL Leaders', sort: 'nil', icon: 'fa-dollar-sign' },
      { label: '? LANIL Rating', sort: 'lanil_rating', icon: 'fa-star' },
      { label: '?? Passing Yds', sort: 'pass_yds', icon: 'fa-football' },
      { label: '?? Rushing Yds', sort: 'rush_yds', icon: 'fa-person-running' },
      { label: '?? Receiving Yds', sort: 'rec_yds', icon: 'fa-bullseye' },
      { label: '?? Touchdowns', sort: 'tds', icon: 'fa-fire' },
      { label: '??? Sacks & TFL', sort: 'sacks', icon: 'fa-shield-halved' },
      { label: '? 40-Yd Laser Speed', sort: 'speed', icon: 'fa-bolt' }
    ];
  } else if (s.includes('basketball')) {
    pills = [
      { label: '?? NIL Leaders', sort: 'nil', icon: 'fa-dollar-sign' },
      { label: '? LANIL Rating', sort: 'lanil_rating', icon: 'fa-star' },
      { label: '?? Top Scorers (PPG)', sort: 'points', icon: 'fa-basketball' },
      { label: '?? 3-Point Snipers', sort: 'three_pt', icon: 'fa-bullseye' }
    ];
  } else if (s.includes('baseball')) {
    pills = [
      { label: '?? NIL Leaders', sort: 'nil', icon: 'fa-dollar-sign' },
      { label: '? LANIL Rating', sort: 'lanil_rating', icon: 'fa-star' },
      { label: '? .400+ Batting AVG', sort: 'batting_avg', icon: 'fa-baseball' },
      { label: '?? Home Run Kings', sort: 'home_runs', icon: 'fa-bomb' },
      { label: '? Pitching Strikeouts', sort: 'strikeouts', icon: 'fa-bolt' }
    ];
  } else if (s.includes('softball')) {
    pills = [
      { label: '?? NIL Leaders', sort: 'nil', icon: 'fa-dollar-sign' },
      { label: '? LANIL Rating', sort: 'lanil_rating', icon: 'fa-star' },
      { label: '?? .400+ Batting AVG', sort: 'batting_avg', icon: 'fa-baseball-bat-ball' },
      { label: '?? Home Run Kings', sort: 'home_runs', icon: 'fa-bomb' },
      { label: '? Strikeout Aces', sort: 'strikeouts', icon: 'fa-bolt' }
    ];
  } else if (s.includes('track')) {
    pills = [
      { label: '?? NIL Leaders', sort: 'nil', icon: 'fa-dollar-sign' },
      { label: '? Fastest 100m/200m Speed', sort: 'speed', icon: 'fa-person-running' }
    ];
  }

  return pills.map(p => {
    const isActive = activeSort === p.sort;
    return \`<button onclick="updateStatSort('\${p.sort}')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap \${isActive ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5'}">
      <i class="fa-solid \${p.icon} text-[10px]"></i>
      <span>\${p.label}</span>
    </button>\`;
  }).join('');
}
`;

const oldTarget = `let ATHLETES = [...window.INITIAL_ATHLETES];
let currentView = 'directory';
let filterClass = 'all';
let filterSport = 'all';
let filterParish = 'all';
let searchTerm = '';
let unlockedAthletes = new Set();`;

html = html.replace(oldTarget, statDefinitions.trim());

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Successfully inserted statDefinitions and renderStatPills into index.html!");
