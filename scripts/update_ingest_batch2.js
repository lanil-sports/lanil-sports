const fs = require("fs");
const path = require("path");

const scriptPath = path.join(__dirname, "..", "scripts", "ingest_maxpreps.js");
let code = fs.readFileSync(scriptPath, "utf8");

// 1. Replace MP- with LANIL-
code = code.replace(/const pid = `MP-\${schoolId\.substring\(0, 10\)}-\${gradYear}-\${String\(idx \+ 1\)\.padStart\(3, "0"\)}`;/g,
  'const pid = `LANIL-${schoolId.substring(0, 10).toUpperCase()}-${gradYear}-${String(idx + 1).padStart(3, "0")}`;');

// 2. Target the next batch of 40 schools (slice 35 to 75)
code = code.replace(/const targetSchools = allSchools\.slice\(0, 35\);/g,
  'const targetSchools = allSchools.slice(35, 75);');

// 3. Ingest both football and basketball
const oldScrapeLoop = `      const footballPlayers = await scrapeSchoolRoster(schoolObj, "football");
      if (footballPlayers.length > 0) {
        const headshots = footballPlayers.filter(p => p.headshot_url).length;
        totalWithHeadshots += headshots;
        console.log(\`  Upserting \${footballPlayers.length} athletes (\${headshots} headshots)...\`);

        const res = await postJSON("/rest/v1/athletes?on_conflict=slug", footballPlayers);
        if (res.status >= 200 && res.status < 300) {
          totalAthletes += footballPlayers.length;
          console.log(\`  Saved \${footballPlayers.length} athletes.\`);
        } else {
          console.log(\`  Error upserting athletes: HTTP \${res.status} \${res.body.substring(0, 100)}\`);
        }
      }`;

const newScrapeLoop = `      for (const currentSport of ["football", "basketball"]) {
        const players = await scrapeSchoolRoster(schoolObj, currentSport);
        if (players.length > 0) {
          const headshots = players.filter(p => p.headshot_url).length;
          totalWithHeadshots += headshots;
          console.log(\`  Upserting \${players.length} \${currentSport} athletes (\${headshots} headshots)...\`);

          const res = await postJSON("/rest/v1/athletes?on_conflict=slug", players);
          if (res.status >= 200 && res.status < 300) {
            totalAthletes += players.length;
            console.log(\`  Saved \${players.length} \${currentSport} athletes.\`);
          } else {
            console.log(\`  Error upserting: HTTP \${res.status} \${res.body.substring(0, 100)}\`);
          }
        }
        await new Promise(r => setTimeout(r, 400));
      }`;

if (code.includes(oldScrapeLoop)) {
  code = code.replace(oldScrapeLoop, newScrapeLoop);
}

fs.writeFileSync(scriptPath, code, "utf8");
console.log("Updated ingest_maxpreps.js for batch 2 (Schools 35-75, Football & Basketball, LANIL- IDs)!");
