const https = require("https");
const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");

// Patterns that indicate garbage (not real player names)
const JUNK_PATTERNS = [
  /^(My Guys|Playoff Edition|Share Facebook|View Player|Download Image|Continue Reading|Freak List|Stat Leaders|Backs Who|Receivers Who|Linebacker Ranks|Quarterback Ranks|Edge Ranks|Names You|Awards Louisiana|Midseason Awards|Each Wide|Each Quarter|Each Running|Each Edge|Each Line|Each Tight|Each Defender|Each Defensive|Each Offensive|Top 2028|Where Each|Already Subscriber|Subscription|Instagram Twitter|Twitter State|State Louisiana|Louisiana High School Wide|Louisiana High School Running|Louisiana Football Names|Louisiana High School Foot|Caleb Sisk October|Caleb Sisk Read|Caleb Sisk November|Caleb Sisk State|Sisk November|Sisk October|Day High School|Day This|Metairie Park Country|Pope John Paul|Ranked Players|Watch List|Lineup Players|Logansport This|Bunkie This|Homer This|Baton Rouge This|Byrd This|Barbe This|Leesville This|Georgia School|Franklin Parish This|Franklin Parish$|Westminster Christian$|South Terrebonne High$|Cedar Creek$|Lincoln Prep$|Covenant Christian Academy$|East Beauregard$|Loyola College Prep$|Louis Catholic$|Thomas More This|Thomas More High|Thomas More$|Charles Catholic This|Augustine This|Academy This|Young July|Calvary Baptist$|Isidore Newman$|West St$|East St$)/i,
  /\b(Instagram|Twitter|Facebook|State$|This$|Read$|November$|October$|July$)\s*$/i,
  /^(Jaden Johnson Jaden|Zaylon Birdlong Zaylon|Kameron Bernard Kameron|Khylen Taylor Khylen|Armani Davis Armani|Reginald Monroe Reginald|Lucas Jefferson Lucas|Kamon Mitchell Kamon|Waylon Johnson Waylon|Ashton Joseph Ashton|Dustin Davis Dustin|Rylan Delaune Rylan|Jamion James Jamion|Kylin Jones Kylin|Tylon Dominick Tylon|Kane Saavedra Kane|Colt Lavarine Colt|Javante Broussard Javante|Deontae Fleming Deontae|Jaden Moffitt Jaden|Huckleberry Finley Huckleberry|Brylan Washington Brylan|Krew Collura Krew|Brylan Washington Brylan|Preston Pellerin Preston|Denham Ellsworth Denham|Sley Gardner Sley|Bryce Shropshire Bryce|Jamall Breaux Jamall|Coates Jr$|James Jr$|Copeland Jr$|Chance Archangel Caleb)/i
];

function isJunk(name) {
  return JUNK_PATTERNS.some(p => p.test(name)) ||
    name.split(" ").length > 4 ||  // More than 4 words = likely garbage
    name.length > 50 ||
    /\d/.test(name) ||  // Contains numbers
    /[,\.!?]/.test(name);  // Contains punctuation
}

function request(method, path2, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: HOST, path: path2, method,
      headers: {
        "apikey": KEY, "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      }
    };
    if (payload) opts.headers["Content-Length"] = Buffer.byteLength(payload);
    const req = https.request(opts, r => {
      let d = ""; r.on("data", c => d += c);
      r.on("end", () => resolve({ status: r.statusCode, body: d }));
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  // 1. Fetch all PRZ records
  console.log("Fetching PRZ records...");
  const r = await request("GET", "/rest/v1/athletes?player_id=like.PRZ-*&select=id,player_id,full_name&limit=400");
  const all = JSON.parse(r.body);
  console.log("Total PRZ records:", all.length);

  // 2. Separate clean vs junk
  const clean = all.filter(a => !isJunk(a.full_name));
  const junk = all.filter(a => isJunk(a.full_name));
  console.log("Clean player names:", clean.length);
  console.log("Junk to delete:", junk.length);

  console.log("\n✅ CLEAN PLAYERS:");
  clean.forEach(a => console.log("  " + a.player_id + " | " + a.full_name));

  // 3. Delete junk records
  if (junk.length > 0) {
    const junkIds = junk.map(a => a.player_id);
    console.log("\n🗑️ Deleting junk...");
    // Delete in chunks of 50 using IN filter
    for (let i = 0; i < junkIds.length; i += 50) {
      const chunk = junkIds.slice(i, i + 50);
      const filterStr = chunk.map(id => encodeURIComponent(id)).join(",");
      const dr = await request("DELETE", "/rest/v1/athletes?player_id=in.(" + filterStr + ")");
      console.log("  Deleted batch", Math.floor(i/50)+1, "→ HTTP", dr.status);
    }
  }

  // 4. Final count
  const total = await request("GET", "/rest/v1/athletes?select=count");
  console.log("\n📊 FINAL DB COUNT:");
  console.log(total.body);
})();