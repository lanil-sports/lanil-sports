const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// Helper function to render quick pills for each sport
const pillHelper = `
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

if (!html.includes("function renderStatPills")) {
  html = html.replace("function updateStatSort(val) {", pillHelper + "\nfunction updateStatSort(val) {");
}

// Update the filter section in renderDirectory
const oldGridTag = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">';
const newGridTag = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">';
html = html.replace(oldGridTag, newGridTag);

// Add the Stat Sorter dropdown right after the Parish dropdown
const parishSelectEnd = `              <option value="Winn" \${filterParish==='Winn'?'selected':''}>Winn Parish</option>
            </select>
        </div>`;

const statSorterDropdown = `              <option value="Winn" \${filterParish==='Winn'?'selected':''}>Winn Parish</option>
            </select>
        </div>

        <div>
          <select onchange="updateStatSort(this.value)" class="w-full bg-slate-900/80 border border-amber-400/40 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400">
            <option value="nil" \${statSort==='nil'?'selected':''}>?? Sort: Highest NIL Value</option>
            <option value="lanil_rating" \${statSort==='lanil_rating'?'selected':''}>? Sort: LANIL Rating</option>
            \${filterSport.toLowerCase().includes('football') || filterSport === 'all' ? \`
              <option value="pass_yds" \${statSort==='pass_yds'?'selected':''}>?? Top Passing Yards</option>
              <option value="rush_yds" \${statSort==='rush_yds'?'selected':''}>?? Top Rushing Yards</option>
              <option value="rec_yds" \${statSort==='rec_yds'?'selected':''}>?? Top Receiving Yards</option>
              <option value="tds" \${statSort==='tds'?'selected':''}>?? Top Touchdowns</option>
              <option value="sacks" \${statSort==='sacks'?'selected':''}>??? Top Sacks & TFL</option>
              <option value="speed" \${statSort==='speed'?'selected':''}>? Fastest 40-Yd Dash</option>
            \` : ''}
            \${filterSport.toLowerCase().includes('basketball') ? \`
              <option value="points" \${statSort==='points'?'selected':''}>?? Top Scorers (PPG)</option>
              <option value="three_pt" \${statSort==='three_pt'?'selected':''}>?? Top 3-Point Plays</option>
            \` : ''}
            \${filterSport.toLowerCase().includes('baseball') ? \`
              <option value="batting_avg" \${statSort==='batting_avg'?'selected':''}>? Batting Avg (.AVG)</option>
              <option value="home_runs" \${statSort==='home_runs'?'selected':''}>?? Home Runs (HR)</option>
              <option value="strikeouts" \${statSort==='strikeouts'?'selected':''}>? Pitching Strikeouts</option>
            \` : ''}
            \${filterSport.toLowerCase().includes('softball') ? \`
              <option value="batting_avg" \${statSort==='batting_avg'?'selected':''}>?? Batting Avg (.AVG)</option>
              <option value="home_runs" \${statSort==='home_runs'?'selected':''}>?? Home Runs (HR)</option>
              <option value="strikeouts" \${statSort==='strikeouts'?'selected':''}>? Strikeout Aces</option>
            \` : ''}
            \${filterSport.toLowerCase().includes('track') ? \`
              <option value="speed" \${statSort==='speed'?'selected':''}>? Fastest 100m/200m Speed</option>
            \` : ''}
            <option value="offers" \${statSort==='offers'?'selected':''}>?? Most D-I Offers</option>
          </select>
        </div>`;

html = html.replace(parishSelectEnd, statSorterDropdown);

// Add the Quick Stat Leader Pills row right above the "Showing X records" bar
const showingBar = `<div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">`;
const statPillsRow = `
        <!-- Top Stats Leaderboard Quick Pills -->
        <div class="pt-2 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <i class="fa-solid fa-chart-line text-amber-400"></i> Leaderboard:
          </span>
          \${renderStatPills(filterSport, statSort)}
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">`;

html = html.replace(showingBar, statPillsRow);

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Successfully installed Dynamic Sport Stat Filter & Leaderboard Pills!");
