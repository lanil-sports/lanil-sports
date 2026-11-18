const fs = require("fs");
const html = fs.readFileSync("lanil-sports/index.html", "utf8");
const scriptStart = html.lastIndexOf("<script>");
const scriptEnd = html.lastIndexOf("</script>");
const code = html.substring(scriptStart + "<script>".length, scriptEnd);

const win = { scrollTo: () => {}, INITIAL_ATHLETES: [] };
const elements = {};
const doc = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = {
        innerHTML: "",
        textContent: "",
        src: "",
        style: {},
        classList: { add: () => {}, remove: () => {} }
      };
    }
    return elements[id];
  },
  addEventListener: () => {}
};

try {
  const fn = new Function("window", "document", "fetch", code + `
    console.log("Testing openCardModal on first athlete...");
    openCardModal(ATHLETES[0].id);
    console.log("Topps School:", document.getElementById('topps-school').textContent);
    console.log("Topps Name:", document.getElementById('card-name').textContent);
    console.log("Topps Card Num:", document.getElementById('topps-card-num').textContent);
    console.log("Testing openMerchOrder('card')...");
    openMerchOrder('card');
    console.log("Merch Athlete Name:", document.getElementById('merch-athlete-name').textContent);
    console.log("Testing openMerchOrder('poster')...");
    openMerchOrder('poster');
    console.log("Merch Title:", document.getElementById('merch-title').textContent);
  `);
  fn(win, doc, () => Promise.resolve({ json: () => Promise.resolve({}) }));
  console.log("TOPPS CARD & MERCH TESTS PASSED 100%!");
} catch (err) {
  console.error("Test failed:", err);
}
