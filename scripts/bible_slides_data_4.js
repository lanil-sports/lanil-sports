// scripts/bible_slides_data_4.js
module.exports = [
  // SLIDE 13: GitHub Workflows
  {
    num: 13,
    category: "AUTOMATED PIPELINE",
    title: "GitHub Actions & Automated Sports Ingestion Workflow",
    content: `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-center py-2">
        <div class="lg:col-span-7 glass p-5 rounded-2xl border border-white/10 space-y-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <i class="fa-brands fa-github"></i> .github/workflows/weekly_sync.yml
            </span>
            <span class="text-[10px] text-slate-400 font-mono">Cron: 0 6 * * 2 (Tuesdays)</span>
          </div>

          <pre class="bg-slate-950 p-3.5 rounded-xl font-mono text-[10.5px] leading-relaxed text-slate-300 border border-white/5 overflow-x-auto"><span class="text-amber-400">name:</span> Weekly Louisiana Sports Ingestion & Sync
<span class="text-amber-400">on:</span>
  <span class="text-cyan-400">schedule:</span>
    - <span class="text-emerald-400">cron: '0 6 * * 2'</span>  <span class="text-slate-500"># Tuesday 06:00 UTC (Post-Weekend Stats)</span>
  <span class="text-cyan-400">workflow_dispatch:</span>       <span class="text-slate-500"># Manual 1-Click Trigger Button</span>

<span class="text-amber-400">jobs:</span>
  <span class="text-cyan-400">sync-sports-data:</span>
    <span class="text-slate-400">runs-on:</span> ubuntu-latest
    <span class="text-slate-400">steps:</span>
      - <span class="text-slate-400">uses:</span> actions/checkout@v4
      - <span class="text-slate-400">uses:</span> actions/setup-node@v4
        <span class="text-slate-400">with:</span> { <span class="text-white">node-version:</span> 20 }
      - <span class="text-slate-400">run:</span> node scripts/scrape_athletes.js
        <span class="text-slate-400">env:</span>
          <span class="text-amber-300 font-bold">SUPABASE_URL:</span> <span class="text-white">\${{ secrets.SUPABASE_URL }}</span>
          <span class="text-amber-300 font-bold">SUPABASE_SERVICE_ROLE_KEY:</span> <span class="text-white">\${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}</span></pre>

          <div class="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
            <span>Runs automatically every Tuesday at 6 AM UTC</span>
            <span class="text-emerald-400 font-semibold">✓ 100% Automated</span>
          </div>
        </div>

        <div class="lg:col-span-5 space-y-3.5">
          <div class="glass p-4 rounded-xl border border-white/10">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-1">
              <i class="fa-solid fa-key"></i> GitHub Repository Secrets
            </h4>
            <p class="text-slate-300 text-xs leading-relaxed mb-2">
              Configured securely under <strong class="text-white">Settings → Secrets and variables → Actions</strong>:
            </p>
            <ul class="text-[11px] text-slate-400 space-y-1 font-mono">
              <li>• <span class="text-white">SUPABASE_URL</span>: Your project API endpoint</li>
              <li>• <span class="text-white">SUPABASE_SERVICE_ROLE_KEY</span>: Backend admin service key</li>
            </ul>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10">
            <h4 class="text-white font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-2 mb-1">
              <i class="fa-solid fa-arrows-rotate"></i> Sync Workflow Stages
            </h4>
            <ol class="text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
              <li>Fetches LHSAA Friday night stats & newspaper recaps.</li>
              <li>Cleans, normalizes, and deduplicates player profiles.</li>
              <li>Performs upsert to Supabase PostgreSQL database.</li>
              <li>Writes timestamped JSON audit log to GitHub repo.</li>
            </ol>
          </div>
        </div>
      </div>
    `
  },

  // SLIDE 14: Deployment Guide
  {
    num: 14,
    category: "DEPLOYMENT GUIDE",
    title: "$0-Budget Production Deployment & Domain Connection",
    content: `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 h-full items-center py-2">
        <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full hover:border-amber-400/40 transition">
          <div>
            <div class="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center mb-3">1</div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide mb-1">Supabase Database</h3>
            <div class="text-[11px] text-amber-300 font-semibold mb-3">$0 / Free Cloud Tier</div>
            <ul class="text-xs text-slate-300 space-y-2">
              <li>1. Create free account at <strong class="text-white">supabase.com</strong>.</li>
              <li>2. Click <strong class="text-white">New Project</strong> → name it <code class="text-amber-300">lanil-sports</code>.</li>
              <li>3. Open <strong class="text-white">SQL Editor</strong> on the left panel.</li>
              <li>4. Paste <code class="text-cyan-300">supabase/schema.sql</code> and click <strong class="text-emerald-400">Run</strong>.</li>
              <li>5. Database tables, indexes, and initial athletes are instantly active!</li>
            </ul>
          </div>
          <div class="mt-4 p-2.5 rounded-xl bg-slate-900 border border-white/5 text-[10px] text-slate-400">
            Includes 500MB storage & unlimited API calls
          </div>
        </div>

        <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full hover:border-cyan-400/40 transition">
          <div>
            <div class="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center mb-3">2</div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide mb-1">Cloudflare Pages / Vercel</h3>
            <div class="text-[11px] text-cyan-300 font-semibold mb-3">$0 / Global Edge Hosting</div>
            <ul class="text-xs text-slate-300 space-y-2">
              <li>1. Push repo to <strong class="text-white">github.com/lanil-sports</strong>.</li>
              <li>2. Log in to <strong class="text-white">pages.cloudflare.com</strong> (or Vercel).</li>
              <li>3. Click <strong class="text-white">Create a Project</strong> → Connect GitHub.</li>
              <li>4. Select repository <code class="text-amber-300">lanil-sports</code>.</li>
              <li>5. Build framework preset: <strong class="text-white">None (Static HTML)</strong>.</li>
              <li>6. Click <strong class="text-emerald-400">Deploy</strong>. Site goes live in 10 seconds!</li>
            </ul>
          </div>
          <div class="mt-4 p-2.5 rounded-xl bg-slate-900 border border-white/5 text-[10px] text-slate-400">
            Free global edge CDN & DDoS protection
          </div>
        </div>

        <div class="glass p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full hover:border-emerald-400/40 transition">
          <div>
            <div class="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center mb-3">3</div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide mb-1">Connect lanilsports.com</h3>
            <div class="text-[11px] text-emerald-300 font-semibold mb-3">Custom Domain Setup</div>
            <ul class="text-xs text-slate-300 space-y-2">
              <li>1. In Cloudflare Pages, go to <strong class="text-white">Custom Domains</strong>.</li>
              <li>2. Click <strong class="text-white">Set up a domain</strong>.</li>
              <li>3. Enter <code class="text-amber-300">lanilsports.com</code> and <code class="text-amber-300">www.lanilsports.com</code>.</li>
              <li>4. Cloudflare automatically sets up DNS records & generates free SSL/TLS certificate.</li>
              <li>5. Your branded domain is live with HTTPS worldwide!</li>
            </ul>
          </div>
          <div class="mt-4 p-2.5 rounded-xl bg-slate-900 border border-white/5 text-[10px] text-slate-400">
            Free automated SSL certificate renewal
          </div>
        </div>
      </div>
    `
  },

  // SLIDE 15: Louisiana Act 810 Compliance
  {
    num: 15,
    category: "LEGAL STANDARDS",
    title: "Louisiana NIL Act 810 (La. R.S. 17:3705) Compliance Standards",
    content: `
      <div class="h-full flex flex-col justify-between py-2 space-y-4">
        <div class="glass p-5 rounded-2xl border border-amber-400/40 bg-amber-500/5">
          <div class="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <i class="fa-solid fa-scale-balanced"></i> Louisiana Revised Statute 17:3705 (Act 810)
          </div>
          <p class="text-slate-300 text-xs leading-relaxed">
            Louisiana is one of the premier high school athletic states with clear legislative frameworks protecting student-athletes while allowing them to monetize their Name, Image, and Likeness (NIL). LANILSPORTS.COM strictly enforces all 4 pillars of the law:
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="glass p-4 rounded-xl border border-white/10 space-y-1.5">
            <div class="flex items-center gap-2 text-white font-bold text-xs">
              <span class="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">1</span>
              <span>Mandatory Minor Parental Consent</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Any student-athlete under 18 years of age must have signed parental or legal guardian authorization before any commercial NIL transaction, profile claim, or royalty payout is disbursed.
            </p>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10 space-y-1.5">
            <div class="flex items-center gap-2 text-white font-bold text-xs">
              <span class="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">2</span>
              <span>School IP & Trademark Protection</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Athletes cannot wear official high school uniforms or display member school crests/LHSAA trademarks in commercial paid endorsements without written approval from the school principal or athletic director.
            </p>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10 space-y-1.5">
            <div class="flex items-center gap-2 text-white font-bold text-xs">
              <span class="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">3</span>
              <span>Prohibited Endorsement Categories</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Strictly prohibits any endorsement or affiliation with alcohol, tobacco, vaping, cannabis, sports gambling/wagering, adult entertainment, and firearms or dangerous weapons.
            </p>
          </div>

          <div class="glass p-4 rounded-xl border border-white/10 space-y-1.5">
            <div class="flex items-center gap-2 text-white font-bold text-xs">
              <span class="w-5 h-5 rounded-full bg-yellow-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">4</span>
              <span>Independent Directory Safe Harbor</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              LANILSPORTS.COM operates strictly as an independent sports directory, media outlet, and digital yearbook platform. It does not act as an athlete sports agent, attorney, or endorsement broker.
            </p>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-400 text-center">
          ⚖️ Compliance disclaimers are hard-coded into every claim modal, checkout flow, and digital card export.
        </div>
      </div>
    `
  },

  // SLIDE 16: Roadmap & Conclusion
  {
    num: 16,
    category: "GROWTH & STRATEGY",
    title: "Execution Roadmap: Scaling LANIL Sports Statewide",
    content: `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 h-full items-center py-2">
        <div class="glass p-5 rounded-2xl border border-emerald-400/40 bg-emerald-500/5 flex flex-col justify-between h-full">
          <div>
            <div class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-[10px] uppercase mb-2">
              Phase 1 • ACTIVE NOW
            </div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide mb-3">Digital Yearbook Foundation</h3>
            <ul class="text-xs text-slate-300 space-y-2">
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Directory live with Classes 2027–2030</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Free 9:16 digital cards & signature canvas</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Weekly Athlete of the Week fan voting poll</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> Supabase cloud database connected</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-check text-emerald-400 text-xs"></i> GitHub Actions automated weekly sync</li>
            </ul>
          </div>
          <div class="mt-4 pt-3 border-t border-white/5 text-emerald-400 text-[11px] font-semibold">
            Status: Fully Deployed & Operational
          </div>
        </div>

        <div class="glass p-5 rounded-2xl border border-amber-400/40 bg-amber-500/5 flex flex-col justify-between h-full">
          <div>
            <div class="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase mb-2">
              Phase 2 • MONTHS 1–3
            </div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide mb-3">Physical Merchandising Engine</h3>
            <ul class="text-xs text-slate-300 space-y-2">
              <li class="flex items-center gap-2"><i class="fa-solid fa-circle-dot text-amber-400 text-xs"></i> 32pt collector cards with magnetic cases</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-circle-dot text-amber-400 text-xs"></i> Custom peel & stick vinyl wall decals</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-circle-dot text-amber-400 text-xs"></i> 3D custom athlete bobblehead sculpts</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-circle-dot text-amber-400 text-xs"></i> Direct Stripe checkout integration</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-circle-dot text-amber-400 text-xs"></i> Automated parent royalty revenue-splits</li>
            </ul>
          </div>
          <div class="mt-4 pt-3 border-t border-white/5 text-amber-400 text-[11px] font-semibold">
            Projected Revenue: $15,000–$25,000/mo
          </div>
        </div>

        <div class="glass p-5 rounded-2xl border border-cyan-400/40 bg-cyan-500/5 flex flex-col justify-between h-full">
          <div>
            <div class="inline-block px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold text-[10px] uppercase mb-2">
              Phase 3 • MONTHS 4–12
            </div>
            <h3 class="font-athletic text-2xl text-white uppercase tracking-wide mb-3">Statewide Monopolization</h3>
            <ul class="text-xs text-slate-300 space-y-2">
              <li class="flex items-center gap-2"><i class="fa-solid fa-arrow-right text-cyan-400 text-xs"></i> 64-Parish local business sponsor program</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-arrow-right text-cyan-400 text-xs"></i> Varsity AD portals for entire team rosters</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-arrow-right text-cyan-400 text-xs"></i> Statewide Louisiana Athlete of the Year gala</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-arrow-right text-cyan-400 text-xs"></i> College recruiter SaaS subscriptions ($19.99/mo)</li>
              <li class="flex items-center gap-2"><i class="fa-solid fa-arrow-right text-cyan-400 text-xs"></i> Expansion to Texas, Mississippi & Alabama</li>
            </ul>
          </div>
          <div class="mt-4 pt-3 border-t border-white/5 text-cyan-400 text-[11px] font-semibold">
            Long-Term Enterprise Value: $2.5M+
          </div>
        </div>
      </div>
    `
  }
];
