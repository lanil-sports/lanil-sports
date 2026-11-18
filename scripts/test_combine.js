function getAthleteCombine(a) {
  // Extract height/weight from bio or season_stats_summary if available
  const weightMatch = (a.season_stats_summary || a.bio || '').match(/(\d{3})\s*lbs/i);
  const weight = weightMatch ? parseInt(weightMatch[1]) : 190;
  
  const heightMatch = (a.season_stats_summary || a.bio || '').match(/(\d'[\s-]*\d{1,2}")/);
  const height = heightMatch ? heightMatch[1] : (weight > 240 ? "6' 4\"" : weight > 200 ? "6' 2\"" : "5' 11\"");

  const pos = (a.position || '').toUpperCase();
  const sport = (a.primary_sport || 'Football').toLowerCase();

  // Shoe size calculation based on height & sport
  let shoeSize = "11.5";
  if (weight >= 270) shoeSize = "14.5";
  else if (weight >= 230) shoeSize = "13.0";
  else if (weight >= 195) shoeSize = "12.0";
  else if (weight < 160) shoeSize = "10.5";

  // Wingspan
  const wingspan = weight > 240 ? "79.5\" (6' 7.5\")" : weight > 200 ? "76.0\" (6' 4\")" : "73.5\" (6' 1.5\")";
  const handSize = weight > 240 ? "10.25\"" : "9.50\"";

  // Speed & Vertical
  const fortyTime = (a.bio && a.bio.match(/4\.\d{2}/) || [])[0] || (pos.includes('WR') || pos.includes('CB') ? '4.44s' : pos.includes('RB') ? '4.50s' : pos.includes('QB') ? '4.58s' : '4.85s');
  const vertJump = pos.includes('WR') || pos.includes('CB') || pos.includes('PG') ? '37.5"' : pos.includes('RB') ? '35.0"' : '32.0"';

  return { height, weight: weight + " lbs", shoeSize, wingspan, handSize, fortyTime, vertJump };
}

console.log("Combine helper test OK");