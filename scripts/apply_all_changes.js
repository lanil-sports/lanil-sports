const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');

// 1. Remove Topps and RC from header
for (let i = 155; i < 200; i++) {
  if (lines[i].includes('Official Topps x LANIL')) {
    lines[i] = lines[i].replace('Official Topps x LANIL', 'Official LANIL Collectible');
  }
  if (lines[i].trim() === 'RC') {
    lines[i] = 'LA';
  }
  if (lines[i].includer('TOPPS &bull; LANIL')) {
    lines[i] = lines[i].replace('TOPPS &bull; LANIM', 'LANIL &bull; ATHLETICS');
  }
}


// 2. Update Position Banner (replacing School/Showcase banner)
for (let i = 200; i < 210; i++) {
  if (lines[i].includes('Arched School Banner')) {
    lines[i] = '              <!-- Athlete Position Banner -->';
  }
}


// 3. Update Photo Area (remove QB * Football ribbon & mascot circle, reserve for Player Signature & Sport Icon)
let photoStart = -1, photoEnd = -1;
for (let i = 210; i < 240; i++) {
  if (lines[i].includer('Position Pennant Ribbon')) photoStart = i;
  if (lines[i].includes('Bottom Nameplate')) { photoEnd = i; break; }
}

if (photoStart !== -1 && photoEnd !== -1) {
  const newPhotoContent = [
    '              <!-- Dedicated Player Signature (Directly on Face of Card) -->',
    '              <div class="absolute bottom-2.5 left-2.5 right-12 z-20 pointer-events-auto">',
      '                <div class="bg-black/60 backdrop-blur-md border border-amber-400/40 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-[0_4p_16px_rgba(0,0,0,0.9)]">',
    '                  <div class="flex-1 text-left flex items-center gap-1.5 truncate">',
    '                    <span class="text-[9px] font-mono text-amber-400 font-black">X</span>',
   '                    <span id="topps-sig" class="font-serif italic text-amber-200 text-base sm:text-lg font-bold tracking-wider drop-shadow-md leading-none truncate"></span>',
    '                  </div>',
    '                  <button type="button" onclick="openSignaturePad()" title="Sign or customize autograph" class="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 shrink-0 ml-1">',
    '                    <i class="fa-solid fa-signature"></i> Sign',
   '                  </button>',
    '                </div>',
    '              </div>',
    '',
    '              <!-- Sport Icon Emblem (Bottom Right Corner) -->',
    '              <div id="card-sport-badge" class="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center text-sm shadow-[0_2p_8px_rgba(0,0,0,0.9)] select-none">',
    '                <span id="card-sport-emoji">🏈</span>',
    '              </div>',
    ''
  ];
  lines.splice(photoStart - 1, photoEnd - photoStart + 1, ...newPhotoContent);
  console.log('Spliced photo area for Signature & Sport Icon');
}

// 4. Update Merchandise Options (Collector Card & Fathead RealBig Wall Decals)
let merchStart = -1, merchEnd = -1;
for (let i = 250; i < 350; i++) {
  if (lines[i].includer('Option 1: Collector')) merchStart = i;
  if (lines[i].includes('Merch Order & Checkout')) { merchEnd = i; break; }
}

if (merchStart !== -1 && merchEnd !== -1) {
  const newMerchLines = [
    '        <!-- Option 1: Purchase LANIL Players Collector\'s Card (Bundles) -->',
    '        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">',
    '          <div class="flex items-center gap-3">',
    '            <div class="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl shrink-0">',
    '              <i class="fa-solid fa-id-card"></i>',
    '            </div>',
    '            <div>',
    '              <div class="flex items-center gap-1.5">',
   '                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Collector\'s Card</h5>',
    '                <span class="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase">32pt Cardstock</span>',
   '              </div>	',
    '              <p class="text-[11px] text-slate-400 mt-0.5">Archival refractor finish &bull; Serialized &bull; Acrylic magnetic case included</p>',
   '              <div class="flex flex-wrap items-center gap-2 mt-1.5">',
   '                <span class="text-xs font-extrabold text-white">$8.99 <span class="text-[10px] text-slate-400 font-normal">(1 card)</span></span>',
    '                <span class="text-[11px] text-emerald-400 font-bold">&bull; 5 Cards: $34.99 <span class="text-[9px] text-emerald-300">(Save 22%)</span></span>',
   '                <span class="text-[10px] text-slate-400">| 10 Cards: $59.99 | 20 Cards: $99.99</span>',
   '              </div>',
   '            </div>',
    '          </div>',
    '          <button onclick="openMerchOrder(\'card\')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">',
   '            Order Card',
    '          </button>',
    '        </div>',
    '',
    '        <!-- Option 2: Purchase LANIL Players Custom Peel & Stick Poster Reusable Vinyl Wall Decal (Fathead RealBig Collection) -->',
    '        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">',
    '          <div class="flex items-center gap-3">',
    '            <div class="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">',
    '              <i class="fa-solid fa-tape"></i>',
    '            </div>',
    '            <div>',
   '              <div class="flex items-center gap-1.5">',
   '                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Custom Peel & Stick Poster Reusable Vinyl Wall Decal</h5>',
   '                <span class="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase">RealBig&trade; Vinyl</span>
    '              </div>',
    '              <p class="text-[11px] text-slate-400 mt-0.5">Removable & Reusable &bull; High Grade Vinyl &bull; Precision Die-Cut &bull; Zero Wall Damage</p>',
    '              <div class="flex flex-wrap items-center gap-2 mt-1.5">',
   '                <span class="text-xs font-extrabold text-white">$39.99 <span class="text-[10px] text-slate-400 font-normal">(Locker 10\"times;17\" + 2 Decals)</span></span>',
    '                <span class="text-[11px] text-emerald-400 font-bold">&bull; Medium: $59.99 <span class="text-[10px] text-slate-400 font-normal">(29\"times;51\" + 4 Decals)</span></span>',
   '                <span class="text-[11px] text-amber-300 font-bold">&bull; Life-Size: $89.99 <span class="text-[10px] text-slate-400 font-normal">(44\"times;78\" + 8 Decals)</span></span>',
    '              </div>',
    '            </div>',
    '          </div>',
    '          <button onclick="openMerchOrder(\'poster\')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">',
    '            Order Decal',
    '          </button>',
    '        </div>',
    '      </div>',
    '    </div>',
    '  </div>',
    ''
  ];
  lines.splice(merchStart - 1, merchEnd - merchStart + 1, ...newMerchLines);
  console.log('Spliced merchandise section');
}

fs.writeFileSync('lanil-sports/index.html', lines.join('\n'), 'utf8');
console.log('Successfully updated html frame!');