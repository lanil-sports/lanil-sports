const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

// Extract the main script block
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
if (!scriptMatch) {
  console.error("Could not find script block!");
  process.exit(1);
}

const scriptCode = scriptMatch[1];

// Create a mock DOM environment
const mockDOM = `
let window = {
  INITIAL_ATHLETES: [],
  supabase: null,
  scrollTo: () => {}
};
let document = {
  getElementById: (id) => ({
    innerHTML: '',
    classList: { add: () => {}, remove: () => {} },
    value: '',
    src: '',
    textContent: ''
  }),
  addEventListener: (event, cb) => {}
};
let alert = console.log;
let fetch = () => Promise.resolve({ json: () => Promise.resolve({}) });

${scriptCode}

console.log("INITIAL_ATHLETES count:", window.INITIAL_ATHLETES.length);
console.log("ATHLETES count:", ATHLETES.length);

const renderedDir = renderDirectory();
console.log("renderDirectory() returned length:", renderedDir.length);
console.log("First 200 chars of renderDirectory():", renderedDir.substring(0, 200));
`;

try {
  eval(mockDOM);
  console.log("Execution simulation passed with zero errors!");
} catch (err) {
  console.error("Execution error:", err);
}
