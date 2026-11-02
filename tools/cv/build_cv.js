// Genera las 4 versiones del CV en DOCX (Carta, una columna, compatible con ATS).
// Uso: node build_cv.js <carpeta_salida>
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType,
  TabStopType, BorderStyle, LevelFormat,
} = require('docx');

const OUT = process.argv[2] || 'out';
fs.mkdirSync(OUT, { recursive: true });

const FONT = 'Calibri';
const ACCENT = '0B6E4F';   // verde esmeralda oscuro (misma identidad que el portafolio)
const INK = '1A1A1A';
const MUTED = '555555';
const PAGE_W = 12240, MARGIN_X = 900, MARGIN_Y = 640;
const RIGHT_TAB = PAGE_W - 2 * MARGIN_X;

const C = require('./cv_content.js');

// ---------- helpers ----------
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 20, bold: o.bold, italics: o.italics, color: o.color || INK });
const link = (text, url, o = {}) => new ExternalHyperlink({ link: url, children: [run(text, { color: o.color || INK, size: o.size || 19 })] });

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 150, after: 50 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
    children: [run(text.toUpperCase(), { bold: true, size: 21, color: ACCENT })],
  });
}

function bullet(text) {
  // Permite **negritas** simples dentro del texto
  const parts = text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(p =>
    p.startsWith('**') ? run(p.slice(2, -2), { bold: true }) : run(p));
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 20, line: 250 },
    children: parts,
  });
}

function entryHeader(left, right, sub) {
  const out = [new Paragraph({
    spacing: { before: 80, after: 0 },
    keepNext: true,
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    children: [
      ...left.map((t, i) => run(t, i === 0 ? { bold: true, size: 21 } : { size: 20, color: MUTED })),
      run('\t' + right, { size: 19, color: MUTED }),
    ],
  })];
  if (sub) out.push(new Paragraph({
    spacing: { after: 30 }, keepNext: true,
    children: [run(sub, { italics: true, size: 19, color: MUTED })],
  }));
  return out;
}

function skillLine(label, value) {
  return new Paragraph({
    spacing: { after: 25, line: 250 },
    children: [run(label + ': ', { bold: true }), run(value)],
  });
}

function build(v) {
  const L = C.labels[v.lang];
  const children = [];

  // Encabezado
  children.push(new Paragraph({
    alignment: AlignmentType.LEFT, spacing: { after: 0 },
    children: [run(C.name.toUpperCase(), { bold: true, size: 34, color: INK })],
  }));
  children.push(new Paragraph({
    spacing: { after: 50 },
    children: [run(v.headline, { bold: true, size: 22, color: ACCENT })],
  }));
  const sep = () => run('  ·  ', { color: MUTED, size: 19 });
  children.push(new Paragraph({
    spacing: { after: 0 },
    children: [
      run(L.location, { size: 19 }), sep(),
      // NO_PHONE=1 genera la versión para publicar en la web, sin teléfono
      ...(process.env.NO_PHONE || !C.phone ? [] : [run(C.phone, { size: 19 }), sep()]),
      link(C.email, 'mailto:' + C.email),
    ],
  }));
  children.push(new Paragraph({
    spacing: { after: 60 },
    children: [
      link('linkedin.com/in/oswaldo-cobos-8a693a195', 'https://linkedin.com/in/oswaldo-cobos-8a693a195'), sep(),
      link('github.com/owsy12', 'https://github.com/owsy12'),
      ...(C.portfolio ? [sep(), link(C.portfolio.replace('https://', ''), C.portfolio)] : []),
    ],
  }));

  // Perfil
  children.push(sectionTitle(L.profile));
  children.push(new Paragraph({ spacing: { after: 20, line: 255 }, children: [run(v.summary)] }));

  // Bloques de experiencia/proyectos en el orden de la versión
  for (const block of v.blocks) {
    children.push(sectionTitle(block.title));
    for (const e of block.entries) {
      children.push(...entryHeader(e.left, e.right, e.sub));
      e.bullets.forEach(b => children.push(bullet(b)));
    }
  }

  // Habilidades
  children.push(sectionTitle(L.skills));
  v.skills.forEach(([k, val]) => children.push(skillLine(k, val)));

  // Educación, idiomas y disponibilidad (bloque compacto)
  children.push(sectionTitle(L.education));
  children.push(new Paragraph({
    spacing: { before: 40, after: 25 },
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    children: [run(L.degree, { bold: true }), run(' — ' + L.school, { color: MUTED }), run('\t' + L.grad, { size: 19, color: MUTED })],
  }));
  children.push(skillLine(L.languagesLabel, L.languages));
  children.push(skillLine(L.availLabel, L.avail));

  return new Document({
    creator: C.name,
    title: `${C.name} — CV`,
    description: v.headline,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: { config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 300, hanging: 200 } } } }],
    }] },
    sections: [{
      properties: { page: {
        size: { width: PAGE_W, height: 15840 },
        margin: { top: MARGIN_Y, bottom: MARGIN_Y, left: MARGIN_X, right: MARGIN_X },
      } },
      children,
    }],
  });
}

(async () => {
  for (const v of C.versions) {
    const buf = await Packer.toBuffer(build(v));
    const file = path.join(OUT, v.file + '.docx');
    fs.writeFileSync(file, buf);
    console.log('ok', file);
  }
})();
