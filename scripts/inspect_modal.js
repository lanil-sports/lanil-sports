const fs = require('fs');
const content = fs.readFileSync('lanil-sports/index.html', 'utf8');
const startModal = content.indexOf('card-modal');
console.log('=== CARD MODAL HTML ===');
console.log(content.substring(startModal - 15, startModal + 2500));
const startScript = content.indexOf('function openCardModal');
console.log('=== OPEN CARD MODAL JS ===');
console.log(content.substring(startScript, startScript + 3500));
