const fetch = globalThis.fetch;

async function check() {
  const url = "https://www.maxpreps.com/ca/folsom/folsom-bulldogs/athletes/ryder-lyons/football/stats/?careerid=ufohkivpbcci2";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const text = await res.text();
  
  // Find tables or game stats
  const tableMatches = text.match(/<table[\s\S]*?<\/table>/gi) || [];
  console.log("Table count in HTML:", tableMatches.length);
  if (tableMatches.length > 0) {
    console.log("First table snippet:", tableMatches[0].substring(0, 300));
  }

  // Check for image URLs
  const imgMatches = text.match(/https:\/\/[^"'\s]+(?:athlete|photo|headshot|player)[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || [];
  console.log("Found athlete images:", imgMatches.slice(0, 5));
}
check().catch(console.error);
