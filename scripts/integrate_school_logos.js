const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. Add SCHOOL_LOGOS and getSchoolLogo right above getSportDesign
const logoLogic = `
let SCHOOL_LOGOS = {};
fetch('/school_logos.json')
  .then(r => r.json())
  .then(data => { SCHOOL_LOGOS = data; render(); })
  .catch(e => console.log('Logos note:', e));

function getSchoolLogo(schoolName) {
  if (!schoolName) return '';
  const key = schoolName.toLowerCase().trim();
  if (SCHOOL_LOGOS[key]) return SCHOOL_LOGOS[key];
  const stripped = key.replace(/ high school| high| school/g, '').trim();
  if (SCHOOL_LOGOS[stripped]) return SCHOOL_LOGOS[stripped];
  for (const [k, v] of Object.entries(SCHOOL_LOGOS)) {
    if (k.length > 3 && (key.includes(k) || k.includes(key))) return v;
  }
  return '';
}
`;

if (!html.includes("function getSchoolLogo")) {
  html = html.replace("function getSportDesign(sport) {", logoLogic + "\nfunction getSportDesign(sport) {");
}

// 2. Update renderAthleteCard to include the school logo badge
const oldSchoolSnippet = `<p class="text-xs text-slate-300 flex items-center gap-1 truncate">
            <i class="fa-solid fa-school text-slate-400 text-[10px]"></i>
            <span>\${a.school_name}</span>
          </p>`;

const newSchoolSnippet = `<p class="text-xs text-slate-300 flex items-center gap-1.5 truncate">
            \${getSchoolLogo(a.school_name || a.school_id) ? \`<img src="\${getSchoolLogo(a.school_name || a.school_id)}" alt="" class="w-4 h-4 rounded-full object-contain bg-white/10 p-0.5 border border-white/20 shrink-0" onerror="this.style.display='none'">\` : '<i class="fa-solid fa-school text-slate-400 text-[10px]"></i>'}
            <span class="truncate">\${a.school_name}</span>
          </p>`;

if (html.includes(oldSchoolSnippet)) {
  html = html.replace(oldSchoolSnippet, newSchoolSnippet);
} else {
  // Regex replacement for flexibility
  html = html.replace(
    /<p class="text-xs text-slate-300 flex items-center gap-1 truncate">[\s\S]*?<i class="fa-solid fa-school[^>]*><\/i>[\s\S]*?<span>\$\{a\.school_name\}<\/span>[\s\S]*?<\/p>/,
    newSchoolSnippet
  );
}

// 3. Update modal detail view school line
html = html.replace(
  /<p class="text-xs sm:text-sm text-slate-300">\$\{a\.school_name\}\s*-\s*\$\{a\.parish_city\}<\/p>/,
  `<p class="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
    \${getSchoolLogo(a.school_name || a.school_id) ? \`<img src="\${getSchoolLogo(a.school_name || a.school_id)}" alt="" class="w-6 h-6 rounded-full object-contain bg-white/10 p-0.5 border border-white/20 shrink-0" onerror="this.style.display='none'">\` : ''}
    <span>\${a.school_name} &bull; \${a.parish_city}</span>
  </p>`
);

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Successfully connected official school & team mascot logos!");