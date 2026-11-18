const fs = require('fs');

let html = fs.readFileSync('lanil-sports/index.html', 'utf8');

// 1. Remove all TOPPS mentions and keep LANIL
html = html.split('Official Topps x LANIL Trading Card').join('Official LANIL Collectible Trading Card');
html = html.split('Topps-Style Shareable Card Modal').join('LANIL Shareable Athlete Card Modal');
html = html.split('The Authentic Topps-Style Physical Card Frame').join('The Authentic LANIL Physical Card Frame');
html = html.split('TOPPS &bull; LANIL')join('LANIL &bull; ATHLETICS');
html = html.split('Topps x LANIL').join('LANIL Official');
html = html.split('Topps Refractor Badge').join('LANIL Refractor Badge');
html = html.split('Topps Refractor Emblem').join('LANIL Emblem');
html = html.split('Topps-Style Trading Card is ready').join('LANIL Trading Card is ready');
html = html.split('Topps-Style').join('LANIL');
html = html.split('TOPPS').join('LANIL');
html = html.split('Topps').join('LANIL');

// 2. Remove RC and add LA in the refractor badge
html = html.replace(/>\s+RC\s*<\/div>/g, '>LA</div>');

// 3. User says: "Where the Ryder Lyons at over the QB Fooball, that space should be reserved for the Player to add their signatures? thoughts?"
// Replace the old signature overlay with the dedicated Player Signature Zone
const newSigBlock = `             <!-- Dedicated Player Signature Zone (Directly Above Position Ribbon) -->
              <div class="absolute bottom-8 inset-x-2 z-20 pointer-events-auto">
                <div class="bg-black/75 backdrop-blur-md border border-amber-400/50 rounded-lg px-2.5 py-1 flex items-center justify-between shadow-[0_4p_16px_rgba(0,0,0,0.9)]">
                  <div class="flex-1 text-left">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono text-amber-400 font-black">X</span>
                      <span id="topps-sig" class="font-serif italic text-amber-200 text-base sm:text-lg font-bold tracking-wider drop-shadow-md leading-none"></span>
                    </div>
                    <span class="text-[7px] text-amber-400/80 uppercase tracking-widest font-mono block mt-0.5 leading-none">OFFICIAL ATHLETE SIGNATURE</span>
                  </div>
                  <button type="button" onclick="openSignaturePad()" title="Sign or customize autograph" class="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1 shrink-0">
                    <i class="fa-solid fa-signature"></i> Sign
                  </button>
                </div>
              </div>`;

html = html.replace(/<!-- Gold Facsimile Autograph Overlay -->[\s\S]*?<span id="topps-sig"[\s\S]*?<\/div>\s+<\/div>/, newSigBlock + '\n            </div>');

// 4. User says: "where the Black Circle with the Gold outline, can we remove that an add the icon for the sport, same as we used through the site"
// Replace the black circle with gold outline with the sport icon badge
const newSportBadge = `            <!-- Sport Icon Emblem (Bottom Right) -->
              <div id="card-sport-icon-badge" class="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-amber-400 flex items-center justify-center text-sm shadow-[0_2p_8px_rgba(0,0,0,0.9)] select-none">
                <span id="card-sport-emoji">🏇</span>
              </div>`;

html = html.replace(/<!-- School Mascot Medallion \(Bottom Right\) -->[\s\S]*?<img id="topps-logo"[\s\S]*?<\/div>/, newSportBadge);

// 5. Update the merchandise section
const newMerchSection = `       <!-- Option 1: Purchase LANIL Players Collector's Card (Bundles) -->
        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Collector's Card</h5>
                <span class="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase">32pt Cardstock</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Archival refractor finish &bull; Serialized &bull; Acrylic magnetic case included</p>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-xs font-extrabold text-white">$8.99 <span class="text-[10px] text-slate-400 font-normal">(1 card)</span></span>
                <span class="text-[11px] text-emerald-400 font-bold">&bull; 5 Cards: $34.99 <span class="text-[9px] text-emerald-300">(Save 22%)</span></span>
                <span class="text-[10px] text-slate-400">| 10 Cards: $59.99 | 20 Cards: $99.99</span>
              </div>
            </div>
          </div>
          <button onclick="openMerchOrder('card')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">
            Order Card
          </button>
        </div>

        <!-- Option 2: Purchase LANIL Players Custom Peel & Stick Poster Reusable Vinyl Wall Decal (Fathead RealBig Collection) -->
        <div class="bg-slate-800/60 rounded-xl p-3.5 border border-white/5 hover:border-amber-400/40 transition flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">
              <i class="fa-solid fa-tape"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h5 class="font-bold text-white text-xs">Purchase LANIL Players Custom Peel &amp; Stick Poster Reusable Vinyl Wall Decal</h5>
                <span class="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold uppercase">RealBig&trade; Vinyl</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">Removable &amp; Reusable &bull; High Grade Vinyl &bull; Precision Die-Cut &bull; Zero Wall Damage</p>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-xs font-extrabold text-white">$39.99 <span class="text-[10px] text-slate-400 font-normal">(Locker 10&quot;&times;17&quot; + 2 Decals)</span></span>
                <span class="text-[11px] text-emerald-400 font-bold">&bull; Medium: $59.99 <span class="text-[10px] text-slate-400 font-normal">(29&quot;&times;51&quot; + 4 Decals)</span></span>
                <span class="text-[11px] text-amber-300 font-bold">&bull; Life-Size: $89.99 <span class="text-[10px] text-slate-400 font-normal">(44&quot;&times;78&quot; + 8 Decals)</span></span>
              </div>
            </div>
          </div>
          <button onclick="openMerchOrder('poster')" class="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shrink-0 shadow-lg shadow-red-900/30">
            Order Decal
          </button>
        </div>`;

html = html.replace(
  /<!-- Option 1: Collector's Physical Playing Card -->[\s\S]*?<\/div>\s*<\/div>\s+<!-- Merch Order/m,
  newMerchSection + '\n      </div>\n    </div>\n  </div>\n\n  <!-- Merch Order'
);

// 6. Update openMerchOrder in the JS
const newMerchFn = `function openMerchOrder(type) {
  if (!selectedAthlete && !currentCardAthlete) return;
  const athlete = currentCardAthlete || selectedAthlete;
  activeMerchType = type;
  
  document.getElementById('merch-athlete-name').textContent = athlete.full_name + ' (' + athlete.school_name + ')';
  const optSelect = document.getElementById('merch-option');
  
  if (type === 'card') {
    document.getElementById('merch-title').textContent = "PURCHASE LANIL PLAYERS
0COLLECTOR'S CARD";
    document.getElementById('merch-subtitle').textContent = "Authentic 32pt heavy cardstock with acrylic magnetic display case";
    document.getElementById('merch-icon').innerHTML = '<i class="fa-solid fa-id-card"></i>';
    document.getElementById('merch-price-display').textContent = "$8.99";
    optSelect.innerHTML = '<option value="8.99">1 Card (Single in Acrylic Magnetic Case) - $8.99</option>' +
      '<option value="34.99">5 Cards Bundle [SAVE 22)]i ($7.00/ea) - $34.99</option>' +
      '<option value="59.99">10 Cards Booster Pack [SAVE 33%] ($6.00/ea) - $59.99</option>' +
      '<option value="99.99">20 Cards Team & Family Case [SAVE 44%] ($5.00/ea) - $99.99</option>';
  } else {
    document.getElementById('merch-title').textContent = "PURCHASE LANIL PLAYERS�T��HQS	��P����T����[Y[���][[Y[��RY
	�Y\��\�X�]I�K�^�۝[�H��]XY\�[H�X[�Y��(���X�[ێ��[[ݘX�H	��]\�X�H�[�[�[X�[���[Y[���][[Y[��RY
	�Y\��ZX�ۉ�K�[��\�SH	�H�\��H��K\��Y�K]\H���O����[Y[���][[Y[��RY
	�Y\��\�X�KY\�^I�K�^�۝[�H��K�NH���[X��[��\�SH	��[ۈ�[YOH��K�NH���X[
���\��^�JH
���۝\�X�[�
L�MȊHH	�K�NO��[ۏ��
	��[ۈ�[YOH�NK�NH��YY][H
�Y���H�ٙ�X�JH
�
�۝\�X�[�
�H�
LH�HH	
NK�NO��[ۏ��
	��[ۈ�[YOH�K�NH��\��H
Y�KT�^�H�X[�Y��(�H
��۝\�X�[�


�
��HH	K�NO��[ۏ��B���[�[�[
	�Y\��[[�[	�NX�[H[��\X�Jٝ[��[ۈ�[�Y\��ܙ\�
\W���J���[�[�[
	�Y\��[[�[	�
N��K��]�Y\����N���
ˈ\]H�[��\�[�[��]�ܝ[[ښH���HH�ܝ�X�ۈ��X�[ۈB��ۜ��ܝX\��X�H����ܝX�ۈ[X�[H�[X�[ۈ���H�ܝ�X�ۈ��X�[ۂ��ۜ��ܝ[[ښQ[H��[Y[���][[Y[��RY
	��\�\�ܝY[[ښI�NY�
�ܝ[[ښQ[
H�ۜ��H
K��[X\�W��ܝ	��K����\��\�J
N�ۜ��ܝ[[ښ\�H	ٛ���[	Έ	�c�	��	ؘ\��]�[	Έ	�c�	��	ؘ\�X�[	Έ	������	�����\�Έ	���I��	ݛ�^X�[	Έ	�c�	��	�[��\�Έ	�'�/���	����Έ	�c�9��I��	����^IΈ	�'����	�Xܛ���IΈ	�'��I��	���[[Z[��Έ	�c���	�ɕ�ѱ����耟�>�(��������Ʌ�����������耟�>��(��������Ʌ���耟�~>��(�������ͽ�щ����耟�2���(�������������ѽ��耟�~>���(���������᥹��耟�~�(�(������(���������������ѕ��
��ѕ�Ѐ�����������m�t������~>��(���)��()������ѵ������Ց�Ƞ���ɐ�����е����������(���ѵ���ѵ��ɕ�����������5��������ɐ��������숰������5��1��������q�������5��������ɐ��������숤�)�(()�̹�ɥѕ���M幌�������������̽����๡ѵ�����ѵ�����ј����)���ͽ��������MU

ML����19%0�����ѕ́�Ս���͙ձ�䁅��������I���ٕ��Q=AAL��͕ЁI�Ѽ�1��A���ȁM������ɔ�i�����������ٕȁE���щ�����M���Ё%����������������������ѡ���������́���х�������
