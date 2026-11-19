const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'scripts', 'pptx_slides_3.js');
let code = fs.readFileSync(filePath, 'utf8');

const oldSlide8Right = `    // 2. Right Container: Specifications & Artistry
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.9, y: 1.4, w: 6.6, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("CUSTOM ATHLETE FIGURE ARTISTRY & WORKFLOW", {
      x: 6.15, y: 1.6, w: 6.1, h: 0.35,
      fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.GOLD_ACCENT
    });

    const figurePoints = [
      { title: "Photo → 3D Polyresin Sculpt", desc: "Proprietary photogrammetry translates student-athlete headshot into custom 3D caricatured face sculpt." },
      { title: "Authentic Team Uniform & Jersey", desc: "Hand-painted varsity football uniform with accurate school colors, numbers, and cleats." },
      { title: "Sport Accessories & Blister Pack", desc: "Includes miniature varsity helmet, game football, and MVP trophy encased in a collector's clamshell blister pack." },
      { title: "Senior Night & Family Keepsake", desc: "Highest emotional gift value for Senior banquets, holiday gifts, and lifelong athletic memorabilia." }
    ];

    figurePoints.forEach((fp, i) => {
      s.addText(\`★  \${fp.title}\`, {
        x: 6.15, y: 2.05 + (i * 0.75), w: 6.1, h: 0.25,
        fontFace: 'Arial', fontSize: 10.5, bold: true, color: COLORS.WHITE
      });
      s.addText(fp.desc, {
        x: 6.4, y: 2.28 + (i * 0.75), w: 5.85, h: 0.45,
        fontFace: 'Arial', fontSize: 9.5, color: COLORS.SLATE_TEXT
      });
    });

    // 3. Editions Cards
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.15, y: 5.0, w: 2.95, h: 1.5, r: 0.1,
      fill: { color: '1E293B' }, line: { color: '334155', width: 1 }
    });`;

const newSlide8Right = `    // 2. Right Container: Specifications & Artistry
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.9, y: 1.4, w: 6.6, h: 5.3, r: 0.15,
      fill: { color: COLORS.SLATE_CARD }, line: { color: '334155', width: 1 }
    });
    s.addText("CUSTOM ATHLETE FIGURE ARTISTRY & WORKFLOW", {
      x: 6.15, y: 1.55, w: 6.1, h: 0.35,
      fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.GOLD_ACCENT
    });

    // REVENUE SHARING SPLIT HIGHLIGHT (ACT 810 COMPLIANT)
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.15, y: 1.95, w: 6.1, h: 0.95, r: 0.1,
      fill: { color: '0A231C' }, line: { color: COLORS.EMERALD, width: 1.2 }
    });
    s.addText("GUARANTEED REVENUE SHARING (LOUISIANA ACT 810 COMPLIANT):", {
      x: 6.3, y: 2.05, w: 5.8, h: 0.22,
      fontFace: 'Arial', fontSize: 9.5, bold: true, color: COLORS.EMERALD
    });
    s.addText([
      { text: "• 20% Player / Parent NIL Royalty: ", options: { bold: true, color: COLORS.WHITE } },
      { text: "Direct deposit ($10.00 - $16.00/unit) to verified account\\n", options: { color: COLORS.SLATE_TEXT } },
      { text: "• 10% High School / Booster Club: ", options: { bold: true, color: COLORS.WHITE } },
      { text: "Automatic team fundraiser donation ($5.00 - $8.00/unit)", options: { color: COLORS.SLATE_TEXT } }
    ], {
      x: 6.3, y: 2.3, w: 5.8, h: 0.55,
      fontFace: 'Arial', fontSize: 8.5, lineSpacing: 13
    });

    const figurePoints = [
      { title: "Photo → 3D Polyresin Sculpt", desc: "Photogrammetry translates headshot into custom 3D caricatured face sculpt." },
      { title: "Authentic Team Uniform & Jersey", desc: "Hand-painted varsity uniform with accurate school colors, numbers, and cleats." },
      { title: "Sport Accessories & Blister Pack", desc: "Miniature varsity helmet, Wilson football, and MVP trophy in clamshell box." }
    ];

    figurePoints.forEach((fp, i) => {
      s.addText(\`★  \${fp.title}\`, {
        x: 6.15, y: 3.05 + (i * 0.62), w: 6.1, h: 0.22,
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE
      });
      s.addText(fp.desc, {
        x: 6.4, y: 3.27 + (i * 0.62), w: 5.85, h: 0.38,
        fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE_TEXT
      });
    });

    // 3. Editions Cards
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.15, y: 5.0, w: 2.95, h: 1.5, r: 0.1,
      fill: { color: '1E293B' }, line: { color: '334155', width: 1 }
    });`;

if (code.includes(oldSlide8Right)) {
  code = code.replace(oldSlide8Right, newSlide8Right);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated Slide 8 with Revenue Sharing in pptx_slides_3.js');
} else {
  console.log('Target not found in pptx_slides_3.js');
}
