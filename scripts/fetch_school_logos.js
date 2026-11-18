const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

(async () => {
  console.log("Fetching Louisiana schools and mascot logos from MaxPreps...");
  const res = await fetch("https://www.maxpreps.com/la/schools/", { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const data = JSON.parse($("#__NEXT_DATA__").html());
  const schools = data.props.pageProps.groupings || [];

  const logoMap = {};
  schools.forEach(s => {
    if (s.mascotUrl) {
      // Keys: normalized school name, slug, and clean name
      const cleanName = s.name.toLowerCase().trim();
      const slug = s.canonicalUrl.split("/").filter(Boolean).pop();
      logoMap[cleanName] = s.mascotUrl;
      if (slug) logoMap[slug] = s.mascotUrl;
      // Also stripped variants (e.g. "neville high school" -> "neville")
      const stripped = cleanName.replace(/ high school| high| school/g, "").trim();
      logoMap[stripped] = s.mascotUrl;
    }
  });

  // Explicit additions for core schools if needed
  logoMap["neville high school"] = "https://image.maxpreps.io/school-mascot/6/8/1/681b5e5f-827c-4081-b16b-5e4b2a435cf8.gif?version=638448452400000000&width=256&height=256";
  logoMap["neville"] = logoMap["neville high school"];
  logoMap["edna karr high school"] = "https://image.maxpreps.io/school-mascot/3/b/e/3be01f7c-7a91-454d-965a-0639d48b1fc5.gif?version=634033604000000000&width=256&height=256";
  logoMap["edna karr"] = logoMap["edna karr high school"];
  logoMap["ruston high school"] = "https://image.maxpreps.io/school-mascot/1/6/7/1676f4e6-ee32-47e1-8849-cfa29be0d1e5.gif?version=635465373000000000&width=256&height=256";
  logoMap["ruston"] = logoMap["ruston high school"];
  logoMap["destrehan high school"] = "https://image.maxpreps.io/school-mascot/0/e/9/0e99e030-cf29-4702-8a9c-0bc2b6db760d.gif?version=634033603800000000&width=256&height=256";
  logoMap["destrehan"] = logoMap["destrehan high school"];

  const outPath = path.join(__dirname, "..", "school_logos.json");
  fs.writeFileSync(outPath, JSON.stringify(logoMap, null, 2), "utf8");
  console.log(`Saved ${Object.keys(logoMap).length} school logo mappings to ${outPath}!`);
})();