/**
 * LANILSPORTS — Multi-Source Recruiting Scraper v2
 * - Prep Redzone: cheerio (open access)
 * - LANIL: Puppeteer stealth (bypasses Cloudflare)
 * - 247Sports: Puppeteer stealth (bypasses CDN)
 */

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const https = require("https");
const fs = require("fs");
const path = require("path");

const SUPABASE_HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.SUPABASE_SERVICE_ROLE_KEY || "");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

let idCounter = 200;
function nextId() { return "EXT-" + String(++idCounter).padStart(4, "0"); }

// ─── PREP REDZONE (cheerio, no JS needed) ────────────────────────────────────

async function scrapePreRedzone() {
  console.log("\n========== PREP REDZONE ==========");
  const results = [];

  const urls = [
    "https://www.prepredzone.com/louisiana/",
    "https://www.prepredzone.com/2026/11/",
    "https://www.prepredzone.com/2026/10/",
    "https://www.prepredzone.com/2026/09/",
    "https://www.prepredzone.com/category/louisiana-football/",
    "https://www.prepredzone.com/category/louisiana-basketball/"
  ];

  for (const url of urls) {
    try {
      console.log("  Fetching:", url);
      const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "text/html" }, timeout: 15000 });
      if (!res.ok) { console.log("  HTTP", res.status); continue; }
      const html = await res.text();
      const $ = cheerio.load(html);

      // Extract article headlines mentioning Louisiana HS players
      $("h2 a, h3 a, h1 a, .entry-title a").each((i, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr("href") || "";
        if (title.length > 10 && title.length < 150) {
          results.push({ type: "headline", title, url: href, source: "Prep Redzone" });
        }
      });

      // Extract player names from lists/paragraphs
      $(".entry-content p, .entry-content li, .post-content p").each((i, el) => {
        const text = $(el).text().trim();
        // Pattern: FirstName LastName, School, Position (Year)
        const matches = text.matchAll(/([A-Z][a-z]+ [A-Z][a-z']+(?:\s[A-Z][a-z]+)?),?\s+([A-Z][A-Za-z\s\.]+(?:High School|High|Academy|Prep))/g);
        for (const m of matches) {
          results.push({
            type: "player",
            name: m[1].trim(),
            school: m[2].trim(),
            rawText: text.substring(0, 200),
            url: url,
            source: "Prep Redzone"
          });
        }
      });

      console.log("  Collected", results.length, "records so far");
    } catch(e) { console.log("  Error:", e.message); }
    await sleep(rand(1500, 2500));
  }

  return results;
}

// ─── ON3 (Puppeteer stealth) ──────────────────────────────────────────────────

async function scrapeLANIL(browser) {
  console.log("\n========== ON3 (Puppeteer) ==========");
  const results = [];

  const urls = [
    { url: "https://www.on3.com/db/rankings/football/national/2027/?position=&stateId=18", sport: "Football", year: 2027 },
    { url: "https://www.on3.com/db/rankings/football/national/2028/?position=&stateId=18", sport: "Football", year: 2028 },
    { url: "https://www.on3.com/db/rankings/basketball/national/2027/?position=&stateId=18", sport: "Basketball", year: 2027 },
    { url: "https://www.on3.com/db/rankings/baseball/national/2027/?position=&stateId=18", sport: "Baseball", year: 2027 }
  ];

  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({ width: 1280, height: 900 });

  for (const { url, sport, year } of urls) {
    try {
      console.log("  Loading:", url);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await sleep(3000);

      // Wait for player cards to appear
      await page.waitForSelector("[class*='PlayerCard'], [class*='prospect'], .recruit, table tbody tr", { timeout: 10000 }).catch(() => {});

      const html = await page.content();
      const $ = cheerio.load(html);

      // LANIL player rows
      $("[class*='PlayerCard'], [class*='RecruitCard'], tr").each((i, el) => {
        const $el = $(el);
        const name = $el.find("[class*='name'], [class*='Name'], td:nth-child(2), .athlete").first().text().trim();
        const school = $el.find("[class*='school'], [class*='School'], td:nth-child(4)").first().text().trim();
        const pos = $el.find("[class*='pos'], [class*='Pos'], td:nth-child(3)").first().text().trim();
        const rating = $el.find("[class*='rating'], [class*='Rating'], [class*='score'], td:nth-child(5)").first().text().trim();
        const href = $el.find("a").first().attr("href") || "";
        if (name && name.length > 3 && !/rank|name|pos|school/i.test(name)) {
          results.push({
            type: "player", name, school, pos, sport, year,
            rating, url: href ? "https://www.on3.com" + href : url,
            source: "LANIL"
          });
        }
      });

      console.log("  LANIL records so far:", results.length);
    } catch(e) { console.log("  LANIL error:", e.message.substring(0, 100)); }
    await sleep(rand(3000, 5000));
  }

  await page.close();
  return results;
}

// ─── 247SPORTS (Puppeteer stealth) ───────────────────────────────────────────

async function scrape247(browser) {
  console.log("\n========== 247SPORTS (Puppeteer) ==========");
  const results = [];

  const urls = [
    { url: "https://247sports.com/Season/2027-Football/CompositeRecruitRankings/?InstitutionGroup=HighSchool&State=LA", sport: "Football", year: 2027 },
    { url: "https://247sports.com/Season/2028-Football/CompositeRecruitRankings/?InstitutionGroup=HighSchool&State=LA", sport: "Football", year: 2028 },
    { url: "https://247sports.com/Season/2027-Basketball/CompositeRecruitRankings/?InstitutionGroup=HighSchool&State=LA", sport: "Basketball", year: 2027 },
    { url: "https://247sports.com/Season/2028-Basketball/CompositeRecruitRankings/?InstitutionGroup=HighSchool&State=LA", sport: "Basketball", year: 2028 },
    { url: "https://247sports.com/Season/2029-Football/CompositeRecruitRankings/?InstitutionGroup=HighSchool&State=LA", sport: "Football", year: 2029 }
  ];

  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({ width: 1280, height: 900 });
  // Set extra headers to look more like a real browser
  await page.setExtraHTTPHeaders({
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none"
  });

  for (const { url, sport, year } of urls) {
    try {
      console.log("  Loading:", url);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });
      await sleep(4000);

      // Scroll to load lazy content
      await page.evaluate(() => window.scrollBy(0, 800));
      await sleep(2000);

      await page.waitForSelector(".rankings-page__list-item, .recruit, li[class*='ListView'], tr", { timeout: 12000 }).catch(() => {});

      const html = await page.content();
      const $ = cheerio.load(html);

      $(".rankings-page__list-item, li[class*='ListView'], .recruit").each((i, el) => {
        const $el = $(el);
        const name = $el.find(".rankings-page__name-link, [class*='Name'], .name").first().text().trim();
        const school = $el.find(".rankings-page__school-name, [class*='School'], .school, .meta").first().text().trim();
        const pos = $el.find(".position, [class*='Position'], .pos").first().text().trim();
        const stars = $el.find(".icon-starsolid, [class*='stars']").length;
        const rating = $el.find("[class*='Score'], .score, .rating").first().text().trim();
        const natRank = $el.find("[class*='natrank'], .natrank").first().text().trim();
        const stateRank = $el.find("[class*='staterank'], .staterank").first().text().trim();
        const href = $el.find("a").first().attr("href") || "";
        if (name && name.length > 3 && !/player|rank|name/i.test(name)) {
          results.push({
            type: "player", name, school, pos, sport, year,
            stars, rating, natRank, stateRank,
            url: href.startsWith("http") ? href : "https://247sports.com" + href,
            source: "247Sports"
          });
        }
      });

      console.log("  247Sports records so far:", results.length);
    } catch(e) { console.log("  247 error:", e.message.substring(0, 100)); }
    await sleep(rand(4000, 7000));
  }

  await page.close();
  return results;
}

// ─── NORMALIZE TO SUPABASE FORMAT ────────────────────────────────────────────

function normalize(raw) {
  if (!raw.name || raw.name.length < 3) return null;
  const name = raw.name.replace(/\s+/g, " ").trim();
  if (/ranking|recruit|football|basketball|click|more|view/i.test(name)) return null;
  const sport = (raw.sport || "Football");
  const year = raw.year || 2027;
  return {
    player_id: nextId(),
    full_name: name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + year,
    grad_year: year,
    current_grade: year <= 2027 ? "Senior" : year === 2028 ? "Junior" : year === 2029 ? "Sophomore" : "Freshman",
    school_id: (raw.school || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-high-school$/, "").replace(/-high$/, "").substring(0, 50) || "unknown",
    school_name: raw.school || "Louisiana HS",
    parish_city: "Louisiana",
    primary_sport: sport,
    secondary_sports: [],
    position: raw.pos || "",
    season_stats_summary: [
      raw.rating ? "Rating: " + raw.rating : "",
      raw.stars ? raw.stars + "-star recruit" : "",
      raw.natRank ? "Nat Rank: #" + raw.natRank : "",
      raw.stateRank ? "LA Rank: #" + raw.stateRank : ""
    ].filter(Boolean).join(" | "),
    newspaper_mentions: [],
    social_handles: {},
    total_followers: 0,
    est_nil_value: raw.stars >= 5 ? 85000 : raw.stars === 4 ? 35000 : raw.stars === 3 ? 8000 : 1500,
    potential_colleges: [],
    headshot_url: "",
    photo_gallery: [],
    bio: "Sourced via " + (raw.source || "scraper") + ". Profile: " + (raw.url || ""),
    hudl_url: "", youtube_url: "",
    gpa: null,
    claimed: false, tier: "free",
    verified: false, parent_consent_verified: false
  };
}

// ─── SUPABASE UPSERT ─────────────────────────────────────────────────────────

async function upsertBatch(athletes) {
  if (!athletes.length) return 0;
  const payload = JSON.stringify(athletes);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_HOST,
      path: "/rest/v1/athletes?on_conflict=player_id",
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) resolve(athletes.length);
        else { console.error("  Upsert error", res.statusCode, d.substring(0, 200)); resolve(0); }
      });
    });
    req.on("error", reject);
    req.write(payload); req.end();
  });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

(async () => {
  console.log("LANILSPORTS Recruiting Scraper v2");
  console.log("LANIL | 247Sports | Prep Redzone");
  console.log("=" .repeat(50));

  let allRaw = [];
  let totalUpserted = 0;
  const logData = { timestamp: new Date().toISOString(), sources: {} };

  // 1. Prep Redzone (no browser needed)
  const przRaw = await scrapePreRedzone();
  logData.sources.prepRedzone = przRaw;
  console.log("\nPrep Redzone raw records:", przRaw.length);
  allRaw = allRaw.concat(przRaw.filter(r => r.type === "player"));

  // 2. Try Puppeteer for LANIL + 247Sports
  let browser = null;
  try {
    const puppeteer = require("puppeteer-extra");
    const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteer.use(StealthPlugin());

    console.log("\nLaunching stealth browser...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
             "--disable-accelerated-2d-canvas", "--no-first-run", "--no-zygote",
             "--disable-gpu", "--window-size=1280,900"]
    });
    console.log("Browser launched OK");

    const on3Raw = await scrapeLANIL(browser);
    logData.sources.on3 = on3Raw;
    allRaw = allRaw.concat(on3Raw);

    const raw247 = await scrape247(browser);
    logData.sources["247sports"] = raw247;
    allRaw = allRaw.concat(raw247);

  } catch(e) {
    console.log("\nPuppeteer error:", e.message.substring(0, 150));
    console.log("Continuing with Prep Redzone data only...");
  } finally {
    if (browser) await browser.close();
  }

  // 3. Normalize + deduplicate
  const seen = new Set();
  const normalized = [];
  for (const raw of allRaw) {
    const rec = normalize(raw);
    if (!rec) continue;
    const key = rec.full_name.toLowerCase() + "|" + (rec.school_name || "").toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(rec);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Unique normalized records:", normalized.length);

  // 4. Upsert in batches of 25
  for (let i = 0; i < normalized.length; i += 25) {
    const batch = normalized.slice(i, i + 25);
    const n = await upsertBatch(batch);
    totalUpserted += n;
    console.log("Upserted batch " + (Math.floor(i/25)+1) + " → " + totalUpserted + " total");
    await sleep(300);
  }

  logData.normalized = normalized;
  const logPath = path.join(__dirname, "..", "scrape_log_" + Date.now() + ".json");
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));

  console.log("\n✅ DONE");
  console.log("   Total upserted:", totalUpserted);
  console.log("   Log saved:", logPath);
  console.log("\n📋 NEXT: Run with Puppeteer in visible mode to debug LANIL/247 selectors");
  console.log("   Or add --headed flag: browser = await puppeteer.launch({ headless: false })");
})();