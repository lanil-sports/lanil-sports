const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
console.log(lines.slice(160, 260).join('\n'));