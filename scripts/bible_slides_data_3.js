// scripts/bible_slides_data_3.js
module.exports = [
  // SLIDE 9: Custom Wall Decals (Fathead Style)
  {
    num: 9,
    category: "PHYSICAL MERCHANDISE ENGINE",
    title: "Custom Peel & Stick Vinyl Wall Decals (Fathead Style)",
    content: `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-center py-2">
        <!-- WALL DECAL MOCKUP IMAGE -->
        <div class="lg:col-span-5 flex justify-center items-center">
          <div class="relative group">
            <img src="/assets/ryder_lyons_wall_decal.jpg" alt="Ryder Lyons Custom Wall Decal" class="max-h-[460px] w-auto rounded-2xl border-2 border-emerald-400/80 shadow-2xl shadow-emerald-500/20 object-contain group-hover:scale-105 transition-transform duration-300">
            <div class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-400 text-slate-950 font-bold text-[9px] uppercase px-3 py-0.5 rounded-full shadow tracking-wider whitespace-nowrap">
              ★ 100% Repositionable Vinyl ★
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-3.5">
          <div class="glass p-4 rounded-xl border border-white/10 flex items-center justify-between hover:border-amber-400/40 transition">
            <div>
              <div class="text-white font-bold text-sm">Locker Room Decal (18" × 24")</div>
              <div class="text-slate-400 text-xs mt-0.5">Fits standard high school athletic & hallway metal lockers</div>
              <div class="text-emerald-400 text-[11px] font-semibold mt-1">71% Gross Margin ($28.49 profit)</div>
            </div>
            <div class="font-athletic text-3xl font-bold text-amber-400">$39.99</div>
          </div>

          <div class="glass p-4 rounded-xl border border-amber-400/40 bg-amber-500/5 flex items-center justify-between hover:border-amber-400 transition">
            <div>
              <div class="text-amber-300 font-bold text-sm flex items-center gap-2">
                <span>Bedroom Wall Poster (24" × 36")</span>
                <span class="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full uppercase">Fan Favorite</span>
              </div>
              <div class="text-slate-300 text-xs mt-0.5">Classic poster size; zero nails, push-pins, or tape needed</div>
              <div class="text-emerald-400 text-[11px] font-semibold mt-1">74% Gross Margin ($37.19 profit)</div>
            </div>
            <div class="font-athletic text-3xl font-bold text-amber-400">$49.99</div>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10 flex items-center justify-between hover:border-cyan-400/40 transition">
            <div>
              <div class="text-white font-bold text-sm">Life-Size Athletic Cutout (36" × 60")</div>
              <div class="text-slate-400 text-xs mt-0.5">Full 5-foot die-cut player silhouette for game rooms & gyms</div>
              <div class="text-emerald-400 text-[11px] font-semibold mt-1">76% Gross Margin ($53.49 profit)</div>
            </div>
            <div class="font-athletic text-3xl font-bold text-cyan-400">$69.99</div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-emerald-400/30 text-[11px] text-slate-300 flex items-center gap-2">
            <i class="fa-solid fa-shield-halved text-emerald-400 text-sm"></i>
            <span>Guaranteed zero wall damage: 6-mil low-tack repositionable vinyl safe for painted drywall and athletic lockers.</span>
          </div>
        </div>
      </div>
    `
  },

  // SLIDE 10: Unit Economics Table
  {
    num: 10,
    category: "BUSINESS MODEL",
    title: "Zero-Inventory On-Demand Fulfillment & Unit Economics",
    content: `
      <div class="h-full flex flex-col justify-between py-2 space-y-4">
        <div class="glass rounded-2xl border border-white/10 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-900 text-amber-400 font-athletic text-sm uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th class="py-3 px-4">Product Keepsake</th>
                  <th class="py-3 px-3 text-center">Retail Price</th>
                  <th class="py-3 px-3 text-center">Fulfillment Cost</th>
                  <th class="py-3 px-3 text-center">Net Margin ($)</th>
                  <th class="py-3 px-3 text-center">Gross Margin (%)</th>
                  <th class="py-3 px-4">Fulfillment Channel</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5 text-slate-300">
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">Ultra-HD Pro Digital Card (4K)</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$1.00</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$0.03 (Stripe fee)</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$0.97</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">97%</td>
                  <td class="py-2.5 px-4 text-slate-400">Instant Automated Download</td>
                </tr>
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">Single 32pt Collector Card + Case</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$9.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$2.65</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$7.34</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">73%</td>
                  <td class="py-2.5 px-4 text-slate-400">API Print-on-Demand + Dropship</td>
                </tr>
                <tr class="hover:bg-white/5 transition bg-amber-500/5">
                  <td class="py-2.5 px-4 font-semibold text-white">5-Pack Family & Booster Bundle</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$24.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$6.40</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$18.59</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">74%</td>
                  <td class="py-2.5 px-4 text-slate-400">Batch On-Demand Print Run</td>
                </tr>
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">10-Pack Team / Sponsor Pack</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$44.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$10.80</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$34.19</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">76%</td>
                  <td class="py-2.5 px-4 text-slate-400">Commercial Gang Run</td>
                </tr>
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">Locker Room Decal (18" × 24")</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$39.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$11.50</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$28.49</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">71%</td>
                  <td class="py-2.5 px-4 text-slate-400">Wide-Format Latex Vinyl Plotter</td>
                </tr>
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">Bedroom Wall Poster Decal (24" × 36")</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$49.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$12.80</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$37.19</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">74%</td>
                  <td class="py-2.5 px-4 text-slate-400">Rolled Tube Dropship</td>
                </tr>
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">Life-Size Athletic Cutout (36" × 60")</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$69.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$16.50</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$53.49</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">76%</td>
                  <td class="py-2.5 px-4 text-slate-400">Custom Die-Cut Wide Plotter</td>
                </tr>
                <tr class="hover:bg-white/5 transition">
                  <td class="py-2.5 px-4 font-semibold text-white">Custom 3D Athlete Bobblehead</td>
                  <td class="py-2.5 px-3 text-center text-amber-300 font-bold">$49.99</td>
                  <td class="py-2.5 px-3 text-center text-slate-400">$19.00</td>
                  <td class="py-2.5 px-3 text-center text-emerald-400 font-bold">$30.99</td>
                  <td class="py-2.5 px-3 text-center font-bold text-emerald-400">62%</td>
                  <td class="py-2.5 px-4 text-slate-400">3D Sculpting Partner Dropship</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="glass p-3 rounded-xl border border-white/10 text-xs">
            <div class="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-ban"></i> Zero Inventory Capital
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed">No unsold boxes or warehousing. Every physical product is printed and assembled only after customer checkout.</p>
          </div>
          <div class="glass p-3 rounded-xl border border-white/10 text-xs">
            <div class="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-box"></i> Direct Dropship
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed">White-label packaging delivers directly to parent addresses or varsity banquets with branded tracking numbers.</p>
          </div>
          <div class="glass p-3 rounded-xl border border-white/10 text-xs">
            <div class="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <i class="fa-solid fa-hand-holding-dollar"></i> Student Royalty Split
            </div>
            <p class="text-slate-400 text-[11px] leading-relaxed">Configurable direct rev-share deposited straight to verified parent/guardian accounts under Act 810 rules.</p>
          </div>
        </div>
      </div>
    `
  },

  // SLIDE 11: Monetization SaaS Tiers
  {
    num: 11,
    category: "RECURRING REVENUE",
    title: "Monetization Blueprint: SaaS Subscriptions & Hyperlocal Ads",
    content: `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 h-full items-center py-2">
        <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-amber-400/40 transition h-full">
          <div>
            <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Athletes & Parents</div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide">LANIL Athlete Plus</h3>
            <div class="my-3">
              <span class="font-athletic text-4xl font-bold text-white">$3.99</span>
              <span class="text-slate-400 text-xs">/ month</span>
            </div>
            <ul class="text-xs text-slate-300 space-y-2 mb-4">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400 text-xs"></i> 10 high-res photo gallery uploads</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400 text-xs"></i> Custom scouting bio & Hudl/YouTube links</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400 text-xs"></i> Official Gold Verified Prospect badge</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400 text-xs"></i> Recruiter profile view analytics alerts</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-amber-400 text-xs"></i> Unlimited free unwatermarked Pro 4K cards</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-400/10 text-amber-300 text-[11px] text-center font-semibold">
            Direct high school athlete & family subscription
          </div>
        </div>

        <div class="glass p-5 rounded-2xl border border-cyan-400/40 bg-cyan-500/5 flex flex-col justify-between hover:border-cyan-400 transition h-full relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full">
            B2B Scouting SaaS
          </div>
          <div>
            <div class="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Coaches & Media</div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide">Recruiter & Media Pro</h3>
            <div class="my-3">
              <span class="font-athletic text-4xl font-bold text-cyan-400">$19.99</span>
              <span class="text-slate-400 text-xs">/ month</span>
            </div>
            <ul class="text-xs text-slate-300 space-y-2 mb-4">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400 text-xs"></i> Full unredacted 64-parish database</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400 text-xs"></i> Direct varsity coach contact channels</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400 text-xs"></i> Historical stats & laser measurables</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400 text-xs"></i> Exportable PDF/Excel recruiting dossiers</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400 text-xs"></i> Priority sleeper alerts on new prospects</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-300 text-[11px] text-center font-semibold">
            Essential scouting index for NCAA & JUCO coaches
          </div>
        </div>

        <div class="glass p-5 rounded-2xl border border-emerald-400/30 flex flex-col justify-between hover:border-emerald-400 transition h-full">
          <div>
            <div class="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Local Louisiana Businesses</div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide">Parish Sponsorship</h3>
            <div class="my-3">
              <span class="font-athletic text-4xl font-bold text-emerald-400">$99.00</span>
              <span class="text-slate-400 text-xs">/ month</span>
            </div>
            <ul class="text-xs text-slate-300 space-y-2 mb-4">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Exclusive banner on parish directory</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Target high-intent local sports parents</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Co-branded sponsor of Athlete of the Week</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Monthly shoutout on @lanilsports social</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Tax-deductible youth athletics support</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-300 text-[11px] text-center font-semibold">
            64 Parishes × $99/mo = $6,336 MRR potential
          </div>
        </div>
      </div>
    `
  },

  // SLIDE 12: Database Architecture
  {
    num: 12,
    category: "BACKEND ARCHITECTURE",
    title: "Supabase PostgreSQL Database Schema & Security (RLS)",
    content: `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-center py-2">
        <div class="lg:col-span-7 glass p-5 rounded-2xl border border-white/10 space-y-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-table-cells"></i> Relational PostgreSQL DDL
            </span>
            <span class="text-[10px] text-slate-400 font-mono">supabase/schema.sql</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 bg-slate-900 rounded-lg border border-white/5">
              <div class="text-white font-bold font-mono text-[11px] text-amber-300">athletes</div>
              <p class="text-[10px] text-slate-400 mt-1">player_id (PK), full_name, slug, grad_year, school_slug, parish, sport, stats, nil_val, photo_url, claimed</p>
            </div>
            <div class="p-2.5 bg-slate-900 rounded-lg border border-white/5">
              <div class="text-white font-bold font-mono text-[11px] text-cyan-300">schools</div>
              <p class="text-[10px] text-slate-400 mt-1">id (PK), school_name, mascot, classification (5A-1A), parish_name, logo_url, lhsaa_member</p>
            </div>
            <div class="p-2.5 bg-slate-900 rounded-lg border border-white/5">
              <div class="text-white font-bold font-mono text-[11px] text-emerald-300">athlete_offers</div>
              <p class="text-[10px] text-slate-400 mt-1">id (PK), athlete_id (FK), college_name, division (D1-FBS, FCS), offer_date, offer_status</p>
            </div>
            <div class="p-2.5 bg-slate-900 rounded-lg border border-white/5">
              <div class="text-white font-bold font-mono text-[11px] text-yellow-300">fan_votes</div>
              <p class="text-[10px] text-slate-400 mt-1">id (PK), week_id, athlete_id (FK), voter_fingerprint, ip_hash, created_at (prevents bot ballot stuffing)</p>
            </div>
          </div>

          <div class="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300">
            <span class="text-emerald-400 font-bold">CREATE POLICY</span> "Public can view active athletes" <span class="text-cyan-400">ON</span> athletes<br>
            <span class="text-amber-300">FOR SELECT USING</span> (status = 'active');<br>
            <span class="text-emerald-400 font-bold">CREATE POLICY</span> "Athletes can update own claimed profile" <span class="text-cyan-400">ON</span> athletes<br>
            <span class="text-amber-300">FOR UPDATE USING</span> (auth.uid() = claimed_by_user_id);
          </div>
        </div>

        <div class="lg:col-span-5 space-y-3.5">
          <div class="glass p-4 rounded-xl border border-white/10">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-1">
              <i class="fa-solid fa-lock"></i> Row Level Security (RLS)
            </h4>
            <p class="text-slate-300 text-xs leading-relaxed">
              Every table enforces granular RLS policies. Unauthenticated public traffic can read verified roster entries, while write operations require Supabase Auth or service role keys.
            </p>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-2 mb-1">
              <i class="fa-solid fa-shield-virus"></i> Anti-Bot Fan Voting
            </h4>
            <p class="text-slate-300 text-xs leading-relaxed">
              Voting requests are recorded with unique client fingerprint hashes and rate-limited via a database trigger function (<code class="text-amber-300">record_fan_vote</code>), preventing automated bot manipulation.
            </p>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-2 mb-1">
              <i class="fa-solid fa-network-wired"></i> Zero-Latency Fallback
            </h4>
            <p class="text-slate-300 text-xs leading-relaxed">
              If the database connection is interrupted or credentials are intentionally blank, the app gracefully falls back to the embedded seed data (<code class="text-amber-300">data.js</code>).
            </p>
          </div>
        </div>
      </div>
    `
  }
];
