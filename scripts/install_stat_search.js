const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. Add statSort variable and helper functions
const oldVarDecl = "let searchTerm = '';\nlet unlockedAthletes = new Set();";
const newVarDecl = `let searchTerm = '';
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

function setQuickStatFilter(sport, sortKey) {
  if (sport !== null) filterSport = sport;
  statSort = sortKey;
  render();
}`;

if (!html.includes("function getAthleteStatValue")) {
  html = html.replace(oldVarDecl, newVarDecl);
}

// 2. Replace renderDirectory with enhanced stat searching & dynamic leaderboards
const oldRenderDirStart = `function renderDirectory() {
  const filtered = ATHLETES.filter(a => {
    if (filterClass !== 'all' && a.grad_year.toString() !== filterClass) return false;
    if (filterSport !== 'all' && a.primary_sport !== filterSport) return false;
    if (filterParish !== 'all' && !a.parish_city.toLowerCase().includes(filterParish.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = a.full_name.toLowerCase().includes(q);
      const matchSchool = a.school_name.toLowerCase().includes(q);
      const matchCity = a.parish_city.toLowerCase().includes(q);
      const matchPos = (a.position || '').toLowerCase().includes(q);
      if (!matchName && !matchSchool && !matchCity && !matchPos) return false;
    }
    return true;
  });`;

const newRenderDirStart = `function renderDirectory() {
  let filtered = ATHLETES.filter(a => {
    if (filterClass !== 'all' && a.grad_year.toString() !== filterClass) return false;
    if (filterSport !== 'all' && a.primary_sport !== filterSport) return false;
    if (filterParish !== 'all' && !a.parish_city.toLowerCase().includes(filterParish.toLowerCase())) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = a.full_name.toLowerCase().includes(q);
      const matchSchool = a.school_name.toLowerCase().includes(q);
      const matchCity = a.parish_city.toLowerCase().includes(q);
      const matchPos = (a.position || '').toLowerCase().includes(q);
      const matchStats = (a.season_stats_summary || '').toLowerCase().includes(q);
      const matchBio = (a.bio || '').toLowerCase().includes(q);
      if (!matchName && !matchSchool && !matchCity && !matchPos && !matchStats && !matchBio) return false;
    }
    return true;
  });

  // Sort by selected top stat leader
  filtered.sort((a, b) => {
    const valB = getAthleteStatValue(b, statSort);
    const valA = getAthleteStatValue(a, statSort);
    if (valB !== valA) return valB - valA;
    return (b.est_nil_value || 0) - (a.est_nil_value || 0);
  });`;

html = html.replace(oldRenderDirStart, newRenderDirStart);

// 3. Update the search input placeholder & add dynamic Sport Stat Sorter
const oldSearchInput = `<input type="text" oninput="updateSearch(this.value)" value="\${searchTerm}" placeholder="Search athlete, school, or city..." class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400">`;
const newSearchInput = `<input type="text" oninput="updateSearch(this.value)" value="\${searchTerm}" placeholder="Search athlete, school, parish, or stats (e.g. 2,000 yds, 15 TD, sacks, 3-pt)..." class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400">`;

html = html.replace(oldSearchInput, newSearchInput);

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Updated index.html with stat filter logic & search!");
