const https = require("https");
const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");

function patchAthletes(filter, updates) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(updates);
    const options = {
      hostname: HOST,
      path: "/rest/v1/athletes?" + filter,
      method: "PATCH",
      headers: {
        "apikey": KEY,
        "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log("Purging all adult Unsplash images from Supabase...");
  const res = await patchAthletes("headshot_url=like.*unsplash.com*", { headshot_url: "" });
  console.log("Supabase PATCH status:", res.status);
  try {
    const updated = JSON.parse(res.body);
    console.log(`Cleared bearded headshots from ${updated.length} athlete profiles in Supabase!`);
  } catch(e) {
    console.log("Body:", res.body.substring(0, 200));
  }
})();