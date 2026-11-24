const fetch = globalThis.fetch;
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const ARTICLES = [
  "https://prepredzone.com/2026/11/louisiana-my-guys-playoff-edition/",
  "https://prepredzone.com/2026/10/midseason-awards-louisiana-high-school-football/",
  "https://prepredzone.com/2026/10/louisiana-football-names-you-should-know/",
  "https://prepredzone.com/2026/10/louisiana-high-school-wide-receivers-who-are-dawgs/"
];

(async () => {
  for (const url of ARTICLES) {
    console.log("\n========== " + url.split("/").slice(-2,-1)[0].toUpperCase() + " ==========");
    const r = await fetch(url, { headers:{"User-Agent":UA,"Accept":"text/html"}, timeout:15000 });
    const html = await r.text();
    const $ = cheerio.load(html);
    const content = $(".entry-content, .post-content, article").first();

    // Print raw paragraph text to see the actual format
    let pCount = 0;
    content.find("p, li, h3, h4, strong").each((i, el) => {
      const t = $(el).text().trim().replace(/\s+/g, " ");
      if (t.length > 10 && t.length < 500 && pCount < 15) {
        console.log("[" + el.tagName + "] " + t.substring(0,250));
        pCount++;
      }
    });
    await new Promise(r=>setTimeout(r,1500));
  }
})();