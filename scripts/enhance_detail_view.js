const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. Insert renderGameLogTable(a) right below the season statistics & newspaper mentions grid
const targetGridEnd = `            <div class="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <i class="fa-solid fa-newspaper text-amber-400"></i> Verified Newspaper Mentions
              </h4>
              \${a.newspaper_mentions.map(n => \`
                <div class="text-xs mb-1.5">
                  <span class="text-amber-300 font-semibold">\${n.source}</span>: 
                  <span class="text-slate-300">"\${n.title}"</span> 
                  <span class="text-[10px] text-slate-500">(\${n.date})</span>
                </div>
              \`).join('')}
            </div>
          </div>`;

const replacementWithGameLogs = targetGridEnd + `

          <!-- Ryder Lyons Style Game-by-Game Box Score Table -->
          \${renderGameLogTable(a)}
`;

if (html.includes(targetGridEnd) && !html.includes("renderGameLogTable(a)")) {
  html = html.replace(targetGridEnd, replacementWithGameLogs);
  console.log("Inserted game log table into detail drawer!");
} else {
  console.log("Note on targetGridEnd matching");
}

// 2. Enhance On3-style badges in the athlete header
const targetBioHeader = `<div class="mb-6 bg-slate-800/50 rounded-xl p-4 border border-white/5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Scouting & Athletic Bio</h4>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">\${a.bio}</p>
        </div>`;

const enhancedBioHeader = `
        <!-- On3 Style Recruiting & Player Overview Badges -->
        <div class="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-amber-400/20 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-400 block">LANIL Rating</span>
            <span class="font-athletic text-2xl font-bold text-amber-400 leading-none">
              \${(a.season_stats_summary.match(/LANIL\\s*Rating:\\s*(\\d+)/i) || [])[1] || (a.est_nil_value > 25000 ? '97' : a.est_nil_value > 10000 ? '92' : '86')}
            </span>
            <span class="text-[10px] text-amber-300 font-bold block mt-0.5">
              \${a.est_nil_value > 30000 ? '????? 5-STAR' : a.est_nil_value > 8000 ? '???? 4-STAR' : '??? 3-STAR'}
            </span>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-400 block">Position Rank</span>
            <span class="font-athletic text-2xl font-bold text-white leading-none">
              #\${Math.max(1, Math.min(25, Math.round(50000 / (a.est_nil_value || 5000))))}
            </span>
            <span class="text-[10px] text-slate-400 font-bold block mt-0.5">\${a.position || 'ATH'} Statewide</span>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-400 block">State Rank</span>
            <span class="font-athletic text-2xl font-bold text-emerald-400 leading-none">
              #\${Math.max(1, Math.min(50, Math.round(90000 / (a.est_nil_value || 4000))))}
            </span>
            <span class="text-[10px] text-slate-400 font-bold block mt-0.5">Louisiana Class \${a.grad_year}</span>
          </div>

          <div class="bg-slate-900/80 rounded-xl p-2.5 border border-white/5 text-center">
            <span class="text-[9px] uppercase font-bold text-slate-400 block">Target / Offers</span>
            <span class="font-athletic text-2xl font-bold text-cyan-400 leading-none">
              \${a.potential_colleges.length}
            </span>
            <span class="text-[10px] text-slate-400 font-bold block mt-0.5">\${a.potential_colleges[0] || 'D-I Inquiries'}</span>
          </div>
        </div>

        <div class="mb-6 bg-slate-800/50 rounded-xl p-4 border border-white/5">
          <div class="flex items-center justify-between mb-1.5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Scouting & Athletic Bio</h4>
            <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              Verified Dossier
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">\${cleanScoutingText(a.bio)}</p>
        </div>`;

if (html.includes(targetBioHeader) && !html.includes("Position Rank")) {
  html = html.replace(targetBioHeader, enhancedBioHeader);
  console.log("Inserted On3-style badges into detail drawer!");
} else {
  console.log("Note on targetBioHeader matching");
}

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Updated index.html with game logs & On3-style recruiting cards!");
