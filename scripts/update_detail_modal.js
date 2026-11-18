const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. Add COLLEGE_LOGOS and getCollegeLogo
const collegeLogoLogic = `
const COLLEGE_LOGOS = {
  "lsu": "https://a.espncdn.com/i/teamlogos/ncaa/500/99.png",
  "alabama": "https://a.espncdn.com/i/teamlogos/ncaa/500/333.png",
  "ohio state": "https://a.espncdn.com/i/teamlogos/ncaa/500/194.png",
  "georgia": "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png",
  "texas a&m": "https://a.espncdn.com/i/teamlogos/ncaa/500/245.png",
  "texas": "https://a.espncdn.com/i/teamlogos/ncaa/500/251.png",
  "florida state": "https://a.espncdn.com/i/teamlogos/ncaa/500/52.png",
  "florida": "https://a.espncdn.com/i/teamlogos/ncaa/500/57.png",
  "ole miss": "https://a.espncdn.com/i/teamlogos/ncaa/500/145.png",
  "tennessee": "https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png",
  "kentucky": "https://a.espncdn.com/i/teamlogos/ncaa/500/96.png",
  "auburn": "https://a.espncdn.com/i/teamlogos/ncaa/500/2.png",
  "tulane": "https://a.espncdn.com/i/teamlogos/ncaa/500/2655.png",
  "louisiana tech": "https://a.espncdn.com/i/teamlogos/ncaa/500/2348.png",
  "ragin cajuns": "https://a.espncdn.com/i/teamlogos/ncaa/500/309.png",
  "louisiana": "https://a.espncdn.com/i/teamlogos/ncaa/500/309.png",
  "ull": "https://a.espncdn.com/i/teamlogos/ncaa/500/309.png",
  "ulm": "https://a.espncdn.com/i/teamlogos/ncaa/500/2433.png",
  "southern": "https://a.espncdn.com/i/teamlogos/ncaa/500/2582.png",
  "grambling": "https://a.espncdn.com/i/teamlogos/ncaa/500/2755.png",
  "mcneese": "https://a.espncdn.com/i/teamlogos/ncaa/500/2377.png",
  "nicholls": "https://a.espncdn.com/i/teamlogos/ncaa/500/2449.png",
  "northwestern state": "https://a.espncdn.com/i/teamlogos/ncaa/500/2466.png",
  "duke": "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png",
  "gonzaga": "https://a.espncdn.com/i/teamlogos/ncaa/500/2250.png",
  "baylor": "https://a.espncdn.com/i/teamlogos/ncaa/500/239.png",
  "usc": "https://a.espncdn.com/i/teamlogos/ncaa/500/30.png",
  "oklahoma": "https://a.espncdn.com/i/teamlogos/ncaa/500/201.png",
  "clemson": "https://a.espncdn.com/i/teamlogos/ncaa/500/228.png",
  "south carolina": "https://a.espncdn.com/i/teamlogos/ncaa/500/2579.png",
  "houston": "https://a.espncdn.com/i/teamlogos/ncaa/500/248.png",
  "tcu": "https://a.espncdn.com/i/teamlogos/ncaa/500/2628.png",
  "memphis": "https://a.espncdn.com/i/teamlogos/ncaa/500/235.png",
  "southern miss": "https://a.espncdn.com/i/teamlogos/ncaa/500/2572.png"
};

function getCollegeLogo(name) {
  if (!name) return '';
  const n = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(COLLEGE_LOGOS)) {
    if (n.includes(k) || k.includes(n)) return v;
  }
  return '';
}
`;

if (!html.includes("function getCollegeLogo")) {
  html = html.replace("function getSchoolLogo(schoolName) {", collegeLogoLogic + "\nfunction getSchoolLogo(schoolName) {");
}

// 2. Remove the internal ${a.player_id} badge from modal header
html = html.replace(
  /<span class="px-2\.5 py-0\.5 rounded-full text-xs font-semibold bg-black\/60 text-amber-300 border border-amber-400\/30">\s*\$\{a\.player_id\}\s*<\/span>/,
  `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
    <i class="fa-solid fa-shield-halved text-[10px]"></i> LHSAA Varsity
  </span>`
);

// 3. Fix Vote (undefined) -> Vote (${a.votes || 0})
html = html.replace(
  /<i class="fa-solid fa-fire"><\/i> Vote \(\$\{a\.votes\}\)/g,
  '<i class="fa-solid fa-fire"></i> Vote (${a.votes || 0})'
);

// 4. In Reported Offers, replace graduation cap with real college team logo
const oldOffersPattern = /<div class="flex flex-wrap gap-2">[\s\S]*?\$\{a\.potential_colleges\.map\(c => `[\s\S]*?<i class="fa-solid fa-graduation-cap[^>]*><\/i>\s*\$\{c\}[\s\S]*?`\)\.join\(''\)\}[\s\S]*?<\/div>/;

const newOffersSnippet = `<div class="flex flex-wrap gap-2">
                  \${a.potential_colleges.map(c => {
                    const cLogo = getCollegeLogo(c);
                    return \`
                      <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white flex items-center gap-2 shadow-sm hover:border-amber-400/40 transition">
                        \${cLogo ? \`<img src="\${cLogo}" alt="\${c}" class="w-5 h-5 object-contain shrink-0 drop-shadow" onerror="this.style.display='none'">\` : '<i class="fa-solid fa-award text-amber-400"></i>'}
                        <span>\${c}</span>
                      </span>
                    \`;
                  }).join('')}
                </div>`;

if (oldOffersPattern.test(html)) {
  html = html.replace(oldOffersPattern, newOffersSnippet);
  console.log("Replaced college offers with official team logos!");
} else {
  console.log("Could not match oldOffersPattern directly; trying secondary match...");
  const oldOffersDirect = `<div class="flex flex-wrap gap-2">
                  \${a.potential_colleges.map(c => \`
                    <span class="px-3 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs font-semibold text-white">
                      <i class="fa-solid fa-graduation-cap text-amber-400 mr-1"></i> \${c}
                    </span>
                  \`).join('')}
                </div>`;
  if (html.includes(oldOffersDirect)) {
    html = html.replace(oldOffersDirect, newOffersSnippet);
    console.log("Replaced college offers with official team logos (secondary match)!");
  }
}

// 5. Update Social Following display when count is 0 or pending
const oldSocialFollowers = `<span class="text-[10px] text-slate-400 uppercase font-bold">Social Following</span>
                  <span class="font-athletic text-2xl font-bold text-white block">\${a.total_followers.toLocaleString()}</span>
                  <span class="text-[10px] text-slate-400">\${a.social_handles.instagram || ''} \${a.social_handles.twitter || ''}</span>`;

const newSocialFollowers = `<span class="text-[10px] text-slate-400 uppercase font-bold">Social Following</span>
                  \${a.total_followers > 0 ? \`
                    <span class="font-athletic text-2xl font-bold text-white block">\${a.total_followers.toLocaleString()}</span>
                    <span class="text-[10px] text-amber-300 font-medium truncate block">\${a.social_handles.instagram || a.social_handles.twitter || 'Public Handles'}</span>
                  \` : \`
                    <span class="font-athletic text-2xl font-bold text-slate-400 block">Pending Link</span>
                    <span class="text-[10px] text-slate-500">Claim to link @social</span>
                  \`}`;

if (html.includes(oldSocialFollowers)) {
  html = html.replace(oldSocialFollowers, newSocialFollowers);
  console.log("Updated Social Following display logic!");
}

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Successfully updated Athlete Detail modal!");