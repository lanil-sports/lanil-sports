const fetch = require("node-fetch");
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

(async () => {
  const res = await fetch("https://www.prepredzone.com/louisiana/", { headers: { "User-Agent": UA }, timeout: 15000 });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log("=== ARTICLE TITLES ===");
  $("h1, h2, h3").each((i, el) => {
    if (i < 25) console.log($(el).prop("tagName") + ": " + $(el).text().trim().substring(0, 100));
  });

  console.log("\n=== LINKS (first 20) ===");
  $("a").each((i, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    if (i < 20 && text.length > 5 && text.length < 100) console.log(text + " → " + href);
  });

  console.log("\n=== CLASSES ON PAGE (sample) ===");
  const classes = new Set();
  $("[class]").each((i, el) => {
    $(el).attr("class").split(" ").forEach(c => { if (c) classes.add(c); });
  });
  const arr = Array.from(classes).slice(0, 40);
  console.log(arr.join(", "));

  console.log("\n=== PARAGRAPH SAMPLE ===");
  $("p").each((i, el) => {
    if (i < 5) {
      const t = $(el).text().trim();
      if (t.length > 20) console.log(t.substring(0, 200));
    }
  });
})();