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
  console.log("athleteData count:", athletes.length);
  if (athletes.length > 0) {
    console.log("Sample athlete 0:", JSON.stringify(athletes[0], null, 2));
    console.log("Sample athlete 1:", JSON.stringify(athletes[1], null, 2));
  }
})();