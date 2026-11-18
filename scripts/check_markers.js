const fs = require('fs');
let c = fs.readFileSync('lanil-sports/index.html', 'utf8');
let s1 = c.indexOf('function openCardModal(id)');
let s2 = c.indexOf('function updateClass');
console.log('s1:', s1, 's2:', s2);