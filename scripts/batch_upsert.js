const https = require("https");
const fs = require("fs");
const path = require("path");

const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");

// Parish name -> valid parish_id map (matches Supabase parish IDs)
const PARISH_MAP = {
  "ouachita": "ouachita", "monroe": "ouachita",
  "caddo": "caddo", "shreveport": "caddo",
  "jefferson": "jefferson", "new orleans": "orleans", "orleans": "orleans",
  "east baton rouge": "east-baton-rouge", "baton rouge": "east-baton-rouge",
  "st charles": "st-charles", "st. charles": "st-charles",
  "st tammany": "st-tammany", "st. tammany": "st-tammany", "mandeville": "st-tammany",
  "lafayette": "lafayette",
  "rapides": "rapides", "alexandria": "rapides",
  "lincoln": "lincoln", "ruston": "lincoln",
  "calcasieu": "calcasieu", "lake charles": "calcasieu",
  "bossier": "bossier",
  "st landry": "st-landry", "st. landry": "st-landry",
  "jefferson davis": "jefferson-davis",
  "east feliciana": "east-feliciana",
  "tangipahoa": "tangipahoa",
  "washington": "washington",
  "livingston": "livingston",
  "ascension": "ascension",
  "iberia": "iberia",
  "vermilion": "vermilion",
  "st mary": "st-mary", "st. mary": "st-mary",
  "terrebonne": "terrebonne",
  "lafourche": "lafourche",
  "plaquemines": "plaquemines",
  "st bernard": "st-bernard", "st. bernard": "st-bernard",
  "st john the baptist": "st-john-the-baptist",
  "west baton rouge": "west-baton-rouge",
  "pointe coupee": "pointe-coupee",
  "iberville": "iberville",
  "st helena": "st-helena", "st. helena": "st-helena",
  "west feliciana": "west-feliciana",
  "grant": "grant",
  "winn": "winn",
  "natchitoches": "natchitoches",
  "sabine": "sabine",
  "desoto": "desoto", "de soto": "desoto",
  "red river": "red-river",
  "bienville": "bienville",
  "claiborne": "claiborne",
  "union": "union",
  "morehouse": "morehouse",
  "richland": "richland",
  "franklin": "franklin",
  "east carroll": "east-carroll",
  "west carroll": "west-carroll",
  "madison": "madison",
  "tensas": "tensas",
  "catahoula": "catahoula",
  "concordia": "concordia",
  "caldwell": "caldwell",
  "la salle": "lasalle", "lasalle": "lasalle",
  "allen": "allen",
  "beauregard": "beauregard",
  "vernon": "vernon",
  "acadia": "acadia",
  "evangeline": "evangeline",
  "avoyelles": "avoyelles",
  "st martin": "st-martin", "st. martin": "st-martin",
  "assumption": "assumption",
  "cameron": "cameron",
  "jackson": "jackson",
  "caldwell": "caldwell",
  "st james": "st-james", "st. james": "st-james"
};

function getParishId(parishCity) {
  if (!parishCity) return "ouachita";
  const lower = parishCity.toLowerCase().replace(/\s*parish\s*/i,"").replace(/\s*\/.*$/,"").trim();
  if (PARISH_MAP[lower]) return PARISH_MAP[lower];
  // Try direct match
  const slug = lower.replace(/\./g,"").replace(/\s+/g,"-");
  return slug || "ouachita";
}

function getSchoolId(a) {
  if (a.school_id) return a.school_id;
  return a.school_name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-high-school$/,"").replace(/-high$/,"");
}

const dataPath = path.join(__dirname, "..", "data.js");
let raw = fs.readFileSync(dataPath, "utf8");
raw = raw.replace(/^\/\/[^\n]*\n/, "").trim();
raw = raw.replace(/^window\.INITIAL_ATHLETES\s*=\s*/, "").trim();
raw = raw.replace(/;\s*$/, "").trim();
const athletes = JSON.parse(raw);
console.log("Parsed " + athletes.length + " athletes");

// Build schools
const schoolMap = {};
athletes.forEach(a => {
  const id = getSchoolId(a);
  if (!schoolMap[id]) {
    const parts = (a.parish_city || "").split("/");
    const parishPart = parts[0] ? parts[0].trim() : "";
    const city = parts[1] ? parts[1].trim() : "";
    schoolMap[id] = {
      id: id,
      name: a.school_name,
      parish_id: getParishId(parishPart),
      city: city || parishPart,
      classification: "5A",
      lhsaa_member: true
    };
  }
});
const schools = Object.values(schoolMap);
console.log("Schools: " + schools.map(s => s.id + "(" + s.parish_id + ")").join(", "));

function mapAthlete(a) {
  return {
    player_id: a.player_id,
    full_name: a.full_name,
    slug: a.slug || (a.full_name.toLowerCase().replace(/\s+/g,"-") + "-" + a.grad_year),
    grad_year: a.grad_year,
    current_grade: a.current_grade,
    school_id: getSchoolId(a),
    school_name: a.school_name,
    parish_city: a.parish_city,
    primary_sport: a.primary_sport,
    secondary_sports: a.secondary_sports || [],
    position: a.position,
    season_stats_summary: a.season_stats_summary || "",
    newspaper_mentions: a.newspaper_mentions || [],
    social_handles: a.social_handles || {},
    total_followers: a.total_followers || 0,
    est_nil_value: a.est_nil_value || 0,
    potential_colleges: a.potential_colleges || [],
    headshot_url: a.headshot_url || "",
    photo_gallery: a.photo_gallery || [],
    bio: a.bio || "",
    hudl_url: a.hudl_url || "",
    youtube_url: a.youtube_url || "",
    gpa: a.gpa || null,
    claimed: false, tier: a.tier || "free",
    verified: false, parent_consent_verified: false
  };
}

function postJSON(urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: HOST, path: urlPath, method: "POST",
      headers: {
        "apikey": KEY, "Authorization": "Bearer " + KEY,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
        "Content-Length": Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, (res) => {
      let data = ""; res.on("data", d => data += d);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(payload); req.end();
  });
}

(async () => {
  console.log("\n--- Upserting " + schools.length + " schools ---");
  const sr = await postJSON("/rest/v1/schools?on_conflict=id", schools);
  console.log("Schools HTTP:", sr.status);
  if (sr.status === 200 || sr.status === 201) {
    console.log("Schools: OK");
  } else {
    console.error("Schools error:", sr.body.substring(0,500));
  }

  console.log("\n--- Upserting " + athletes.length + " athletes ---");
  const ar = await postJSON("/rest/v1/athletes?on_conflict=player_id", athletes.map(mapAthlete));
  console.log("Athletes HTTP:", ar.status);
  if (ar.status === 200 || ar.status === 201) {
    const arr = JSON.parse(ar.body);
    console.log("SUCCESS: " + arr.length + " athletes in DB!");
    arr.forEach(a => console.log(" + " + a.player_id + " | " + a.full_name + " | " + a.primary_sport));
  } else {
    console.error("Athletes error:", ar.body.substring(0,600));
  }
})();