const { pptx, COLORS, applySlideChrome } = require('./pptx_base');
const fs = require('fs');
const path = require('path');

function buildSlides4() {
  // SLIDE 10: Unit Economics Table
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Business Model", "Zero-Inventory On-Demand Fulfillment & Unit Economics");

    const rows = [
      [
        { text: "Product Item", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } },
        { text: "Retail", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } },
        { text: "COGS", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } },
        { text: "Player (20%)", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } },
        { text: "School (10%)", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } },
        { text: "Net Profit", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } },
        { text: "Margin %", options: { bold: true, fill: { color: '1E293B' }, color: COLORS.GOLD_ACCENT } }
      ],
      ["Ultra-HD Pro Digital Card (4K)", "$1.00", "$0.03", "$0.20", "$0.10", "$0.67", "67.0%"],
      ["Single 32pt Collector Card + Case", "$9.99", "$2.65", "$2.00", "$1.00", "$4.34", "43.4%"],
      ["5-Pack Family & Booster Bundle", "$24.99", "$6.40", "$5.00", "$2.50", "$11.09", "44.4%"],
      ["10-Pack Team / Sponsor Pack", "$44.99", "$10.80", "$9.00", "$4.50", "$20.69", "46.0%"],
      ["Locker Room Decal (18x24)", "$39.99", "$11.50", "$8.00", "$4.00", "$16.49", "41.2%"],
      ["Bedroom Wall Poster Decal (24x36)", "$49.99", "$12.80", "$10.00", "$5.00", "$22.19", "44.4%"],
      ["Life-Size Athletic Cutout (36x60)", "$69.99", "$16.50", "$14.00", "$7.00", "$32.49", "46.4%"],
      ["Custom 3D Athlete Bobblehead (7-inch)", "$65.00", "$19.00", "$13.00", "$6.50", "$26.50", "40.8%"]
    ];

    s.addTable(rows, {
      x: 0.8, y: 1.4, w: 11.7, h: 3.4,
      fontFace: 'Arial', fontSize: 10, color: COLORS.WHITE,
      border: { color: '334155', pt: 1 },
      align: 'center', valign: 'middle'
    });

    const pillars = [
      { title: "No Inventory Liability", desc: "Zero capital tied up in unsold stock. Products are only printed and packaged after Stripe payment confirmation." },
      { title: "Direct Dropship Delivery", desc: "White-labeled packaging ships directly to the parent, athlete, or school athletic department via automated webhook." },
      { title: "Athlete Royalty Protocol", desc: "Configurable royalty rev-share deposited directly to parent/guardian bank accounts under Act 810 guidelines." }
    ];

    pillars.forEach((p, idx) => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8 + (idx * 4.0), y: 5.1, w: 3.7, h: 1.6, r: 0.1,
        fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
      });
      s.addText(p.title, {
        x: 1.0 + (idx * 4.0), y: 5.3, w: 3.3, h: 0.3,
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.GOLD_ACCENT
      });
      s.addText(p.desc, {
        x: 1.0 + (idx * 4.0), y: 5.65, w: 3.3, h: 0.9,
        fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT, lineSpacing: 15
      });
    });
  }

  // SLIDE 11: Monetization SaaS Tiers
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Recurring Revenue", "Monetization Blueprint: SaaS Subscriptions & Hyperlocal Ads");

    const tiers = [
      {
        name: "LANIL ATHLETE PLUS",
        price: "$3.99 / mo",
        sub: "For Student-Athletes & Parents",
        features: [
          "Up to 10 verified high-res photo uploads",
          "Custom scouting bio & Hudl/YouTube highlights",
          "Official Gold Verified Prospect Badge",
          "College recruiter view analytics & alerts",
          "Unlimited free unwatermarked Pro 4K cards"
        ],
        color: COLORS.GOLD_ACCENT
      },
      {
        name: "RECRUITER & MEDIA PRO",
        price: "$19.99 / mo",
        sub: "For College Coaches, Scouts & Journalists",
        features: [
          "Full unredacted Louisiana athlete database",
          "Direct coach & parent contact channels",
          "Historical measurables & 40-yd laser tracking",
          "Exportable PDF/Excel recruiting dossiers",
          "Priority notifications on newly discovered talent"
        ],
        color: COLORS.CYAN
      },
      {
        name: "PARISH SPONSORSHIP",
        price: "$99.00 / mo",
        sub: "For Louisiana Local Businesses",
        features: [
          "Exclusive banner ad on parish directory page",
          "High-intent local sports parent audience",
          "Co-branded sponsor of Athlete of the Week poll",
          "Social media mention across @lanilsports",
          "Tax-deductible local high school sports support"
        ],
        color: COLORS.EMERALD
      }
    ];

    tiers.forEach((t, i) => {
      const x = 0.8 + (i * 4.0);
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x, y: 1.4, w: 3.7, h: 5.3, r: 0.15,
        fill: { color: COLORS.SLATE_CARD }, line: { color: t.color, width: 1.5 }
      });
      s.addText(t.name, {
        x: x + 0.2, y: 1.65, w: 3.3, h: 0.35,
        fontFace: 'Arial', fontSize: 13, bold: true, color: t.color, align: 'center'
      });
      s.addText(t.price, {
        x: x + 0.2, y: 2.05, w: 3.3, h: 0.5,
        fontFace: 'Arial', fontSize: 24, bold: true, color: COLORS.WHITE, align: 'center'
      });
      s.addText(t.sub, {
        x: x + 0.2, y: 2.55, w: 3.3, h: 0.3,
        fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT, align: 'center'
      });
      s.addShape(pptx.shapes.LINE, {
        x: x + 0.4, y: 2.95, w: 2.9, h: 0,
        line: { color: '334155', width: 1 }
      });
      const bList = t.features.map(f => ({
        text: "✔  " + f + "\n\n",
        options: { color: COLORS.WHITE }
      }));
      s.addText(bList, {
        x: x + 0.3, y: 3.15, w: 3.1, h: 3.3,
        fontFace: 'Arial', fontSize: 9.5, lineSpacing: 14
      });
    });
  }

  // SLIDE 12: Database Architecture
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Backend Architecture", "Supabase PostgreSQL Database Schema & Security (RLS)");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 5.6, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("POSTGRESQL RELATIONAL TABLES", { x: 1.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.GOLD_ACCENT });

    const tables = [
      { name: "athletes", desc: "Core profile data: full_name, slug, grad_year, school_id, parish, primary_sport, position, season_stats_summary, bio, headshot_url, est_nil_value, claimed." },
      { name: "schools", desc: "High school directory: school_name, parish, classification (1A–5A), mascot, logo_url, district." },
      { name: "athlete_offers", desc: "College recruitment: athlete_id, college_name, division, offer_date, offer_type (scholarship, preferred walk-on)." },
      { name: "fan_votes", desc: "Athlete of the Week tallies: athlete_id, week_number, vote_count, voter_ip_hash, user_agent." }
    ];

    tables.forEach((tb, i) => {
      s.addText(`TABLE: ${tb.name}`, { x: 1.1, y: 2.1 + (i * 1.15), w: 5.0, h: 0.3, fontFace: 'Courier New', fontSize: 11, bold: true, color: COLORS.CYAN });
      s.addText(tb.desc, { x: 1.1, y: 2.4 + (i * 1.15), w: 5.0, h: 0.75, fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT });
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.4, w: 5.7, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("DATA SECURITY & COMPLIANCE", { x: 7.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.EMERALD });

    const sec = [
      { title: "Row-Level Security (RLS) Active", desc: "Public anonymous users can only SELECT verified and published athlete fields. Sensitive claim contacts and parental phone numbers are protected." },
      { title: "Automated Backup & Disaster Recovery", desc: "Point-in-time PostgreSQL WAL archiving on Supabase ensures zero data loss." },
      { title: "Edge Caching & 50ms Response", desc: "Directory queries are cached across Cloudflare edge nodes, keeping database read IOPS minimal even under viral poll traffic spikes." },
      { title: "Dual Environment Parity", desc: "Seamless fallback between local client mock seed data and production Supabase cloud database." }
    ];

    sec.forEach((sc, idx) => {
      s.addText(`🔒  ${sc.title}`, { x: 7.1, y: 2.15 + (idx * 1.1), w: 5.1, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(sc.desc, { x: 7.4, y: 2.45 + (idx * 1.1), w: 4.8, h: 0.7, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });
  }

  // SLIDE 13: GitHub Workflows
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Automated Pipeline", "GitHub Actions & Automated Sports Ingestion Workflow");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 6.0, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("WORKFLOW: .github/workflows/weekly_sync.yml", { x: 1.1, y: 1.6, w: 5.4, h: 0.35, fontFace: 'Courier New', fontSize: 11, bold: true, color: COLORS.GOLD_ACCENT });

    const ymlSnippet = [
      { text: "name: Weekly Louisiana Sports Sync\n", options: { color: COLORS.AMBER_LIGHT } },
      { text: "on:\n  schedule:\n    - cron: '0 12 * * 2' ", options: { color: COLORS.WHITE } },
      { text: "# Every Tuesday 6:00 AM CST\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "  workflow_dispatch:    ", options: { color: COLORS.WHITE } },
      { text: "# Manual Run Button\n\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "jobs:\n  scrape-and-sync:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n      - run: node scripts/ingest_sports.js\n        env:\n          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}\n          SUPABASE_SERVICE_ROLE_KEY: ...\n", options: { color: COLORS.WHITE } }
    ];
    s.addText(ymlSnippet, { x: 1.1, y: 2.05, w: 5.4, h: 4.4, fontFace: 'Courier New', fontSize: 9.5, lineSpacing: 16 });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.2, y: 1.4, w: 5.3, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("PIPELINE ADVANTAGES", { x: 7.5, y: 1.6, w: 4.7, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.CYAN });

    const pipePoints = [
      { title: "Automated Weekly Schedule", desc: "Scrapes newly reported weekend game box scores and newspaper stats every Tuesday at 6 AM CST." },
      { title: "Zero Hardcoded Credentials", desc: "Fully isolated security using GitHub Action encrypted secrets (SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY)." },
      { title: "Manual One-Click Sync", desc: "Allows instant ad-hoc updates by clicking 'Run workflow' from the GitHub Actions dashboard." },
      { title: "Data Normalization", desc: "Cleans raw athletic statistics, parses player mentions, and updates NIL valuations in Supabase automatically." }
    ];

    pipePoints.forEach((pp, i) => {
      s.addText(`✔  ${pp.title}`, { x: 7.5, y: 2.15 + (i * 1.1), w: 4.7, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(pp.desc, { x: 7.8, y: 2.45 + (i * 1.1), w: 4.4, h: 0.7, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });
  }

  // SLIDE 14: Deployment Guide
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Deployment Guide", "$0-Budget Production Deployment & Domain Connection");

    const deploySteps = [
      {
        num: "STEP 1",
        title: "Supabase Free Database",
        desc: "1. Create account on supabase.com.\n2. Open SQL Editor.\n3. Paste supabase/schema.sql and run.\n4. Database is instantly initialized with seed data & RLS."
      },
      {
        num: "STEP 2",
        title: "Cloudflare Pages CI/CD",
        desc: "1. Go to pages.cloudflare.com.\n2. Connect GitHub repo: lanil-sports.\n3. Framework: Static HTML (None).\n4. Click Deploy. Live instantly on a free .pages.dev URL."
      },
      {
        num: "STEP 3",
        title: "Domain Setup (lanilsports.com)",
        desc: "1. In Pages, click 'Custom Domains'.\n2. Enter lanilsports.com and www.\n3. Cloudflare automatically issues free SSL/HTTPS certificate."
      }
    ];

    deploySteps.forEach((ds, i) => {
      const x = 0.8 + (i * 4.0);
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: x, y: 1.4, w: 3.7, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
      s.addShape(pptx.shapes.RECTANGLE, { x: x + 0.3, y: 1.7, w: 1.2, h: 0.35, fill: { color: COLORS.GOLD_ACCENT } });
      s.addText(ds.num, { x: x + 0.3, y: 1.7, w: 1.2, h: 0.35, fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY_DARK, align: 'center', valign: 'middle' });
      s.addText(ds.title, { x: x + 0.3, y: 2.2, w: 3.2, h: 0.6, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE });
      s.addText(ds.desc, { x: x + 0.3, y: 2.9, w: 3.2, h: 3.5, fontFace: 'Arial', fontSize: 10.5, color: COLORS.SLATE_TEXT, lineSpacing: 20 });
    });
  }

  // SLIDE 15: Louisiana Act 810 Compliance
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Legal Standards", "Louisiana NIL Act 810 (La. R.S. 17:3705) Compliance Standards");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 11.7, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: COLORS.GOLD_ACCENT, width: 1.5 } });
    s.addText("LEGAL DIRECTIVES FOR HIGH SCHOOL NIL IN LOUISIANA", { x: 1.1, y: 1.6, w: 11.0, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT });

    const legalRules = [
      {
        title: "1. Mandatory Minor Parental / Guardian Consent",
        desc: "Under Louisiana law, all student-athletes under 18 years of age must have explicit written authorization from a parent or legal guardian prior to entering into any commercial NIL sponsorship or endorsement."
      },
      {
        title: "2. School Intellectual Property & Trademark Protection",
        desc: "Student-athletes cannot wear official school uniforms, display official school crests, or use LHSAA logos in commercial promotions without explicit written consent from the school principal or athletic director."
      },
      {
        title: "3. Prohibited Endorsement Industries",
        desc: "Strictly forbids high school student endorsements in categories including: alcohol, tobacco/vaping, cannabis, sports betting/gambling, adult entertainment, and firearms/weapons."
      },
      {
        title: "4. Independent Directory & Media Safe Harbor",
        desc: "LANILSPORTS.COM operates strictly as an informational news directory, scouting yearbook, and media archive — not as an athlete sports agency or contract broker."
      }
    ];

    legalRules.forEach((lr, idx) => {
      s.addText(lr.title, { x: 1.1, y: 2.1 + (idx * 1.15), w: 11.0, h: 0.35, fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.WHITE });
      s.addText(lr.desc, { x: 1.4, y: 2.45 + (idx * 1.15), w: 10.7, h: 0.65, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT, lineSpacing: 16 });
    });
  }

  // SLIDE 16: Roadmap & Conclusion
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Growth & Strategy", "Execution Roadmap: Scaling LANIL Sports Statewide");

    const phases = [
      {
        phase: "PHASE 1 (ACTIVE)",
        title: "Digital Yearbook Foundation",
        bullets: [
          "Directory with Classes 2027-2030 live",
          "Free 9:16 digital cards & signature pad",
          "Weekly Athlete of the Week fan voting",
          "Supabase cloud database connected",
          "GitHub CI/CD weekly data sync live"
        ]
      },
      {
        phase: "PHASE 2 (MONTHS 1-3)",
        title: "Merchandise & School Stores",
        bullets: [
          "Fulfillment partner API integration",
          "Collector cards with magnetic cases",
          "Custom peel-and-stick vinyl wall decals",
          "3D custom athlete bobbleheads live",
          "Stripe checkout connected on domain"
        ]
      },
      {
        phase: "PHASE 3 (MONTHS 4-12)",
        title: "Hyperlocal Monopolization",
        bullets: [
          "64-Parish local business sponsorships",
          "Varsity Athletic Director team portals",
          "Statewide Athlete of the Year Awards",
          "Recruiter Pro SaaS subscriptions",
          "Expansion to neighboring Gulf South states"
        ]
      }
    ];

    phases.forEach((p, idx) => {
      const x = 0.8 + (idx * 4.0);
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x, y: 1.4, w: 3.7, h: 5.3, r: 0.15,
        fill: { color: COLORS.SLATE_CARD }, line: { color: idx === 0 ? COLORS.EMERALD : '334155', width: 1.5 }
      });
      s.addText(p.phase, {
        x: x + 0.3, y: 1.7, w: 3.2, h: 0.3,
        fontFace: 'Arial', fontSize: 10, bold: true, color: idx === 0 ? COLORS.EMERALD : COLORS.GOLD_ACCENT
      });
      s.addText(p.title, {
        x: x + 0.3, y: 2.05, w: 3.2, h: 0.6,
        fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE
      });
      s.addShape(pptx.shapes.LINE, {
        x: x + 0.3, y: 2.7, w: 3.1, h: 0,
        line: { color: '334155', width: 1 }
      });
      const bList = p.bullets.map(b => ({
        text: "• " + b + "\n\n",
        options: { color: COLORS.SLATE_TEXT }
      }));
      s.addText(bList, {
        x: x + 0.3, y: 2.9, w: 3.1, h: 3.5,
        fontFace: 'Arial', fontSize: 10, lineSpacing: 16
      });
    });
  }
}

module.exports = { buildSlides4 };
