// scripts/acquire_schools.js — Parse school_logos.json artifact into school records.
const fs = require('fs');
const path = require('path');

const ARTIFACT = path.join(__dirname, '..', 'school_logos.json');

function main() {
  const raw = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const schools = Object.entries(raw).map(([slug, logo]) => ({
    slug,
    logo_url: logo,
    source: 'school_logos.json artifact',
  }));
  const dataDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const outFile = path.join(dataDir, 'schools.json');
  fs.writeFileSync(outFile, JSON.stringify({ source: 'school_logos.json artifact', acquired_at: new Date().toISOString(), count: schools.length, schools }, null, 2));
  console.log(`schools: ${schools.length} from school_logos.json; wrote ${outFile}`);
}

main();
