const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const scriptRegex = /<script(?:\s+type=["']text\/javascript["'])?>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  try {
    new Function(code);
    console.log("Script block " + count + " parsed successfully (no syntax errors)!");
  } catch (err) {
    console.error("Syntax error in script block " + count + ":", err.message);
  }
}
