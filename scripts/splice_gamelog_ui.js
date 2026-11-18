const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let lines = fs.readFileSync(htmlPath, "utf8").split("\n");

// 1. Locate the newspaper grid end
const gridEndIndex = lines.findIndex(l => l.includes("Verified Newspaper Mentions"));
console.log("Found Newspaper Mentions at line:", gridEndIndex + 1);

// Find the closing </div> of that 2-column grid
let targetClose = -1;
for (let i = gridEndIndex; i < gridEndIndex + 25; i++) {
  if (lines[i].trim() === "</div>" && lines[i+1] && lines[i+1].trim() === "</div>") {
    targetClose = i + 1;
    break;
  }
}
console.log("Found grid closing at line:", targetClose + 1);

if (targetClose !== -1) {
  lines.splice(targetClose + 1, 0, "          ${renderGameLogTable(a)}");
}

// 2. Locate Scouting & Athletic Bio to insert On3 badges right before it
const bioIndex = lines.findIndex(l => l.includes("Scouting & Athletic Bio"));
console.log("Found Bio at line:", bioIndex + 1);

const on3Badges = `
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
`;

// Insert on3Badges right before the bio container div (which is 1 line before bioIndex)
if (bioIndex !== -1) {
  lines.splice(bioIndex - 1, 0, on3Badges);
}

fs.writeFileSync(htmlPath, lines.join("\n"), "utf8");
console.log("Successfully inserted GameLog and On3 Badges!");
