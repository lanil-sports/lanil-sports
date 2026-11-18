const fetch = require("node-fetch");

async function check() {
  const url = "https://www.on3.com/rivals/maxx-jones-246534/";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  console.log("On3 status:", res.status);
  const text = await res.text();
  console.log("On3 text length:", text.length);
  // Look for image URLs
  const imgMatches = text.match(/https:\/\/[^"'\s]+(?:on3|rivals|media)[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || [];
  console.log("Images found:", imgMatches.slice(0, 10));
}
check().catch(console.error);
