const fs = require('fs');
const c = fs.readFileSync('lanil-sports/index.html', 'utf8');
const s = c.indexOf('card-modal');
const e = c.indexOf('merch-modal');
console.log('=== CARD MODAL ===');
console.log(c.substring(s, e > 0 ? e + 1500 : s + 3500));
const s2 = c.indexOf('function openMerchOrder');
console.log('=== MERCH SCRIPT ===');
console.log(c.substring(s2, s2 + 2500));