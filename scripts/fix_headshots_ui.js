const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. Remove all unsplash headshot URLs from window.INITIAL_ATHLETES
html = html.replace(/"headshot_url":\s*"https:\/\/images\.unsplash\.com\/[^"]+"/g, '"headshot_url": ""');

// 2. Add the athletic avatar generator function before render()
const avatarHelper = `
function getSportIcon(sport) {
  const s = (sport || '').toLowerCase();
  if (s.includes('football')) return 'fa-football';
  if (s.includes('basketball')) return 'fa-basketball';
  if (s.includes('baseball')) return 'fa-baseball-bat-ball';
  if (s.includes('softball')) return 'fa-baseball';
  if (s.includes('volleyball')) return 'fa-volleyball';
  if (s.includes('track')) return 'fa-person-running';
  return 'fa-medal';
}

function renderAthleteAvatar(a, extraClasses = '') {
  if (a.headshot_url && a.headshot_url.trim() !== '' && !a.headshot_url.includes('unsplash.com')) {
    return \`<img src="\${a.headshot_url}" alt="\${a.full_name}" class="w-full h-full object-cover \${extraClasses}">\`;
  }
  
  // High school athletic jersey placeholder with sport icon, jersey #, and position
  const jerseyMatch = (a.season_stats_summary || '').match(/#(\\d+)/);
  const jersey = jerseyMatch ? '#' + jerseyMatch[1] : '';
  const initials = a.full_name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const icon = getSportIcon(a.primary_sport);

  return \`
    <div class="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-3 relative overflow-hidden \${extraClasses}">
      <div class="absolute inset-0 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
      <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-1.5 shadow-inner">
        <i class="fa-solid \${icon} text-2xl sm:text-3xl text-amber-400"></i>
      </div>
      <div class="font-athletic text-2xl sm:text-3xl font-bold tracking-wider text-white leading-none">
        \${jersey || initials}
      </div>
      <div class="text-[9px] uppercase tracking-wider text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 mt-1">
        \${a.position || a.primary_sport || 'VARSITY'}
      </div>
    </div>
  \`;
}
`;

// Insert avatarHelper right before function renderAthleteCard
if (!html.includes("function renderAthleteAvatar")) {
  html = html.replace("function renderAthleteCard(a) {", avatarHelper + "\nfunction renderAthleteCard(a) {");
}

// 3. Update renderAthleteCard to use renderAthleteAvatar(a)
html = html.replace(
  /<img src="\${a\.headshot_url}" alt="\${a\.full_name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">/,
  `\${renderAthleteAvatar(a, 'group-hover:scale-105 transition duration-500')}`
);

// 4. Update modal detail hero image
html = html.replace(
  /<img src="\${a\.headshot_url}" alt="\${a\.full_name}" class="w-full h-full object-cover">/,
  `\${renderAthleteAvatar(a)}`
);

// 5. Update Fan Vote avatar
html = html.replace(
  /<img src="\${a\.headshot_url}" class="w-12 h-12 rounded-xl object-cover border border-white\/10">/,
  `<div class="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">\${renderAthleteAvatar(a)}</div>`
);

// 6. Update Rankings table avatar
html = html.replace(
  /<img src="\${a\.headshot_url}" class="w-8 h-8 rounded-lg object-cover">/,
  `<div class="w-8 h-8 rounded-lg overflow-hidden shrink-0">\${renderAthleteAvatar(a)}</div>`
);

// 7. Update loadLiveSupabaseAthletes fallback in index.html to not use unsplash
const oldFallbackRegex = /headshot_url:\s*a\.headshot_url\s*\|\|\s*\(a\.primary_sport[\s\S]*?photo-1506794778202-cad84cf45f1d[^\)]*\)/;
html = html.replace(oldFallbackRegex, 'headshot_url: a.headshot_url || ""');

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Successfully updated index.html with athletic avatar system!");