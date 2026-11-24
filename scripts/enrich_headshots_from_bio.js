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

const DRY_RUN=process.argv.includes("--dry-run");
const LIMIT_ARG=process.argv.find(a=>a.startsWith("--limit="));
const LIMIT=LIMIT_ARG?Number(LIMIT_ARG.split("=")[1]):Infinity;
const SPORT_ARG=process.argv.find(a=>a.startsWith("--sport="));
const SPORT_FILTER=SPORT_ARG?SPORT_ARG.split("=")[1].toLowerCase():"";

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

async function fetchHtml(url){
  const resp=await fetch(url,{headers:{
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept":"text/html,application/xhtml+xml,*/*"
  }, redirect:"follow", signal:AbortSignal.timeout(20000)});
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

function extractHeadshot(html, pageUrl){
  const metas=[];
  const metaRe=/<meta\s+[^>]*>/ig;
  for(const m of html.matchAll(metaRe)){
    const tag=m[0];
    const prop=(tag.match(/property=["']([^"']+)["']/i)||[])[1]||"";
    const name=(tag.match(/name=["']([^"']+)["']/i)||[])[1]||"";
    const content=(tag.match(/content=["']([^"']+)["']/i)||[])[1]||"";
    if(content) metas.push({prop:prop.toLowerCase(),name:name.toLowerCase(),content});
  }
  const candidates=[];
  for(const m of metas){
    if(m.prop==="og:image"||m.prop==="og:image:url"||m.name==="twitter:image"||m.name==="twitter:image:src") candidates.push(m.content);
  }
  // Sidearm/common roster img patterns
  for(const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/ig)){
    const src=m[1];
    const tag=m[0];
    if(/headshot|roster|bio_photo|player_image/i.test(src+ " " + tag) && !/logo|icon|placeholder|default|silhouette/i.test(src)) candidates.push(src);
  }
  for(let c of candidates){
    if(!c) continue;
    c=c.trim();
    if(c.startsWith("//")) c="https:"+c;
    if(c.startsWith("/")) { try{ c=new URL(c,pageUrl).href; }catch{} }
    if(!/^https?:\/\//i.test(c)) continue;
    if(/logo|icon|sprite|placeholder|default-avatar|silhouette|generic|social-share|og-default|no_headshot|no-headshot|noimage/i.test(c)) continue;
    return c;
  }
  return "";
}

function normName(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");}

async function main(){
  console.log(`enrich_headshots_from_bio.js ${DRY_RUN?"(DRY RUN)":""} limit=${LIMIT} sport=${SPORT_FILTER||"all"}`);
  const d1=await lib.fetchTextFromJS("https://lhsaanetwork.com/wp-content/themes/lhsaa-network/site/athlete-data.js");
  const src=(d1.athletes||[]).filter(a=>a.bio_url && a.name);
  console.log(`D1 source records with bio_url: ${src.length}`);

  const athletes=[];
  let offset=0;
  while(true){
    const page=await lib.supabaseGetRows(`/athletes?select=id,player_id,full_name,school_name,primary_sport,headshot_url&limit=1000&offset=${offset}`);
    if(!page.length) break;
    athletes.push(...page);
    offset+=page.length;
    if(page.length<1000) break;
  }
  console.log(`Supabase athletes: ${athletes.length}`);
  const byKey=new Map();
  for(const a of athletes){
    const k=normName(a.full_name)+"|"+normName(a.school_name)+"|"+normName(a.primary_sport);
    if(!byKey.has(k)) byKey.set(k,a);
  }

  const targets=[];
  for(const s of src){
    const sport=s.sport||"";
    const canon = /baseball/i.test(sport)?"baseball":/basketball/i.test(sport)?"basketball":"";
    if(SPORT_FILTER && !sport.toLowerCase().includes(SPORT_FILTER) && canon!==SPORT_FILTER) continue;
    const k=normName(s.name)+"|"+normName(s.highschool)+"|"+normName(/men|women/i.test(sport) && /basketball/i.test(sport)?"basketball":sport.replace(/^Men’s |^Women’s /,''));
    // also try direct sport
    let a=byKey.get(k);
    if(!a){
      const k2=normName(s.name)+"|"+normName(s.highschool)+"|"+normName(sport.includes("Basketball")?"Basketball":sport);
      a=byKey.get(k2);
    }
    if(!a){
      // try looser match: name+school
      for(const [kk,v] of byKey.entries()){
        if(kk.startsWith(normName(s.name)+"|"+normName(s.highschool)+"|")) { a=v; break; }
      }
    }
    if(!a) continue;
    if(a.headshot_url && String(a.headshot_url).trim()) continue;
    targets.push({athlete:a,bio_url:s.bio_url,name:s.name});
  }
  console.log(`Targets missing headshot with bio_url: ${targets.length}`);
  const slice=targets.slice(0, LIMIT===Infinity?targets.length:LIMIT);
  let ok=0, fail=0, skip=0;
  for(let i=0;i<slice.length;i++){
    const t=slice[i];
    try{
      const html=await fetchHtml(t.bio_url);
      const img=extractHeadshot(html,t.bio_url);
      if(!img){ skip++; console.log(`[skip] ${t.name} - no image`); }
      else {
        console.log(`[img] ${t.name} -> ${img.slice(0,100)}`);
        if(!DRY_RUN){
          const r=await lib.supabaseRequest("PATCH", `/athletes?id=eq.${t.athlete.id}`, {headshot_url:img}, {Prefer:"return=minimal"});
          if(r.status>=400) { fail++; console.log(`  [patch-fail] ${r.status} ${r.body.slice(0,120)}`); }
          else ok++;
        } else { ok++; }
      }
    }catch(e){ fail++; console.log(`[err] ${t.name}: ${e.message}`); }
    if(i % 10 === 0) await sleep(350);
    else await sleep(150);
  }
  console.log(`Done. ok=${ok} skip=${skip} fail=${fail} dryRun=${DRY_RUN}`);
}

main().catch(e=>{console.error(e); process.exit(1);});