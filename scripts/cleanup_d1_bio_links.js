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
const LIMIT_ARG=process.argv.find(a=>a.startsWith("--limit="));
const LIMIT=LIMIT_ARG?Number(LIMIT_ARG.split("=")[1]):Infinity;
const DELAY_MS=Number((process.argv.find(a=>a.startsWith("--delay="))||"").split("=")[1]||"350");
const NAME_ARG=process.argv.find(a=>a.startsWith("--name="));
const NAME_FILTER=NAME_ARG?decodeURIComponent(NAME_ARG.split("=")[1]).toLowerCase():"";

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function norm(s){return String(s||"").replace(/\s+/g," ").trim();}
function stripTags(s){return norm(String(s||"").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&#x27;/g,"'").replace(/&quot;/g,'"'));}
function sanitizeField(key, val){
  let v=norm(val).replace(/^[:\-\s]+/,"").trim();
  if(!v) return "";
  if(/[<>{}]/.test(v)) return "";
  if(/position\s*:fixed|left\s*:\s*-?\d|display\s*:none|transition\s*:opacity/i.test(v)) return "";
  if(v.length>90) return "";
  if(key==="height" && !/\d/.test(v)) return "";
  if(key==="position" && v.length>40) return "";
  return v;
}

async function fetchHtml(url){
  const resp=await fetch(url,{headers:{
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept":"text/html,application/xhtml+xml,*/*"
  }, redirect:"follow", signal:AbortSignal.timeout(20000)});
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

function extractBioUrl(summary){
  const m=String(summary||"").match(/Bio:\s*(https?:\/\/\S+)/i);
  return m?m[1].replace(/[)\]"']+$/,""):"";
}

function cleanSummary(summary){
  let s=String(summary||"");
  s=s.replace(/\s*Bio:\s*https?:\/\/\S+/ig,"").trim();
  s=s.replace(/\s*[|•-]\s*$/,"").trim();
  return s;
}

function extractSidearmBio(html){
  // Sidearm roster pages often have dt/dd or label/value pairs
  const fields={};
  const patterns=[
    /Position:\s*<\/[^>]+>\s*<[^>]+>\s*([^<]+)/i,
    /Position:\s*<[^>]*>([^<]+)</i,
    /"Position"\s*:\s*"([^"]+)"/i,
  ];
  const labelMap={
    position:["Position"], height:["Height"], class:["Class","Academic Year","Year"], hometown:["Hometown"], highschool:["High School","Highschool","Last School","Previous School"]
  };
  // generic dt/dd
  const dtdd=[...html.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/ig)];
  for(const m of dtdd){
    const k=stripTags(m[1]).replace(/:$/,"");
    const v=stripTags(m[2]);
    for(const [key,labels] of Object.entries(labelMap)){
      if(labels.some(l=>k.toLowerCase()===l.toLowerCase())) { const sv=sanitizeField(key,v); if(sv) fields[key]=sv; }
    }
  }
  // generic label span/li patterns
  for(const [key,labels] of Object.entries(labelMap)){
    if(fields[key]) continue;
    for(const label of labels){
      const re=new RegExp(label+"[:\\s]*<\\/[^>]+>\\s*<[^>]+>\\s*([^<]+)","i");
      const m=html.match(re);
      if(m){ const sv=sanitizeField(key,stripTags(m[1])); if(sv){ fields[key]=sv; break; } }
      const re2=new RegExp(label+"[:\\s]*([A-Za-z0-9][^<\\n\\r]{1,60})","i");
      const m2=html.match(re2);
      if(m2 && !/class=|href=|script|style=|fixed;|display:none/i.test(m2[1])) { const sv=sanitizeField(key,stripTags(m2[1])); if(sv){ fields[key]=sv; break; } }
    }
  }
  // bio paragraph
  let bio="";
  const bioMatch=html.match(/id="sidearm-roster-player-bio"[\s\S]*?<div[^>]*class="[^"]*s-person-card__content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                   html.match(/class="[^"]*sidearm-roster-player-bio[^"]*"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
  if(bioMatch) bio=stripTags(bioMatch[1]);
  if(!bio || /No information available/i.test(bio)) bio="";
  return {fields,bio};
}

function buildBioText(fields, existingBio){
  const parts=[];
  if(fields.position) parts.push(`Position: ${fields.position}`);
  if(fields.height) parts.push(`Height: ${fields.height}`);
  if(fields.class) parts.push(`Class: ${fields.class}`);
  if(fields.hometown) parts.push(`Hometown: ${fields.hometown}`);
  if(fields.highschool) parts.push(`High School: ${fields.highschool}`);
  const factLine=parts.join(" | ");
  const existing=norm(existingBio);
  if(existing && factLine && !existing.includes(factLine)) return `${factLine}. ${existing}`.trim();
  return factLine || existing;
}

function extractGameLogs(html){
  // Very conservative: only detect explicit "no statistics available"
  if(/no statistics available/i.test(html)) return {available:false, logs:[]};
  // Placeholder for future parser; avoid guessing
  return {available:false, logs:[]};
}

function extractPlayerMentions(html, playerName){
  // Conservative: don't pull generic team "Related News"
  return [];
}

async function main(){
  console.log(`cleanup_d1_bio_links.js ${APPLY?"APPLY":"DRY-RUN"} limit=${LIMIT}`);
  const athletes=[];
  let offset=0;
  async function fetchPage(sel){
    return lib.supabaseGetRows(`/athletes?select=${encodeURIComponent(sel)}&season_stats_summary=ilike.*http*&limit=1000&offset=${offset}`);
  }
  const baseSel="id,full_name,school_name,primary_sport,season_stats_summary,bio,newspaper_mentions";
  let sel=baseSel+",box_scores,game_logs";
  while(true){
    let page;
    try { page=await fetchPage(sel); }
    catch(e){ if(sel!==baseSel){ sel=baseSel; page=await fetchPage(sel); } else throw e; }
    if(!page.length) break;
    athletes.push(...page);
    offset+=page.length;
    if(page.length<1000) break;
  }
  console.log(`Candidates: ${athletes.length}`);
  const filtered=NAME_FILTER ? athletes.filter(a=>String(a.full_name||"").toLowerCase().includes(NAME_FILTER)) : athletes;
  const rows=filtered.slice(0, LIMIT===Infinity?filtered.length:LIMIT);
  const report=[];
  let applied=0, errors=0;
  for(let i=0;i<rows.length;i++){
    const a=rows[i];
    const bioUrl=extractBioUrl(a.season_stats_summary);
    if(!bioUrl){ report.push({id:a.id,name:a.full_name,status:"no-bio-url"}); continue; }
    try{
      const html=await fetchHtml(bioUrl);
      const sidearm=/sidearm/i.test(html) || /s-person-card/i.test(html) || /sidearm-roster-player/i.test(html);
      const parsed= sidearm ? extractSidearmBio(html) : {fields:{}, bio:""};
      const newBio=buildBioText(parsed.fields, a.bio);
      const newSummary=cleanSummary(a.season_stats_summary);
      const stats=extractGameLogs(html);
      const mentions=extractPlayerMentions(html, a.full_name);
      const patch={};
      if(newSummary !== norm(a.season_stats_summary)) patch.season_stats_summary=newSummary;
      if(newBio && norm(newBio)!==norm(a.bio)) patch.bio=newBio;
      // only set if we actually extracted
      if(stats.logs.length) patch.game_logs=stats.logs;
      if(mentions.length) patch.newspaper_mentions=mentions;
      const changed=Object.keys(patch).length>0;
      report.push({id:a.id,name:a.full_name,school:a.school_name,bioUrl,sidearm,changed,patchKeys:Object.keys(patch),fields:parsed.fields});
      if(APPLY && changed){
        const r=await lib.supabaseRequest("PATCH", `/athletes?id=eq.${a.id}`, patch, {Prefer:"return=minimal"});
        if(r.status>=400) { errors++; report[report.length-1].applyError=`${r.status} ${String(r.body).slice(0,120)}`; }
        else applied++;
      }
    }catch(e){
      errors++; report.push({id:a.id,name:a.full_name,bioUrl,status:"error",error:e.message});
    }
    if(i%25===0) console.log(`progress ${i}/${rows.length}`);
    await sleep(DELAY_MS);
  }
  const outPath=path.join(__dirname,"..","data",`cleanup_bio_links_${APPLY?"apply":"dryrun"}_${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outPath),{recursive:true});
  fs.writeFileSync(outPath, JSON.stringify({apply:APPLY,total:rows.length,applied,errors,report}, null, 2));
  console.log(`Wrote ${outPath}`);
  console.log(`applied=${applied} errors=${errors}`);
}
main().catch(e=>{console.error(e); process.exit(1);});