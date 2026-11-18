const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const target = "document.addEventListener('DOMContentLoaded', () => {\r\n  render();\r\n});";
const targetUnix = "document.addEventListener('DOMContentLoaded', () => {\n  render();\n});";

const replacement = `// Supabase Live Data Connection
const SUPABASE_URL = 'https://uwnslkzyvmrrycdxvudg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VSm_VLdVuFcQHseAssDINA_g9XYQoEW';
let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function loadLiveSupabaseAthletes() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('athletes')
      .select('*')
      .order('est_nil_value', { ascending: false })
      .limit(1000);
    
    if (!error && data && data.length > 0) {
      ATHLETES = data.map(a => ({
        ...a,
        headshot_url: a.headshot_url || (a.primary_sport === 'Softball' || a.primary_sport === 'Volleyball'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80')
      }));
      render();
      console.log('✅ Loaded ' + ATHLETES.length + ' live Louisiana athletes from Supabase!');
    }
  } catch (err) {
    console.warn('Supabase live fetch note:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  loadLiveSupabaseAthletes();
});`;

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("Successfully patched index.html (CRLF)!");
} else if (html.includes(targetUnix)) {
  html = html.replace(targetUnix, replacement);
  fs.writeFileSync(htmlPath, html, "utf8");
  console.log("Successfully patched index.html (LF)!");
} else {
  // Replace just render() inside DOMContentLoaded
  const regex = /document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*\(\)\s*=>\s*\{[\s\S]*?render\(\);\s*\}\);/;
  if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync(htmlPath, html, "utf8");
    console.log("Successfully patched index.html via regex!");
  } else {
    console.log("Could not find DOMContentLoaded block");
  }
}