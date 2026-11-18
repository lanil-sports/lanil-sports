const fs = require('fs');
const lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
console.log('Lines 315 to 420:');
console.log(lines.slice(315, 420).join('\n'));