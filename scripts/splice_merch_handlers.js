const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let lines = fs.readFileSync(htmlPath, "utf8").split("\n");

const startIdx = lines.findIndex(l => l.includes("function openCardModal(id) {"));
console.log("startIdx:", startIdx);

if (startIdx !== -1) {
  // Find where downloadCard ends
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("function downloadCard() {"));
  let closeIdx = -1;
  for (let i = endIdx; i < endIdx + 10; i++) {
    if (lines[i].trim() === "}") {
      closeIdx = i;
      break;
    }
  }
  console.log("closeIdx:", closeIdx);

  const merchScript = `let currentCardAthlete = null;

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
  alert("?? Order Initialized for " + currentCardAthlete.full_name + "!" +
        "\\n\\nItem: " + item +
        "\\nTotal: " + price +
        "\\n\\nRedirecting to secure Stripe Checkout...");
  closeModal('merch-modal');
}`;

  lines.splice(startIdx, (closeIdx - startIdx + 1), merchScript);
  fs.writeFileSync(htmlPath, lines.join("\n"), "utf8");
  console.log("Successfully spliced Topps and Merch script into index.html!");
}
