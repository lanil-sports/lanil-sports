const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// Find and replace the Top Announcement Bar
const oldBarRegex = /<!-- Top Announcement Bar -->[\s\S]*?<!-- Main Navigation -->/;

const newBar = `<!-- Top Announcement Bar -->
  <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-amber-700 px-4 py-2 text-xs text-center font-medium text-amber-200 border-b border-white/10 flex items-center justify-center gap-2">
    <span class="bg-amber-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">OFFICIAL</span>
    <span>Louisiana High School NIL Directory & Yearbook (2026–2027) is LIVE across all 64 Parishes.</span>
  </div>

  <!-- Main Navigation -->`;

if (oldBarRegex.test(html)) {
  html = html.replace(oldBarRegex, newBar);
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("Successfully removed download buttons from the header!");
} else {
  console.log("Could not find Top Announcement Bar");
}