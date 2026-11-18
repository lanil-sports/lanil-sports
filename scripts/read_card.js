const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
console.log(lines.slice(170, 260).map((x, i) => (i+170) + ': ' + x).join('\n'));