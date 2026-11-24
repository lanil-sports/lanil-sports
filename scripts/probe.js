const fetch = globalThis.fetch;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const urls = [
  "https://www.on3.com/db/rankings/football/national/2027/?position=&stateId=18",
  "https://www.on3.com/db/rankings/football/state/louisiana/2027/",
  "https://www.on3.com/rankings/football/state/louisiana/",
  "https://247sports.com/Season/2027-Football/CompositeRecruitRankings/?InstitutionGroup=HighSchool&State=LA",
  "https://247sports.com/state/louisiana/Season/2027-Football/AllTimeRecruitRankings/",
  "https://www.prepredzone.com/louisiana/",
  "https://www.prepredzone.com/tag/louisiana-football/",
  "https://www.prepredzone.com/2026/11/"
];
(async()=>{
  for(const url of urls){
    try{
      const r = await fetch(url,{headers:{"User-Agent":UA,"Accept":"text/html"},timeout:12000,follow:5});
      const text = await r.text();
      console.log(r.status + " [" + text.length + "b] " + url.substring(0,90));
    }catch(e){console.log("ERR " + e.message.substring(0,50) + " " + url.substring(0,60));}
    await new Promise(r=>setTimeout(r,2000));
  }
})();