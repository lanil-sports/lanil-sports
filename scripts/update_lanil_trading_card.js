const fs = require('fs');

let html = fs.readFileSync('lanil-sports/index.html', 'utf8');

// 1. Remove LANIL x Topps mentions and keep LANIL
html = html.split('Official Topps x LANIL Trading Card').join('Official LANIL Collectible Trading Card');
let modalMentions = [
  'Topps-Style Shareable Card Modal',
  'The Authentic Topps-Style Physical Card Frame',
  'TOPPS &bull; LANIL',
  'Topps x LANIL',
  'Topps Refractor Badge',
  'Topps Refractor Emblem',
  'Topps-Style Trading Card is ready',
  'Topps-Style',
  'TOPPS',
  'Topps'
];
modalMentions.forEach(m => {
  html = html.split(m).join('LANIL');
});

html = html.split('LANIL &bull; LANIL').join('LANIL &bull; ATHLETICS');
html = html.split('Official LANIL Trading Card').join('Official LANIL Collectible Trading Card');

// 2. Remove RC and add LA
html = html.replace(/>\s*RC\s*<\/div>/g, '>LA</div>');

// 3. User says: "Where the Ryder Lyons at over the QB Fooball, that space should be reserved for the Player to add their signatures? thoughts?"
// Replace the old autograph block with an authentic Player Signature Zone
const newSignatureZone = `,            <!-- Dedicated Athlete Signature Zone (Directly Above Position Ribbon) -->
              <div class="autograph-zone absolute bottom-8 inset-x-2.5 z-20 pointer-events-auto">
                <div class="bg-black/75 backdrop-blur-md border border-amber-400/50 rounded-lg px-2.5 py-1.5 flex items-center justify-between shadow-[0_4p_16px_rgba(0,0,0,0.9)]">
                  <div class="flex-1 text-left">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono text-amber-400 font-black">X</span>
                      <span id="topps-sig" class="font-serif italic text-amber-200 text-base sm:text-lg font-bold tracking-wider drop-shadow-md leading-none"></span>
                    </div>
                    <span class="text-[7px] text-amber-400/80 uppercase tracking-widest font-mono block mt-0.5 leading-none">OFFICIAL ATHLETE SIGNATURE</span>
                  </div>
                  <button type="button" onclick="openSignaturePad()" title="Sign or customize autograph" class="px-2 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 shrink-0">
                    <i class="fa-solid fa-signature"></i> Sign
                  </button>
                </div>
              </div>`;

if (!html.includes('absolute bottom-8 inset-x-2.5')) {
  html = html.replace(/<div class="absolute bottom-6 inset-x-0[\s\S]*?<span id="topps-sig"[\s\S]*?<\/div>\s*<\/div>/, newSignatureZone + '\n            </div>');
}

// 4. Update the merchandise options
const newMerchSection = `       <!-- Option 1: Purchase LANIL Players Collector's Card (Bundles) -->
        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Collector's Card</h5>
                <span class="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase">32pt Cardstock</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Archival refractor finish &bull; Serialized &bull; Acrylic magnetic case included</p>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-xs font-extrabold text-white">$8.99 <span class="text-[10px] text-slate-400 font-normal">(1 card)</span></span>
                <span class="text-[11px] text-emerald-400 font-bold">&bull; 5 Cards: $34.99 <span class="text-[9px] text-emerald-300">(Save 22%)</span></span>
                <span class="text-[10px] text-slate-400">| 10 Cards: $59.99 | 20 Cards: $99.99</span>
              </div>
            </div>
          </div>
          <button onclick="openMerchOrder('card')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">
            Order Card
          </button>
        </div>

        <!-- Option 2: Purchase LANIL Players Custom Peel & Stick Poster Reusable Vinyl Wall Decal (Fathead RealBig Collection) -->
        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">
              <i class="fa-solid fa-tape"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Custom Peel &amp; Stick Poster Reusable Vinyl Wall Decal</h5>
                <span class="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase">RealBig&trade; Vinyl</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Removable &amp; Reusable &bull; High Grade Vinyl &bull; Precision Die-Cut &bull; Zero Wall Damage</p>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-xs font-extrabold text-white">$39.99 <span class="text-[10px] text-slate-400 font-normal">(Locker 10&quot;&times;17&quot; + 2 Decals)</span></span>
                <span class="text-[11px] text-emerald-400 font-bold">&bull; Medium: $59.99 <span class="text-[10px] text-slate-400 font-normal">(29&quot;&times;51&quot; + 4 Decals)</span></span>
                <span class="text-[11px] text-amber-300 font-bold">&bull; Life-Size: $89.99 <span class="text-[10px] text-slate-400 font-normal">(44&quot;&times;78&quot; + 8 Decals)</span></span>
              </div>
            </div>
          </div>
          <button onclick="openMerchOrder('poster')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">
            Order Decal
          </button>
        </div>`;

// Replace old merchandise block
html = html.replace(
  /<!-- Option 1: Collector's Physical Playing Card -->[\s\S]*?<\/div>\s*<\/div>\s+<!-- Merch Order/m,
  newMerchSection + '\n      </div>\n    </div>\n  </div>\n\n  <!-- Merch Order'
);

// 5. Update openMerchOrder in the JS
const newMerchFn = `function openMerchOrder(type) {
  if (!selectedAthlete) return;
  activeMerchType = type;
  
  document.getElementById('merch-athlete-name').textContent = selectedAthlete.full_name + ' (' + selectedAthlete.school_name + ')';
  const optSelect = document.getElementById('merch-option');
  
  if (type === 'card') {
    document.getElementById('merch-title').textContent = "PURCHASE LANIL PLAYERS COLLECTOR'S CARD";
    document.getElementById('merch-subtitle').textContent = "Authentic 32pt heavy cardstock with acrylic magnetic display case";
    document.getElementById('merch-icon').innerHTML = '<i class="fa-solid fa-id-card"></i>';
    document.getElementById('merch-price-display').textContent = "$8.99";
    optSelect.innerHTML = `
      <option value="8.99">1 Card (Single in Acrylic Magnetic Case) - $8.99</option>
      <option value="34.99">5 Cards Bundle [SAVE 22%] ($7.00/ea) - $34.99</option>
      <option value="59.99">10 Cards Booster Pack [SAVE 33%] ($6.00/ea) - $59.99</option>
      <option value="99.99">20 Cards Team & Family Case [SAVE 44%] ($5.00/ea) - $99.99</option>
    `;
  } else {
    document.getElementById('merch-title').textContent = "PURCHASE LANIL PLAYERS CUSTOM PEEL & STICK POSTER";
    document.getElementById('merch-subtitle').textContent = "Fathead-style RealBig™ Collection: Removable & Reusable Vinyl Wall Decal";
    document.getElementById('merch-icon').innerHTML = '<i class="fa-solid fa-tape"></i>';
    document.getElementById('merch-price-display').textContent = "$39.99";
    optSelect.innerHTML = `
      <option value="39.99">Small (Locker Size) + 2 Bonus Decals (10" x 17") - $39.99</option>
      <option value="59.99">Medium (Bedroom / Office) + 4 Bonus Decals (29" x 51") - $59.99</option>
      <option value="89.99">Large (Life-Size RealBig™) + 8 Bonus Decals (44" x 78") - $89.99</option>
    `;
  }

  openModal('merch-modal');
let_selected_price:}`;

html = html.replace(
  /function openMerchOrder\(type\)[\s\S]*?openModal\('merch-modal'\);\n}/,
  newMerchFn.split('let_selected_price:}').join($document.getElementById('merch-price-display').textContent = '$' + optSelect.value;
  optSelect.onchange = () => { document.getElementById('merch-price-display').textContent = '$' + optSelect.value; };
  }')
);

// 6. Add Signature Pad Modal & JS
const sigModalHtml = `
  <!-- Digital Player Signature Modal -->
  <div id="sig-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-amber-400/40 rounded-2xl max-w-md w-full p-5 relative shadow-2xl text-left">
      <button onclick="closeModal('sig-modal')" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">✕</button>
      
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-sm">
          <i class="fa-solid fa-signature"></i>
        </div>
        <div>
          <h3 class="font-athletic text-xl font-bold text-white leading-none">ATHLETE ON-CARD SIGNATURE</h3>
          <p class="text-xs text-slate-400">Student-Athlete or Parent Authentic Autograph</p>
        </div>
      </div>

      <p class="text-xs text-slate-300 mb-3">
        Personalize your LANIL trading card with your authentic script signature. You can type or customize below:
      </p>

      <div class="space-y-3">
        <div>
          <label class="block text-slate-400 text-[11px] font-bold mb-1 uppercase">Autograph Signature Text</label>
          <input type="text" id="sig-input-text" placeholder="e.g. Ryder Lyons #3" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-amber-300 font-serif italic text-base focus:outline-none focus:border-amber-400">
        </div>

        <div class="p-3 rounded-xl bg-slate-950 border border-white/10 text-center">
          <span class="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Card Preview</span>
          <span id="sig-preview-disp" class="font-serif italic text-amber-300 text-2xl tracking-widest font-bold"></span>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button onclick="savePlayerSignature()" class="flex-1 py-2.5 rounded-xl gold-gradient text-slate-950 font-bold text-xs hover:brightness-110 shadow transition">
            Apply to Card
          </button>
          <button onclick="closeModal('sig-modal')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>`;

if (!html.includes('id="sig-modal"')) {
  html = html.replace('<!-- Merch Order & Checkout Sheet Modal -->', sigModalHtml + '\n\n  <!-- Merch Order & Checkout Sheet Modal --');
}

const sigFunctions = `
function openSignaturePad() {
  if (!selectedAthlete) return;
  const sigInput = document.getElementById("sig-input-text");
  const sigDisp = document.getElementById("sig-preview-disp");
  const curSig = document.getElementById("topps-sig");
  const initial = (curSig && curSig.textContent) ? curSig.textContent : selectedAthlete.full_name;
  if (sigInput) sigInput.value = initial;
  if (sigDisp) sigDisp.textContent = initial;
  if (sigInput) {
    sigInput.oninput = function() {
      if (sigDisp) sigDisp.textContent = sigInput.value || selectedAthlete.full_name;
    };
  }
  openModal("sig-modal");
}

function savePlayerSignature() {
  const sigInput = document.getElementById("sig-input-text");
  const val = (sigInput && sigInput.value.trim()) ? sigInput.value.trim() : (selectedAthlete ? selectedAthlete.full_name : "");
  const curSig = document.getElementById("topps-sig");
  if (curSig) curSig.textContent = val;
  closeModal("sig-modal");
}
`f;

if (!html.includes('function openSignaturePad')) {
  html = html.replace('function openCardModal', sigFunctions + '\n\nfunction openCardModal');
}


fs.writeFileSync('lanil-sports/index.html', html, 'utf8');
console.log('SUCCESS: All LANIL updates successfully applied! Removed TOPPS, set RC to LA, player signature zone added over QB Football, and Fathead decals installed!');
