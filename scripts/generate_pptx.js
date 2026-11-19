const { pptx } = require('./pptx_base');
const { buildSlides1 } = require('./pptx_slides_1');
const { buildSlides2 } = require('./pptx_slides_2');
const { buildSlides3 } = require('./pptx_slides_3');
const { buildSlides4 } = require('./pptx_slides_4');
const fs = require('fs');
const path = require('path');

console.log('Building Slide Set 1 (Slides 1-3)...');
buildSlides1();
console.log('Building Slide Set 2 (Slides 4-6)...');
buildSlides2();
console.log('Building Slide Set 3 (Slides 7-9)...');
buildSlides3();
console.log('Building Slide Set 4 (Slides 10-16)...');
buildSlides4();

const out1 = path.join(__dirname, '..', 'LANIL_SPORTS_BIBLE.pptx');
const out2 = path.join(__dirname, '..', '..', 'LANIL_SPORTS_BIBLE.pptx');

pptx.writeFile({ fileName: out1 }).then(() => {
  console.log('✅ Generated PowerPoint Bible at:', out1);
  fs.copyFileSync(out1, out2);
  console.log('✅ Copied PowerPoint Bible to root:', out2);
}).catch(err => {
  console.error('❌ Error generating PPTX:', err);
});
