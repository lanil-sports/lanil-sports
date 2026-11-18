const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const newAvatarSystem = `
function getSportDesign(sport) {
  const s = (sport || '').toLowerCase();
  
  if (s.includes('football')) {
    return {
      bg: 'bg-gradient-to-br from-[#064e3b] via-[#042f2e] to-[#021d17]',
      accent: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/20',
      badgeColor: 'text-emerald-400',
      pattern: '<div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/20"></div><div class="absolute inset-x-0 top-1/4 h-0.5 bg-white/10"></div><div class="absolute inset-x-0 bottom-1/4 h-0.5 bg-white/10"></div>',
      svg: \`<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-300">
        <defs>
          <radialGradient id="fbLeather" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#b45309"/>
            <stop offset="45%" stop-color="#854d0e"/>
            <stop offset="85%" stop-color="#582900"/>
            <stop offset="100%" stop-color="#2a1200"/>
          </radialGradient>
        </defs>
        <g transform="rotate(-35 50 50)">
          <path d="M 12 50 C 22 22, 78 22, 88 50 C 78 78, 22 78, 12 50 Z" fill="url(#fbLeather)" stroke="#240f00" stroke-width="2.5"/>
          <path d="M 25 36 C 27 43, 27 57, 25 64" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.95"/>
          <path d="M 75 36 C 73 43, 73 57, 75 64" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.95"/>
          <line x1="38" y1="50" x2="62" y2="50" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="42" y1="44" x2="42" y2="56" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="47" y1="43" x2="47" y2="57" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="53" y1="43" x2="53" y2="57" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
          <line x1="58" y1="44" x2="58" y2="56" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>
        </g>
      </svg>\`
    };
  }
  
  if (s.includes('basketball')) {
    return {
      bg: 'bg-gradient-to-br from-[#451a03] via-[#2d1202] to-[#140600]',
      accent: 'border-orange-500/30 text-orange-300 bg-orange-500/20',
      badgeColor: 'text-orange-400',
      pattern: '<div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_100%] opacity-40"></div><div class="absolute w-36 h-36 rounded-full border border-white/10 -bottom-16 -right-16"></div>',
      svg: \`<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-[0_8px_16px_rgba(234,88,12,0.5)] group-hover:scale-110 transition-transform duration-300">
        <defs>
          <radialGradient id="bbOrange" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fb923c"/>
            <stop offset="40%" stop-color="#ea580c"/>
            <stop offset="85%" stop-color="#c2410c"/>
            <stop offset="100%" stop-color="#7c2d12"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="41" fill="url(#bbOrange)" stroke="#271306" stroke-width="2.5"/>
        <line x1="9" y1="50" x2="91" y2="50" stroke="#1c1917" stroke-width="3" stroke-linecap="round"/>
        <line x1="50" y1="9" x2="50" y2="91" stroke="#1c1917" stroke-width="3" stroke-linecap="round"/>
        <path d="M 23 18 C 42 34, 42 66, 23 82" stroke="#1c1917" stroke-width="3" fill="none"/>
        <path d="M 77 18 C 58 34, 58 66, 77 82" stroke="#1c1917" stroke-width="3" fill="none"/>
      </svg>\`
    };
  }

  if (s.includes('baseball')) {
    return {
      bg: 'bg-gradient-to-br from-[#14532d] via-[#153424] to-[#0f172a]',
      accent: 'border-blue-400/30 text-blue-200 bg-blue-500/20',
      badgeColor: 'text-blue-400',
      pattern: '<div class="absolute w-24 h-24 rotate-45 border-2 border-white/10 -bottom-8 left-1/2 -translate-x-1/2 opacity-30"></div>',
      svg: \`<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-[0_8px_16px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-300">
        <defs>
          <radialGradient id="baseWhite" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="65%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#cbd5e1"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="41" fill="url(#baseWhite)" stroke="#94a3b8" stroke-width="2.5"/>
        <path d="M 28 14 C 42 32, 42 68, 28 86" stroke="#dc2626" stroke-width="3.5" stroke-dasharray="2,5" stroke-linecap="round" fill="none"/>
        <path d="M 28 14 C 42 32, 42 68, 28 86" stroke="#dc2626" stroke-width="1.8" fill="none"/>
        <path d="M 72 14 C 58 32, 58 68, 72 86" stroke="#dc2626" stroke-width="3.5" stroke-dasharray="2,5" stroke-linecap="round" fill="none"/>
        <path d="M 72 14 C 58 32, 58 68, 72 86" stroke="#dc2626" stroke-width="1.8" fill="none"/>
      </svg>\`
    };
  }

  if (s.includes('softball')) {
    return {
      bg: 'bg-gradient-to-br from-[#1e293b] via-[#365314] to-[#142308]',
      accent: 'border-lime-400/30 text-lime-300 bg-lime-400/20',
      badgeColor: 'text-lime-400',
      pattern: '<div class="absolute inset-0 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>',
      svg: \`<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-[0_8px_16px_rgba(163,230,53,0.45)] group-hover:scale-110 transition-transform duration-300">
        <defs>
          <radialGradient id="sbYellow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="40%" stop-color="#ccff00"/>
            <stop offset="85%" stop-color="#a3e635"/>
            <stop offset="100%" stop-color="#65a30d"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="41" fill="url(#sbYellow)" stroke="#3f6212" stroke-width="2.5"/>
        <path d="M 28 14 C 42 32, 42 68, 28 86" stroke="#dc2626" stroke-width="3.5" stroke-dasharray="2,5" stroke-linecap="round" fill="none"/>
        <path d="M 28 14 C 42 32, 42 68, 28 86" stroke="#dc2626" stroke-width="1.8" fill="none"/>
        <path d="M 72 14 C 58 32, 58 68, 72 86" stroke="#dc2626" stroke-width="3.5" stroke-dasharray="2,5" stroke-linecap="round" fill="none"/>
        <path d="M 72 14 C 58 32, 58 68, 72 86" stroke="#dc2626" stroke-width="1.8" fill="none"/>
      </svg>\`
    };
  }

  if (s.includes('track')) {
    return {
      bg: 'bg-gradient-to-br from-[#7f1d1d] via-[#450a0a] to-[#1c0404]',
      accent: 'border-red-400/30 text-red-300 bg-red-500/20',
      badgeColor: 'text-red-400',
      pattern: '<div class="absolute inset-0 flex flex-col justify-around py-3 opacity-25"><div class="h-0.5 w-full bg-white"></div><div class="h-0.5 w-full bg-white"></div><div class="h-0.5 w-full bg-white"></div><div class="h-0.5 w-full bg-white"></div></div>',
      svg: \`<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-[0_8px_16px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform duration-300">
        <defs>
          <radialGradient id="trackBg" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ef4444"/>
            <stop offset="70%" stop-color="#b91c1c"/>
            <stop offset="100%" stop-color="#7f1d1d"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="41" fill="url(#trackBg)" stroke="#fecaca" stroke-width="2.5"/>
        <path d="M 18 78 C 36 78, 78 58, 78 18" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.65"/>
        <path d="M 28 86 C 46 86, 86 68, 86 28" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.65"/>
        <circle cx="52" cy="28" r="6" fill="#ffffff"/>
        <path d="M 46 36 L 56 42 L 67 38 M 52 44 L 43 54 L 35 50 M 52 44 L 59 58 L 70 66" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>\`
    };
  }

  // Default / Volleyball / Other Sports
  return {
    bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617]',
    accent: 'border-indigo-400/30 text-indigo-300 bg-indigo-500/20',
    badgeColor: 'text-indigo-400',
    pattern: '<div class="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>',
    svg: \`<svg viewBox="0 0 100 100" class="w-16 h-16 drop-shadow-[0_8px_16px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform duration-300">
      <defs>
        <radialGradient id="vbWhite" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="41" fill="url(#vbWhite)" stroke="#1e293b" stroke-width="2.5"/>
      <path d="M 50 9 C 50 35, 50 35, 23 50" stroke="#1e293b" stroke-width="2.5" fill="none"/>
      <path d="M 23 50 C 45 60, 45 60, 50 91" stroke="#1e293b" stroke-width="2.5" fill="none"/>
      <path d="M 50 9 C 66 30, 66 70, 50 91" stroke="#2563eb" stroke-width="3" fill="none"/>
      <path d="M 13 35 C 35 45, 65 45, 87 35" stroke="#f59e0b" stroke-width="3" fill="none"/>
      <path d="M 13 65 C 35 55, 65 55, 87 65" stroke="#2563eb" stroke-width="3" fill="none"/>
    </svg>\`
  };
}

function renderAthleteAvatar(a, extraClasses = '') {
  if (a.headshot_url && a.headshot_url.trim() !== '' && !a.headshot_url.includes('unsplash.com')) {
    return \`<img src="\${a.headshot_url}" alt="\${a.full_name}" class="w-full h-full object-cover \${extraClasses}">\`;
  }
  
  const design = getSportDesign(a.primary_sport);
  const jerseyMatch = (a.season_stats_summary || '').match(/#(\\d+)/);
  const jersey = jerseyMatch ? '#' + jerseyMatch[1] : '';
  const initials = a.full_name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return \`
    <div class="w-full h-full \${design.bg} flex flex-col items-center justify-center p-3 relative overflow-hidden \${extraClasses}">
      \${design.pattern}
      
      <!-- Realistic Dynamic Sport SVG -->
      <div class="relative z-10 mb-1.5 flex items-center justify-center">
        \${design.svg}
      </div>

      <!-- Jersey Number or Clean Initials -->
      <div class="relative z-10 font-athletic text-2xl sm:text-3xl font-bold tracking-wider text-white leading-none drop-shadow-md">
        \${jersey || initials}
      </div>

      <!-- Distinctive Position / Sport Tag -->
      <div class="relative z-10 text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm mt-1.5 \${design.accent}">
        \${a.position || a.primary_sport || 'VARSITY'}
      </div>
    </div>
  \`;
}
`;

// Replace existing getSportIcon and renderAthleteAvatar with new newAvatarSystem
const oldAvatarRegex = /function getSportIcon[\s\S]*?function renderAthleteAvatar[\s\S]*?\n\}/;

if (oldAvatarRegex.test(html)) {
  html = html.replace(oldAvatarRegex, newAvatarSystem);
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("Successfully installed realistic dynamic sport SVGs and themed backgrounds!");
} else {
  console.log("Could not match oldAvatarRegex");
}