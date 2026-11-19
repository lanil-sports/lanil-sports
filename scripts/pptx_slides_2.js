const { pptx, COLORS, applySlideChrome } = require('./pptx_base');

function buildSlides2() {
  // SLIDE 4: Core Website Features
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Feature Breakdown", "Searchable Athlete Directory & Verified Recruiting Intelligence");

    const cards = [
      {
        title: "Multi-Faceted Filter Matrix",
        points: [
          "Class Year: 2027 Seniors, 2028 Juniors, 2029 Sophomores, 2030 Freshmen.",
          "Sport Selector: Football, Basketball, Baseball, Softball, Track & Field.",
          "Parish Coverage: Orleans, Jefferson, East Baton Rouge, Ouachita, Caddo, and all 64 parishes.",
          "Instant Search: Real-time keyword filter across athlete names, schools, and positions."
        ]
      },
      {
        title: "Athlete Dossier & Paywall Teaser",
        points: [
          "Public View: Verified school, graduation year, position, clean season statistics snapshot, and newspaper mentions.",
          "Paywalled Intelligence: Projected annual NIL market valuation, verified D-I scholarship offers, target colleges.",
          "Interactive Preview: Interactive switch allows scouts to test premium unlocked state."
        ]
      },
      {
        title: "Interactive Game-by-Game Logs",
        points: [
          "Complete 10-game varsity schedule box scores dynamically generated per sport.",
          "Quarterbacks: Cmp/Att, Pass Yds, Completion %, Touchdowns, Interceptions, QBR.",
          "Running Backs: Carries, Rushing Yards, Yards Per Carry, Touchdowns, Longest Run.",
          "Basketball / Baseball / Softball: Sport-specific columns (PPG, APG, Batting AVG, HR)."
        ]
      },
      {
        title: "Athlete & Parent Self-Claim Portal",
        points: [
          "Self-Service Onboarding: Student-athletes and parents claim profiles in 60 seconds.",
          "Preload integration: Clicking 'Claim Profile' automatically prefills the student's name, school, and class year.",
          "Parental Consent Gate: Built-in minor consent verification complying with Louisiana Act 810."
        ]
      }
    ];

    cards.forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + (col * 5.9);
      const y = 1.4 + (row * 2.75);

      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x, y: y, w: 5.7, h: 2.55, r: 0.12,
        fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
      });
      s.addText(c.title, {
        x: x + 0.3, y: y + 0.2, w: 5.1, h: 0.35,
        fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.GOLD_ACCENT
      });
      const bulletList = c.points.map(pt => ({
        text: pt + "\n",
        options: { color: COLORS.SLATE_TEXT, bullet: true }
      }));
      s.addText(bulletList, {
        x: x + 0.3, y: y + 0.6, w: 5.1, h: 1.8,
        fontFace: 'Arial', fontSize: 10, lineSpacing: 16
      });
    });
  }

  // SLIDE 5: Viral Growth Engine: Athlete of the Week Fan Poll
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Viral Acquisition Engine", "Athlete of the Week Fan Voting & High School Social Flywheel");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.4, w: 6.8, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("HOW THE FAN VOTING FLYWHEEL WORKS", {
      x: 1.1, y: 1.6, w: 6.2, h: 0.35,
      fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT
    });

    const steps = [
      { title: "Weekly Nomination of 4 Louisiana Standouts", desc: "Every Sunday, LANIL sports nominates 4 top-performing high school athletes across North, Central, and South Louisiana." },
      { title: "Booster Club & High School Community Mobilization", desc: "Parents, teammates, school bands, and booster clubs compete fiercely to push their player into 1st place before Friday voting closes." },
      { title: "Live Real-Time Percentage Bars & Micro-Counters", desc: "Interactive animated voting bars show instant vote percentages, driving high emotional urgency and return visits." },
      { title: "Viral Social Referrals & Zero-CAC Traffic", desc: "Every voter is prompted to share to Instagram Stories, GroupMe, and X (#LOUISIANABUILT), injecting thousands of organic users into the platform weekly." }
    ];

    steps.forEach((st, i) => {
      s.addShape(pptx.shapes.OVAL, {
        x: 1.1, y: 2.15 + (i * 1.15), w: 0.45, h: 0.45,
        fill: { color: COLORS.GOLD_ACCENT }
      });
      s.addText((i + 1).toString(), {
        x: 1.1, y: 2.15 + (i * 1.15), w: 0.45, h: 0.45,
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY_DARK, align: 'center', valign: 'middle'
      });
      s.addText(st.title, {
        x: 1.7, y: 2.15 + (i * 1.15), w: 5.6, h: 0.3,
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE
      });
      s.addText(st.desc, {
        x: 1.7, y: 2.45 + (i * 1.15), w: 5.6, h: 0.65,
        fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT
      });
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.0, y: 1.4, w: 4.5, h: 5.3, r: 0.15,
      fill: { color: '1E293B' }, line: { color: COLORS.GOLD_ACCENT, width: 1.5 }
    });
    s.addText("VIRAL PERFORMANCE IMPACT", {
      x: 8.3, y: 1.7, w: 3.9, h: 0.35,
      fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.GOLD_ACCENT, align: 'center'
    });

    const metrics = [
      { num: "4,200+", label: "Average Votes Per Weekly Contest" },
      { num: "68%", label: "Mobile Traffic Ratio (Instagram/X)" },
      { num: "$0.00", label: "Paid Customer Acquisition Cost (CAC)" },
      { num: "32%", label: "Visitors Who Explore Directory Profiles" }
    ];

    metrics.forEach((m, idx) => {
      s.addText(m.num, {
        x: 8.3, y: 2.3 + (idx * 1.05), w: 3.9, h: 0.5,
        fontFace: 'Arial', fontSize: 26, bold: true, color: COLORS.WHITE, align: 'center'
      });
      s.addText(m.label, {
        x: 8.3, y: 2.8 + (idx * 1.05), w: 3.9, h: 0.35,
        fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.AMBER_LIGHT, align: 'center'
      });
    });
  }

  // SLIDE 6: Digital Player Card Generator
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Product Showcase", "Official 9:16 Authentic Playing Card: Digital & Pro Exports");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 1.4, w: 6.8, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("AUTHENTIC PHYSICAL-CARD DIGITAL TWIN", {
      x: 1.1, y: 1.6, w: 6.2, h: 0.35,
      fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT
    });

    const cardFeatures = [
      { title: "Metallic Refractor Sheen Overlay", desc: "Dual diagonal linear gradient mimicking a 90s Topps/Bowman chrome finish." },
      { title: "Official High School & Mascot Banner", desc: "Displays full school name (e.g., JOHN CURTIS CHRISTIAN SCHOOL) + mascot medallion (★ PATRIOTS ★) without text truncation." },
      { title: "Sport Icon & Verified Serial Number", desc: "Dynamic sport badge (football, basketball, baseball) + unique serial: CARD #LA-2701 derived from player name hash." },
      { title: "Interactive Signature Canvas", desc: "Touch/mouse signature drawing pad allowing athletes to digitally autograph their own card in custom gold foil ink." },
      { title: "Centered Authenticity Hologram Footer", desc: "Features LANIL AUTHENTICATED • #LOUISIANABUILT centered at the foot of the card frame." }
    ];

    cardFeatures.forEach((cf, idx) => {
      s.addText(`✔  ${cf.title}`, {
        x: 1.1, y: 2.1 + (idx * 0.95), w: 6.2, h: 0.3,
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE
      });
      s.addText(cf.desc, {
        x: 1.4, y: 2.4 + (idx * 0.95), w: 5.9, h: 0.55,
        fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT
      });
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.0, y: 1.4, w: 4.5, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("DIGITAL CARD TIERS", {
      x: 8.3, y: 1.6, w: 3.9, h: 0.35,
      fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.CYAN, align: 'center'
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 2.1, w: 3.9, h: 2.0, r: 0.1,
      fill: { color: '1E293B' }
    });
    s.addText("FREE SOCIAL CARD", {
      x: 8.5, y: 2.25, w: 3.5, h: 0.3,
      fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.WHITE
    });
    s.addText("Format: 9:16 Instagram Story & X\nResolution: Standard Web 2X\nWatermark: #LOUISIANABUILT watermark\nRights: Free personal social sharing", {
      x: 8.5, y: 2.6, w: 3.5, h: 1.3,
      fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT, lineSpacing: 15
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 4.4, w: 3.9, h: 2.0, r: 0.1,
      fill: { color: '1E293B' }, line: { color: COLORS.GOLD_ACCENT, width: 1 }
    });
    s.addText("ULTRA-HD PRO CARD ($1.00)", {
      x: 8.5, y: 4.55, w: 3.5, h: 0.3,
      fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.GOLD_ACCENT
    });
    s.addText("Format: Ultra-HD 4K Export (300 DPI)\nBadge: PRO 4K Crown Badge\nWatermark: 100% Unwatermarked\nRights: Commercial & Personal Print Rights", {
      x: 8.5, y: 4.9, w: 3.5, h: 1.3,
      fontFace: 'Arial', fontSize: 9.5, color: COLORS.WHITE, lineSpacing: 15
    });
  }
}

module.exports = { buildSlides2 };
