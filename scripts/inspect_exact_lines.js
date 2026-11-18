const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
console.log('Line 163:', lines[162]);
console.log('Line 186:', lines[185]);
console.log('Line 189:', lines[188]);
console.log('Line 202-204:', lines.slice(201, 205).join(' |'));
console.log('Line 214-230:', lines.slice(213, 231).join('\n'));