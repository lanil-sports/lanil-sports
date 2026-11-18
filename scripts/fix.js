const fs = require('fs');
let s = fs.readFileSync('lanil-sports/scripts/apply_all_final.js', 'utf8');
s = s.split(") join(").join(").join(");
fs.writeFileSync('lanil-sports/scripts/apply_all_final.js', s);
console.log('Fixed successfully');