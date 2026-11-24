const fetch = globalThis.fetch;
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

(async () => {
  const res = await fetch("https://www.prepredzone.com/louisiana/", { headers: { "User-Agent": UA }, timeout: 15000 });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Find article links
  console.log("=== ALL ARTICLE LINKS ===");
  const articleLinks = [];
  $("a[href]").each((i, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (href.includes("prepredzone.com") && href.includes("/20") && text.length > 5) {
      articleLinks.push({ text, href });
    }
  });
  articleLinks.forEach(a => console.log(a.text.substring(0,80) + " -> " + a.href));

  // Also look for schedule/roster links
  console.log("\n=== GAME SCHEDULE SECTION ===");
  const schedSection = $("h2:contains('Louisiana Game Schedule')").next();
  console.log(schedSection.text().trim().substring(0, 500));

  // Look for player names pattern
  console.log("\n=== RAW TEXT SAMPLE (body) ===");
  const bodyText = $("body").text().replace(/\s+/g," ").trim();
  // Find sections with player-like names
  const playerMatches = bodyText.match(/([A-Z][a-z]+ [A-Z][a-z]+),\s*([A-Z][a-zA-Z\s\.]+(?:High|Academy|Prep))/g) || [];
  console.log("Player pattern matches:", playerMatches.length);
  playerMatches.slice(0,20).forEach(m => console.log(" →", m));
})();