const https = require("https");
const fs = require("fs");
const path = require("path");

const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");
const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";

function replaceOn3(str) {
  if (!str) return str;
  return str
    .replace(/On3\s*Rating:/gi, "LANIL Rating:")
    .replace(/On3\s*Consensus/gi, "LANIL Consensus")
    .replace(/On3\s*Radar/gi, "LANIL Radar")
    .replace(/On3/gi, "LANIL");
}

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function updateSupabase() {
  console.log("Fetching athletes from Supabase...");
  const getOpt = {
    hostname: HOST,
    path: "/rest/v1/athletes?or=(season_stats_summary.ilike.*On3*,bio.ilike.*On3*,player_id.ilike.*ON3*)&select=id,player_id,full_name,season_stats_summary,bio",
    method: "GET",
    headers: {
      "apikey": KEY,
      "Authorization": "Bearer " + KEY
    }
  };

  const res = await request(getOpt);
  const rows = JSON.parse(res.body);
  console.log(`Found ${rows.length} rows to update in Supabase.`);

  for (const row of rows) {
    const updatedPlayerId = (row.player_id || "").replace(/^ON3-/i, "LANIL-");
    const updatedStats = replaceOn3(row.season_stats_summary);
    const updatedBio = replaceOn3(row.bio);

    const patchData = JSON.stringify({
      player_id: updatedPlayerId,
      season_stats_summary: updatedStats,
      bio: updatedBio
    });

    const patchOpt = {
      hostname: HOST,
      path: `/rest/v1/athletes?id=eq.${row.id}`,
      method: "PATCH",
      headers: {
        "apikey": KEY,
        "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      }
    };

    const patchRes = await request(patchOpt, patchData);
    console.log(`Updated ${row.full_name}: HTTP ${patchRes.status}`);
  }

  console.log("Supabase records updated successfully!");
}

async function updateLocalSeedFiles() {
  const seedPath = path.join(__dirname, "seed_recruiting_data.js");
  if (fs.existsSync(seedPath)) {
    let content = fs.readFileSync(seedPath, "utf8");
    content = content
      .replace(/player_id:"ON3-/g, 'player_id:"LANIL-')
      .replace(/On3 Rating:/g, "LANIL Rating:")
      .replace(/On3 Consensus/g, "LANIL Consensus")
      .replace(/On3 Radar/g, "LANIL Radar")
      .replace(/On3/g, "LANIL");
    fs.writeFileSync(seedPath, content, "utf8");
    console.log("Updated seed_recruiting_data.js");
  }

  const scrapePath = path.join(__dirname, "scrape_recruiting.js");
  if (fs.existsSync(scrapePath)) {
    let content = fs.readFileSync(scrapePath, "utf8");
    content = content
      .replace(/player_id:"ON3-/g, 'player_id:"LANIL-')
      .replace(/On3 Rating:/g, "LANIL Rating:")
      .replace(/On3/g, "LANIL");
    fs.writeFileSync(scrapePath, content, "utf8");
    console.log("Updated scrape_recruiting.js");
  }
}

async function run() {
  await updateSupabase();
  await updateLocalSeedFiles();
}

run().catch(console.error);
