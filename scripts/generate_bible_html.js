const fs = require('fs');
const path = require('path');

const slides1 = require('./bible_slides_data_1');
const slides2 = require('./bible_slides_data_2');
const slides3 = require('./bible_slides_data_3');
const slides4 = require('./bible_slides_data_4');

const allSlides = [...slides1, ...slides2, ...slides3, ...slides4];

console.log(`Loaded ${allSlides.length} slides.`);

const html = `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LANIL SPORTS BIBLE | Official Pitch Deck & Operating Manual</title>
  <meta name="description" content="Official Master Operating Blueprint, Technical Architecture & Merchandising Bible for LANILSPORTS.COM">

  <!-- Google Fonts: Teko (Athletic) & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Teko:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            athletic: ['Teko', 'sans-serif'],
            sans: ['Inter', 'sans-serif']
          },
          colors: {
            brand: {
              navy: '#090D16',
              slate: '#10172A',
              card: '#1E293B',
              gold: '#F5B700',
              amber: '#FBBF24',
              cyan: '#06B6D4',
              emerald: '#10B981'
            }
          }
        }
      }
    }
  </script>

  <!-- Font Awesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #090D16;
      color: #E2E8F0;
      overflow-x: hidden;
    }
    .font-athletic {
      font-family: 'Teko', sans-serif;
    }
    .glass {
      background: rgba(16, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .slide-canvas {
      aspect-ratio: 16 / 9;
      max-height: 85vh;
      width: 100%;
      background: #090D16;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #090D16;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #F5B700;
    }
  </style>
</head>
<body class="h-full flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">

  <!-- TOP APP BAR -->
  <header class="bg-slate-950/90 border-b border-white/10 px-4 py-3 sticky top-0 z-50 backdrop-blur-md">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <!-- Brand & Title -->
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-athletic text-slate-950 font-bold text-xl group-hover:scale-105 transition">
            LA
          </div>
          <span class="font-athletic text-2xl font-bold tracking-wider text-white uppercase group-hover:text-amber-400 transition">
            LANIL<span class="text-amber-400">SPORTS</span>
          </span>
        </a>
        <span class="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
          Platform Bible & Deck
        </span>
      </div>

      <!-- Slide Navigation Controls -->
      <div class="flex items-center gap-2">
        <!-- Slide Selector / Drawer Button -->
        <button onclick="toggleDrawer()" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-2 transition" title="View all 16 slides">
          <i class="fa-solid fa-table-cells-large text-amber-400"></i>
          <span class="hidden md:inline font-medium">All Slides</span>
        </button>

        <!-- Prev / Next Controls -->
        <div class="flex items-center bg-slate-900 rounded-lg border border-white/10 p-0.5">
          <button onclick="prevSlide()" class="p-1.5 px-2.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition" title="Previous Slide (Left Arrow)">
            <i class="fa-solid fa-chevron-left text-xs"></i>
          </button>
          <span id="slideCounter" class="px-3 text-xs font-mono font-semibold text-amber-300">
            1 / 16
          </span>
          <button onclick="nextSlide()" class="p-1.5 px-2.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition" title="Next Slide (Right Arrow or Space)">
            <i class="fa-solid fa-chevron-right text-xs"></i>
          </button>
        </div>

        <!-- Fullscreen Button -->
        <button onclick="toggleFullscreen()" class="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs transition" title="Toggle Fullscreen (F)">
          <i class="fa-solid fa-expand"></i>
        </button>

        <!-- Download PPTX Button -->
        <a href="/LANIL_SPORTS_BIBLE.pptx" download class="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-105 transition">
          <i class="fa-solid fa-file-powerpoint text-sm"></i>
          <span class="hidden sm:inline">Download .PPTX</span>
        </a>

        <!-- Back to Directory -->
        <a href="/" class="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1.5 transition">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Live Site</span>
        </a>
      </div>
    </div>
  </header>

  <!-- MAIN SLIDE STAGE -->
  <main class="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
    <div class="w-full max-w-6xl mx-auto">
      <!-- 16:9 SLIDE CONTAINER -->
      <div id="slideContainer" class="slide-canvas rounded-2xl relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none">
        <!-- Top Gold Accent Bar -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

        <!-- Slide Header -->
        <div id="slideHeader" class="relative z-10">
          <div id="slideCategory" class="text-amber-400 font-mono text-[11px] font-bold tracking-widest uppercase mb-1">
            OFFICIAL MASTER BIBLE
          </div>
          <h2 id="slideTitle" class="font-athletic text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-white uppercase leading-none">
            LANIL SPORTS
          </h2>
        </div>

        <!-- Slide Body (Dynamically populated) -->
        <div id="slideBody" class="relative z-10 flex-1 my-auto overflow-y-auto pr-1">
          <!-- Slide Content injected via JS -->
        </div>

        <!-- Slide Footer Chrome -->
        <div class="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          <div class="flex items-center gap-2">
            <span class="text-amber-400 font-bold">LANILSPORTS.COM</span>
            <span>•</span>
            <span class="hidden sm:inline">LOUISIANA HIGH SCHOOL ATHLETE DIRECTORY & NIL PLATFORM</span>
          </div>
          <div class="text-amber-400/90 font-bold">
            CONFIDENTIAL & PROPRIETARY
          </div>
        </div>
      </div>

      <!-- KEYBOARD SHORTCUTS HINT -->
      <div class="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
        <div class="flex items-center gap-3">
          <span><kbd class="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300">←</kbd> / <kbd class="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300">→</kbd> or <kbd class="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300">Space</kbd> Navigate</span>
          <span class="hidden sm:inline">•</span>
          <span class="hidden sm:inline"><kbd class="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300">F</kbd> Fullscreen</span>
          <span class="hidden sm:inline">•</span>
          <span class="hidden sm:inline"><kbd class="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300">Esc</kbd> Exit</span>
        </div>
        <div class="flex items-center gap-2">
          <a href="/master-blueprint" class="hover:text-amber-300 transition text-[11px] flex items-center gap-1">
            <i class="fa-solid fa-file-lines text-amber-400"></i>
            <span>Master Blueprint</span>
          </a>
          <span>•</span>
          <a href="/walkthrough" class="hover:text-amber-300 transition text-[11px] flex items-center gap-1">
            <i class="fa-solid fa-code text-cyan-400"></i>
            <span>Backend Walkthrough</span>
          </a>
        </div>
      </div>
    </div>
  </main>

  <!-- SLIDE DRAWER / JUMP MODAL -->
  <div id="slideDrawer" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
      <div class="p-4 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-table-cells-large text-amber-400"></i>
          <h3 class="font-athletic text-2xl text-white uppercase tracking-wider">Presentation Slide Deck Overview</h3>
          <span class="text-xs text-slate-400 font-mono ml-2">(16 Slides)</span>
        </div>
        <button onclick="toggleDrawer()" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="drawerThumbnails">
        <!-- Rendered by JS -->
      </div>
    </div>
  </div>

  <!-- SLIDES DATA SCRIPT -->
  <script>
    const SLIDES = ${JSON.stringify(allSlides)};
    let currentIdx = 0;

    function renderSlide(idx) {
      if (idx < 0) idx = 0;
      if (idx >= SLIDES.length) idx = SLIDES.length - 1;
      currentIdx = idx;

      const slide = SLIDES[currentIdx];
      document.getElementById('slideCategory').textContent = slide.category;
      document.getElementById('slideTitle').textContent = slide.title;
      document.getElementById('slideBody').innerHTML = slide.content;
      document.getElementById('slideCounter').textContent = (currentIdx + 1) + ' / ' + SLIDES.length;

      // Update URL hash without scroll
      history.replaceState(null, null, '#slide-' + (currentIdx + 1));
    }

    function nextSlide() {
      if (currentIdx < SLIDES.length - 1) {
        renderSlide(currentIdx + 1);
      }
    }

    function prevSlide() {
      if (currentIdx > 0) {
        renderSlide(currentIdx - 1);
      }
    }

    function goToSlide(idx) {
      renderSlide(idx);
      toggleDrawer(false);
    }

    function toggleDrawer(force) {
      const drawer = document.getElementById('slideDrawer');
      if (typeof force === 'boolean') {
        if (force) drawer.classList.remove('hidden');
        else drawer.classList.add('hidden');
      } else {
        drawer.classList.toggle('hidden');
      }
    }

    function toggleFullscreen() {
      const el = document.getElementById('slideContainer');
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }

    // Populate drawer thumbnails
    function initDrawer() {
      const container = document.getElementById('drawerThumbnails');
      container.innerHTML = SLIDES.map((s, i) => \`
        <div onclick="goToSlide(\${i})" class="glass p-3 rounded-xl border border-white/10 hover:border-amber-400/80 cursor-pointer transition flex flex-col justify-between group hover:scale-[1.02]">
          <div>
            <div class="flex items-center justify-between text-[10px] font-mono mb-1">
              <span class="text-amber-400 font-bold">SLIDE \${s.num}</span>
              <span class="text-slate-500">\${s.category.substring(0, 16)}</span>
            </div>
            <h4 class="text-white font-bold text-xs group-hover:text-amber-300 transition leading-snug">
              \${s.title}
            </h4>
          </div>
          <div class="mt-3 text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-1.5">
            <span>Click to view</span>
            <i class="fa-solid fa-arrow-right text-amber-400 group-hover:translate-x-1 transition"></i>
          </div>
        </div>
      \`).join('');
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        renderSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        renderSlide(SLIDES.length - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        toggleDrawer(false);
      }
    });

    // Touch swipe handling
    let touchStartX = 0;
    let touchEndX = 0;
    const stage = document.getElementById('slideContainer');
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) nextSlide();
      if (touchEndX > touchStartX + 50) prevSlide();
    }, false);

    // Initial load
    initDrawer();
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const num = parseInt(hash.replace('#slide-', ''), 10);
      if (!isNaN(num) && num >= 1 && num <= SLIDES.length) {
        renderSlide(num - 1);
      } else {
        renderSlide(0);
      }
    } else {
      renderSlide(0);
    }
  </script>
</body>
</html>`;

const outPath = path.join(__dirname, '..', 'bible.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Successfully generated bible.html (${Buffer.byteLength(html, 'utf8')} bytes) at: ${outPath}`);
