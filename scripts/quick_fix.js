const fs = require('fs');
let s = fs.readFileSync('lanil-sports/scripts/apply_final_clean.js', 'utf8');
s = s.replaceAll('"\',\',', '"\',');
s = s.replaceAll('" x 17") - $39.99</option>\' + p', '" x 17") - $39.99</option>\' +');
s = s.replaceAll('") - $89.99</option>\' + p', '") - $89.99</option>\' +');
fs.writeFileSync('lanil-sports/scripts/apply_final_clean.js', s);
console.log('Quick fix applied');