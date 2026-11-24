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
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function norm(s){return String(s||"").replace(/\s+/g," ").trim();}
function decodeMailto(h){ try{ return decodeURIComponent(h.replace(/^mailto:/i,'').split('?')[0]); }catch{ return h.replace(/^mailto:/i,''); } }

async function fetchHtml(url){
  const resp=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html,*/*"},redirect:"follow",signal:AbortSignal.timeout(20000)});
  if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

function extractContacts(html, sourceUrl, school){
  const out=[];
  // mailto links
  for(const m of html.matchAll(/<a[^>]+href=["'](mailto:[^"']+)["'][^>]*>([\s\S]*?)<\/a>/ig)){
    const email=decodeMailto(m[1]).trim().toLowerCase();
    const name=norm(m[2].replace(/<[^>]+>/g,""));
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;
    out.push({school_id:school.id,school_name:school.name,school_level:school.level||"college",sport:"",coach_name:name||"",role:"",email,phone:"",source_url:sourceUrl,source_type:"official_staff_directory",verified:false,confidence:0.7,opt_out:false,last_checked_at:new Date().toISOString()});
  }
  // simple dedupe
  const seen=new Set();
  return out.filter(c=>{const k=c.email+"|"+c.coach_name; if(seen.has(k)) return false; seen.add(k); return true;});
}

async function main(){
  const colleges=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","la_colleges.json"),"utf8"));
  let total=0, ok=0, err=0;
  for(const c of colleges){
    const urls=[`${c.athletics_url}/staff-directory`, `${c.athletics_url}/staff.aspx`, `${c.athletics_url}/athletics/staff-directory`];
    let found=[];
    for(const u of urls){
      try{ const html=await fetchHtml(u); found=extractContacts(html,u,c); if(found.length) { console.log(c.name, found.length, u); break; } }catch{}
    }
    if(!found.length) console.log(c.name, "0");
    for(const rec of found){
      total++;
      if(!APPLY) { ok++; continue; }
      const r=await lib.supabaseRequest("POST","/coaches_contacts",[rec],{Prefer:"resolution=merge-duplicates,return=minimal"});
      if(r.status<400) ok++; else { err++; if(err<10) console.log("err",r.status,String(r.body).slice(0,120)); }
    }
    await sleep(400);
  }
  console.log({total,ok,err,apply:APPLY});
}
main().catch(e=>{console.error(e); process.exit(1);});