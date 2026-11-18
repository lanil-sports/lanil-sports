const fs = require('fs');
let lines = fs.readFileSync('lanil-sports/scripts/apply_all_final.js', 'utf8').split('\n');
lines[5] = "html = html.split('Official Topps x LANIL Trading Card').join('Official LANIL Collectible Trading Card');";
fs.writeFileSync('lanil-sports/scripts/apply_all_final.js', lines.join('\n'));
console.log('Line 6 fixed perfectly');