const fetch = require("node-fetch");
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TEST_URLS = [
  "https://www.maxpreps.com/la/monroe/neville-tigers/football/roster/",
  "https://www.maxpreps.com/la/river-ridge/john-curtis-patriots/football/roster/",
  "https://www.maxpreps.com/la/new-orleans/edna-karr-cougars/football/roster/",
  "https://www.maxpreps.com/la/shreveport/captain-shreve-gators/football/roster/",
  "https://www.maxpreps.com/la/baton-rouge/catholic-high-bears/football/roster/",
  "https://www.lhsaa.org/schools",
  "https://www.lhsaa.org/sports/football",
  "https://www.maxpreps.com/local/state-of-louisiana/rankings/football/?classificationid=0"
];

(async()=>{
  for(const url of TEST_URLS){
    try{
      const r = await fetch(url,{headers:{"User-Agent":UA,"Accept":"text/html"},timeout:12000,follow:5});
      const html = await r.text();
      console.log(r.status + " [" + html.length + "b] " + url.replace("https://",""));
      if(r.ok && html.length > 5000){
        const $ = cheerio.load(html);
        // Sample content
        const title = $("h1,h2").first().text().trim().substring(0,80);
        const rows = $("tr,li,.player-row,[class*=roster],[class*=player]").length;
        console.log("  Title:", title || "(none)");
        console.log("  Potential rows:", rows);
      }
    }catch(e){console.log("ERR: "+e.message.substring(0,60)+" | "+url.replace("https://",""));}
    await new Promise(r=>setTimeout(r,800));
  }
})();