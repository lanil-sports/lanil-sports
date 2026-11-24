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

async function fetchHtml(url){
  const resp=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html,*/*"},redirect:"follow",signal:AbortSignal.timeout(20000)});
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

// Very basic Sidearm roster parser: looks for roster table rows / player cards
function parseSidearmRoster(html, baseUrl){
  const players=[];
  // player links often /sports/.../roster/.../12345 or /roster.aspx?rp_id=
  const linkRe=/<a[^>]+href=["']([^"']*(?:\/roster\/[^"']+|roster\.aspx\?rp_id=\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/ig;
  const seen=new Set();
  for(const m of html.matchAll(linkRe)){
    const href=new URL(m[1], baseUrl).href;
    const name=norm(m[2].replace(/<[^>]+>/g," "));
    if(!name || name.length<3 || name.length>60) continue;
    if(/full roster|coaching staff|roster/i.test(name) && name.split(/\s+/).length<2) continue;
    const key=name.toLowerCase()+"|"+href;
    if(seen.has(key)) continue;
    seen.add(key);
    if(name.split(/\s+/).length>=2) players.push({name, bio_url:href});
  }
  return players;
}

async function main(){
  const colleges=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","la_colleges.json"),"utf8"));
  console.log(`LA colleges: ${colleges.length} (apply=${APPLY})`);
  const report=[];
  for(const c of colleges.slice(0, LIMIT===Infinity?colleges.length:LIMIT)){
    const rosterUrl = c.sports?.football || c.sports?.mens_basketball || c.athletics_url;
    try{
      // try common roster paths
      const candidates=[rosterUrl, c.athletics_url+"/sports/football/roster", c.athletics_url+"/sports/mens-basketball/roster"].filter(Boolean);
      let found=[]; let used="";
      for(const u of candidates){
        try{ const html=await fetchHtml(u); const p=parseSidearmRoster(html,u); if(p.length>found.length){found=p; used=u;} if(found.length>0) break; }catch{}
      }
      console.log(c.name, "->", found.length, "players", used);
      report.push({college:c.name, used, count:found.length, sample:found.slice(0,5)});
    }catch(e){
      console.log(c.name, "ERR", e.message);
      report.push({college:c.name, error:e.message});
    }
    await sleep(500);
  }
  const out=path.join(__dirname,"..","data",`la_college_roster_probe_${Date.now()}.json`);
  fs.writeFileSync(out, JSON.stringify(report,null,2));
  console.log("Wrote",out);
}
main().catch(e=>{console.error(e); process.exit(1);});