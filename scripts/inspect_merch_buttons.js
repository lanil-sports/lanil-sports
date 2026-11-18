const fs = require('fs');
const lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
console.log(lines.slice(265, 335).join('\n'));