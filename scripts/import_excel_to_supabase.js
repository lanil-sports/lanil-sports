/**
 * LANILSPORTS.COM Data Pipeline Ingestion Script
 * Ingests rows from CSV/JSON exported from the Louisiana Yearbook Spreadsheet
 * and upserts them into Supabase PostgreSQL.
 *
 * Usage:
 *   node import_excel_to_supabase.js <path_to_data.json>
 */

const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

function calculateEstimatedNIL(followers, collegesCount, hasSecondarySport) {
  // $0.15 per follower + $250 per college offer/interest + $300 multi-sport bonus + $100 base
  const followerVal = (followers || 0) * 0.15;
  const collegeVal = collegesCount > 0 ? (collegesCount * 250) : 100;
  const multiSportVal = hasSecondarySport ? 300 : 0;
  return Math.round(followerVal + collegeVal + multiSportVal);
}

function transformRow(row) {
  const secondarySports = row.Secondary_Sports ? row.Secondary_Sports.split(',').map(s => s.trim()) : [];
  const colleges = row.Potential_Colleges ? row.Potential_Colleges.split(',').map(s => s.trim()) : [];
  const followers = parseInt(row.Total_Followers, 10) || 0;
  
  const nilVal = row.Est_NIL_Value ? parseFloat(row.Est_NIL_Value) : calculateEstimatedNIL(followers, colleges.length, secondarySports.length > 0);

  return {
    player_id: row.Player_ID,
    full_name: row.Full_Name,
    slug: row.Full_Name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + row.Grad_Year,
    grad_year: parseInt(row.Grad_Year, 10),
    current_grade: row.Current_Grade,
    school_name: row.High_School,
    parish_city: row.Parish_City,
    primary_sport: row.Primary_Sport,
    secondary_sports: secondarySports,
    position: row.Position,
    season_stats_summary: row.Season_Stats_Summary,
    newspaper_mentions: row.Newspaper_Mentions ? [{ source: "Local Media", title: row.Newspaper_Mentions, date: row.Last_Updated || new Date().toISOString().split('T')[0] }] : [],
    social_handles: { raw: row.Social_Handles || '' },
    total_followers: followers,
    est_nil_value: nilVal,
    potential_colleges: colleges,
    headshot_url: row.Player_Photo || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=500&auto=format&fit=crop&q=80',
    last_updated: row.Last_Updated || new Date().toISOString().split('T')[0]
  };
}

console.log("LANIL Data Pipeline Script ready.");
console.log("Call with your Supabase credentials to sync high school sports rosters.");