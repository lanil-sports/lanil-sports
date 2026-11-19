const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

const COLORS = {
  NAVY_DARK: '090D16',
  SLATE_CARD: '10172A',
  SLATE_LIGHT: '1E293B',
  GOLD_ACCENT: 'F5B700',
  AMBER_LIGHT: 'FBBF24',
  WHITE: 'FFFFFF',
  SLATE_TEXT: '94A3B8',
  EMERALD: '10B981',
  CYAN: '06B6D4'
};

function applySlideChrome(slide, category, title) {
  slide.background = { color: COLORS.NAVY_DARK };
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: '100%', h: 0.08,
    fill: { color: COLORS.GOLD_ACCENT }
  });
  slide.addText(category.toUpperCase(), {
    x: 0.8, y: 0.35, w: 6.0, h: 0.25,
    fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.GOLD_ACCENT,
    charSpacing: 2
  });
  slide.addText(title, {
    x: 0.8, y: 0.6, w: 11.5, h: 0.6,
    fontFace: 'Arial', fontSize: 22, bold: true, color: COLORS.WHITE
  });
  slide.addShape(pptx.shapes.LINE, {
    x: 0.8, y: 7.0, w: 11.7, h: 0,
    line: { color: '334155', width: 1 }
  });
  slide.addText("LANILSPORTS.COM  •  LOUISIANA HIGH SCHOOL ATHLETE DIRECTORY & NIL PLATFORM", {
    x: 0.8, y: 7.05, w: 9.0, h: 0.3,
    fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE_TEXT, bold: true
  });
  slide.addText("CONFIDENTIAL & PROPRIETARY", {
    x: 9.8, y: 7.05, w: 2.7, h: 0.3,
    fontFace: 'Arial', fontSize: 8, color: COLORS.GOLD_ACCENT, bold: true, align: 'right'
  });
}

module.exports = { pptx, COLORS, applySlideChrome };
