const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Top nav link
const targetNav = `<button onclick="navigate('pricing')" class="nav-link text-slate-300 hover:text-amber-400 transition">Pricing & NIL</button>`;
const bibleNav = `${targetNav}
        <a href="/bible" class="nav-link text-amber-300 hover:text-amber-200 transition flex items-center gap-1 font-semibold"><i class="fa-solid fa-book-bookmark text-xs"></i> Platform Bible</a>`;

if (html.includes(targetNav)) {
  html = html.replace(targetNav, bibleNav);
  console.log('Nav link replaced');
} else {
  console.log('Nav target not found');
}

// 2. Header Pitch Deck button
const targetBtn = `<button onclick="openModal('claim-modal')" class="text-xs md:text-sm font-bold px-3.5 py-2 rounded-xl gold-gradient text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5">`;
const deckBtn = `<a href="/bible" class="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 transition"><i class="fa-solid fa-file-powerpoint text-amber-400"></i> Pitch Deck</a>
        ${targetBtn}`;

if (html.includes(targetBtn)) {
  html = html.replace(targetBtn, deckBtn);
  console.log('Header button replaced');
} else {
  console.log('Header button target not found');
}

// 3. Footer links
const targetFooter = `<div class="pt-2 flex gap-3 text-sm">`;
const footerLinks = `<div class="pt-3 border-t border-white/5 space-y-1.5 text-[11px] mb-3">
          <a href="/bible" class="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"><i class="fa-solid fa-book-bookmark"></i> LANIL Sports Bible & Pitch Deck</a>
          <a href="/LANIL_SPORTS_BIBLE.pptx" download class="text-slate-400 hover:text-white flex items-center gap-1.5"><i class="fa-solid fa-file-powerpoint text-amber-400"></i> Download PowerPoint (.PPTX)</a>
          <a href="/master-blueprint" class="text-slate-400 hover:text-white flex items-center gap-1.5"><i class="fa-solid fa-file-lines text-amber-400"></i> Master Blueprint</a>
          <a href="/walkthrough" class="text-slate-400 hover:text-white flex items-center gap-1.5"><i class="fa-solid fa-code text-cyan-400"></i> Backend Walkthrough</a>
        </div>
        ${targetFooter}`;

if (html.includes(targetFooter)) {
  html = html.replace(targetFooter, footerLinks);
  console.log('Footer links replaced');
} else {
  console.log('Footer target not found');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated index.html with Platform Bible links.');
