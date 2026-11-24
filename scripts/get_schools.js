const fetch = globalThis.fetch;
const cheerio = require("cheerio");

(async () => {
  const res = await fetch("https://www.maxpreps.com/la/schools/", { 
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } 
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  console.log("Title:", $("h1").text().trim());

  // Also check __NEXT_DATA__
  if ($("#__NEXT_DATA__").length > 0) {
    try {
      const data = JSON.parse($("#__NEXT_DATA__").html());
      console.log("pageProps keys:", Object.keys(data.props.pageProps));
      for (const k of Object.keys(data.props.pageProps)) {
        const val = data.props.pageProps[k];
        if (Array.isArray(val)) {
          console.log(`pageProps.${k} is array of length ${val.length}`);
          if (val.length > 0) console.log(`  Sample 0:`, val[0]);
        }
      }
    } catch(e) {
      console.log("JSON parse error:", e.message);
    }
  }

  const links = [];
  $("a").each((i, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    // School urls look like: /la/monroe/neville-tigers/ or /la/new-orleans/edna-karr-cougars/
    const parts = href.split("/").filter(Boolean);
    if (parts.length === 3 && parts[0] === "la") {
      links.push({ city: parts[1], slug: parts[2], name: text, href });
    }
  });
  console.log("Found school links count:", links.length);
  if (links.length > 0) {
    console.log("Sample 10 schools:", links.slice(0, 10));
  }
})();