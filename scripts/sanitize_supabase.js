const fs = require("fs");
const htmlPath = "lanil-sports/index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const target = `ATHLETES = data.map(a => ({
        ...a,
        headshot_url: a.headshot_url || ""
      }));`;

const replacement = `ATHLETES = data.map(a => ({
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

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("Sanitization added to loadLiveSupabaseAthletes successfully!");
} else {
  console.log("Target not found, checking current state...");
}
