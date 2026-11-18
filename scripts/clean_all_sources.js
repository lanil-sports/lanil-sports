const https = require("https");
const fs = require("fs");
const path = require("path");

const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");
const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";

function cleanScoutingText(str) {
  if (!str) return "";
  return str
    .replace(/\.?\s*(?:View\s*official\s*)?MaxPreps(?:\s*profile)?:\s*https?:\/\/[^\s]+/gi, ". Verified LHSAA varsity roster.")
    .replace(/https?:\/\/(?:www\.)?(?:maxpreps|on3|247sports|prepredzone|rivals)\.com[^\s]*/gi, "")
    .replace(/On3\s*Rating:/gi, "LANIL Rating:")
    .replace(/On3\s*Consensus/gi, "LANIL Consensus")
    .replace(/On3\s*Radar/gi, "LANIL Radar")
    .replace(/On3/gi, "LANIL")
    .replace(/247\s*Composite:/gi, "LANIL Composite:")
    .replace(/247\s*Rating:/gi, "LANIL Rating:")
    .replace(/247Sports/gi, "LANIL")
    .replace(/247\s*Sports/gi, "LANIL")
    .replace(/\b247\b/gi, "LANIL")
    .replace(/Prep\s*Redzone\s*All-State\s*Watch/gi, "LANIL All-State Watch")
    .replace(/Prep\s*Redzone\s*Freshman\s*Watch/gi, "LANIL Freshman Watch")
    .replace(/Prep\s*Redzone\s*Watch/gi, "LANIL Scouting Watch")
    .replace(/Prep\s*Redzone/gi, "LANIL Scouting")
    .replace(/MaxPreps/gi, "LHSAA Roster")
    .replace(/Rivals/gi, "LANIL")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
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

async function cleanSupabaseAthletes() {
  console.log("Searching Supabase athletes for mentions of MaxPreps, On3, 247, Prep Redzone, Rivals...");

  let offset = 0;
  const limit = 200;
  let hasMore = true;
  let totalUpdated = 0;

  while (hasMore) {
    const getOpt = {
      hostname: HOST,
      path: `/rest/v1/athletes?select=id,full_name,season_stats_summary,bio,player_id&order=id.asc&offset=${offset}&limit=${limit}`,
      method: "GET",
      headers: {
        "apikey": KEY,
        "Authorization": "Bearer " + KEY
      }
    };

    const res = await request(getOpt);
    if (res.status !== 200) {
      console.error("Error fetching rows:", res.status, res.body);
      break;
    }

    const rows = JSON.parse(res.body);
    if (rows.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of rows) {
      const origBio = row.bio || "";
      const origStats = row.season_stats_summary || "";
      const origId = row.player_id || "";

      const cleanBio = cleanScoutingText(origBio);
      const cleanStats = cleanScoutingText(origStats);
      const cleanId = origId.replace(/^ON3-/i, "LANIL-");

      if (cleanBio !== origBio || cleanStats !== origStats || cleanId !== origId) {
        const patchData = JSON.stringify({
          bio: cleanBio,
          season_stats_summary: cleanStats,
          player_id: cleanId
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
        if (patchRes.status >= 200 && patchRes.status < 300) {
          totalUpdated++;
          if (totalUpdated % 20 === 0) {
            console.log(`Cleaned and updated ${totalUpdated} athletes in Supabase...`);
          }
        }
      }
    }

    offset += rows.length;
    if (rows.length < limit) {
      hasMore = false;
    }
  }

  console.log(`Finished Supabase cleanup! Total updated rows: ${totalUpdated}`);
}

function cleanLocalFiles() {
  console.log("Cleaning local project files...");

  // 1. Clean scripts/seed_recruiting_data.js
  const seedFile = path.join(__dirname, "seed_recruiting_data.js");
  if (fs.existsSync(seedFile)) {
    let content = fs.readFileSync(seedFile, "utf8");
    content = cleanScoutingText(content);
    fs.writeFileSync(seedFile, content, "utf8");
    console.log("Cleaned seed_recruiting_data.js");
  }

  // 2. Clean scripts/ingest_maxpreps.js
  const ingestFile = path.join(__dirname, "ingest_maxpreps.js");
  if (fs.existsSync(ingestFile)) {
    let content = fs.readFileSync(ingestFile, "utf8");
    content = content.replace(
      /bio:\s*`Varsity \$\{sport\} athlete at \$\{school\.name\}\. Height: \$\{heightStr \|\| "N\/A"\}, Weight: \$\{weight \? weight \+ " lbs" : "N\/A"\}\. MaxPreps: \$\{profileUrl\}`/g,
      'bio: `Varsity ${sport} athlete at ${school.name}. Height: ${heightStr || "N/A"}, Weight: ${weight ? weight + " lbs" : "N/A"}. Verified LHSAA varsity roster.`'
    );
    fs.writeFileSync(ingestFile, content, "utf8");
    console.log("Cleaned ingest_maxpreps.js");
  }

  // 3. Clean index.html
  const htmlFile = path.join(__dirname, "..", "index.html");
  if (fs.existsSync(htmlFile)) {
    let html = fs.readFileSync(htmlFile, "utf8");

    // Add cleanScoutingText helper in index.html if not present
    if (!html.includes("function cleanScoutingText(")) {
      const helper = `
function cleanScoutingText(str) {
  if (!str) return '';
  return str
    .replace(/\\.?\\s*(?:View\\s*official\\s*)?MaxPreps(?:\\s*profile)?:\\s*https?:\\/\\/[^\\s]+/gi, '. Verified LHSAA varsity roster.')
    .replace(/https?:\\/\\/(?:www\\.)?(?:maxpreps|on3|247sports|prepredzone|rivals)\\.com[^\\s]*/gi, '')
    .replace(/On3\\s*Rating:/gi, 'LANIL Rating:')
    .replace(/On3\\s*Consensus/gi, 'LANIL Consensus')
    .replace(/On3\\s*Radar/gi, 'LANIL Radar')
    .replace(/On3/gi, 'LANIL')
    .replace(/247\\s*Composite:/gi, 'LANIL Composite:')
    .replace(/247\\s*Rating:/gi, 'LANIL Rating:')
    .replace(/247Sports/gi, 'LANIL')
    .replace(/247\\s*Sports/gi, 'LANIL')
    .replace(/\\b247\\b/gi, 'LANIL')
    .replace(/Prep\\s*Redzone\\s*All-State\\s*Watch/gi, 'LANIL All-State Watch')
    .replace(/Prep\\s*Redzone\\s*Freshman\\s*Watch/gi, 'LANIL Freshman Watch')
    .replace(/Prep\\s*Redzone\\s*Watch/gi, 'LANIL Scouting Watch')
    .replace(/Prep\\s*Redzone/gi, 'LANIL Scouting')
    .replace(/MaxPreps/gi, 'LHSAA Roster')
    .replace(/Rivals/gi, 'LANIL')
    .replace(/\\s{2,}/g, ' ')
    .replace(/\\s+\\./g, '.')
    .trim();
}
`;
      html = html.replace("let ATHLETES = [...window.INITIAL_ATHLETES];", helper + "\nlet ATHLETES = [...window.INITIAL_ATHLETES];");
    }

    // Ensure loadLiveSupabaseAthletes runs cleanScoutingText on all fields
    const supabaseMapTarget = `ATHLETES = data.map(a => ({
        ...a,
        player_id: (a.player_id || '').replace(/^ON3-/i, 'LANIL-'),
        season_stats_summary: (a.season_stats_summary || '')
          .replace(/On3\\s*Rating:/gi, 'LANIL Rating:')
          .replace(/On3\\s*Consensus/gi, 'LANIL Consensus')
          .replace(/On3\\s*Radar/gi, 'LANIL Radar')
          .replace(/On3/gi, 'LANIL'),
        bio: (a.bio || '')
          .replace(/On3\\s*Rating:/gi, 'LANIL Rating:')
          .replace(/On3\\s*Consensus/gi, 'LANIL Consensus')
          .replace(/On3\\s*Radar/gi, 'LANIL Radar')
          .replace(/On3/gi, 'LANIL'),
        headshot_url: a.headshot_url || ""
      }));`;

    const cleanSupabaseMap = `ATHLETES = data.map(a => ({
        ...a,
        player_id: (a.player_id || '').replace(/^ON3-/i, 'LANIL-'),
        season_stats_summary: cleanScoutingText(a.season_stats_summary || ''),
        bio: cleanScoutingText(a.bio || ''),
        headshot_url: a.headshot_url || ""
      }));`;

    html = html.replace(supabaseMapTarget, cleanSupabaseMap);

    // Also wrap bio and stats rendering in cleanScoutingText
    html = html.replace(/\$\{a\.season_stats_summary\}/g, "${cleanScoutingText(a.season_stats_summary)}");
    html = html.replace(/\$\{a\.bio \|\| 'Official verified roster athlete\.'\}/g, "${cleanScoutingText(a.bio) || 'Official verified roster athlete.'}");

    fs.writeFileSync(htmlFile, html, "utf8");
    console.log("Cleaned index.html");
  }
}

async function main() {
  cleanLocalFiles();
  await cleanSupabaseAthletes();
}

main().catch(console.error);
