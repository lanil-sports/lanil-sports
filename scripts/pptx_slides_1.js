const { pptx, COLORS, applySlideChrome } = require('./pptx_base');

function buildSlides1() {
  // SLIDE 1: Title Slide
  {
    const s = pptx.addSlide();
    s.background = { color: COLORS.NAVY_DARK };
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: COLORS.GOLD_ACCENT } });
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0, y: 1.4, w: 3.4, h: 0.45, r: 0.2,
      fill: { color: '1E293B' }, line: { color: COLORS.GOLD_ACCENT, width: 1 }
    });
    s.addText("★ OFFICIAL PLATFORM BIBLE ★", {
      x: 1.0, y: 1.4, w: 3.4, h: 0.45,
      fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.GOLD_ACCENT, align: 'center'
    });
    s.addText("LANIL SPORTS", {
      x: 1.0, y: 2.0, w: 11.0, h: 1.2,
      fontFace: 'Arial', fontSize: 54, bold: true, color: COLORS.WHITE, charSpacing: 3
    });
    s.addText("The Master Operating Blueprint, Technical Architecture & Merchandising Bible", {
      x: 1.0, y: 3.1, w: 11.0, h: 0.6,
      fontFace: 'Arial', fontSize: 18, color: COLORS.AMBER_LIGHT
    });
    s.addText("Complete guide covering Website Architecture, GitHub CI/CD, Supabase Database, Act 810 Compliance, Viral Growth, and Zero-Inventory Merchandising (Collector Trading Cards, 3D Bobbleheads & Wall Decals).", {
      x: 1.0, y: 3.8, w: 10.5, h: 0.9,
      fontFace: 'Arial', fontSize: 13, color: COLORS.SLATE_TEXT, lineSpacing: 20
    });
    const badges = [
      { label: "RECRUITING & NIL DIRECTORY", sub: "Classes 2027-2030 (64 Parishes)" },
      { label: "ZERO-INVENTORY COMMERCE", sub: "Cards, Decals & Bobbleheads (70% Margin)" },
      { label: "100% ACT 810 COMPLIANT", sub: "La. R.S. 17:3705 Legal Framework" }
    ];
    badges.forEach((b, i) => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 1.0 + (i * 3.8), y: 5.1, w: 3.6, h: 1.3, r: 0.15,
        fill: { color: '10172A' }, line: { color: '334155', width: 1 }
      });
      s.addText(b.label, {
        x: 1.2 + (i * 3.8), y: 5.3, w: 3.2, h: 0.4,
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.GOLD_ACCENT
      });
      s.addText(b.sub, {
        x: 1.2 + (i * 3.8), y: 5.75, w: 3.2, h: 0.5,
        fontFace: 'Arial', fontSize: 10, color: COLORS.WHITE
      });
    });
  }

  // SLIDE 2: Executive Summary
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Strategic Overview", "Executive Summary: The Louisiana High School NIL Ecosystem");
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.4, w: 5.6, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("THE OPPORTUNITY", {
      x: 1.1, y: 1.6, w: 5.0, h: 0.35,
      fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT
    });
    s.addText([
      { text: "• Louisiana High School Athletics: ", options: { bold: true, color: COLORS.WHITE } },
      { text: "One of the premier sports talent pipelines in America, producing top national recruits annually across Football, Basketball, Baseball, Softball, and Track & Field.\n\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "• The Information Void: ", options: { bold: true, color: COLORS.WHITE } },
      { text: "Prior to LANILSPORTS.COM, athletes, parents, and local business sponsors lacked a unified directory tracking verified rosters, NIL valuations, and verified newspaper coverage across all 64 Louisiana parishes.\n\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "• The Solution: ", options: { bold: true, color: COLORS.WHITE } },
      { text: "An independent digital yearbook, verified recruiting intelligence platform, and high-margin branded merchandise engine built specifically for Louisiana student-athletes.", options: { color: COLORS.SLATE_TEXT } }
    ], { x: 1.1, y: 2.1, w: 5.0, h: 4.3, fontFace: 'Arial', fontSize: 11, lineSpacing: 18 });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 1.4, w: 5.7, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("CORE VALUE PROPOSITION", {
      x: 7.1, y: 1.6, w: 5.0, h: 0.35,
      fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.CYAN
    });
    const pillars = [
      { title: "Informational & Scouting Directory", desc: "Centralized yearbook tracking Class of 2027–2030 athletes with clean verified statistics, game logs, and local media mentions." },
      { title: "Direct Athlete & Parent Empowerment", desc: "Free self-claim portal allowing student-athletes and parents to claim their profiles, add verified measurables, and build an NIL brand resume." },
      { title: "Zero-Inventory Merchandising", desc: "Instant physical keepsake monetization (player trading cards, custom 3D bobblehead dolls, and peel-and-stick locker decals) generating 65%-75% margins." },
      { title: "Total Act 810 Legal Protection", desc: "Strict minor parental consent protocols and school IP protection ensuring 100% compliance with Louisiana Revised Statute 17:3705." }
    ];
    pillars.forEach((p, idx) => {
      s.addText(`${idx + 1}. ${p.title}`, { x: 7.1, y: 2.1 + (idx * 1.1), w: 5.1, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(p.desc, { x: 7.1, y: 2.4 + (idx * 1.1), w: 5.1, h: 0.7, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });
  }

  // SLIDE 3: Architecture & File Structure
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Codebase & Structure", "Repository Architecture & Production File Layout");
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 5.6, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("REPOSITORY TREE (lanil-sports/)", { x: 1.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Courier New', fontSize: 12, bold: true, color: COLORS.GOLD_ACCENT });
    const treeText = [
      { text: "lanil-sports/\n", options: { bold: true, color: COLORS.WHITE } },
      { text: "├── index.html          ", options: { color: COLORS.AMBER_LIGHT } },
      { text: "# Production SPA (Tailwind + Teko font)\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── app.js              ", options: { color: COLORS.AMBER_LIGHT } },
      { text: "# Client logic, modal handlers & filters\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── data.js             ", options: { color: COLORS.AMBER_LIGHT } },
      { text: "# Offline seed database (Classes 27-30)\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── server.js           ", options: { color: COLORS.AMBER_LIGHT } },
      { text: "# Production Node.js HTTP server\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── package.json        ", options: { color: COLORS.AMBER_LIGHT } },
      { text: "# Dependencies & scripts\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── school_logos.json   ", options: { color: COLORS.AMBER_LIGHT } },
      { text: "# 393 verified LHSAA school mascots\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── supabase/\n", options: { color: COLORS.WHITE } },
      { text: "│   └── schema.sql      ", options: { color: COLORS.CYAN } },
      { text: "# PostgreSQL DDL, RLS & seed tables\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "├── .github/workflows/\n", options: { color: COLORS.WHITE } },
      { text: "│   └── weekly_sync.yml ", options: { color: COLORS.EMERALD } },
      { text: "# Automated Tuesday ingestion CI/CD\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "└── scripts/            ", options: { color: COLORS.WHITE } },
      { text: "# Data scraping & ingestion pipeline", options: { color: COLORS.SLATE_TEXT } }
    ];
    s.addText(treeText, { x: 1.1, y: 2.05, w: 5.0, h: 4.4, fontFace: 'Courier New', fontSize: 10, lineSpacing: 17 });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.4, w: 5.7, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("CORE STACK & DESIGN HIGHLIGHTS", { x: 7.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT });
    const stackItems = [
      { title: "Zero Build Step Frontend", desc: "Native HTML5, Tailwind CSS via CDN, and vanilla ES6+. Loads in under 400ms on mobile devices without complex bundling." },
      { title: "Teko Athletic Font & High-Gloss UI", desc: "Engineered specifically to evoke the aesthetic of authenticated physical sports cards and varsity athletic media." },
      { title: "Dual Storage Architecture", desc: "Functions 100% offline using window.INITIAL_ATHLETES fallback, automatically connecting to live Supabase PostgreSQL when credentials exist." },
      { title: "Client-Side High-Res Rendering", desc: "Powered by html2canvas for instant 9:16 story-size graphics rendering directly on the user's mobile or desktop browser." }
    ];
    stackItems.forEach((item, idx) => {
      s.addText(`◆  ${item.title}`, { x: 7.1, y: 2.15 + (idx * 1.1), w: 5.1, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(item.desc, { x: 7.4, y: 2.45 + (idx * 1.1), w: 4.8, h: 0.7, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });
  }
}

module.exports = { buildSlides1 };
