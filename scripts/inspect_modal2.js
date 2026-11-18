const fs = require('fs');
const content = fs.readFileSync('lanil-sports/index.html', 'utf8');
const startModal = content.indexOf('id=" card-modal\');
const endModal = content.indexOf('id=\merch-modal\');
console.log('=== CARD MODAL FULL ===');
console.log(content.substring(startModal, endModal + 1500));
