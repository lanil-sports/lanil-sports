const fs = require('fs');
let html = fs.readFileSync('lanil-sports/index.html', 'utf8');

html = html.replaceAll('Official Topps x LANIL Trading Card', 'Official LANIL Collectible Trading Card');
html = html.replaceAll('Topps-Style Shareable Card Modal', 'LANIL Shareable Athlete Card Modal');
html = html.replaceAll('The Authentic Topps-Style Physical Card Frame', 'The Authentic LANIL Physical Card Frame');
html = html.replaceAll('TOPPS &bull; LANIL', 'LANIL &bull; ATHLETICS');
html = html.replaceAll('Topps x LANIM', 'LANIL Official');
html = html.replaceAll('Topps Refractor Badge', 'LANIL Refractor Badge');
html = html.replaceAll('Topps Refractor Emblem', 'LANIL Emblem');
html = html.replaceAll('Topps-Style Trading Card is ready', 'LANIL Trading Card is ready');
html = html.replaceAll('TOPPS', 'LANIL');
html = html.replaceAll('Topps', 'LANIL');

html = html.replace(/>\s*RC\s*<\/div>/g, '>LA</div>');

const newSigBlock = '              <!-- Dedicated Player Signature Zone (Directly Above Position Ribbon) -->\n' +
+ '              <div class="absolute bottom-8 inset-x-2.5 z-20 pointer-events-auto">\n' +
+ '                <div class="bg-black/75 backdrop-blur-md border border-amber-400/50 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-[0_4p_16px_rgba(0,0,0,0.9)]">\n' +
+ '                  <div class="flex-1 text-left">\n' +
+ '                    <div class="flex items-center gap-1.5">\n' +
+ '                      <span class="text-[9px] font-mono text-amber-400 font-black">X</span>\n' +
+ '                      <span id="topps-sig" class="font-serif italic text-amber-200 text-base sm:text-lg font-bold tracking-wider drop-shadow-md leading-none"></span>\n' +
+ '                    </div>\n' +
+ '                    <span class="text-[7px] text-amber-400/80 uppercase tracking-widest font-mono block mt-0.5 leading-none">OFFICAL ATHLETE SIGNATURE</span>\n' +
+ '                  </div>\n' +
+ '                  <button type="button" onclick="openSignaturePad()" title="Sign or customize autograph" class="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 shrink-0">\n' +
+ '                    <i class="fa-solid fa-signature"></i> Sign\n' +
+ '                  </button>\n' +
+ '                </div>\n' +
+ '              </div>';

html = html.replace(/<!-- Gold Facsimile Autograph Overlay -->[\s\S]*?<span id="topps-sig"[\s\S]*?<\/div>\s+<\/div>/, newSigBlock + '\n            </div>');

const newSportBadge = '            <!-- Sport Icon Emblem (Bottom Right) -->\n' +
+ '              <div id="card-sport-icon-badge" class="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center text-sm shadow-[0_2p_8px_rgba(0,0,0,0.9)] select-none">\n' +
+ '                <span id="card-sport-emoji">ðŸ‡</span>\n' +
+ '              </div>';

html = html.replace(/<!-- School Mascot Medallion \(Bottom Right\) -->[\s\S]*?<img id="topps-logo"[s\S]*?<\/div>/, newSportBadge);

const newMerchSection = '        <!-- Option 1: Purchase LANIL Players Collector\'s Card (Bundles) -->\n' +
+ '        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">\n' +
+ '          <div class="flex items-center gap-3">\n' +
+ '            <div class="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl shrink-0">\n' +
+ '              <i class="fa-solid fa-id-card"></i>\n' +
+ '            </div>\n' +
+ '            <div>\n' +
+ '              <div class="flex items-center gap-1.5">\n' +
+ '                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Collector\'s Card</h5>\n' +
+ '                <span class="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase">32pt Cardstock</span>\n' +
+ '              </div>\n' +
+ '              <p class="text-[11px] text-slate-400 mt-0.5">Archival refractor finish &bull; Serialized &bull; Acrylic magnetic case included</p>\n' +
+ '              <div class="flex flex-wrap items-center gap-2 mt-1.5">\n' +
+ '                <span class="text-xs font-extrabold text-white">$8.99 <span class="text-[10px] text-slate-400 font-normal">(1 card)</span></span>\n' +
+ '                <span class="text-[11px] text-emerald-400 font-bold">&bull; 5 Cards: $34.99 <span class="text-[9px] text-emerald-300">(Save 22%)</span></span>\n' +
+ '                <span class="text-[10px] text-slate-400">| 10 Cards: $59.99 | 20 Cards: $99.99</span>\n' +
+ '              </div>\n' +
+ '            </div>\n' +
+ '          </div>\n' +
+ '          <button onclick="openMerchOrder('card')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">\n' +
+ '            Order Card\n' +
+ '          </button>\n' +
+ '        </div>\n\n' +
+ '        <!-- Option 2: Purchase LANIL Players Custom Peel & Stick Poster Reusable Vinyl Wall Decal (Fathead RealBig Collection) -->\n' +
+ '        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">\n' +
+ '          <div class="flex items-center gap-3">\n' +
+ '            <div class="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">\n' +
+ '              <i class="fa-solid fa-tape"></i>\n' +
+ '            </div>\n' +
+ '            <div>\n' +
+ '              <div class="flex items-center gap-1.5">\n' +
+ '                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Custom Peel &amp; Stick Poster Reusable Vinyl Wall Decal</h5>\n' +
+ '                <span class="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase">RealBig&trade; Vinyl</span>\n' +
+ '              </div>\n' +
+ '              <p class="text-[11px] text-slate-400 mt-0.5">Removable &amp; Reusable &bull; High Grade Vinyl &bull; Precision Die-Cut &bull; Zero Wall Damage</p>\n' +
+ '              <div class="flex flex-wrap items-center gap-2 mt-1.5">\n' +
+ '                <span class="text-xs font-extrabold text-white">$39.99 <span class="text-[10px] text-slate-400 font-normal">(Locker 10"&times;17" + 2 Decals)</span></span>\n' +
+ '                <span class="text-[11px] text-emerald-400 font-bold">&bull; Medium: $59.99 <span class="text-[10px] text-slate-400 font-normal">(29"&times;51" + 4 Decals)</span></span>\n' +
+ '                <span class="text-[11px] text-amber-300 font-bold">&bull; Life-Size: $89.99 <span class="text-[10px] text-slate-400 font-normal">(44"&times;78" + 8 Decals)</span></span>\n' +
+ '              </div>\n' +
+ '            </div>\n' +
+ '          </div>\n' +
+ '          <button onclick="openMerchOrder('poster')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">\n' +
+ '            Order Decal\n' +
+ '          </button>\n' +
+ '        </div>';

html = html.replace(/<!-- Option 1: Collector's Physical Playing Card -->[\s\S]*?<\/div>\s*<\/div>\s+<!-- Merch Order/m, newMerchSection + '\n      </div>\n    </div>\n  </div>\n\n  <!-- Merch Order');

const newMerchFn = 'function openMerchOrder(type) {\n\' +
+ '  if (!selectedAthlete && !currentCardAthlete) return;\n' +
+ '  const athlete = currentCardAthlete || selectedAthlete;\n' +
+ '  activeMerchType = type;\n' +
+ '  \n' +
+ '  document.getElementById("merch-athlete-name").textContent = athlete.full_name + " (" + athlete.school_name + ")";\n' +
+ '  const optSelect = document.getElementById("merch-option");\n' +
+ '  \n' +
+ '  if (type === "card") {\n' +
+ '    document.getElementById("merch-title").textContent = "PURGHASE LANIL PLAYERS COLLECTOR\'S CARD";\n' +
+ '    document.getElementById("merch-subtitle").textContent = "Authentic 32pt heavy cardstock with acrylic magnetic display case";\n' +
+ '    document.getElementById("merch-icon").innerHTML = \'<i class="fa-solid fa-id-card"></i>\';\n' +
+ '    document.getElementById("merch-price-display").textContent = "$8.99";\n' +
+ '    optSelect.innerHTML = \'<option value="8.99">1 Card (Single in Acrylic Magnetic Case) - $8.99</option>\' +\n' +
+ '      \'<option value="34.99">5 Cards Bundle [SAVE 22%] ($7.00/ea) - $34.99</option>\' +\n' +
+ '      \'<option value="59.99">10 Cards Booster Pack [SAVE 33%] ($6.00/ea) - $59.99</option>\' +\n' +
+ '      \'<option value="99.99">20 Cards Team & Family Case [SAVE 44%] ($5.00/ea) - $99.99</option>\';\n' +
+ '  } else {\n' +
+ '    document.getElementById("merch-title").textContent = "PURGHASE PEEL & STICK REUSABLE VINYL WALL DECAL";\n' +
+ '    document.getElementById("merch-subtitle").textContent = "Fathead RealBigâŠ Collection: Removable & Reusable, High Grade Vinyl, Precision Die-Cut";\n' +
+ '    document.getElementById("merch-icon").innerHTML = \'<i class="fa-solid fa-tape"></i>\';\n' +
+ '    document.getElementById("merch-price-display").textContent = "$39.99";\n' +
+ '    optSelect.innerHTML = \'<option value="39.99">Small (Locker Size) + 2 Bonus Decals (10" x 17") - $39.99</option>\' +\n' +
+ '      \'<option value="59.99">Medium (Bedroom / Office) + 4 Bonus Decals (29" x 51") - $59.99</option>\' +\n' +
+ '      \'<option value="89.99">Large (Life-Size RealBigâ„¢) + 8 Bonus Decals (44" x 78") - $89.99</option>\';\n' +
+ '  }\n\n' +
+ '  openModal("merch-modal");\n' +
+ '  optSelect.onchange = () => { document.getElementById("merch-price-display").textContent = "$" + optSelect.value; };\n' +
+ '}';

html = html.replace(/function openMerchOrder\(type\)[\s\S]*?openModal\('merch-modal'\);\n}/, newMerchFn);

const sportMapLogic = '  // Sport Icon Emblem Selection from Sports Icon Collection\n' +
+ '  const sportEmojiEl = document.getElementById("card-sport-emoji");\n' +
+ '  if (sportEmojiEl) {\n' +
+ '    const s = (a.primary_sport || "").toLowerCase();\n' +
+ '    const sportEmojis = {\n' +
+ '      "football": "ðŸˆ",\n' +
+ '      "basketball": "ðŸ€",\n' +
+ '      "baseball": "âš¾'",\n' +
+ '      "soccer": "âš½",\n' +
+ '      "volleyball": 'å€",\n' +
+ '      "tennis": "ðŸŒ¾",\n' +
+ '      "golf": "ðŸŽç½",\n' +
+ '      "hockey": 'å’",\n' +
+ '      "lacrosse": 'å¥'ˆ±q¸œ€¬(¬€œ€€€€€€‰ÍÝ¥µµ¥¹œˆè€Ÿ–>(ˆ±q¸œ€¬(¬€œ€€€€€€‰ÝÉ•ÍÑ±¥¹œˆè€‹Â~òðˆ±q¸œ€¬(¬€œ€€€€€€‰ÑÉ…¬€˜™¥•±ˆè€‹Â~>ˆ±q¸œ€¬(¬€œ€€€€€€‰ÑÉ…¬ˆè€‹Â~>ˆ±q¸œ€¬(¬€œ€€€€€€‰Í½™Ñ‰…±°ˆè€Ÿ–2øˆ±q¸œ€¬(¬€œ€€€€€€‰‰…‘µ¥¹Ñ½¸ˆè€‹Â~>àˆ±q¸œ€¬(¬€œ€€€€€€‰‰½á¥¹œˆè€Ÿ–>”‰q¸œ€¬(¬€œ€€€ôíq¸œ€¬(¬€œ€€€ÍÁ½ÉÑµ½©¥°¹Ñ•áÑ½¹Ñ•¹Ð€ôÍÁ½ÉÑµ½©¥ÍmÍtñð€‹Â~>ˆíq¸œ€¬(¬€œ€õq¸œì()¥˜€ …¡Ñµ°¹¥¹±Õ‘•Ì …ÉµÍÁ½ÉÐµ•µ½©¤œ¤¤ì(€¡Ñµ°€ô¡Ñµ°¹É•Á±…” ‰½Á•¹5½‘…° …Éµµ½‘…°œ¤ìˆ°ÍÁ½ÉÑ5…Á1½¥Œ€¬€‰q¸€½Á•¹5½‘…° …Éµµ½‘…°œ¤ìˆ¤ì)ô()½¹ÍÐÍ¥5½‘…±!Ñµ°€ô€œ€€ð„´´¥¥Ñ…°A±…å•ÈM¥¹…ÑÕÉ”5½‘…°€´´ùq¸œ€¬(¬€œ€€ñ‘¥Ø¥ô‰Í¥œµµ½‘…°ˆ±…ÍÌô‰™¥á•¥¹Í•Ð´Àè´ÔÀ‰œµ‰±…¬¼àÔ‰…­‘É½Àµ‰±ÕÈµµ¡¥‘‘•¸™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•ÈÀ´Ðˆùq¸œ€¬(¬€œ€€€€ñ‘¥Ø±…ÍÌô‰‰œµÍ±…Ñ”´äÀÀ‰½É‘•È‰½É‘•Èµ…µ‰•È´ÐÀÀ¼ÐÀÉ½Õ¹‘•´Éá°µ…àµÜµµÜµ™Õ±°À´ÔÉ•±…Ñ¥Ù”Í¡…‘½Ü´Éá°Ñ•áÐµ±•™Ðˆùq¸œ€¬(¬€œ€€€€€€ñ‰ÕÑÑ½¸½¹±¥¬ô‰±½Í•5½‘…° Í¥œµµ½‘…°œ¤ˆ±…ÍÌô‰…‰Í½±ÕÑ”Ñ½À´ÐÉ¥¡Ð´ÐÑ•áÐµÍ±…Ñ”´ÐÀÀ¡½Ù•ÈéÑ•áÐµÝ¡¥Ñ”Ñ•áÐµá°ˆûŠrTð½‰ÕÑÑ½¸ùq¸œ€¬(¬€œ€€€€€q¸œ€¬(¬€œ€€€€€€ñ‘¥Ø±…ÍÌô‰™±•à¥Ñ•µÌµ•¹Ñ•È…À´Èµˆ´Ìˆùq¸œ€¬(¬€œ€€€€€€€€ñ‘¥Ø±…ÍÌô‰Ü´à ´àÉ½Õ¹‘•µ±œ‰œµ…µ‰•È´ÐÀÀ¼ÈÀÑ•áÐµ…µ‰•È´ÐÀÀ™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•ÈÑ•áÐµÍ´ˆùq¸œ€¬(¬€œ€€€€€€€€€€ñ¤±…ÍÌô‰™„µÍ½±¥™„µÍ¥¹…ÑÕÉ”ˆøð½¤ùq¸œ€¬(¬€œ€€€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€€€€€ñ‘¥Øùq¸œ€¬(¬€œ€€€€€€€€€€ñ Ì±…ÍÌô‰™½¹Ðµ…Ñ¡±•Ñ¥ŒÑ•áÐµá°™½¹Ðµ‰½±Ñ•áÐµÝ¡¥Ñ”±•…‘¥¹œµ¹½¹”ˆùQ!1Q=8µIM%9QUIð½ Ìùq¸œ€¬(¬€œ€€€€€€€€€€ñÀ±…ÍÌô‰Ñ•áÐµáÌÑ•áÐµÍ±…Ñ”´ÐÀÀˆùMÑÕ‘•¹ÐµÑ¡±•Ñ”½ÈA…É•¹ÐÕÑ¡•¹Ñ¥ŒÕÑ½É…Á ð½Àùq¸œ€¬(¬€œ€€€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€€€ñÀ±…ÍÌô‰Ñ•áÐµáÌÑ•áÐµÍ±…Ñ”´ÌÀÀµˆ´Ìˆùq¸œ€¬(¬€œ€€€€€€€A•ÉÍ½¹…±¥é”å½ÕÈ19%0ÑÉ…‘¥¹œ…ÉÝ¥Ñ å½ÕÈ…ÕÑ¡•¹Ñ¥ŒÍÉ¥ÁÐÍ¥¹…ÑÕÉ”¸e½Ô…¸ÑåÁ”½ÈÕÍÑ½µ¥é”‰•±½Üéq¸œ€¬(¬€œ€€€€€€ð½Àùq¸œ€¬(¬€œ€€€€€€ñ‘¥Ø±…ÍÌô‰ÍÁ…”µä´Ìˆùq¸œ€¬(¬€œ€€€€€€€€ñ‘¥Øùq¸œ€¬(¬€œ€€€€€€€€€€ñ±…‰•°±…ÍÌô‰‰±½¬Ñ•áÐµÍ±…Ñ”´ÐÀÀÑ•áÐµlÄÅÁát™½¹Ðµ‰½±µˆ´ÄÕÁÁ•É…Í”ˆùÕÑ½É…Á M¥¹…ÑÕÉ”Q•áÐð½±…‰•°ùq¸œ€¬(¬€œ€€€€€€€€€€ñ¥¹ÁÕÐÑåÁ”ô‰Ñ•áÐˆ¥ô‰Í¥œµ¥¹ÁÕÐµÑ•áÐˆÁ±…•¡½±‘•Èô‰”¹œ¸Iå‘•È1å½¹Ì€ŒÌˆ±…ÍÌô‰Üµ™Õ±°‰œµÍ±…Ñ”´àÀÀ‰½É‘•È‰½É‘•ÈµÝ¡¥Ñ”¼ÄÀÉ½Õ¹‘•µá°Áà´ÌÁä´ÈÑ•áÐµ…µ‰•È´ÌÀÀ™½¹ÐµÍ•É¥˜¥Ñ…±¥ŒÑ•áÐµ‰…Í”™½ÕÌé½ÕÑ±¥¹”µ¹½¹”™½ÕÌé‰½É‘•Èµ…µ‰•È´ÐÀÀˆùq¸œ€¬(¬€œ€€€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€€€€€ñ‘¥Ø±…ÍÌô‰À´ÌÉ½Õ¹‘•µá°‰œµÍ±…Ñ”´äÔÀ‰½É‘•È‰½É‘•ÈµÝ¡¥Ñ”¼ÄÀÑ•áÐµ•¹Ñ•Èˆùq¸œ€¬(¬€œ€€€€€€€€€€ñÍÁ…¸±…ÍÌô‰Ñ•áÐµlÄÁÁátÑ•áÐµÍ±…Ñ”´ÔÀÀÕÁÁ•É…Í”ÑÉ…­¥¹œµÝ¥‘•È‰±½¬µˆ´Äˆù…ÉAÉ•Ù¥•Üð½ÍÁ…¸ùq¸œ€¬(¬€œ€€€€€€€€€€ñÍÁ…¸¥ô‰Í¥œµÁÉ•Ù¥•Üµ‘¥ÍÀˆ±…ÍÌô‰™½¹ÐµÍ•É¥˜¥Ñ…±¥ŒÑ•áÐµ…µ‰•È´ÌÀÀÑ•áÐ´Éá°ÑÉ…­¥¹œµÝ¥‘•ÍÐ™½¹Ðµ‰½±ˆøð½ÍÁ…¸ùq¸œ€¬(¬€œ€€€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€€€€€ñ‘¥Ø±…ÍÌô‰™±•à¥Ñ•µÌµ•¹Ñ•È…À´ÈÁÐ´Èˆùq¸œ€¬(¬€œ€€€€€€€€€€ñ‰ÕÑÑ½¸½¹±¥¬ô‰Í…Ù•A±…å•ÉM¥¹…ÑÕÉ” ¤ˆ±…ÍÌô‰™±•à´ÄÁä´È¸ÔÉ½Õ¹‘•µá°½±µÉ…‘¥•¹ÐÑ•áÐµÍ±…Ñ”´äÔÀ™½¹Ðµ‰½±Ñ•áÐµáÌ¡½Ù•Èé‰É¥¡Ñ¹•ÍÌ´ÄÄÀÍ¡…‘½ÜÑÉ…¹Í¥Ñ¥½¸ˆùq¸œ€¬(¬€œ€€€€€€€€€€€ÁÁ±äÑ¼…É‘q¸œ€¬(¬€œ€€€€€€€€€€ð½‰ÕÑÑ½¸ùq¸œ€¬(¬€œ€€€€€€€€€€ñ‰ÕÑÑ½¸½¹±¥¬ô‰±½Í•5½‘…° Í¥œµµ½‘…°œ¤ˆ±…ÍÌô‰Áà´ÐÁä´È¸ÔÉ½Õ¹‘•µá°‰œµÍ±…Ñ”´àÀÀ¡½Ù•Èé‰œµÍ±…Ñ”´ÜÀÀÑ•áÐµÝ¡¥Ñ”™½¹Ðµ‰½±Ñ•áÐµáÌÑÉ…¹Í¥Ñ¥½¸ˆùq¸œ€¬(¬€œ€€€€€€€€€€€…¹•±q¸œ€¬(¬€œ€€€€€€€€€€ð½‰ÕÑÑ½¸ùq¸œ€¬(¬€œ€€€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€€€ð½‘¥Øùq¸œ€¬(¬€œ€€ð½‘¥Øøœì()¥˜€ …¡Ñµ°¹¥¹±Õ‘•Ì ¥ô‰Í¥œµµ½‘…°ˆœ¤¤ì(€¡Ñµ°€ô¡Ñµ°¹É•Á±…” œð„´´5•É =É‘•È€˜¡•­½ÕÐM¡••Ð5½‘…°€´´øœ°Í¥5½‘…±!Ñµ°€¬€q¹q¸€€ð„´´5•É =É‘•È€˜¡•­½ÕÐM¡••Ð5½‘…°€´´œ¤ì)ô()½¹ÍÐÍ¥Õ¹Ñ¥½¹Ì€ô€™Õ¹Ñ¥½¸½Á•¹M¥¹…ÑÕÉ•A… ¤íq¸œ€¬(¬€œ€¥˜€ …Í•±•Ñ•‘Ñ¡±•Ñ”€˜˜€…ÕÉÉ•¹Ñ…É‘Ñ¡±•Ñ”¤É•ÑÕÉ¸íq¸œ€¬(¬€œ€½¹ÍÐ…Ñ¡±•Ñ”€ôÕÉÉ•¹Ñ…É‘Ñ¡±•Ñ”ñðÍ•±•Ñ•‘Ñ¡±•Ñ”íq¸œ€¬(¬€œ€½¹ÍÐÍ¥%¹ÁÕÐ€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰Í¥œµ¥¹ÁÕÐµÑ•áÐˆ¤íq¸œ€¬(¬€œ€½¹ÍÐÍ¥¥ÍÀ€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰Í¥œµÁÉ•Ù¥•Üµ‘¥ÍÀˆ¤íq¸œ€¬(¬€œ€½¹ÍÐÕÉM¥œ€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰Ñ½ÁÁÌµÍ¥œˆ¤íq¸œ€¬(¬€œ€½¹ÍÐ¥¹¥Ñ¥…°€ô€¡ÕÉM¥œ€˜˜ÕÉM¥œ¹Ñ•áÑ½¹Ñ•¹Ð¤€üÕÉM¥œ¹Ñ•áÑ½¹Ñ•¹Ð€è…Ñ¡±•Ñ”¹™Õ±±}¹…µ”íq¸œ€¬(¬€œ€¥˜€¡Í¥%¹ÁÕÐ¤Í¥%¹ÁÕÐ¹Ù…±Õ”€ô¥¹¥Ñ¥…°íq¸œ€¬(¬€œ€¥˜€¡Í¥¥ÍÀ¤Í¥¥ÍÀ¹Ñ•áÑ½¹Ñ•¹Ð€ô¥¹¥Ñ¥…°íq¸œ€¬(¬€œ€¥˜€¡Í¥%¹ÁÕÐ¤íq¸œ€¬(¬€œ€€€Í¥%¹ÁÕÐ¹½¹¥¹ÁÕÐ€ô™Õ¹Ñ¥½¸ ¤íq¸œ€¬(¬€œ€€€€€¥˜€¡Í¥¥ÍÀ¤Í¥¥ÍÀ¹Ñ•áÑ½¹Ñ•¹Ð€ôÍ¥%¹ÁÕÐ¹Ù…±Õ”ñð…Ñ¡±•Ñ”¹™Õ±±}¹…µ”íq¸œ€¬(¬€œ€€€ôíq¸œ€¬(¬€œ€õq¸œ€¬(¬€œ€½Á•¹5½‘…° ‰Í¥œµµ½‘…°ˆ¤íq¸œ€¬(¬€õq¹q¸œ€¬(¬€™Õ¹Ñ¥½¸Í…Ù•A±…å•ÉM¥¹…ÑÕÉ” ¤íq¸œ€¬(¬€œ€½¹ÍÐ…Ñ¡±•Ñ”€ôÕÉÉ•¹Ñ…É‘Ñ¡±•Ñ”ñðÍ•±•Ñ•‘Ñ¡±•Ñ”íq¸œ€¬(¬€œ€½¹ÍÐÍ¥%¹ÁÕÐ€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰Í¥œµ¥¹ÁÕÐµÑ•áÐˆ¤íq¸œ€¬(¬€œ€½¹ÍÐÙ…°€ô€¡Í¥%¹ÁÕÐ€˜˜Í¥%¹ÁÕÐ¹Ù…±Õ”¹ÑÉ¥´ ¤¤€üÍ¥%¹ÁÕÐ¹Ù…±Õ”¹ÑÉ¥´ ¤€è€¡…Ñ¡±•Ñ”€ü…Ñ¡±•Ñ”¹™Õ±±}¹…µ”€è€ˆˆ¤íq¸œ€¬(¬€œ€½¹ÍÐÕÉM¥œ€ô‘½Õµ•¹Ð¹•Ñ±•µ•¹Ñ	å% ‰Ñ½ÁÁÌµÍ¥œˆ¤íq¸œ€¬(¬€œ€¥˜€¡ÕÉM¥œ¤ÕÉM¥œ¹Ñ•áÑ½¹Ñ•¹Ð€ôÙ…°íq¸œ€¬(¬€œ€±½Í•5½‘…° ‰Í¥œµµ½‘…°ˆ¤íq¸œ€¬(¬€õq¸œì()¥˜€ …¡Ñµ°¹¥¹±Õ‘•È ™Õ¹Ñ¥½¸½Á•¹M¥¹…ÑÕÉ•A…œ¤¤ì(€¡Ñµ°€ô¡Ñµ°¹É•Á±…” ™Õ¹Ñ¥½¸½Á•¹…É‘5½‘…°œ°Í¥Õ¹Ñ¥½¹Ì€¬€q·îÍÑ¥½¸½Á•¹…É‘5½‘…°œ¤ì)ô()™Ì¹ÝÉ¥Ñ•¥±•Må¹Œ ±…¹¥°µÍÁ½ÉÑÌ½¥¹‘•à¹¡Ñµ°œ°¡Ñµ°°€ÕÑ˜àœ¤ì)½¹Í½±”¹±½œ MUMLè±°19%0ÕÁ‘…Ñ•ÌÍÕ•ÍÍ™Õ±±ä…ÁÁ±¥•„I•µ½Ù•Q=AAL°Í•ÐIÑ¼1°A±…å•ÈM¥¹…ÑÕÉ”i½¹”…‘‘•½Ù•ÈE½½Ñ‰…±°°MÁ½ÉÐ%½¸µ‰±•´…‘‘•°…¹…Ñ¡•…‘•…±Ì¥¹ÍÑ…±±•„œ¤
