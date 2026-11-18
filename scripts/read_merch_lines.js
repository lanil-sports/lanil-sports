const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
console.log(lines.slice(270, 335).map((x, i) => (i+270) + ': ' + x).join('\n'));