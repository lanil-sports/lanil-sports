const { pptx, COLORS, applySlideChrome } = require('./pptx_base');

function buildSlides3() {
  // SLIDE 7: Physical Collector Cards
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Physical Merchandise Engine", "Physical Keepsakes: 32pt Collector Cards & Magnetic Acrylic Cases");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 5.6, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("PHYSICAL SPECIFICATIONS", { x: 1.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT });

    const specs = [
      { title: "32pt Heavy-Gauge Cardstock", desc: "Double the thickness of standard retail baseball cards for a rigid, ultra-premium feel." },
      { title: "High-Gloss UV Mirror-Refractor Coating", desc: "Glossy protective refractor coat highlights player photos and gold foil lettering." },
      { title: "Recessed Magnetic Acrylic Case", desc: "Every card ships pre-encased in a UV-blocking 35pt diamond-corner magnetic display holder." },
      { title: "Authentic Serial & Hologram", desc: "Each print run carries an authentic Louisiana NIL verified holographic foil badge on reverse." }
    ];

    specs.forEach((sp, i) => {
      s.addText(`■  ${sp.title}`, { x: 1.1, y: 2.15 + (i * 1.1), w: 5.0, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(sp.desc, { x: 1.35, y: 2.45 + (i * 1.1), w: 4.75, h: 0.7, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.4, w: 5.7, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("PRICING & BOOSTER BUNDLES", { x: 7.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.CYAN });

    const bundles = [
      { name: "Single Player Collector's Card", price: "$9.99", desc: "1 custom card in a crystal-clear magnetic acrylic display case. Ideal for parents & student-athletes.", margin: "72% Gross Margin" },
      { name: "5-Pack Family & Booster Bundle", price: "$24.99", desc: "5 matching collector cards + 5 magnetic cases. Perfect for grandparents, family, and home display.", margin: "74% Gross Margin" },
      { name: "10-Pack Team / Sponsor Pack", price: "$44.99", desc: "10 cards + cases. Tailored for varsity teams, coaching staffs, and local business sponsors.", margin: "76% Gross Margin" }
    ];

    bundles.forEach((b, idx) => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.1, y: 2.1 + (idx * 1.55), w: 5.1, h: 1.4, r: 0.1, fill: { color: '1E293B' }, line: { color: '334155', width: 1 } });
      s.addText(b.name, { x: 7.3, y: 2.2 + (idx * 1.55), w: 3.5, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(b.price, { x: 10.8, y: 2.2 + (idx * 1.55), w: 1.2, h: 0.3, fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.GOLD_ACCENT, align: 'right' });
      s.addText(b.desc, { x: 7.3, y: 2.55 + (idx * 1.55), w: 4.7, h: 0.5, fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT });
      s.addText(b.margin, { x: 7.3, y: 3.1 + (idx * 1.55), w: 4.7, h: 0.25, fontFace: 'Arial', fontSize: 8.5, bold: true, color: COLORS.EMERALD });
    });
  }

  // SLIDE 8: Custom 3D Athlete Bobblehead Dolls
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Physical Merchandise Engine", "Custom Athlete Bobblehead Dolls: Premium 3D Keepsakes");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 6.8, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("PRODUCT SPECIFICATIONS & ARTISTRY", { x: 1.1, y: 1.6, w: 6.2, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT });

    const bobblePoints = [
      { title: "Custom 3D Head Sculpt from Player Headshot", desc: "Proprietary photogrammetry workflow translates front and profile headshots into handcrafted 3D caricatured resin portraits." },
      { title: "Hand-Painted Varsity Uniforms", desc: "Detailed uniforms matching school team colors, jersey numbers, and sport gear (helmets, bats, basketballs)." },
      { title: "Weighted Ceramic Composite Base", desc: "Includes an engraved metal nameplate: Player Name, School, Graduation Year, and verified serial number." },
      { title: "High Emotional Value & Keepsake Demand", desc: "Unrivaled gift for Senior Nights, varsity banquets, holiday gifts, and family heirloom collections." }
    ];

    bobblePoints.forEach((bp, i) => {
      s.addText(`★  ${bp.title}`, { x: 1.1, y: 2.15 + (i * 1.1), w: 6.2, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(bp.desc, { x: 1.35, y: 2.45 + (i * 1.1), w: 5.9, h: 0.65, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 8.0, y: 1.4, w: 4.5, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("COLLECTOR EDITIONS", { x: 8.3, y: 1.6, w: 3.9, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.CYAN, align: 'center' });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 8.3, y: 2.15, w: 3.9, h: 2.1, r: 0.1, fill: { color: '1E293B' }, line: { color: '334155', width: 1 } });
    s.addText("VARSITY EDITION BOBBLEHEAD", { x: 8.5, y: 2.3, w: 3.5, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
    s.addText("Price: $49.99\nHeight: 7.0 Inches\nMaterials: Polyresin & Spring Neck\nBase: Standard Engraved Acrylic\nGross Margin: 62% ($31.00 net)", {
      x: 8.5, y: 2.65, w: 3.5, h: 1.4, fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT, lineSpacing: 16
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 8.3, y: 4.45, w: 3.9, h: 2.1, r: 0.1, fill: { color: '1E293B' }, line: { color: COLORS.GOLD_ACCENT, width: 1 } });
    s.addText("LIMITED EDITION COLLECTOR DOME", { x: 8.5, y: 4.6, w: 3.5, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.GOLD_ACCENT });
    s.addText("Price: $79.99\nIncludes: Acrylic UV-resistant display dome\nDetails: Gold foil numbering (e.g. 1 of 50)\nAutograph: Signed certificate card included\nGross Margin: 68% ($54.40 net)", {
      x: 8.5, y: 4.95, w: 3.5, h: 1.4, fontFace: 'Arial', fontSize: 9.5, color: COLORS.WHITE, lineSpacing: 16
    });
  }

  // SLIDE 9: Custom Wall Decals (Fathead Style)
  {
    const s = pptx.addSlide();
    applySlideChrome(s, "Physical Merchandise Engine", "Custom Peel & Stick Vinyl Wall Decals (Fathead Style)");

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.4, w: 5.6, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("VINYL WALL DECAL TECHNOLOGY", { x: 1.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.GOLD_ACCENT });

    const decalFeatures = [
      { title: "Heavy-Duty Repositionable Vinyl", desc: "Thick 6-mil matte vinyl that peels on and off with zero drywall or locker damage." },
      { title: "Precision Silhouette Die-Cut", desc: "Automated contour cutting around athlete action silhouettes, school logos, and jersey numbers." },
      { title: "Fade-Resistant UV Inks", desc: "Vibrant high-contrast pigment inks guaranteed not to fade for 5+ years indoors." },
      { title: "Locker & Bedroom Ready", desc: "Adheres perfectly to painted drywall, concrete blocks, glass, wood, and metal lockers." }
    ];

    decalFeatures.forEach((df, i) => {
      s.addText(`◆  ${df.title}`, { x: 1.1, y: 2.15 + (i * 1.1), w: 5.0, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(df.desc, { x: 1.35, y: 2.45 + (i * 1.1), w: 4.75, h: 0.7, fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE_TEXT });
    });

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.4, w: 5.7, h: 5.3, r: 0.15, fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 } });
    s.addText("SIZES, PRICING & MARGINS", { x: 7.1, y: 1.6, w: 5.0, h: 0.35, fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.CYAN });

    const decalSizes = [
      { title: 'Locker Room Decal (18" × 24")', price: '$39.99', desc: 'Custom size designed specifically to fit on standard high school gym and athletic lockers.', margin: '71% Gross Margin' },
      { title: 'Bedroom Wall Poster Decal (24" × 36")', price: '$49.99', desc: 'Large athletic poster size. No tape, pins, or frames required. Peels off cleanly without paint peel.', margin: '74% Gross Margin' },
      { title: 'Life-Size Athletic Cutout Decal (36" × 60")', price: '$69.99', desc: 'Full 5-foot die-cut player cutout. The ultimate high school sports centerpiece for game rooms.', margin: '76% Gross Margin' }
    ];

    decalSizes.forEach((ds, idx) => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.1, y: 2.1 + (idx * 1.55), w: 5.1, h: 1.4, r: 0.1, fill: { color: '1E293B' }, line: { color: '334155', width: 1 } });
      s.addText(ds.title, { x: 7.3, y: 2.2 + (idx * 1.55), w: 3.6, h: 0.3, fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE });
      s.addText(ds.price, { x: 10.9, y: 2.2 + (idx * 1.55), w: 1.1, h: 0.3, fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.GOLD_ACCENT, align: 'right' });
      s.addText(ds.desc, { x: 7.3, y: 2.55 + (idx * 1.55), w: 4.7, h: 0.5, fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT });
      s.addText(ds.margin, { x: 7.3, y: 3.1 + (idx * 1.55), w: 4.7, h: 0.25, fontFace: 'Arial', fontSize: 8.5, bold: true, color: COLORS.EMERALD });
    });
  }
}

module.exports = { buildSlides3 };
