const fs = require('fs');
const lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
let modalStart = -1, modalEnd = -1, jsStart = -1, jsEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id= card-modal')) modalStart = i;
  if (modalStart !== -1 && lines[i].includes('id=merch-modal')) { modalEnd = i; break; }
}
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function openCardModal')) jsStart = i;
  if (jsStart !== -1 && lines[i].includes('function updateClass')) { jsEnd = i; break; }
}
console.log('modalStart:', modalStart, 'modalEnd:', modalEnd);
console.log('jsStart:', jsStart, 'jsEnd:', jsEnd);