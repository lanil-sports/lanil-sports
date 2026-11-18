const fs = require('fs');
let s = fs.readFileSync('lanil-sports/index.html', 'utf8');

// 1. Remove TOPPS and set LA
includes: {
  s = s.replaceAll('Official Topps x LANIL', 'Official LANIL Collectible');
  s = s.replaceAll('Topps-Style', 'LANIL');
  s = s.replaceAll('TOPPS &bull; LANIL', 'LANIL &bull; ATHLETICS');
  s = s.replaceAll('Topps x LANIL', 'LANIL Official');
  s = s.replaceAll('TOPPS', 'LANIL');
  s = s.replaceAll('Topps', 'LANIL');
  s = s.replace(/>\s*RC\s*<\/div>/g, '>LA</div>');
}


// 2. User: "Where National Showcase/Folsom at, remove that. Add Quarterback there."
// Update banner above picture to be Athlete Position Banner
if (s.includes('id="topps-school"')) {
  s = s.replace(
    '<!-- Arched School Banner -->',
    '<!-- Athlete Position Title Banner -->'
  );
}

// 3. User: "Remove the QB * Football from the picture. The only thing that should be on the face of the Player is their signature and the Football icon at the Right Corner."
let photoSectionRegex = /<!-- Position Pennant Ribbon \(Bottom Left\) -->[\s\S]*?<!-- Bottom Nameplate/;

const newFaceElements = `<!-- Dedicated Player Signature (Directly on Face of Card) -->
              <div class="absolute bottom-2.5 left-2.5 right-12 z-20 pointer-events-auto">
                <div class="bg-black/60 backdrop-blur-md border border-amber-400/40 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-[0_4p_16px_rgba(0,0,0,0.9)]">
                  <div class="flex-1 text-left flex items-center gap-1.5 truncate">
                    <span class="text-[9px] font-mono text-amber-400 font-black">X</span>
                    <span id="topps-sig" class="font-serif italic text-amber-200 text-base sm:text-lg font-bold tracking-wider drop-shadow-md leading-none truncate"></span>
                  </div>
                  <button type="button" onclick="openSignaturePad()" title="Sign or customize autograph" class="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 shrink-0 ml-1">
                    <i class="fa-solid fa-signature"></i> Sign
                  </button>
                </div>
              </div>

              <!-- Sport Icon Emblem (Bottom Right Corner) -->
              <div id="card-sport-badge" class="absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center text-sm shadow-[0_2p_8px_rgba(0,0,0,0.9)] select-none">
                <span id="card-sport-emoji">🏈</span>
              </div>
            </div>

            <!-- Bottom Nameplate`;

if (photoSectionRegex.test(s)) {
  s = s.replace(photoSectionRegex, newFaceElements);
  console.log('Player face updated successfully');
}

// 4. Update merchandise text
let opt1Regex = /<h5 class="font-bold text-white text-xs">Purchase LANIL Player's Collector's Card<\/h5>/;
if (opt1Regex.test(s)) {
  s = s.replace(opt1Regex, '<h5 class="font-bold text-white text-xs">Purchase LANIL Players Collector\'s Card</h5>');
}

fs.writeFileSync('lanil-sports/index.html', s, 'utf8');
console.log('Patch 1 successfully applied!');