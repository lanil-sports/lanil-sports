const fs = require('fs');

const part1 = 
  <!-- Topps NOW & Fathead RealBig Shareable Athlete Showcase Modal -->
  <div id=" card-modal\ class=\fixed inset-0 z-50 bg-black/90 backdrop-blur-md hidden flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto\>
 <div class=\bg-slate-900 border border-white/15 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto p-4 sm:p-6 md:p-8 relative shadow-2xl text-left\>
 <button onclick=\closeModal card-modal \ class=\absolute top-4 right-4 text-slate-400 hover:text-white text-2xl z-30 transition w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center\>?</button>

 <!-- Breadcrumbs -->
 <div class=\flex items-center gap-2 text-xs text-slate-400 mb-4 pb-3 border-b border-white/10\>
 <span class=\text-slate-500\>Home</span>
 <span>/</span>
 <span class=\text-slate-500\>LANIL Collectibles</span>
 <span>/</span>
 <span id=\topps-breadcrumb-name\ class=\text-amber-400 font-semibold\>Athlete Showcase</span>
 </div>

 <div class=\grid grid-cols-1 lg:grid-cols-12 gap-8 items-start\>
 
 <!-- LEFT COLUMN: Interactive Card & Decal Stage -->
 <div class=\lg:col-span-5 flex flex-col items-center\>
 
 <!-- View Switcher Pills -->
 <div class=\inline-flex p-1 rounded-xl bg-slate-800/90 border border-white/10 mb-4 text-xs font-bold\>
 <button id=\tab-btn-front\ onclick=\switchCardView front \ class=\px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 shadow transition flex items-center gap-1.5\>
 <i class=\fa-solid fa-id-card\></i> Card Front
 </button>
 <button id=\tab-btn-back\ onclick=\switchCardView back \ class=\px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1.5\>
 <i class=\fa-solid fa-rotate\></i> Card Back
 </button>
 <button id=\tab-btn-decal\ onclick=\switchCardView decal \ class=\px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1.5\>
 <i class=\fa-solid fa-person-running\></i> RealBig™ Decal
 </button>
 </div>
;
fs.writeFileSync('lanil-sports/scripts/part1.js', part1);
