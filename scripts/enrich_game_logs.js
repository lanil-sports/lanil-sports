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
const DELAY_MS=Number((process.argv.find(a=>a.startsWith("--delay="))||"").split("=")[1]||"250");
const NAME_FILTER=(process.argv.find(a=>a.startsWith("--name="))||"").split("=")[1]?.toLowerCase()||"";
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function norm(s){return String(s||"").replace(/\s+/g," ").trim();}
function stripTags(s){return norm(String(s||"").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&#x27;/g,"'").replace(/&#39;/g,"'"));}
function extractBioUrl(summary){const m=String(summary||"").match(/Bio:\s*(https?:\/\/\S+)/i); return m?m[1].replace(/[)\]"']+$/,""):"";}

async function fetchHtml(url){
  const resp=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36","Accept":"text/html,*/*"},redirect:"follow",signal:AbortSignal.timeout(20000)});
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

function parseTable(tableHtml){
  const rows=[...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/ig)].map(m=>m[1]);
  const parsed=rows.map(r=>[...r.matchAll(/<(?:th|td)[^>]*>([\s\S]*?)<\/(?:th|td)>/ig)].map(c=>stripTags(c[1])));
  return parsed.filter(r=>r.length);
}

function extractGameLogsFromHtml(html){
  if(/no statistics available for this player/i.test(html)) return {status:"none"};
  // Find tables near stats/game log keywords
  const tableMatches=[...html.matchAll(/<table[\s\S]*?<\/table>/ig)].map(m=>m[0]);
  let best=[];
  for(const t of tableMatches){
    const text=stripTags(t).toLowerCase();
    if(!/(date|opponent|opp|result|score)/.test(text)) continue;
    if(!/(pts|reb|ast|stl|blk|min|fg|3pt|ft|yds|avg|ab|h|r|hr|rbi|era|so)/.test(text)) continue;
    const rows=parseTable(t);
    if(rows.length<2) continue;
    const header=rows[0].map(h=>h.toLowerCase());
    // map known columns to c1-c6 generically
    const dateIdx=header.findIndex(h=>/date/.test(h));
    const oppIdx=header.findIndex(h=>/opponent|opp/.test(h));
    const resIdx=header.findIndex(h=>/result|score|w\/l/.test(h));
    if(dateIdx<0 && oppIdx<0) continue;
    const statIdxs=header.map((h,i)=>({h,i})).filter(x=>!/date|opponent|opp|result|score|#|game|site|attend/.test(x.h)).slice(0,6).map(x=>x.i);
    const logs=[];
    for(const row of rows.slice(1)){
      if(row.length<2) continue;
      const date=dateIdx>=0?row[dateIdx]:"";
      const opp=oppIdx>=0?row[oppIdx]:"";
      const res=resIdx>=0?row[resIdx]:"";
      const vals=statIdxs.map(i=>row[i]??"");
      if(!date && !opp) continue;
      logs.push({date,opp,res,c1:vals[0]||"",c2:vals[1]||"",c3:vals[2]||"",c4:vals[3]||"",c5:vals[4]||"",c6:vals[5]||""});
    }
    if(logs.length>best.length) best=logs;
  }
  if(best.length) return {status:"ok", logs:best};
  if(/no statistics available/i.test(html)) return {status:"none"};
  return {status:"not-found"};
}

async function main(){
  console.log(`enrich_game_logs.js ${APPLY?"APPLY":"DRY-RUN"} limit=${LIMIT}`);
  // After cleanup, bio URLs were removed from season_stats_summary. Use cleanup report if available.
  const reportArg=(process.argv.find(a=>a.startsWith("--report="))||"").split("=")[1];
  let reportPath=reportArg;
  if(!reportPath){
    const dataDir=path.join(__dirname,"..","data");
    const files=fs.readdirSync(dataDir).filter(f=>/^cleanup_bio_links_(apply|dryrun)_.*\.json$/.test(f)).sort();
    reportPath=files.length?path.join(dataDir,files[files.length-1]):"";
  }
  let rows=[];
  if(reportPath && fs.existsSync(reportPath)){
    const rep=JSON.parse(fs.readFileSync(reportPath,"utf8"));
    rows=(rep.report||[]).filter(r=>r.bioUrl).map(r=>({id:r.id, full_name:r.name, school_name:r.school, bioUrl:r.bioUrl}));
    console.log(`Loaded ${rows.length} candidates from report ${path.basename(reportPath)}`);
  } else {
    const athletes=[];
    let offset=0;
    let sel="id,full_name,school_name,primary_sport,season_stats_summary";
    while(true){
      const page=await lib.supabaseGetRows(`/athletes?select=${encodeURIComponent(sel)}&season_stats_summary=ilike.*http*&limit=1000&offset=${offset}`);
      if(!page.length) break;
      athletes.push(...page);
      offset+=page.length;
      if(page.length<1000) break;
    }
    rows=athletes.map(a=>({id:a.id,full_name:a.full_name,school_name:a.school_name,bioUrl:extractBioUrl(a.season_stats_summary)})).filter(r=>r.bioUrl);
  }
  if(NAME_FILTER) rows=rows.filter(a=>String(a.full_name||"").toLowerCase().includes(NAME_FILTER));
  rows=rows.slice(0, LIMIT===Infinity?rows.length:LIMIT);
  console.log(`Candidates: ${rows.length}`);
  const report=[]; let applied=0, errors=0, found=0;
  for(let i=0;i<rows.length;i++){
    const a=rows[i];
    const bioUrl=a.bioUrl || extractBioUrl(a.season_stats_summary);
    if(!bioUrl){ report.push({id:a.id,name:a.full_name,status:"no-bio-url"}); continue; }
    try{
      const html=await fetchHtml(bioUrl);
      const res=extractGameLogsFromHtml(html);
      if(res.status==="ok") found+=res.logs.length;
      report.push({id:a.id,name:a.full_name,bioUrl,status:res.status,count:res.logs?.length||0});
      if(APPLY && res.status==="ok" && res.logs.length){
        let patch={game_logs:res.logs};
        let r=await lib.supabaseRequest("PATCH", `/athletes?id=eq.${a.id}`, patch, {Prefer:"return=minimal"});
        if(r.status>=400 && /game_logs/.test(String(r.body||""))){
          const cur=await lib.supabaseGetRows(`/athletes?select=social_handles&id=eq.${a.id}&limit=1`);
          const sh=Object.assign({}, (cur[0]&&cur[0].social_handles)||{}, {game_logs:res.logs});
          r=await lib.supabaseRequest("PATCH", `/athletes?id=eq.${a.id}`, {social_handles:sh}, {Prefer:"return=minimal"});
          report[report.length-1].fallback="social_handles.game_logs";
        }
        if(r.status>=400){ errors++; report[report.length-1].applyError=`${r.status} ${String(r.body).slice(0,120)}`; }
        else applied++;
      }
    }catch(e){ errors++; report.push({id:a.id,name:a.full_name,bioUrl,status:"error",error:e.message}); }
    if(i%25===0) console.log(`progress ${i}/${rows.length} foundRows=${found}`);
    await sleep(DELAY_MS);
  }
  const out=path.join(__dirname,"..","data",`gamelogs_${APPLY?"apply":"dryrun"}_${Date.now()}.json`);
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out, JSON.stringify({apply:APPLY,total:rows.length,applied,errors,found,report},null,2));
  console.log(`Wrote ${out}`);
  console.log(`applied=${applied} errors=${errors} foundRows=${found}`);
}
main().catch(e=>{console.error(e); process.exit(1);});