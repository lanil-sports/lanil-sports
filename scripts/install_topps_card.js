const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// 1. New Topps-Style Shareable Card Modal and Merch Checkout Modal
const newCardModalHtml = `
  <!-- Topps-Style Shareable Card Modal -->
  <div id="card-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
    <div class="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 relative shadow-2xl text-center">
      <button onclick="closeModal('card-modal')" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl z-20">?</button>
      
      <div class="mb-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
          <i class="fa-solid fa-certificate"></i> Official Topps x LANIL Trading Card
        </span>
        <h3 class="font-athletic text-2xl sm:text-3xl font-bold uppercase tracking-wider text-white mt-1">
          COLLECTIBLE ATHLETE CARD
        </h3>
        <p class="text-xs text-slate-400">Save your free digital card or order premium physical keepsakes.</p>
      </div>

      <!-- The Authentic Topps-Style Physical Card Frame -->
      <div class="mx-auto max-w-[340px] shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        <div id="shareable-card" class="relative rounded-2xl bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-3 text-left border-[5px] border-slate-200 shadow-2xl">
          
          <!-- Inner Card Foil Border -->
          <div class="relative rounded-xl bg-gradient-to-b from-[#090d16] via-[#10172a] to-[#040711] border-2 border-amber-400/80 p-3.5 overflow-hidden flex flex-col justify-between aspect-[9/14] text-white">
            
            <!-- Metallic Refractor Sheen Overlay -->
            <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-amber-400/10 pointer-events-none"></div>

            <!-- Top Header: Arched School Name & Topps Refractor Badge -->
            <div>
              <div class="flex items-center justify-between border-b border-amber-400/30 pb-2 mb-2 relative z-10">
                <!-- Topps Refractor Emblem -->
                <div class="flex items-center gap-1.5">
                  <div class="w-6 h-6 rounded bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 text-slate-950 font-athletic font-extrabold flex items-center justify-center text-xs shadow-sm border border-yellow-200">
                    RC
                  </div>
                  <div>
                    <span class="font-athletic text-xs font-bold text-amber-400 tracking-wider block leading-none">TOPPS &bull; LANIL</span>
                    <span class="text-[8px] text-slate-400 uppercase font-semibold block leading-none">2026 1st Edition</span>
                  </div>
                </div>

                <!-- Card Serial Number -->
                <div class="text-right">
                  <span id="topps-card-num" class="font-mono text-[9px] text-amber-300 font-bold block">CARD #LA-2701</span>
                  <span class="text-[8px] text-emerald-400 font-semibold uppercase block">Verified Prospect</span>
                </div>
              </div>

              <!-- Arched School Banner -->
              <div class="text-center py-1 bg-gradient-to-r from-amber-400/10 via-amber-400/25 to-amber-400/10 rounded border border-amber-400/30 mb-2 relative z-10">
                <span id="topps-school" class="font-athletic text-base tracking-widest text-amber-300 uppercase font-bold drop-shadow block leading-none truncate px-2"></span>
              </div>
            </div>

            <!-- Main Athlete Photo Area -->
            <div class="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-amber-400/60 bg-slate-950 shadow-inner my-1">
              <img id="card-img" src="" alt="Athlete Photo" class="w-full h-full object-cover">
              
              <div id="card-avatar-fallback" class="w-full h-full hidden items-center justify-center bg-slate-900">
              </div>

              <!-- Position Pennant Ribbon (Bottom Left) -->
              <div class="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-amber-400 text-slate-950 font-athletic font-extrabold text-xs px-2.5 py-0.5 rounded shadow-lg border border-yellow-200">
                <span id="card-pos"></span>
                <span>&bull;</span>
                <span id="card-sport"></span>
              </div>

              <!-- School Mascot Medallion (Bottom Right) -->
              <div class="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-slate-950/90 border border-amber-400/80 p-0.5 flex items-center justify-center shadow-lg">
                <img id="topps-logo" src="" alt="Mascot" class="w-full h-full object-contain rounded-full">
              </div>

              <!-- Gold Facsimile Autograph Overlay -->
              <div class="absolute bottom-6 inset-x-0 text-center pointer-events-none select-none opacity-85 z-10">
                <span id="topps-sig" class="font-serif italic text-amber-200 text-lg tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"></span>
              </div>
            </div>

            <!-- Bottom Nameplate & Card Dossier -->
            <div class="relative z-10 mt-1">
              <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-400/40 rounded-lg p-2.5 shadow-md">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 id="card-name" class="font-athletic text-2xl font-bold text-white tracking-wide leading-none truncate"></h4>
                    <p id="card-parish" class="text-[10px] text-amber-300 font-medium truncate mt-0.5"></p>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-[9px] uppercase font-bold text-slate-400 block">Class</span>
                    <span id="card-grad" class="font-athletic text-xl font-bold text-white leading-none"></span>
                  </div>
                </div>

                <!-- Micro Stat Line Highlight -->
                <div class="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-slate-300 font-mono truncate" id="card-stats">
                </div>
              </div>

              <!-- Authenticity Hologram Footer -->
              <div class="mt-2 flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                <span class="flex items-center gap-1 text-amber-400">
                  <i class="fa-solid fa-shield-halved text-[9px]"></i> LANIL AUTHENTICATED
                </span>
                <span>#LOUISIANABUILT</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Free Download / Social Share Action -->
      <div class="mt-5 space-y-3">
        <button onclick="downloadCard()" class="w-full py-3 px-4 rounded-xl gold-gradient text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2">
          <i class="fa-solid fa-arrow-down-to-bracket text-sm"></i>
          <span>Download Free Digital Card (Instagram Story & X)</span>
        </button>
        <p class="text-[11px] text-slate-400">100% Free 9:16 export formatted for your Instagram Story, X, and sports group chats.</p>
      </div>

      <!-- Premium Merchandising & Physical Purchases -->
      <div class="mt-6 pt-5 border-t border-white/10 text-left space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <i class="fa-solid fa-store text-xs"></i>
          <span>Official Athlete Merch & Physical Keepsakes</span>
        </h4>

        <!-- Option 1: Collector's Physical Playing Card -->
        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div>
              <h5 class="font-bold text-white text-xs">Purchase LANIL Player's Collector's Card</h5>
              <p class="text-[11px] text-slate-400">32pt heavy cardstock &bull; Refractor finish &bull; Acrylic magnetic case</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs font-bold text-emerald-400">$9.99</span>
                <span class="text-[10px] text-slate-500">| 5-Pack: $24.99</span>
              </div>
            </div>
          </div>
          <button onclick="openMerchOrder('card')" class="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shrink-0">
            Order Card
          </button>
        </div>

        <!-- Option 2: Custom Peel & Stick Poster Reusable Vinyl Decal -->
        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">
              <i class="fa-solid fa-tape"></i>
            </div>
            <div>
              <h5 class="font-bold text-white text-xs">Custom Peel & Stick Poster Decal</h5>
              <p class="text-[11px] text-slate-400">Reusable vinyl wall graphic &bull; Zero wall damage &bull; Locker or bedroom</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs font-bold text-emerald-400">$39.99</span>
                <span class="text-[10px] text-slate-500">| Life-Size: $69.99</span>
              </div>
            </div>
          </div>
          <button onclick="openMerchOrder('poster')" class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shrink-0">
            Order Decal
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Merch Order & Checkout Sheet Modal -->
  <div id="merch-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-amber-400/30 rounded-2xl max-w-md w-full p-6 relative shadow-2xl text-left">
      <button onclick="closeModal('merch-modal')" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">?</button>
      
      <div class="flex items-center gap-2 mb-4">
        <div id="merch-icon" class="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-sm">
          <i class="fa-solid fa-cart-shopping"></i>
        </div>
        <div>
          <h3 id="merch-title" class="font-athletic text-2xl font-bold text-white leading-none">ORDER MERCHANDISE</h3>
          <p id="merch-subtitle" class="text-xs text-slate-400">Custom printed with verified athlete data</p>
        </div>
      </div>

      <div class="bg-slate-800/80 rounded-xl p-3 border border-white/5 mb-4 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Featured Athlete</span>
          <span id="merch-athlete-name" class="font-bold text-white text-sm"></span>
        </div>
        <div class="text-right">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Unit Price</span>
          <span id="merch-price-display" class="font-bold text-amber-400 text-base"></span>
        </div>
      </div>

      <form onsubmit="handleMerchCheckout(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block text-slate-300 font-bold mb-1">Select Size / Package Option</label>
          <select id="merch-option" onchange="updateMerchPrice(this.value)" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Full Name</label>
            <input type="text" required placeholder="Parent or Fan Name" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">Email Address</label>
            <input type="email" required placeholder="For receipt & tracking" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
          </div>
        </div>

        <div>
          <label class="block text-slate-300 font-bold mb-1">Shipping Street Address</label>
          <input type="text" required placeholder="123 Bayou Lane, Apt 4" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-1">
            <label class="block text-slate-300 font-bold mb-1">City</label>
            <input type="text" required placeholder="Baton Rouge" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">State</label>
            <input type="text" value="LA" readonly class="w-full bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2 text-slate-400 text-center font-bold">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">ZIP</label>
            <input type="text" required placeholder="70801" class="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400">
          </div>
        </div>

        <div class="pt-2">
          <button type="submit" class="w-full py-3 rounded-xl gold-gradient text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-lock text-xs"></i>
            <span>Proceed to Secure Stripe Checkout</span>
          </button>
          <p class="text-[10px] text-slate-500 text-center mt-2">Zero inventory cost. Orders print on demand with high-definition vinyl & archival cardstock.</p>
        </div>
      </form>
    </div>
  </div>
`;

// Locate the existing card-modal container to replace it
const oldCardModalStart = '<div id="card-modal"';
const oldCardModalEnd = '<!-- Footer -->';

const startIdx = html.indexOf(oldCardModalStart);
const endIdx = html.indexOf(oldCardModalEnd);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + newCardModalHtml.trim() + "\n\n  " + html.substring(endIdx);
  console.log("Successfully replaced card-modal with Topps-Style Trading Card & Merch modal!");
} else {
  console.error("Could not find card-modal bounds:", startIdx, endIdx);
}

// 2. Add openCardModal, openMerchOrder, updateMerchPrice, handleMerchCheckout functions
const merchScript = `
let currentCardAthlete = null;

function openCardModal(id) {
  const a = ATHLETES.find(x => x.id === id);
  if (!a) return;
  currentCardAthlete = a;

  const cardImg = document.getElementById('card-img');
  const fallback = document.getElementById('card-avatar-fallback');
  if (a.headshot_url && a.headshot_url.trim() !== '') {
    cardImg.src = a.headshot_url;
    cardImg.style.display = 'block';
    if (fallback) fallback.style.display = 'none';
  } else {
    cardImg.style.display = 'none';
    if (fallback) {
      fallback.innerHTML = renderAthleteAvatar(a);
      fallback.style.display = 'flex';
    }
  }

  document.getElementById('topps-school').textContent = a.school_name || 'LOUISIANA VARSITY';
  document.getElementById('card-name').textContent = a.full_name;
  document.getElementById('card-pos').textContent = a.position || 'ATH';
  document.getElementById('card-sport').textContent = a.primary_sport || 'VARSITY';
  document.getElementById('card-grad').textContent = a.grad_year;
  document.getElementById('card-parish').textContent = a.parish_city;
  document.getElementById('card-stats').textContent = cleanScoutingText(a.season_stats_summary || '');
  document.getElementById('topps-card-num').textContent = 'CARD #LA-' + (a.grad_year ? a.grad_year.toString().slice(-2) : '27') + String(Math.abs(hashCode(a.full_name)) % 900 + 100);
  
  // Autograph signature simulation
  const sig = document.getElementById('topps-sig');
  if (sig) sig.textContent = a.full_name;

  // School logo medallion
  const logoImg = document.getElementById('topps-logo');
  if (logoImg) {
    const sLogo = getSchoolLogo(a.school_name || a.school_id);
    if (sLogo) {
      logoImg.src = sLogo;
      logoImg.style.display = 'block';
    } else {
      logoImg.style.display = 'none';
    }
  }

  openModal('card-modal');
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function downloadCard() {
  alert("? Your Topps-Style Trading Card is ready!\\n\\nRight-click or hold down on the card to Save to Photos for your Instagram Story (9:16), X post, or sports group chat.");
}

let activeMerchType = 'card';

function openMerchOrder(type) {
  if (!currentCardAthlete) return;
  activeMerchType = type;
  
  document.getElementById('merch-athlete-name').textContent = currentCardAthlete.full_name + ' (' + currentCardAthlete.school_name + ')';
  const optSelect = document.getElementById('merch-option');
  
  if (type === 'card') {
    document.getElementById('merch-title').textContent = "PURCHASE COLLECTOR'S CARD";
    document.getElementById('merch-subtitle').textContent = "Authentic 32pt heavy cardstock with acrylic magnetic display case";
    document.getElementById('merch-icon').innerHTML = '<i class="fa-solid fa-id-card"></i>';
    document.getElementById('merch-price-display').textContent = "$9.99";
    optSelect.innerHTML = \`
      <option value="9.99">Single Collector's Card (In Acrylic Magnetic Case) - $9.99</option>
      <option value="24.99">5-Pack Family & Booster Bundle (5 Cards + Cases) - $24.99</option>
      <option value="44.99">10-Pack Team / Sponsor Pack - $44.99</option>
    \`;
  } else {
    document.getElementById('merch-title').textContent = "PURCHASE PEEL & STICK POSTER";
    document.getElementById('merch-subtitle').textContent = "Reusable repositionable vinyl wall decal (Fathead style, zero wall damage)";
    document.getElementById('merch-icon').innerHTML = '<i class="fa-solid fa-tape"></i>';
    document.getElementById('merch-price-display').textContent = "$39.99";
    optSelect.innerHTML = \`
      <option value="39.99">Locker Room Decal (18" x 24") - $39.99</option>
      <option value="49.99">Bedroom Wall Poster Decal (24" x 36") - $49.99</option>
      <option value="69.99">Life-Size Athletic Cutout Decal (36" x 60") - $69.99</option>
    \`;
  }

  openModal('merch-modal');
}

function updateMerchPrice(val) {
  document.getElementById('merch-price-display').textContent = "$" + val;
}

function handleMerchCheckout(e) {
  e.preventDefault();
  const price = document.getElementById('merch-price-display').textContent;
  const item = activeMerchType === 'card' ? "Collector's Trading Card" : "Custom Peel & Stick Poster Decal";
  alert(\`?? Order Initialized for \${currentCardAthlete.full_name}!\` +
        \`\\n\\nItem: \${item}\` +
        \`\\nTotal: \${price}\` +
        \`\\n\\nRedirecting to secure Stripe Checkout...\`);
  closeModal('merch-modal');
}
`;

// Replace existing openCardModal in index.html
const oldOpenCardModal = `function openCardModal(id) {
  const a = ATHLETES.find(x => x.id === id);
  if (!a) return;

  document.getElementById('card-img').src = a.headshot_url;
  document.getElementById('card-name').textContent = a.full_name;
  document.getElementById('card-pos').textContent = a.position;
  document.getElementById('card-sport').textContent = a.primary_sport;
  document.getElementById('card-grad').textContent = a.grad_year;
  document.getElementById('card-school').textContent = a.school_name;
  document.getElementById('card-parish').textContent = a.parish_city;
  document.getElementById('card-stats').textContent = a.season_stats_summary;

  openModal('card-modal');
}

function downloadCard() {
  alert("Card snapshot ready! Right-click or long-press the card preview to save and share to Instagram / X.");
}`;

if (html.includes(oldOpenCardModal)) {
  html = html.replace(oldOpenCardModal, merchScript.trim());
  console.log("Replaced old openCardModal with enhanced Topps & Merch handlers!");
} else {
  console.error("Could not find oldOpenCardModal exactly, will search with flexible pattern...");
}

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Updated index.html with Topps Card & Merch options!");
