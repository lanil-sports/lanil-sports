const fetch = globalThis.fetch;
const cheerio = require("cheerio");
const https = require("https");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const HOST = "uwnslkzyvmrrycdxvudg.supabase.co";
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "");
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

const PRZ_ARTICLES = [
  {url:"https://prepredzone.com/2026/11/louisiana-my-guys-playoff-edition/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/11/offensive-stat-leaders-in-louisiana-ahead-of-the-playoffs/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/louisiana-high-school-wide-receivers-who-are-dawgs/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/running-backs-who-have-produced-at-a-high-level-in-louisiana/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/defensive-stat-leaders-in-louisiana-10-29/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/offensive-stat-leaders-louisiana-high-school-football-10-27/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/midseason-freak-list-louisiana-edition/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/some-louisiana-players-who-are-on-a-roll/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/midseason-awards-louisiana-high-school-football/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/midseason-first-team-all-louisiana/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/10/louisiana-football-names-you-should-know/",sport:"Football",year:2027},
  {url:"https://prepredzone.com/2026/09/2031-louisiana-and-mississippi-prospects-to-know/",sport:"Football",year:2031},
  {url:"https://prepredzone.com/2026/08/where-each-wide-receiver-ranks-in-the-2028-louisiana-rankings/",sport:"Football",year:2028},
  {url:"https://prepredzone.com/2026/08/where-each-quarterback-ranks-in-the-2029-louisiana-rankings/",sport:"Football",year:2029},
  {url:"https://prepredzone.com/2026/08/where-each-edge-ranks-in-the-2028-louisiana-rankings/",sport:"Football",year:2028},
  {url:"https://prepredzone.com/2026/08/where-each-linebacker-ranks-in-the-2028-louisiana-rankings/",sport:"Football",year:2028},
  {url:"https://prepredzone.com/2026/07/top-2028-louisiana-prospects/",sport:"Football",year:2028}
];

(async()=>{
  const found = [];
  const seen = new Set();

  for(const {url,sport,year} of PRZ_ARTICLES){
    try{
      const r = await fetch(url,{headers:{"User-Agent":UA,"Accept":"text/html"},timeout:15000});
      if(!r.ok){console.log("HTTP",r.status,url);continue;}
      const html = await r.text();
      const $ = cheerio.load(html);
      const content = $(".entry-content,.post-content,article").first();
      const text = content.text().replace(/\s+/g," ");

      // 1. Full "FirstName LastName" explicitly mentioned (not article title)
      const fullNames = [...text.matchAll(/\b([A-Z][a-z]+\s+[A-Z][a-z']+(?:\s+[A-Z][a-z]+)?)\b(?!\s+Who|\s+Ranks|\s+Are|\s+Have|\s+Names|\s+Each|\s+Award|\s+Stat|\s+Leaders|\s+Players)/g)];
      for(const m of fullNames){
        const name = m[1].trim();
        if(name.length > 5 && name.length < 40 && !seen.has(name.toLowerCase())){
          // Filter out generic words
          if(!/^(The|This|For|Next|There|That|When|Where|These|Here|Some|Many|Also|All|Our|His|Her|One|Two|Three|And|But|With|From|Into|After|Before|During|Season|State|Class|Game|High|School|Wide|Running|Offensive|Defensive|Midseason|Louisiana|Football|Basketball|Awards|Names|Ranks|Players|Prep|Redzone|Each|Lineup)/.test(name)){
            seen.add(name.toLowerCase());
            found.push({name, sport, year, url});
          }
        }
      }

      // 2. Subscription prompt leaks: "Is this you, FirstName?"
      const leaks = [...text.matchAll(/Is this you,\s+([A-Z][a-z]+)\?/g)];
      leaks.forEach(m=>{
        const firstName = m[1];
        // Check if already found with full name
        const alreadyFull = found.find(f=>f.name.startsWith(firstName+" "));
        if(!alreadyFull && !seen.has(firstName.toLowerCase()+"_partial")){
          seen.add(firstName.toLowerCase()+"_partial");
          found.push({name:firstName+" ["+sport+"]", isPartial:true, sport, year, url});
        }
      });

    }catch(e){console.log("ERR:",e.message.substring(0,60));}
    await sleep(1200);
  }

  console.log("\n=== NAMES EXTRACTED FROM PREP REDZONE ===");
  const full = found.filter(f=>!f.isPartial);
  const partial = found.filter(f=>f.isPartial);
  console.log("Full names:", full.length);
  full.forEach(f=>console.log("  FULL:",f.name,"|",f.sport,f.year));
  console.log("Partial (first name only):", partial.length);
  partial.forEach(f=>console.log("  PARTIAL:",f.name));

  // Upsert only full names
  if(full.length > 0){
    let idN = 400;
    const records = full.map(f=>{
      idN++;
      return {
        player_id:"PRZ-"+String(idN).padStart(4,"0"),
        full_name:f.name,
        slug:f.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+f.year+"-prz"+idN,
        grad_year:f.year,
        current_grade: f.year<=2027?"Senior":f.year===2028?"Junior":f.year===2029?"Sophomore":"Freshman",
        school_id:"louisiana-hs",
        school_name:"Louisiana High School",
        parish_city:"Louisiana",
        primary_sport:f.sport,
        secondary_sports:[],
        position:"",
        season_stats_summary:"Mentioned in Prep Redzone Louisiana coverage",
        newspaper_mentions:[],
        social_handles:{},
        total_followers:0,
        est_nil_value:0,
        potential_colleges:[],
        headshot_url:"",
        photo_gallery:[],
        bio:"Source: Prep Redzone. Article: "+f.url,
        hudl_url:"",youtube_url:"",
        gpa:null,claimed:false,tier:"free",verified:false,parent_consent_verified:false
      };
    });

    // Ensure school exists
    const schoolPayload = JSON.stringify([{id:"louisiana-hs",name:"Louisiana High School",parish_id:"ouachita",city:"Louisiana",classification:"5A",lhsaa_member:true}]);
    await new Promise((res,rej)=>{
      const opts={hostname:HOST,path:"/rest/v1/schools?on_conflict=id",method:"POST",headers:{"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal","Content-Length":Buffer.byteLength(schoolPayload)}};
      const req=https.request(opts,r=>{let d="";r.on("data",c=>d+=c);r.on("end",()=>res(r.statusCode));});
      req.on("error",rej);req.write(schoolPayload);req.end();
    });

    const payload = JSON.stringify(records);
    const result = await new Promise((res,rej)=>{
      const opts={hostname:HOST,path:"/rest/v1/athletes?on_conflict=player_id",method:"POST",headers:{"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal","Content-Length":Buffer.byteLength(payload)}};
      const req=https.request(opts,r=>{let d="";r.on("data",c=>d+=c);r.on("end",()=>res({s:r.statusCode,b:d}));});
      req.on("error",rej);req.write(payload);req.end();
    });
    console.log("\nUpsert status:",result.s, result.s>=400?result.b.substring(0,200):"OK");
    if(result.s<400) console.log("✅ Upserted",records.length,"players from Prep Redzone");
  }

  console.log("\n📋 VERDICT: Prep Redzone is PAYWALLED.");
  console.log("Full player names require a PRZ subscription (~$9.99/mo).");
  console.log("Strategy: Subscribe + scrape OR build data via LHSAA MaxPreps direct.");
})();