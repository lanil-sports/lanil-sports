const fetch = require("node-fetch");
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

(async () => {
  const url = "https://www.maxpreps.com/la/monroe/neville-tigers/football/roster/";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const $ = cheerio.load(html);

  const rawJson = $("#__NEXT_DATA__").html();
  const data = JSON.parse(rawJson);
  console.log("Keys in pageProps:", Object.keys(data.props.pageProps));
  
  // Look for roster or athletes
  for (const k of Object.keys(data.props.pageProps)) {
    const val = data.props.pageProps[k];
    if (typeof val === 'object' && val !== null) {
      console.log(`Key ${k} keys:`, Object.keys(val).slice(0, 10));
    }
  }

  // Find athletes or roster
  const str = JSON.stringify(data.props.pageProps);
  const athletesMatch = data.props.pageProps.athletes || data.props.pageProps.roster || (data.props.pageProps.data && data.props.pageProps.data.athletes);
  
  // Recursively search for an array of athletes/players
  function findRoster(obj, path = "") {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      if (obj.length > 0 && (obj[0].firstName || obj[0].name || obj[0].athleteId || obj[0].jerseyNumber)) {
        console.log(`Found roster array at ${path} with ${obj.length} items!`);
        console.log("Sample player 0:", JSON.stringify(obj[0], null, 2));
        return;
      }
    }
    for (const key of Object.keys(obj)) {
      findRoster(obj[key], path + "." + key);
    }
  }

  findRoster(data.props.pageProps, "pageProps");
})();