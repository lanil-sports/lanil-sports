const fetch = globalThis.fetch;
const fs = require("fs");

async function check() {
  const url = "https://www.maxpreps.com/ca/folsom/folsom-bulldogs/athletes/ryder-lyons/football/stats/?careerid=ufohkivpbcci2";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  const text = await res.text();
  console.log("HTML length:", text.length);
  // Search for script tags containing JSON or stats
  const scripts = text.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  console.log("Total scripts:", scripts.length);
  for (const s of scripts) {
    if (s.includes("stats") || s.includes("careerid") || s.includes("Ryder") || s.includes("__NEXT_DATA__")) {
      console.log("Matched script tag snippet:", s.substring(0, 150));
    }
  }
}

check().catch(console.error);
