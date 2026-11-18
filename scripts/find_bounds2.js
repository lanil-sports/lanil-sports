const fs = require('fs');
const lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('card-modal')) console.log('Found card-modal at line', i, lines[i].trim());
  if (lines[i].includes('merch-modal')) console.log('Found merch-modal at line', i, lines[i].trim());
}