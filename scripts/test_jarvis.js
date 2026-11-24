const fetch = globalThis.fetch;
const cheerio = require("cheerio");

(async () => {
  const res = await fetch("https://www.maxpreps.com/la/monroe/neville-tigers/football/roster/", { 
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } 
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const data = JSON.parse($("#__NEXT_DATA__").html());
  const athletes = data.props.pageProps.athleteData;
  const jarvis = athletes.find(a => a[34] && a[34].includes("Jarvis"));
  if (jarvis) {
    console.log("Jarvis array fields:");
    jarvis.forEach((v, i) => { if (v !== null && v !== "") console.log(`  [${i}]: ${v}`); });
  }
})();