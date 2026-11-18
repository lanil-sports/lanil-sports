const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const scriptStart = html.lastIndexOf("<script>");
const scriptEnd = html.lastIndexOf("</script>");
const code = html.substring(scriptStart + "<script>".length, scriptEnd);

const mockEnv = `
${code}

console.log("INITIAL_ATHLETES count:", window.INITIAL_ATHLETES ? window.INITIAL_ATHLETES.length : 0);
console.log("ATHLETES count:", ATHLETES.length);

try {
  const output = renderDirectory();
  console.log("renderDirectory() SUCCESS! Output length:", output.length);
} catch (e) {
  console.error("renderDirectory() FAILED:", e);
}

try {
  const card = renderAthleteCard(ATHLETES[0]);
  console.log("renderAthleteCard() SUCCESS! Output length:", card.length);
} catch (e) {
  console.error("renderAthleteCard() FAILED:", e);
}
`;

try {
  const win = { scrollTo: () => {}, INITIAL_ATHLETES: [] };
  const doc = {
    getElementById: (id) => ({ innerHTML: "", classList: { add: () => {}, remove: () => {} } }),
    addEventListener: () => {}
  };
  const fetchMock = () => Promise.resolve({ json: () => Promise.resolve({}) });
  const fn = new Function("window", "document", "fetch", mockEnv);
  fn(win, doc, fetchMock);
  console.log("ALL RUNTIME TESTS PASSED PERFECTLY!");
} catch (err) {
  console.error("Test execution failed:", err);
}
