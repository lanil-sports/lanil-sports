const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'scripts', 'bible_slides_data_2.js');
let code = fs.readFileSync(filePath, 'utf8');

// Check Slide 8 content and add Revenue Sharing
const oldSlide8Grid = `          <div class="grid grid-cols-2 gap-3">
            <div class="glass p-3 rounded-xl border border-white/10">
              <div class="text-xs font-bold text-white uppercase">Varsity Blister Pack Figure</div>
              <div class="text-[11px] text-slate-400 mt-1">7" Polyresin figure in custom backing card with football accessories.</div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-white font-athletic text-xl font-bold">$49.99</span>
                <span class="text-emerald-400 text-[10px] font-semibold">62% Margin ($31 net)</span>
              </div>
            </div>

            <div class="glass p-3 rounded-xl border border-amber-400/40 bg-amber-500/5">
              <div class="text-xs font-bold text-amber-400 uppercase flex items-center gap-1">
                <i class="fa-solid fa-crown text-[10px]"></i> Deluxe Display Edition
              </div>
              <div class="text-[11px] text-slate-300 mt-1">Includes UV acrylic display box with laser-engraved metal base.</div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-amber-300 font-athletic text-xl font-bold">$79.99</span>
                <span class="text-emerald-400 text-[10px] font-semibold">68% Margin ($54 net)</span>
              </div>
            </div>
          </div>`;

const newSlide8RevShare = `          <!-- NIL & SCHOOL REVENUE SHARING SPLIT -->
          <div class="glass p-3 rounded-xl border border-emerald-400/30 bg-emerald-500/5">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-hand-holding-dollar"></i> Guaranteed Revenue Sharing Split
              </span>
              <span class="text-[10px] text-slate-400 font-mono">100% Act 810 Compliant</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <div class="text-[10px] text-slate-400 uppercase font-semibold">Player / Parent</div>
                <div class="font-athletic text-lg font-bold text-amber-400 leading-none my-0.5">20% NIL Royalty</div>
                <div class="text-[9px] text-slate-400">Direct deposit ($10–$16/unit)</div>
              </div>
              <div class="p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <div class="text-[10px] text-slate-400 uppercase font-semibold">School / Booster</div>
                <div class="font-athletic text-lg font-bold text-cyan-400 leading-none my-0.5">10% Team Fund</div>
                <div class="text-[9px] text-slate-400">Athletic gear & banquets</div>
              </div>
              <div class="p-2 rounded-lg bg-slate-900/80 border border-white/5">
                <div class="text-[10px] text-slate-400 uppercase font-semibold">LANIL Sports</div>
                <div class="font-athletic text-lg font-bold text-emerald-400 leading-none my-0.5">70% Production</div>
                <div class="text-[9px] text-slate-400">3D sculpt, packing & profit</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="glass p-3 rounded-xl border border-white/10">
              <div class="text-xs font-bold text-white uppercase">Varsity Blister Pack Figure</div>
              <div class="text-[11px] text-slate-400 mt-1">7" Polyresin figure in custom backing card with football accessories.</div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-white font-athletic text-xl font-bold">$49.99</span>
                <span class="text-emerald-400 text-[10px] font-semibold">62% Margin ($31 net)</span>
              </div>
            </div>

            <div class="glass p-3 rounded-xl border border-amber-400/40 bg-amber-500/5">
              <div class="text-xs font-bold text-amber-400 uppercase flex items-center gap-1">
                <i class="fa-solid fa-crown text-[10px]"></i> Deluxe Display Edition
              </div>
              <div class="text-[11px] text-slate-300 mt-1">Includes UV acrylic display box with laser-engraved metal base.</div>
              <div class="mt-2 flex items-center justify-between">
                <span class="text-amber-300 font-athletic text-xl font-bold">$79.99</span>
                <span class="text-emerald-400 text-[10px] font-semibold">68% Margin ($54 net)</span>
              </div>
            </div>
          </div>`;

if (code.includes(oldSlide8Grid)) {
  code = code.replace(oldSlide8Grid, newSlide8RevShare);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully added Revenue Sharing split to Slide 8 in bible_slides_data_2.js');
} else {
  console.log('Target grid not found in bible_slides_data_2.js');
}
