const fetch = require("node-fetch");
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

(async () => {
  const url = "https://www.maxpreps.com/la/monroe/neville-tigers/football/roster/";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("=== TABLE OR ROSTER ELEMENTS ===");
  $("table tr").slice(0, 10).each((i, el) => {
    console.log("ROW " + i + ":", $(el).text().replace(/\s+/g, " ").trim());
  });

  console.log("\n=== ATHLETE / PLAYER LINKS ===");
  $("a[href*='/athletes/']").slice(0, 10).each((i, el) => {
    console.log($(el).text().trim(), "->", $(el).attr("href"));
  });

  console.log("\n=== IMAGES / HEADSHOTS ===");
  $("img[src*='athlete'], img[src*='photo'], img[src*='maxpreps'], img[alt]").slice(0, 10).each((i, el) => {
    console.log($(el).attr("alt"), "->", $(el).attr("src"));
  });
})();