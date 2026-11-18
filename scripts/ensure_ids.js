const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const match = html.match(/window\.INITIAL_ATHLETES\s*=\s*(\[[\s\S]*?\]);/);
if (match) {
  let list = JSON.parse(match[1]);
  list = list.map((a, idx) => ({
    ...a,
    id: a.id || (idx + 1).toString()
  }));

  const startIdx = html.indexOf("window.INITIAL_ATHLETES = ");
  const endMarker = "// LANILSPORTS.COM Core Application Logic (Part 1)";
  const endIdx = html.indexOf(endMarker);

  const before = html.substring(0, startIdx);
  const after = html.substring(endIdx);
  const newHtml = before + "window.INITIAL_ATHLETES = " + JSON.stringify(list) + ";\n\n" + after;
  fs.writeFileSync(htmlPath, newHtml, "utf8");
  console.log("Successfully ensured valid id on all " + list.length + " initial athletes!");
}
