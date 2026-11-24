const fetch = globalThis.fetch;
const cheerio = require("cheerio");

(async () => {
  const res = await fetch("https://www.maxpreps.com/la/schools/", { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const data = JSON.parse($("#__NEXT_DATA__").html());
  const schools = data.props.pageProps.groupings || [];
  const withLogo = schools.filter(s => s.mascotUrl);
  console.log("Total schools:", schools.length, "Schools with mascotUrl:", withLogo.length);
  console.log("Sample 10 mascot URLs:");
  withLogo.slice(0, 10).forEach(s => console.log(" -", s.name, "->", s.mascotUrl));
})();