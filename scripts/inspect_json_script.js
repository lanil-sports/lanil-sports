const fetch = require("node-fetch");
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

(async () => {
  const url = "https://www.maxpreps.com/la/monroe/neville-tigers/football/roster/";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const $ = cheerio.load(html);

  $("script").each((i, el) => {
    const id = $(el).attr("id") || "";
    const type = $(el).attr("type") || "";
    const content = $(el).html() || "";
    if (id || type.includes("json") || content.includes("athletes") || content.includes("roster")) {
      console.log(`Script ${i}: id="${id}", type="${type}", len=${content.length}`);
      if (content.length > 50 && content.length < 500000) {
        if (content.includes("athletes") || content.includes("roster") || content.includes("player")) {
          console.log("Snippet:", content.substring(0, 300));
        }
      }
    }
  });
})();