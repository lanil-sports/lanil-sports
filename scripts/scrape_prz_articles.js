const fetch = globalThis.fetch;
const cheerio = require("cheerio");
const https = require("https");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// High-value Prep Redzone article URLs with real Louisiana player data
const PRZ_ARTICLES = [
  { url: "https://prepredzone.com/2026/11/louisiana-my-guys-playoff-edition/", sport: "Football" },
  { url: "https://prepredzone.com/2026/11/offensive-stat-leaders-in-louisiana-ahead-of-the-playoffs/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/louisiana-high-school-wide-receivers-who-are-dawgs/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/running-backs-who-have-produced-at-a-high-level-in-louisiana/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/defensive-stat-leaders-in-louisiana-10-29/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/offensive-stat-leaders-louisiana-high-school-football-10-27/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/midseason-freak-list-louisiana-edition/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/some-louisiana-players-who-are-on-a-roll/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/midseason-awards-louisiana-high-school-football/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/midseason-first-team-all-louisiana/", sport: "Football" },
  { url: "https://prepredzone.com/2026/10/louisiana-football-names-you-should-know/", sport: "Football" },
  { url: "https://prepredzone.com/louisiana/rankings/2027-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/louisiana/rankings/2028-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/louisiana/rankings/2029-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/2026/09/2031-louisiana-and-mississippi-prospects-to-know/", sport: "Football" },
  { url: "https://prepredzone.com/2026/08/where-each-wide-receiver-ranks-in-the-2028-louisiana-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/2026/08/where-each-quarterback-ranks-in-the-2029-louisiana-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/2026/08/where-each-running-back-ranks-in-the-2028-louisiana-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/2026/08/where-each-edge-ranks-in-the-2028-louisiana-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/2026/08/where-each-linebacker-ranks-in-the-2028-louisiana-rankings/", sport: "Football" },
  { url: "https://prepredzone.com/2026/07/top-2028-louisiana-prospects/", sport: "Football" }
];

// Extract year from URL
function extractYear(url) {
  const m = url.match(/\/(202[6-9]|2030|2031)-rankings/);
  if (m) return parseInt(m[1]);
  const m2 = url.match(/2028|2029|2027|2030|2031/);
  return m2 ? parseInt(m2[0]) : 2027;
}

// Extract position from text context
function extractPos(text) {
  const posMap = {
    "quarterback": "QB", "wide receiver": "WR", "running back": "RB",
    "tight end": "TE", "offensive line": "OL", "defensive line": "DL",
    "linebacker": "LB", "defensive back": "DB", "cornerback": "CB",
    "safety": "S", "edge": "EDGE", "kicker": "K", "punter": "P",
    "qb": "QB", "wr": "WR", "rb": "RB", "te": "TE", "ol": "OL",
    "dl": "DL", "lb": "LB", "db": "DB", "cb": "CB", "de": "DE"
  };
  const lower = text.toLowerCase();
  for (const [k,v] of Object.entries(posMap)) {
    if (lower.includes(k)) return v;
  }
  return "";
}

// Parse player entries from article text
function parseArticleContent($, url, sport) {
  const players = [];
  const gradYear = extractYear(url);

  // Get all text content
  const content = $(".entry-content, .post-content, article, main").first();

  // Strategy 1: Look for bold/strong tags (player names are often bolded)
  content.find("strong, b").each((i, el) => {
    const text = $(el).text().trim();
    // Name pattern: "First Last" or "First Last, School"
    if (/^[A-Z][a-z]+ [A-Z][a-z']+/.test(text) && text.length < 60 && text.length > 4) {
      const parentText = $(el).parent().text().trim();
      // Extract school from surrounding text
      const schoolMatch = parentText.match(/([A-Z][a-zA-Z\s\.]+(?:High School|High|Academy|Prep|Christian))/);
      players.push({
        name: text.split(",")[0].trim(),
        school: schoolMatch ? schoolMatch[1].trim() : "",
        pos: extractPos(parentText),
        gradYear,
        sport,
        bio: parentText.substring(0, 300),
        source: "Prep Redzone"
      });
    }
  });

  // Strategy 2: Numbered list items (rankings pages)
  content.find("ol li, ul li").each((i, el) => {
    const text = $(el).text().trim();
    const nameMatch = text.match(/^(\d+\.\s*)?([A-Z][a-z]+ [A-Z][a-z']+(?:\s[A-Z][a-z]+)?)/);
    if (nameMatch && nameMatch[2]) {
      const name = nameMatch[2].trim();
      if (name.length > 4 && name.length < 50) {
        const schoolMatch = text.match(/([A-Z][a-zA-Z\s\.]+(?:High School|High|Academy|Prep|Christian))/);
        players.push({
          name,
          school: schoolMatch ? schoolMatch[1].trim() : "",
          pos: extractPos(text),
          gradYear,
          sport,
          bio: text.substring(0, 300),
          source: "Prep Redzone"
        });
      }
    }
  });

  // Strategy 3: Paragraphs with "Name, School" pattern
  content.find("p").each((i, el) => {
    const text = $(el).text().trim();
    const matches = [...text.matchAll(/([A-Z][a-z]+ [A-Z][a-z']+(?:\s[A-Z][a-z]+)?),?\s+([A-Z][a-zA-Z\s\.]+(?:High|Academy|Prep|Christian))/g)];
    for (const m of matches) {
      players.push({
        name: m[1].trim(),
        school: m[2].trim(),
        pos: extractPos(text),
        gradYear,
        sport,
        bio: text.substring(0, 300),
        source: "Prep Redzone"
      });
    }
  });

  // Strategy 4: h3/h4 player name headers
  content.find("h3, h4, h5").each((i, el) => {
    const text = $(el).text().trim();
    if (/^[A-Z][a-z]+ [A-Z][a-z']+/.test(text) && text.length < 60) {
      const nextText = $(el).next().text().trim();
      const schoolMatch = (text + " " + nextText).match(/([A-Z][a-zA-Z\s\.]+(?:High School|High|Academy|Prep|Christian))/);
      players.push({
        name: text.split(",")[0].split("|")[0].trim(),
        school: schoolMatch ? schoolMatch[1].trim() : "",
        pos: extractPos(nextText),
        gradYear,
        sport,
        bio: nextText.substring(0, 300),
        source: "Prep Redzone"
      });
    }
  });

  return players;
}

let idCount = 300;
function normalize(p) {
  if (!p.name || p.name.length < 4) return null;
  if (/class|click|view|read|more|louisiana|football|basketball/i.test(p.name)) return null;
  idCount++;
  const pid = "PRZ-" + String(idCount).padStart(4, "0");
  const year = p.gradYear || 2027;
  return {
    player_id: pid,
    full_name: p.name,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g,"-") + "-" + year,
    grad_year: year,
    current_grade: year <= 2027 ? "Senior" : year === 2028 ? "Junior" : year === 2029 ? "Sophomore" : "Freshman",
    school_id: (p.school || "unknown").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-high-school$/,"").replace(/-high$/,"").substring(0,50) || "unknown",
    school_name: p.school || "Louisiana High School",
    parish_city: "Louisiana",
    primary_sport: p.sport || "Football",
    secondary_sports: [],
    position: p.pos || "",
    season_stats_summary: p.bio ? p.bio.substring(0,200) : "Sourced from Prep Redzone Louisiana",
    newspaper_mentions: [],
    social_handles: {},
    total_followers: 0,
    est_nil_value: 0,
    potential_colleges: [],
    headshot_url: "",
    photo_gallery: [],
    bio: "Source: Prep Redzone. " + (p.bio || "").substring(0,300),
    hudl_url: "", youtube_url: "",
    gpa: null,
    claimed: false, tier: "free",
    verified: false, parent_consent_verified: false
  };
}

function upsertAthletes(arr) {
  if (!arr.length) return Promise.resolve(0);
  const payload = JSON.stringify(arr);
  return new Promise((res, rej) => {
    const opts = {
      hostname: HOST, path: "/rest/v1/athletes?on_conflict=player_id",
      method: "POST",
      headers: {
        "apikey": KEY, "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const req = https.request(opts, r => {
      let d = ""; r.on("data", c => d += c);
      r.on("end", () => {
        if (r.statusCode === 200 || r.statusCode === 201 || r.statusCode === 204) res(arr.length);
        else { console.log("  Upsert error:", d.substring(0,200)); res(0); }
      });
    });
    req.on("error", rej);
    req.write(payload); req.end();
  });
}

(async () => {
  console.log("LANILSPORTS — Prep Redzone Article Scraper");
  console.log("Targeting", PRZ_ARTICLES.length, "Louisiana articles");
  console.log("=".repeat(50));

  const allPlayers = [];
  const seen = new Set();

  for (const { url, sport } of PRZ_ARTICLES) {
    try {
      console.log("\nFetching:", url.replace("https://prepredzone.com","PRZ"));
      const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html" }, timeout: 15000 });
      if (!r.ok) { console.log("  HTTP", r.status); continue; }
      const html = await r.text();
      const $ = cheerio.load(html);
      const players = parseArticleContent($, url, sport);
      console.log("  Found", players.length, "player entries");
      players.forEach(p => {
        const key = p.name.toLowerCase() + "|" + (p.school || "").toLowerCase().substring(0,20);
        if (!seen.has(key) && p.name.length > 3) {
          seen.add(key);
          allPlayers.push(p);
        }
      });
    } catch(e) { console.log("  Error:", e.message.substring(0,80)); }
    await sleep(1500);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Total unique players found:", allPlayers.length);

  const normalized = allPlayers.map(normalize).filter(Boolean);
  console.log("After normalization:", normalized.length);

  if (normalized.length > 0) {
    console.log("\nSample players:");
    normalized.slice(0,10).forEach(p => console.log(" + " + p.full_name + " | " + p.school_name + " | " + p.position));

    let upserted = 0;
    for (let i = 0; i < normalized.length; i += 25) {
      const n = await upsertAthletes(normalized.slice(i, i+25));
      upserted += n;
    }
    console.log("\n✅ Upserted", upserted, "players from Prep Redzone to Supabase");
  } else {
    console.log("\nNo players parsed — articles may be paywalled or JS-rendered");
  }

  // Print all found for review
  console.log("\nAll found players:");
  allPlayers.forEach((p,i) => console.log(i+1 + ". " + p.name + " | " + (p.school||"?") + " | " + (p.pos||"?") + " | " + (p.gradYear||"?")));
})();