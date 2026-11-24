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

const LA_COLLEGES=[
  "Louisiana State University","LSU","Southern University","Grambling State University","Tulane University",
  "University of Louisiana at Lafayette","UL Lafayette","University of Louisiana at Monroe","ULM",
  "Louisiana Tech University","McNeese State University","Nicholls State University","Northwestern State University",
  "Southeastern Louisiana University","University of New Orleans","Xavier University of Louisiana","Dillard University",
  "Loyola University New Orleans","Centenary College of Louisiana","Louisiana Christian University",
  "Louisiana State University Shreveport","LSU Shreveport","LSU Alexandria","LSU Eunice",
  "Southern University at New Orleans","Southern University Shreveport","Baton Rouge Community College",
  "Delgado Community College","Bossier Parish Community College","River Parishes Community College",
  "South Louisiana Community College","Nunez Community College","Fletcher Technical Community College"
];

async function getAll(path){
  const rows=[]; let offset=0;
  while(true){
    const page=await lib.supabaseGetRows(`${path}${path.includes("?")?"&":"?"}limit=1000&offset=${offset}`);
    if(!page.length) break; rows.push(...page); offset+=page.length; if(page.length<1000) break;
  }
  return rows;
}

async function main(){
  const schools=await getAll("/schools?select=id,name,city,parish_id,lhsaa_member,classification");
  const athletes=await getAll("/athletes?select=id,full_name,school_name,school_id,primary_sport,grad_year,headshot_url,parish_city");
  const bySchool=new Map();
  for(const a of athletes){
    const key=String(a.school_id||"")+"|"+String(a.school_name||"").toLowerCase();
    const k2=String(a.school_name||"").toLowerCase().trim();
    const rec=bySchool.get(k2)||{school_name:a.school_name,school_id:a.school_id,count:0,sports:new Set(),withPhoto:0};
    rec.count++; rec.sports.add(a.primary_sport||""); if(a.headshot_url && String(a.headshot_url).trim()) rec.withPhoto++;
    bySchool.set(k2,rec);
  }
  const schoolRows=schools.map(s=>{
    const k=String(s.name||"").toLowerCase().trim();
    const stats=bySchool.get(k)||{count:0,sports:new Set(),withPhoto:0,levels:new Set()};
    return {id:s.id,name:s.name,city:s.city,level:s.level||"high_school",lhsaa_member:s.lhsaa_member,athletes:stats.count,sports:[...stats.sports].filter(Boolean),withPhoto:stats.withPhoto};
  }).sort((a,b)=>b.athletes-a.athletes || a.name.localeCompare(b.name));

  const zero=schoolRows.filter(s=>s.athletes===0);
  const covered=schoolRows.filter(s=>s.athletes>0);
  const collegeCoverage=LA_COLLEGES.map(name=>{
    const k=name.toLowerCase().trim();
    const stats=bySchool.get(k)||{count:0,sports:new Set(),withPhoto:0};
    return {name,athletes:stats.count,sports:[...stats.sports].filter(Boolean),withPhoto:stats.withPhoto};
  });

  const report={
    generated_at:new Date().toISOString(),
    totals:{schools:schoolRows.length,schools_with_athletes:covered.length,schools_zero_athletes:zero.length,athletes:athletes.length},
    top_schools:covered.slice(0,50),
    zero_athlete_schools:zero.slice(0,200),
    la_colleges:collegeCoverage,
    wossman: schoolRows.filter(s=>/wossman/i.test(s.name))
  };
  const out=path.join(__dirname,"..","data",`la_coverage_report_${Date.now()}.json`);
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report.totals,null,2));
  console.log("zero schools sample", zero.slice(0,10).map(s=>s.name));
  console.log("wossman", report.wossman);
  console.log("Wrote",out);
}
main().catch(e=>{console.error(e); process.exit(1);});