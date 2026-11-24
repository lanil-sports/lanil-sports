const fetch = globalThis.fetch;
const cheerio = require("cheerio");

(async () => {
  const res = await fetch("https://www.maxpreps.com/la/monroe/neville-tigers/football/roster/", { 
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } 
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Find all athlete mugshots/headshots mapped by name or athlete ID
  const photos = {};
  $("img[src*='roster'], img[src*='athlete']").each((i, el) => {
    const alt = $(el).attr("alt") || "";
    const src = $(el).attr("src") || "";
    if (alt) {
      photos[alt.replace(/ mugshot| photo/i, "").trim()] = src;
    }
  });

  console.log("Found photos count in HTML DOM:", Object.keys(photos).length);
  console.log("Sample photo mapping:", Object.entries(photos).slice(0, 5));
})();