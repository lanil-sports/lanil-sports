const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/index.html', 'utf8').split('\n');
let s=-1, e=-1;
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('function openCardModal')) s = i;
  if (s !== -1 && lines[i].includes('function downloadCard')) { e = i; break; }
}
console.log(lines.slice(s, e+10).map((x, i) => (i+s) + ': ' + x).join('\n'));