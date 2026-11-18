const fs = require('fs');
let s = fs.readFileSync('lanil-sports/scripts/apply_all_final.js', 'utf8');
s = s.replace(/'\) join\(/g, '\\').join(');
s = s.replace(/\'\) share\(/g, '\').share(');
fs.writeFileSync('lanil-sports/scripts/apply_all_final.js', s);
console.log('Fixed dots');