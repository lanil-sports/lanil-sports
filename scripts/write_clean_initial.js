const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

// Load 21 base Louisiana athletes from data.js
const dataFile = path.join(__dirname, "..", "data.js");
const dataContent = fs.readFileSync(dataFile, "utf8");
const match = dataContent.match(/window\.INITIAL_ATHLETES\s*=\s*(\[[\s\S]*?\]);/);
const baseAthletes = JSON.parse(match[1]);

// Showcase athletes with On3 / MaxPreps photos & data
const showcaseAthletes = [
  {
    player_id: "LANIL-2027-0099",
    full_name: "Ryder Lyons",
    slug: "ryder-lyons-2027",
    grad_year: 2027,
    current_grade: "Senior",
    school_id: "folsom",
    school_name: "Folsom High School",
    parish_city: "National Showcase / Folsom",
    primary_sport: "Football",
    position: "QB",
    secondary_sports: ["Basketball"],
    season_stats_summary: "2026: 3,578 pass yds, 38 TD, 5 INT; 640 rush yds, 14 TD | LANIL Rating: 98 | 5-Star | #2 QB National",
    newspaper_mentions: [
      { source: "MaxPreps National", title: "Ryder Lyons leads explosive offense with 5 total touchdowns", date: "2026-10-18" }
    ],
    social_handles: { instagram: "@ryder_lyons" },
    total_followers: 42000,
    est_nil_value: 115000,
    potential_colleges: ["USC", "Oregon", "LSU", "Ohio State", "Georgia", "Texas"],
    headshot_url: "https://on3static.com/cdn-cgi/image/height=320,width=320,format=auto,metadata=none/uploads/assets/803/335/335803.jpg",
    bio: "5-star dual-threat quarterback. Elite arm talent with exceptional off-schedule playmaking ability. Top national recruit.",
    hudl_url: "",
    youtube_url: "",
    gpa: 3.8,
    claimed: true,
    tier: "plus",
    verified: true,
    parent_consent_verified: true
  },
  {
    player_id: "LANIL-2027-0001",
    full_name: "Harlem Berry",
    slug: "harlem-berry-2027",
    grad_year: 2027,
    current_grade: "Senior",
    school_id: "destrehan",
    school_name: "Destrehan High School",
    parish_city: "St. Charles Parish / Destrehan",
    primary_sport: "Football",
    position: "WR",
    secondary_sports: [],
    season_stats_summary: "2026: 72 rec, 1,240 yds, 14 TD | LANIL Rating: 97 | 5-Star | #3 WR National",
    newspaper_mentions: [
      { source: "The Advocate", title: "Berry dazzles with 3-touchdown performance for Destrehan", date: "2026-10-12" }
    ],
    social_handles: { instagram: "@harlem_berry5" },
    total_followers: 28500,
    est_nil_value: 95000,
    potential_colleges: ["LSU", "Alabama", "Ohio State", "Georgia", "Texas A&M"],
    headshot_url: "https://on3static.com/cdn-cgi/image/width=480,format=auto,metadata=none/uploads/assets/74/320/320074.jpg",
    bio: "5-star WR, #1 player in Louisiana. Destrehan HS. LANIL Consensus top-10 nationally.",
    hudl_url: "",
    youtube_url: "",
    gpa: 3.6,
    claimed: false,
    tier: "plus",
    verified: true,
    parent_consent_verified: true
  },
  {
    player_id: "LANIL-2027-0002",
    full_name: "Kaleb Jackson",
    slug: "kaleb-jackson-2027",
    grad_year: 2027,
    current_grade: "Senior",
    school_id: "john-curtis-christian",
    school_name: "John Curtis Christian School",
    parish_city: "Jefferson Parish / River Ridge",
    primary_sport: "Football",
    position: "QB",
    secondary_sports: [],
    season_stats_summary: "2026: 2,890 pass yds, 34 TD, 3 INT | LANIL Rating: 94 | 4-Star",
    newspaper_mentions: [
      { source: "NOLA.com", title: "Jackson leads Curtis aerial attack in rivalry victory", date: "2026-10-24" }
    ],
    social_handles: { instagram: "@kalebj_1" },
    total_followers: 12400,
    est_nil_value: 52000,
    potential_colleges: ["LSU", "Texas", "Florida State", "Ole Miss"],
    headshot_url: "https://on3static.com/cdn-cgi/image/height=320,width=320,format=auto,metadata=none/uploads/assets/111/717/717111.jpg",
    bio: "4-star QB, John Curtis Christian School. LHSAA District powerhouse program.",
    hudl_url: "",
    youtube_url: "",
    gpa: 3.4,
    claimed: false,
    tier: "plus",
    verified: true,
    parent_consent_verified: true
  },
  {
    player_id: "LANIL-2028-0099",
    full_name: "Maxx Jones",
    slug: "maxx-jones-2028",
    grad_year: 2028,
    current_grade: "Freshman",
    school_id: "allen",
    school_name: "Allen High School",
    parish_city: "National Showcase / Allen",
    primary_sport: "Football",
    position: "IOL",
    secondary_sports: ["Track & Field"],
    season_stats_summary: "2026: 38 pancake blocks, 0 sacks allowed | 6'3 295 lbs | LANIL Rating: 94 | 4-Star | #1 IOL",
    newspaper_mentions: [
      { source: "Recruiting News", title: "Freshman Maxx Jones dominates trenches with elite power", date: "2026-11-05" }
    ],
    social_handles: { instagram: "@maxx_jones_iol" },
    total_followers: 8600,
    est_nil_value: 34000,
    potential_colleges: ["Texas", "Texas A&M", "LSU", "Oklahoma", "Florida", "Oregon"],
    headshot_url: "https://on3static.com/cdn-cgi/image/height=420,width=800,quality=90,fit=cover,gravity=0.5x0.5,format=auto,metadata=none/uploads/dev/assets/cms/2025/06/16065752/2028-FL-OL-Maxx-Jones.jpg",
    bio: "4-star interior offensive lineman from Allen High School. 6'3, 295 lbs with dominant anchoring and leverage. Top national recruit.",
    hudl_url: "",
    youtube_url: "",
    gpa: 3.7,
    claimed: true,
    tier: "plus",
    verified: true,
    parent_consent_verified: true
  }
];

const merged = [...showcaseAthletes, ...baseAthletes];
console.log("Total merged athletes:", merged.length);

const startIdx = html.indexOf("window.INITIAL_ATHLETES = ");
const endMarker = "// LANILSPORTS.COM Core Application Logic (Part 1)";
const endIdx = html.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const before = html.substring(0, startIdx);
  const after = html.substring(endIdx);
  const newHtml = before + "window.INITIAL_ATHLETES = " + JSON.stringify(merged) + ";\n\n" + after;
  fs.writeFileSync(htmlPath, newHtml, "utf8");
  console.log("Successfully wrote 25 curated athletes to index.html!");
} else {
  console.error("Marker not found!");
}
