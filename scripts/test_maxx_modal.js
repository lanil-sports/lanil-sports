const fs = require("fs");
const html = fs.readFileSync("lanil-sports/index.html", "utf8");
const scriptStart = html.lastIndexOf("<script>");
const scriptEnd = html.lastIndexOf("</script>");
const code = html.substring(scriptStart + "<script>".length, scriptEnd);

const win = { scrollTo: () => {}, INITIAL_ATHLETES: [] };
let drawerHtml = "";
const doc = {
  getElementById: (id) => ({
    set innerHTML(val) { drawerHtml = val; },
    classList: { add: () => {}, remove: () => {} }
  }),
  addEventListener: () => {}
};
const fn = new Function("window", "document", "fetch", code + "\n const maxx = ATHLETES.find(x => x.slug === 'maxx-jones-2028'); openAthleteDetail(maxx.id);");
fn(win, doc, () => Promise.resolve({ json: () => Promise.resolve({}) }));

console.log("Maxx Jones modal test:");
console.log("Has Maxx Jones:", drawerHtml.includes("Maxx Jones"));
console.log("Has IOL:", drawerHtml.includes("IOL"));
console.log("Has Game-by-Game Box Scores:", drawerHtml.includes("2026 Game-by-Game Box Scores"));
console.log("Has Maxx headshot:", drawerHtml.includes("Maxx-Jones.jpg"));
console.log("Has 4-STAR:", drawerHtml.includes("4-STAR"));
