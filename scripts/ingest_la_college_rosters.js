"use strict";
const fs=require("fs");
const path=require("path");
const ENV_PATH=path.join(__dirname,"..",".env");
if(fs.existsSync(ENV_PATH)){
  for(const line of fs.readFileSync(ENV_PATH,"utf8").split(/\r?\n/)){
    const m=line.match(/^([^#=]+)=(.*)$/);
    if(m && !process.env[m[1].trim()]) process.env[m[1].trim()]=m[2].trim();
  }
}
const lib=require("./ingest_lib");
const APPLY=process.argv.includes("--apply");
const LIMIT=Number((process.argv.find(a=>a.startsWith("--limit="))||"").split("=")[1]||"Infinity");
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function norm(s){return String(s||"").replace(/\s+/g," ").trim();}
function slug(s){return norm(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

const SPORT_PATHS=[
  ["football","Football"],["mens-basketball","Basketball"],["womens-basketball","Basketball"],
  ["baseball","Baseball"],["softball","Softball"],["womens-volleyball","Volleyball"],
  ["mens-track-and-field","Track & Field"],["womens-track-and-field","Track & Field"],
  ["mens-soccer","Soccer"],["womens-soccer","Soccer"]
];

async function fetchHtml(url){
  const resp=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html,*/*"},redirect:"follow",signal:AbortSignal.timeout(20000)});
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

function parseRosterLinks(html, baseUrl){
  const players=[];
  const linkRe=/<a[^>]+href=["']([^"']*(?:\/roster\/[^"']+|roster\.aspx\?rp_id=\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/ig;
  const seen=new Set();
  for(const m of html.matchAll(linkRe)){
    let href; try{ href=new URL(m[1], baseUrl).href; }catch{ continue; }
    const name=norm(m[2].replace(/<[^>]+>/g," "));
    if(!name || name.length<3 || name.length>60) continue;
    if(!/\s/.test(name)) continue;
    if(/full roster|coaching staff|schedule|stats/i.test(name)) continue;
    const key=name.toLowerCase();
    if(seen.has(key)) continue;
    seen.add(key);
    players.push({name, bio_url:href});
  }
  return players;
}

async function upsertPlayer(p, college, sportLabel){
  const playerId="LANIL-COL-"+slug(p.name+"-"+college.id+"-"+sportLabel).slice(0,60);
  const record={
    player_id:playerId,
    full_name:p.name,
    slug:slug(p.name+"-"+college.name+"-"+sportLabel),
    grad_year:2028,
    current_grade:"College",
    school_id:college.id,
    school_name:college.name,
    parish_city:`${college.city}, LA`,
    primary_sport:sportLabel,
    secondary_sports:[],
    position:"",
    season_stats_summary:`${college.name} roster (${sportLabel}).`,
    newspaper_mentions:[], social_handles:{}, total_followers:0, est_nil_value:0,
    potential_colleges:[college.name], headshot_url:"", photo_gallery:[], bio:"",
    hudl_url:"", youtube_url:"", gpa:null, claimed:false, tier:"free", verified:true,
    parent_consent_verified:false, source_url:p.bio_url||college.athletics_url
  };
  if(!APPLY) return {ok:true,dry:true};
  const r=await lib.supabasePost("/athletes", [record], "player_id");
  return {ok:r.ok,status:r.status,body:r.body};
}

async function main(){
  const colleges=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","la_colleges.json"),"utf8"));
  const targets=colleges.slice(0, LIMIT===Infinity?colleges.length:LIMIT);
  let total=0, ok=0, err=0;
  for(const c of targets){
    for(const [pathSport,label] of SPORT_PATHS){
      const url=`${c.athletics_url}/sports/${pathSport}/roster`;
      try{
        const html=await fetchHtml(url);
        const players=parseRosterLinks(html,url);
        console.log(`${c.name} ${label}: ${players.length}`);
        for(const p of players){
          total++;
          const r=await upsertPlayer(p,c,label);
          if(r.ok) ok++; else { err++; if(err<10) console.log("  err",r.status,String(r.body||"").slice(0,100)); }
        }
      }catch(e){ /* skip missing sport */ }
      await sleep(300);
    }
  }
  console.log({total,ok,err,apply:APPLY});
}
main().catch(e=>{console.error(e); process.exit(1);});