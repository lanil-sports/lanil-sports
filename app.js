// LANILSPORTS.COM Core Application Logic (Part 1)
let ATHLETES = [...window.INITIAL_ATHLETES];
let currentView = 'directory';
let filterClass = 'all';
let filterSport = 'all';
let filterParish = 'all';
let searchTerm = '';
let unlockedAthletes = new Set();

function navigate(view) {
  currentView = view;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  const container = document.getElementById('app');
  if (!container) return;
  if (currentView === 'directory') {
    container.innerHTML = renderDirectory();
  } else if (currentView === 'potw') {
    container.innerHTML = renderPOTW();
  } else if (currentView === 'rankings') {
    container.innerHTML = renderRankings();
  } else if (currentView === 'pricing') {
    container.innerHTML = renderPricing();
  }
}

function renderDirectory() {
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
  });

  return `
    <div class="mb-10 text-center relative py-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
        <i class="fa-solid fa-flag-checkered"></i>
        <span>Official Louisiana High School Directory (Classes 2027-2030)</span>
      </div>
      <h1 class="font-athletic text-5xl sm:text-6xl md:text-7xl font-bold tracking-wide uppercase text-white leading-none">
        DISCOVER LOUISIANA <span class="text-amber-400">TALENT</span>
      </h1>
      <p class="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mt-2">
        The independent recruiting yearbook & NIL intelligence index. Browse verified high school athletes, stats, and college prospects across all 64 Louisiana parishes.
      </p>
    </div>

    <div class="glass rounded-2xl p-4 mb-8 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="lg:col-span-2 relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400 text-xs"></i>
          <input type="text" oninput="updateSearch(this.value)" value="${searchTerm}" placeholder="Search athlete, school, or city..." class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400">
        </div>

        <div>
          <select onchange="updateClass(this.value)" class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400">
            <option value="all" ${filterClass==='all'?'selected':''}>All Classes (2027-2030)</option>
            <option value="2027" ${filterClass==='2027'?'selected':''}>Class of 2027 (Seniors)</option>
            <option value="2028" ${filterClass==='2028'?'selected':''}>Class of 2028 (Juniors)</option>
            <option value="2029" ${filterClass==='2029'?'selected':''}>Class of 2029 (Sophomores)</option>
            <option value="2030" ${filterClass==='2030'?'selected':''}>Class of 2030 (Freshmen)</option>
          </select>
        </div>

        <div>
          <select onchange="updateSport(this.value)" class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400">
            <option value="all" ${filterSport==='all'?'selected':''}>All Sports</option>
            <option value="Football" ${filterSport==='Football'?'selected':''}>Football</option>
            <option value="Basketball" ${filterSport==='Basketball'?'selected':''}>Basketball</option>
            <option value="Baseball" ${filterSport==='Baseball'?'selected':''}>Baseball</option>
            <option value="Track & Field" ${filterSport==='Track & Field'?'selected':''}>Track & Field</option>
            <option value="Softball" ${filterSport==='Softball'?'selected':''}>Softball</option>
          </select>
        </div>

        <div>
          <select onchange="updateParish(this.value)" class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400">
            <option value="all" ${filterParish==='all'?'selected':''}>All Parishes</option>
            <option value="Ouachita" ${filterParish==='Ouachita'?'selected':''}>Ouachita (Monroe)</option>
            <option value="Orleans" ${filterParish==='Orleans'?'selected':''}>Orleans (New Orleans)</option>
            <option value="East Baton Rouge" ${filterParish==='East Baton Rouge'?'selected':''}>East Baton Rouge</option>
            <option value="Caddo" ${filterParish==='Caddo'?'selected':''}>Caddo (Shreveport)</option>
            <option value="Iberia" ${filterParish==='Iberia'?'selected':''}>Iberia (New Iberia)</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
        <span>Showing <strong class="text-white">${filtered.length}</strong> Louisiana athlete records</span>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> Verified</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Claimed</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${filtered.map(athlete => renderAthleteCard(athlete)).join('')}
    </div>
  `;
}

function renderAthleteCard(a) {
  return `
    <div class="glass rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all duration-300 group flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5">
      <div class="relative aspect-[4/3] bg-slate-800 overflow-hidden cursor-pointer" onclick="openAthleteDetail('${a.id}')">
        <img src="${a.headshot_url}" alt="${a.full_name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        
        <div class="absolute top-3 left-3 flex items-center gap-1.5">
          <span class="badge-blur text-[10px] font-bold uppercase tracking-wider text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
            Class of ${a.grad_year}
          </span>
          ${a.verified ? `
            <span class="badge-blur text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <i class="fa-solid fa-certificate"></i> Verified
            </span>
          ` : ''}
        </div>

        ${a.claimed ? `
          <span class="absolute top-3 right-3 badge-blur text-[10px] font-semibold text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
            <i class="fa-solid fa-check"></i> Claimed
          </span>
        ` : `
          <button onclick="event.stopPropagation(); openClaimPreload('${a.full_name}', '${a.school_name}', ${a.grad_year})" class="absolute top-3 right-3 badge-blur text-[10px] font-semibold text-amber-300 hover:text-white px-2 py-0.5 rounded-full border border-amber-400/30 hover:border-amber-400 transition">
            Claim Free
          </button>
        `}

        <div class="absolute bottom-3 left-3 right-3">
          <div class="flex items-center gap-2 text-xs font-bold text-amber-400 mb-0.5">
            <span>${a.position}</span>
            <span> • </span>
            <span>${a.primary_sport}</span>
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white tracking-wide group-hover:text-amber-400 transition leading-tight">
            ${a.full_name}
          </h3>
          <p class="text-xs text-slate-300 flex items-center gap-1 truncate">
            <i class="fa-solid fa-school text-slate-400 text-[10px]"></i>
            <span>${a.school_name}</span>
          </p>
        </div>
      </div>

      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div class="space-y-2">
          <p class="text-[11px] text-slate-400 flex items-center gap-1">
            <i class="fa-solid fa-location-dot text-amber-400 text-[10px]"></i>
            <span>${a.parish_city}</span>
          </p>

          <div class="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 text-xs text-slate-300">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Season Snapshot</p>
            <p class="text-xs font-medium text-slate-200 line-clamp-2">${a.season_stats_summary}</p>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="bg-amber-400/5 border border-amber-400/15 rounded-lg p-2 text-center">
              <span class="block text-[9px] uppercase font-bold text-slate-400">Est. NIL Value</span>
              <span class="font-athletic text-lg font-bold text-amber-400 leading-none">$${a.est_nil_value.toLocaleString()}/yr</span>
            </div>
            <div class="bg-slate-900/60 border border-white/5 rounded-lg p-2 text-center">
              <span class="block text-[9px] uppercase font-bold text-slate-400">College Interest</span>
              <span class="font-athletic text-lg font-bold text-white leading-none">${a.potential_colleges.length} Offers</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-white/10 flex items-center gap-2">
          <button onclick="openAthleteDetail('${a.id}')" class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center justify-center gap-1.5">
            <span>View Full Profile</span>
            <i class="fa-solid fa-arrow-right text-[10px] text-amber-400"></i>
          </button>
          <button onclick="openCardModal('${a.id}')" title="Generate Shareable Card" class="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-400 hover:text-black text-slate-300 text-xs transition">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}
// LANILSPORTS.COM Core (Part 2: Detail Drawer & Claim)
function openAthleteDetail(id) {
  const a = ATHLETES.find(x => x.id === id);
  if (!a) return;
  const isUnlocked = unlockedAthletes.has(a.id);

  const content = `
    <div class="relative">
      <div class="h-44 sm:h-52 bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950 relative overflow-hidden">
        <div class="absolute inset-0 bg-black/40"></div>
        <button onclick="closeDrawer()" class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition">✕</button>
        
        <div class="absolute bottom-4 left-6 flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-black">
            Class of ${a.grad_year} (${a.current_grade})
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/60 text-amber-300 border border-amber-400/30">
            ${a.player_id}
          </span>
        </div>
      </div>

      <div class="p-6 -mt-12 relative">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
          <div class="flex items-end gap-4">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-slate-900 bg-slate-800 shadow-xl relative">
              <img src="${a.headshot_url}" alt="${a.full_name}" class="w-full h-full object-cover">
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-athletic text-3xl sm:text-4xl font-bold text-white leading-none">${a.full_name}</h2>
                ${a.verified ? '<i class="fa-solid fa-circle-check text-amber-400 text-base" title="Verified Athlete"></i>' : ''}
              </div>
              <p class="text-xs text-amber-400 font-semibold">${a.position}  •  ${a.primary_sport} ${a.secondary_sports.length ? `(Also: ${a.secondary_sports.join(', ')})` : ''}</p>
              <p class="text-xs text-slate-300">${a.school_name}  -  ${a.parish_city}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button onclick="openCardModal('${a.id}')" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-image"></i> Share Card
            </button>
            <button onclick="votePOTW('${a.id}')" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl gold-gradient text-black font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-fire"></i> Vote (${a.votes})
            </button>
          </div>
        </div>

        <div class="mb-6 bg-slate-800/50 rounded-xl p-4 border border-white/5">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Scouting & Athletic Bio</h4>
          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${a.bio}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-chart-simple text-amber-400"></i> Season Statistics
            </h4>
            <p class="text-xs text-slate-200 font-medium">${a.season_stats_summary}</p>
          </div>

          <div class="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <i class="fa-solid fa-newspaper text-amber-400"></i> Verified Newspaper Mentions
            </h4>
            ${a.newspaper_mentions.map(n => `
              <div class="text-xs mb-1.5">
                <span class="text-amber-300 font-semibold">${n.source}</span>: 
                <span class="text-slate-300">"${n.title}"</span> 
                <span class="text-[10px] text-slate-500">(${n.date})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="border-t border-white/10 pt-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-athletic text-2xl font-bold text-white tracking-wide">RECRUITING & NIL INTELLIGENCE</h3>
              <p class="text-xs text-slate-400">Verified college interest, reported offers, and local sponsorship valuations.</p>
            </div>
            <span class="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase">
              ${isUnlocked ? 'PREMIUM UNLOCKED' : 'PRO FEATURE'}
            </span>
          </div>

          ${isUnlocked ? `
            <div class="space-y-4 bg-slate-800/30 border border-emerald-400/30 rounded-2xl p-5">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-slate-800 rounded-xl p-3 border border-white/5">
                  <span class="text-[10px] text-slate-400 uppercase font-bold">Estimated Annual NIL</span>
                  <span class="font-athletic text-2xl font-bold text-emerald-400 block">$${a.est_nil_value.toLocaleString()}</span>
                  <span class="text-[10px] text-slate-500">Based on social reach & verified offers</span>
                </div>
                <div class="bg-slate-800 rounded-xl p-3 border border-white/5">
                  <span class="text-[10px] text-slate-400 uppercase font-bold">Social Following</span>
                  <span class="font-athletic text-2xl font-bold text-white block">${a.total_followers.toLocaleString()}</span>
                  <span class="text-[10px] text-slate-400">${a.social_handles.instagram || ''} ${a.social_handles.twitter || ''}</span>
                </div>
                <div class="bg-slate-800 rounded-xl p-3 border border-white/5">
                  <span class="text-[10px] text-slate-400 uppercase font-bold">Recruiting Status</span>
                  <span class="font-athletic text-2xl font-bold text-amber-400 block">${a.potential_colleges.length} Offers</span>
                  <span class="text-[10px] text-slate-500">Division I & Regional Interest</span>
                </div>
              </div>

              <div class="pt-2 border-t border-white/5">
                <h5 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Athlete Videos</h5>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  ${(() => {
                    const videoSections = [
                      { label: 'Introduction Video', url: a.intro_video_url || a.introduction_video_url || a.intro_url || '', icon: 'fa-solid fa-user', desc: 'Personal intro & background' },
                      { label: 'Game Film & Highlights', url: a.game_film_url || a.highlight_url || a.highlights_url || a.hudl_url || '', icon: 'fa-solid fa-film', desc: 'In-game plays & highlight reel' },
                      { label: 'Workouts', url: a.workout_url || a.youtube_url || '', icon: 'fa-solid fa-dumbbell', desc: 'Training & workout footage' }
                    ];
                    return videoSections.map(v => v.url ? `
                      <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="group bg-slate-800/70 hover:bg-slate-700/80 border border-white/10 hover:border-amber-400/40 rounded-xl p-3 transition flex flex-col gap-1.5">
                        <div class="flex items-center gap-2">
                          <span class="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center text-xs"><i class="${v.icon}"></i></span>
                          <span class="font-bold text-white text-xs leading-tight">${v.label}</span>
                        </div>
                        <span class="text-[10px] text-slate-400">${v.desc}</span>
                        <span class="mt-auto pt-1 text-[10px] font-semibold text-amber-400 inline-flex items-center gap-1">Watch <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></span>
                      </a>
                    ` : `
                      <button type="button" onclick="alert('${v.label} is not available yet.')" class="text-left bg-slate-800/40 border border-dashed border-white/10 hover:border-amber-400/30 rounded-xl p-3 transition flex flex-col gap-1.5">
                        <div class="flex items-center gap-2">
                          <span class="w-7 h-7 rounded-lg bg-slate-700/60 text-slate-400 flex items-center justify-center text-xs"><i class="${v.icon}"></i></span>
                          <span class="font-bold text-slate-200 text-xs leading-tight">${v.label}</span>
                        </div>
                        <span class="text-[10px] text-slate-500">${v.desc}</span>
                        <span class="mt-auto pt-1 text-[10px] font-semibold text-slate-500 inline-flex items-center gap-1">Coming soon</span>
                      </button>
                    `).join('');
                  })()}
                </div>
              </div>

              <div>
                <h5 class="text-xs font-bold text-slate-300 mb-2">Reported Offers & Target Colleges:</h5>
                <div class="flex flex-wrap gap-2">
                  ${a.potential_colleges.map(c => `
                    <span class="px-3 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs font-semibold text-white">
                      <i class="fa-solid fa-graduation-cap text-amber-400 mr-1"></i> ${c}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : `
            <div class="relative rounded-2xl overflow-hidden border border-amber-400/30 bg-slate-900 p-6 text-center">
              <div class="filter blur-sm opacity-30 pointer-events-none select-none">
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div class="p-4 bg-slate-800 rounded-xl">Est. NIL Value: $2,450</div>
                  <div class="p-4 bg-slate-800 rounded-xl">Followers: 9,400</div>
                  <div class="p-4 bg-slate-800 rounded-xl">Offers: LSU, Tulane, Bama</div>
                </div>
              </div>

              <div class="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/75 backdrop-blur-xs">
                <div class="w-10 h-10 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-lg mb-2">
                  <i class="fa-solid fa-lock"></i>
                </div>
                <h4 class="font-athletic text-2xl font-bold text-white mb-1">UNLOCK FULL RECRUITING & NIL DOSSIER</h4>
                <p class="text-xs text-slate-300 max-w-md mb-4">
                  Get verified college offers, social media engagement analytics, local business sponsorship inquiry forms, and contact channels.
                </p>
                <div class="flex items-center gap-3">
                  <button onclick="unlockTest('${a.id}')" class="px-5 py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition">
                    Preview Profile Access ($19.99/mo or Free Trial)
                  </button>
                </div>
                <p class="text-[10px] text-slate-400 mt-2">Free for verified high school athletic directors & high school coaches.</p>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  document.getElementById('drawer-content').innerHTML = content;
  document.getElementById('athlete-drawer').classList.remove('hidden');
}

function closeDrawer() {
  document.getElementById('athlete-drawer').classList.add('hidden');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function openClaimPreload(name, school, year) {
  document.getElementById('claim-name').value = name;
  document.getElementById('claim-school').value = school;
  document.getElementById('claim-year').value = year;
  openModal('claim-modal');
}

function handleClaimSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('claim-name').value;
  const school = document.getElementById('claim-school').value;
  const year = parseInt(document.getElementById('claim-year').value);
  const sport = document.getElementById('claim-sport').value;
  const email = document.getElementById('claim-email').value;

  let athlete = ATHLETES.find(a => a.full_name.toLowerCase() === name.toLowerCase());
  if (athlete) {
    athlete.claimed = true;
  } else {
    const nextId = "LA-" + year + "-000" + (ATHLETES.length + 1);
    athlete = {
      id: (ATHLETES.length + 1).toString(),
      player_id: nextId,
      full_name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + year,
      grad_year: year,
      current_grade: year === 2027 ? "Senior" : year === 2028 ? "Junior" : year === 2029 ? "Sophomore" : "Freshman",
      school_name: school,
      parish_city: "Louisiana",
      primary_sport: sport,
      secondary_sports: [],
      position: "ATH",
      season_stats_summary: "Profile claimed by athlete. Verified statistics pending moderation.",
      newspaper_mentions: [],
      social_handles: {},
      total_followers: 500,
      est_nil_value: 350,
      potential_colleges: [],
      headshot_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      bio: "High school student-athlete. Profile claimed via LANIL Portal.",
      claimed: true,
      verified: false,
      tier: "free",
      votes: 1
    };
    ATHLETES.unshift(athlete);
  }

  closeModal('claim-modal');
  alert(`Success! Profile for ${name} claimed. Confirmation logged to ${email}. You can now manage photos and updates.`);
  render();
  openAthleteDetail(athlete.id);
}

function unlockTest(id) {
  unlockedAthletes.add(id);
  openAthleteDetail(id);
}
// LANILSPORTS.COM Core (Part 3: Fan Vote, Rankings, Pricing, Share Card)
function renderPOTW() {
  const sorted = [...ATHLETES].sort((a,b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, a) => sum + a.votes, 0);

  return `
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="text-center">
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
          Live Fan Poll  •  Week 11 Round
        </span>
        <h1 class="font-athletic text-5xl sm:text-6xl font-bold tracking-wide text-white uppercase mt-2">
          LOUISIANA ATHLETE OF THE WEEK
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
          Vote for your parish standout. The winner receives a featured profile spotlight and free LANIL Athlete Plus verification!
        </p>
      </div>

      <div class="glass rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
          <span>Total Votes Cast: <strong class="text-amber-400 font-bold">${totalVotes.toLocaleString()}</strong></span>
          <span>Poll Closes: <strong>Friday at 11:59 PM CST</strong></span>
        </div>

        <div class="space-y-4">
          ${sorted.map((a, idx) => {
            const pct = totalVotes ? Math.round((a.votes / totalVotes) * 100) : 0;
            return `
              <div class="bg-slate-900/80 rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400/40 transition">
                <div class="flex items-center gap-3">
                  <span class="font-athletic text-2xl font-bold text-slate-500 w-6 text-center">#${idx+1}</span>
                  <img src="${a.headshot_url}" class="w-12 h-12 rounded-xl object-cover border border-white/10">
                  <div>
                    <h4 class="font-athletic text-xl font-bold text-white leading-none">${a.full_name}</h4>
                    <p class="text-xs text-amber-400">${a.school_name}  •  ${a.primary_sport}</p>
                  </div>
                </div>

                <div class="flex-1 sm:max-w-xs">
                  <div class="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                    <span>${a.votes} votes</span>
                    <span>${pct}%</span>
                  </div>
                  <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div class="h-full gold-gradient rounded-full" style="width: ${pct}%"></div>
                  </div>
                </div>

                <button onclick="votePOTW('${a.id}')" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-black text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5">
                  <i class="fa-solid fa-thumbs-up"></i>
                  <span>Vote</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function votePOTW(id) {
  const a = ATHLETES.find(x => x.id === id);
  if (a) {
    a.votes += 1;
    render();
    alert(`Vote recorded for ${a.full_name}! Thank you for supporting Louisiana high school athletics.`);
  }
}

function renderRankings() {
  const topAthletes = [...ATHLETES].sort((a,b) => b.est_nil_value - a.est_nil_value);
  return `
    <div class="space-y-6">
      <div class="text-center mb-8">
        <h1 class="font-athletic text-5xl sm:text-6xl font-bold tracking-wide uppercase text-white">
          LOUISIANA NIL & PROSPECT RANKINGS
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
          Statewide prospect index ranking based on verified stats, social media engagement, and college recruiting interest.
        </p>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th class="py-3.5 px-4">Rank</th>
                <th class="py-3.5 px-4">Athlete</th>
                <th class="py-3.5 px-4">School & Parish</th>
                <th class="py-3.5 px-4">Class</th>
                <th class="py-3.5 px-4">Sport</th>
                <th class="py-3.5 px-4 text-right">Social Reach</th>
                <th class="py-3.5 px-4 text-right">Est. Annual NIL</th>
                <th class="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${topAthletes.map((a, i) => `
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3 px-4 font-athletic text-lg font-bold text-amber-400">#${i+1}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <img src="${a.headshot_url}" class="w-8 h-8 rounded-lg object-cover">
                      <div>
                        <span class="font-bold text-white block">${a.full_name}</span>
                        <span class="text-[10px] text-slate-400">${a.position}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-white block">${a.school_name}</span>
                    <span class="text-[10px] text-slate-400">${a.parish_city}</span>
                  </td>
                  <td class="py-3 px-4 font-semibold text-slate-300">${a.grad_year}</td>
                  <td class="py-3 px-4">${a.primary_sport}</td>
                  <td class="py-3 px-4 text-right font-medium">${a.total_followers.toLocaleString()}</td>
                  <td class="py-3 px-4 text-right font-athletic text-base font-bold text-amber-400">$${a.est_nil_value.toLocaleString()}</td>
                  <td class="py-3 px-4 text-center">
                    <button onclick="openAthleteDetail('${a.id}')" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold">
                      Profile
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderPricing() {
  return `
    <div class="max-w-5xl mx-auto space-y-12 py-6">
      <div class="text-center">
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
          Clear & Transparent Subscriptions
        </span>
        <h1 class="font-athletic text-5xl sm:text-6xl font-bold tracking-wide uppercase text-white mt-2">
          MONETIZATION & MEMBERSHIP PLANS
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-1">
          Free to discover talent. Low-cost tools for student-athletes. Premium intelligence for college scouts, media, and local sponsors.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass rounded-2xl p-6 flex flex-col justify-between border-t-4 border-amber-400 relative">
          <span class="absolute -top-3 right-6 bg-amber-400 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded">FOR ATHLETES</span>
          <div>
            <h3 class="font-athletic text-2xl font-bold text-white mb-1">LANIL ATHLETE PLUS</h3>
            <p class="text-xs text-slate-400 mb-4">Empower your recruiting journey and showcase your high school career.</p>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="font-athletic text-5xl font-bold text-white">$3.99</span>
              <span class="text-xs text-slate-400">/ month</span>
            </div>
            <ul class="space-y-2.5 text-xs text-slate-300">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400"></i> Up to 10 Headshot & Action Photos</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400"></i> Full Bio & Highlight Links (Hudl/YouTube)</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400"></i> Verified Athlete Badge</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400"></i> 9:16 Shareable Digital Player Card</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400"></i> Profile View Analytics</li>
            </ul>
          </div>
          <button onclick="openModal('claim-modal')" class="w-full mt-6 py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs hover:brightness-110 transition">
            Claim & Upgrade ($3.99/mo)
          </button>
        </div>

        <div class="glass rounded-2xl p-6 flex flex-col justify-between border-t-4 border-indigo-400 relative bg-slate-900/90 shadow-xl">
          <span class="absolute -top-3 right-6 bg-indigo-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">MOST POPULAR</span>
          <div>
            <h3 class="font-athletic text-2xl font-bold text-white mb-1">RECRUITER & MEDIA PRO</h3>
            <p class="text-xs text-slate-400 mb-4">Comprehensive statewide prospect evaluations and recruiting tracking.</p>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="font-athletic text-5xl font-bold text-white">$19.99</span>
              <span class="text-xs text-slate-400">/ month</span>
            </div>
            <ul class="space-y-2.5 text-xs text-slate-300">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-400"></i> Unlock All Athlete Profiles & Dossiers</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-400"></i> Advanced Multi-Sport & Position Filtering</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-400"></i> Verified Offers vs. Reported Tracking</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-400"></i> Historical Weekly Stat Progressions</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-indigo-400"></i> Exportable Excel / CSV Dossiers</li>
            </ul>
          </div>
          <button onclick="alert('Stripe zero-cost checkout integration connects directly here!')" class="w-full mt-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
            Start Pro Access ($19.99/mo)
          </button>
        </div>

        <div class="glass rounded-2xl p-6 flex flex-col justify-between border-t-4 border-emerald-400 relative">
          <span class="absolute -top-3 right-6 bg-emerald-500 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded">LOCAL SPONSORS</span>
          <div>
            <h3 class="font-athletic text-2xl font-bold text-white mb-1">PARISH SPONSORSHIP</h3>
            <p class="text-xs text-slate-400 mb-4">Connect your local Louisiana business with hometown sports communities.</p>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="font-athletic text-5xl font-bold text-white">$99.00</span>
              <span class="text-xs text-slate-400">/ month</span>
            </div>
            <ul class="space-y-2.5 text-xs text-slate-300">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Featured Parish Directory Banner</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Compliant NIL Deal Inquiry Access</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Athlete of the Week Award Sponsorship</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400"></i> Louisiana Act 810 Compliance Guidance</li>
            </ul>
          </div>
          <button onclick="alert('Business inquiries can reach out directly to contact@lanilsports.com')" class="w-full mt-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
            Inquire for Parish Sponsor
          </button>
        </div>
      </div>
    </div>
  `;
}

// Sports Icon Collection mapping
const SPORT_ICONS = {
  'football': '🏈',
  'basketball': '🏀',
  'baseball': '⚾',
  'soccer': '⚽',
  'volleyball': '🏐',
  'tennis': '🎾',
  'golf': '🏌️',
  'hockey': '🏒',
  'lacrosse': '🥍',
  'swimming': '🏊',
  'wrestling': '🤼',
  'track & field': '🏃',
  'track': '🏃',
  'cross country': '🏃',
  'softball': '🥎',
  'badminton': '🏸',
  'boxing': '🥊'
};

function getSportIcon(sportName) {
  if (!sportName) return '🏈';
  const s = sportName.toLowerCase().trim();
  for (const [key, icon] of Object.entries(SPORT_ICONS)) {
    if (s.includes(key)) return icon;
  }
  return '🏆';
}

const POSITION_MAP = {
  'QB': 'Quarterback',
  'WR': 'Wide Receiver',
  'RB': 'Running Back',
  'IOL': 'Interior Offensive Lineman',
  'OT': 'Offensive Tackle',
  'OG': 'Offensive Guard',
  'C': 'Center',
  'OL': 'Offensive Lineman',
  'DE': 'Defensive End',
  'EDGE': 'Edge Rusher',
  'DT': 'Defensive Tackle',
  'DL': 'Defensive Lineman',
  'LB': 'Linebacker',
  'ILB': 'Inside Linebacker',
  'OLB': 'Outside Linebacker',
  'CB': 'Cornerback',
  'S': 'Safety',
  'FS': 'Free Safety',
  'SS': 'Strong Safety',
  'DB': 'Defensive Back',
  'K': 'Kicker',
  'P': 'Punter',
  'ATH': 'Athlete',
  'WR / CB': 'Wide Receiver / Cornerback',
  'DE / EDGE': 'Defensive End / Edge',
  'SS / RHP': 'Shortstop / Pitcher',
  'PG': 'Point Guard',
  'SG / SF': 'Shooting Guard / Small Forward',
  'Sprints / Long Jump': 'Sprints / Long Jump',
  'DT / NT': 'Defensive Tackle / Nose Tackle',
  'RB / ATH': 'Running Back / Athlete',
  'Outside Hitter': 'Outside Hitter',
  'OF / RHP': 'Outfielder / Pitcher',
  'SG': 'Shooting Guard',
  'WR / ATH': 'Wide Receiver / Athlete',
  'SS / OF': 'Shortstop / Outfielder',
  'P / 1B': 'Pitcher / First Base',
  'SF': 'Small Forward',
  'PF': 'Power Forward',
  '1B': 'First Base',
  '2B': 'Second Base',
  '3B': 'Third Base',
  'OF': 'Outfielder',
  'RHP': 'Right-Handed Pitcher',
  'LHP': 'Left-Handed Pitcher',
  'DH': 'Designated Hitter'
};

const SCHOOL_MASCOTS = {
  'folsom': 'Bulldogs',
  'destrehan': 'Fighting Wildcats',
  'john curtis christian': 'Patriots',
  'john-curtis-christian': 'Patriots',
  'john curtis': 'Patriots',
  'allen': 'Eagles',
  'neville': 'Tigers',
  'edna karr': 'Cougars',
  'ruston': 'Bearcats',
  'barbe': 'Bucs',
  'st. thomas more': 'Cougars',
  'catholic': 'Bears',
  'ouachita parish': 'Lions',
  'ouachita': 'Lions',
  'alexandria': 'Trojans',
  'mandeville': 'Skippers',
  'university lab': 'Cubs',
  'west monroe': 'Rebels',
  'westgate': 'Tigers',
  'captain shreve': 'Gators',
  'lafayette': 'Mighty Lions',
  'st. augustine': 'Purple Knights',
  'c.e. byrd': 'Yellow Jackets',
  'scotlandville': 'Hornets',
  'warren easton': 'Fighting Eagles',
  'carencro': 'Golden Bears'
};

function getSchoolMascot(schoolName) {
  if (!schoolName) return '';
  const s = schoolName.toLowerCase().trim();
  for (const [k, v] of Object.entries(SCHOOL_MASCOTS)) {
    if (s.includes(k)) return v;
  }
  return '';
}

function getFullPositionTitle(pos, sport) {
  if (!pos) return 'Athlete';
  const clean = pos.trim();
  if (POSITION_MAP[clean]) return POSITION_MAP[clean];
  if (POSITION_MAP[clean.toUpperCase()]) return POSITION_MAP[clean.toUpperCase()];
  return pos;
}

function formatCardStats(str) {
  if (!str) return '';
  return str
    .replace(/\s*\|\s*LANIL\s*Rating.*$/i, '')
    .replace(/\s*\|\s*LANIL\s*Rat.*$/i, '')
    .replace(/\s*\|\s*On3.*$/i, '')
    .replace(/\s*\|\s*247.*$/i, '')
    .replace(/\s*\|\s*\d+-Star.*$/i, '')
    .trim();
}

function openCardModal(id) {
  const a = ATHLETES.find(x => x.id === id);
  if (!a) return;

  const cardImg = document.getElementById('card-img');
  if (cardImg) cardImg.src = a.headshot_url || '';
  
  const nameEl = document.getElementById('card-name');
  if (nameEl) nameEl.textContent = a.full_name;
  
  const posFullEl = document.getElementById('card-pos-full');
  if (posFullEl) posFullEl.textContent = getFullPositionTitle(a.position, a.primary_sport);
  
  const sportEmojiEl = document.getElementById('card-sport-emoji');
  if (sportEmojiEl) sportEmojiEl.textContent = getSportIcon(a.primary_sport);

  const gradEl = document.getElementById('card-grad');
  if (gradEl) gradEl.textContent = a.grad_year;
  
  const schoolEl = document.getElementById('lanil-school');
  if (schoolEl) schoolEl.textContent = a.school_name || 'LOUISIANA VARSITY';

  const statsEl = document.getElementById('card-stats');
  if (statsEl) {
    const formattedStats = formatCardStats(a.season_stats_summary || '');
    if (formattedStats) {
      statsEl.textContent = formattedStats;
      statsEl.style.display = 'block';
    } else {
      statsEl.textContent = '';
      statsEl.style.display = 'none';
    }
  }

  const sigEl = document.getElementById('lanil-sig');
  if (sigEl) sigEl.textContent = a.full_name;

  openModal('card-modal');
}

function downloadCard(isUnwatermarked = false) {
  if (isUnwatermarked) {
    alert("🌟 Ultra-HD Pro Card (Unwatermarked 4K) ready! Instant download unlocked.");
  } else {
    alert("📸 Free 9:16 Social Card ready with lanilsports.com watermark! Save to photos for Instagram Story & X.");
  }
}

function updateClass(val) { filterClass = val; render(); }
function updateSport(val) { filterSport = val; render(); }
function updateParish(val) { filterParish = val; render(); }
function updateSearch(val) { searchTerm = val; render(); }
function filterByClass(val) { filterClass = val.toString(); currentView = 'directory'; render(); }
function filterByParish(val) { filterParish = val; currentView = 'directory'; render(); }

function saveSupabaseConfig() {
  const url = document.getElementById('cfg-sb-url').value;
  const key = document.getElementById('cfg-sb-key').value;
  localStorage.setItem('lanil_sb_url', url);
  localStorage.setItem('lanil_sb_key', key);
  closeModal('settings-modal');
  alert("Supabase credentials saved locally. When deployed to Cloudflare Pages, your live Supabase database will power the directory!");
}

function resetDemoData() {
  localStorage.removeItem('lanil_sb_url');
  localStorage.removeItem('lanil_sb_key');
  closeModal('settings-modal');
  alert("Reset to initial 2026-2027 Louisiana seed database.");
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  render();
});
