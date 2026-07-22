/**
 * Pure jsPDF renderer for the Technical BRD document.
 * No html2canvas / html2pdf — builds the PDF directly from structured data.
 *
 * Supports both LTR (English) and RTL (Arabic) layouts:
 *   • RTL mode loads the Amiri TrueType font so Arabic glyphs render correctly.
 *   • Every Arabic string is reshaped (letter forms joined) and visually
 *     reordered via the Unicode BiDi algorithm before being passed to jsPDF.
 *   • All X positions, bullet dots, and section bars are mirrored for RTL.
 *
 * Every value coming from the AI is passed through s() before jsPDF sees it —
 * jsPDF throws "Invalid argument" for null, undefined, objects, arrays, or any
 * non-string value.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TechnicalBRD } from './storage';
import { shapeArabic, loadAmiriFont } from './arabic-support';

// ─── Safe string coercion ────────────────────────────────────────────────────

function s(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return val.map(s).join(', ');
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (typeof obj.text    === 'string') return s(obj.text);
    if (typeof obj.content === 'string') return s(obj.content);
    if (typeof obj.value   === 'string') return s(obj.value);
    return '';
  }
  return String(val)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g,     '$1')
    .replace(/__(.+?)__/g,     '$1')
    .replace(/_(.+?)_/g,       '$1')
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/^#{1,6}\s*/gm,   '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/** Guarantee a non-empty string — returns fallback if s() yields ''. */
function sr(val: unknown, fallback: string): string {
  const v = s(val);
  return v.length > 0 ? v : fallback;
}

/** Convert any value to a string[] suitable for bullet lists / iteration. */
function toStringArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s).filter(Boolean);
  return [s(val)].filter(Boolean);
}

// ─── Palette (plain sRGB tuples — never oklab/oklch) ────────────────────────
type RGB = [number, number, number];
const C = {
  primary:  [37,  99,  235] as RGB,
  text:     [15,  23,  42]  as RGB,
  muted:    [100, 116, 139] as RGB,
  border:   [226, 232, 240] as RGB,
  bgLight:  [248, 250, 252] as RGB,
  amber:    [180, 83,  9]   as RGB,
  emerald:  [5,   150, 105] as RGB,
  white:    [255, 255, 255] as RGB,
  coverSub: [210, 224, 255] as RGB,
};

const METHOD_BADGE: Record<string, { bg: RGB; fg: RGB }> = {
  GET:    { bg: [219, 234, 254], fg: [29,  78,  216] },
  POST:   { bg: [209, 250, 229], fg: [5,   150, 105] },
  PUT:    { bg: [254, 243, 199], fg: [180, 83,  9]   },
  PATCH:  { bg: [237, 233, 254], fg: [109, 40,  217] },
  DELETE: { bg: [254, 226, 226], fg: [220, 38,  38]  },
};

// ─── Public types ────────────────────────────────────────────────────────────
export interface PdfMeta {
  projectName: string;
  authorName:  string;
  date:        string;
}

export interface PdfLabels {
  subtitle:           string;
  metaAuthor:         string;
  metaDate:           string;
  metaVersion:        string;
  metaPoweredBy:      string;
  versionLabel:       string;
  poweredByValue:     string;
  sectionGaps:        string;
  sectionRecs:        string;
  sectionOverview:    string;
  sectionFuncSpec:    string;
  sectionNonFunc:     string;
  sectionDBTables:    string;
  sectionAPIs:        string;
  sectionUserStories: string;
  sectionAcceptance:  string;
  colCategory:        string;
  colRequirement:     string;
  colMetric:          string;
  colTable:           string;
  colDescription:     string;
  colFields:          string;
  epicLabel:          string;
  docFooterNote:      string;
}

// ─── Page constants ──────────────────────────────────────────────────────────
const PW       = 210;   // page width  (mm, A4)
const PH       = 297;   // page height (mm, A4)
const ML       = 15;    // margin left/right
const CW       = PW - ML * 2;  // content width
const FOOTER_H = 12;

// ─── Builder ─────────────────────────────────────────────────────────────────
class PdfBuilder {
  doc:  jsPDF;
  y    = ML;
  page = 1;
  readonly isRTL: boolean;

  constructor(
    readonly meta:   PdfMeta,
    readonly labels: PdfLabels,
    isRTL: boolean,
  ) {
    this.isRTL = isRTL;
    this.doc   = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  }

  // ── font helpers ─────────────────────────────────────────────────────────

  /** Set the document font, respecting RTL (Amiri has no bold variant). */
  private setDocFont(bold = false) {
    if (this.isRTL) {
      this.doc.setFont('Amiri', 'normal');
    } else {
      this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    }
  }

  /**
   * Sanitise a value with s(), then reshape it if RTL.
   * Always use this instead of calling s() directly on text that will be
   * rendered inside the PDF.
   */
  txt(raw: unknown): string {
    const clean = s(raw);
    return this.isRTL ? shapeArabic(clean) : clean;
  }

  /** X coordinate for text start (left margin LTR, right margin RTL). */
  private get x0(): number { return this.isRTL ? PW - ML : ML; }

  /** jsPDF text alignment matching the document direction. */
  private get align(): 'left' | 'right' { return this.isRTL ? 'right' : 'left'; }

  // ── pagination ──────────────────────────────────────────────────────────────

  need(mm: number) {
    if (this.y + mm > PH - FOOTER_H - 4) this.newPage();
  }

  newPage() {
    this.drawFooter();
    this.doc.addPage();
    this.page++;
    this.y = ML + 5;
    this.drawRunningHead();
  }

  // ── repeated chrome ─────────────────────────────────────────────────────────

  drawRunningHead() {
    const d = this.doc;
    d.setFillColor(...C.primary);
    d.rect(0, 0, PW, 5, 'F');
    this.setDocFont(false);
    d.setFontSize(7.5);
    d.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    const projectTxt = this.txt(this.meta.projectName) || (this.isRTL ? 'المتطلبات التقنية' : 'Technical BRD');
    if (this.isRTL) {
      // RTL: project name right-aligned, page number left-aligned
      d.text(projectTxt, PW - ML, 11, { align: 'right' });
      d.text(String(this.page), ML, 11);
    } else {
      d.text(projectTxt, ML, 11);
      d.text(String(this.page), PW - ML, 11, { align: 'right' });
    }
    this.y = 16;
  }

  drawFooter() {
    const d  = this.doc;
    const fy = PH - FOOTER_H;
    d.setDrawColor(...C.border);
    d.setLineWidth(0.25);
    d.line(ML, fy, PW - ML, fy);
    this.setDocFont(false);
    d.setFontSize(7);
    d.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    const noteTxt = this.txt(this.labels.docFooterNote) || (this.isRTL ? 'تم الإنشاء بواسطة BA Bridge' : 'Generated by BA Bridge');
    if (this.isRTL) {
      d.text(noteTxt, PW - ML, fy + 5, { align: 'right' });
      d.text(String(this.page), ML, fy + 5);
    } else {
      d.text(noteTxt, ML, fy + 5);
      d.text(String(this.page), PW - ML, fy + 5, { align: 'right' });
    }
  }

  // ── text primitives ─────────────────────────────────────────────────────────

  /** Render sanitised, wrapped text — handles page breaks per line. */
  write(raw: unknown, size: number, color: RGB, bold = false, indent = 0, leading = 5) {
    const text = this.txt(raw);
    if (!text) return;
    const d = this.doc;
    this.setDocFont(bold);
    d.setFontSize(size);
    d.setTextColor(color[0], color[1], color[2]);
    const lines = d.splitTextToSize(text, CW - indent) as string[];
    for (const ln of lines) {
      this.need(leading + 1);
      if (this.isRTL) {
        d.text(ln, PW - ML - indent, this.y, { align: 'right' });
      } else {
        d.text(ln, ML + indent, this.y);
      }
      this.y += leading;
    }
  }

  sectionHeader(raw: unknown) {
    const title = this.txt(raw);
    if (!title) return;
    this.need(16);
    this.y += 5;
    const d = this.doc;
    d.setFillColor(...C.primary);
    if (this.isRTL) {
      d.rect(PW - ML - 3, this.y - 5, 3, 8, 'F');       // bar on right
    } else {
      d.rect(ML, this.y - 5, 3, 8, 'F');                 // bar on left
    }
    this.setDocFont(true);
    d.setFontSize(13);
    d.setTextColor(C.text[0], C.text[1], C.text[2]);
    if (this.isRTL) {
      d.text(title, PW - ML - 6, this.y, { align: 'right' });
    } else {
      d.text(title, ML + 6, this.y);
    }
    this.y += 3;
    d.setDrawColor(...C.border);
    d.setLineWidth(0.25);
    d.line(ML, this.y, PW - ML, this.y);
    this.y += 6;
  }

  bulletList(rawItems: unknown, dotColor: RGB = C.primary) {
    const items = toStringArray(rawItems);
    const d = this.doc;
    for (const item of items) {
      const clean = this.txt(item);
      if (!clean) continue;
      const lines = d.splitTextToSize(clean, CW - 10) as string[];
      this.need(lines.length * 5 + 2);
      d.setFillColor(...dotColor);
      if (this.isRTL) {
        d.circle(PW - ML - 4, this.y - 1.5, 1, 'F');    // dot on right
      } else {
        d.circle(ML + 4, this.y - 1.5, 1, 'F');          // dot on left
      }
      this.setDocFont(false);
      d.setFontSize(9.5);
      d.setTextColor(C.text[0], C.text[1], C.text[2]);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) this.need(5);
        if (this.isRTL) {
          d.text(lines[i], PW - ML - 8, this.y, { align: 'right' });
        } else {
          d.text(lines[i], ML + 8, this.y);
        }
        this.y += 5;
      }
    }
    this.y += 1;
  }

  table(head: string[][], body: string[][], colW?: Record<number, number>) {
    // Reshape each cell for RTL
    const processRow = (row: string[]) =>
      this.isRTL ? row.map(cell => shapeArabic(cell)) : row;
    const pHead = head.map(row => processRow(row));
    const pBody = body.map(row => processRow(row));

    const halign = this.isRTL ? ('right' as const) : ('left' as const);
    const font   = this.isRTL ? 'Amiri' : 'helvetica';

    const colStyles: Record<number, { cellWidth: number }> = {};
    if (colW) {
      for (const [k, v] of Object.entries(colW)) {
        colStyles[Number(k)] = { cellWidth: v };
      }
    }

    autoTable(this.doc, {
      startY:  this.y,
      head:    pHead,
      body:    pBody,
      margin:  { left: ML, right: ML },
      styles: {
        fontSize: 9, cellPadding: 3, lineColor: C.border, lineWidth: 0.2,
        textColor: C.text, overflow: 'linebreak', halign, font,
      },
      headStyles: {
        fillColor: C.primary, textColor: C.white, fontStyle: 'bold',
        fontSize: 9, halign, font,
      },
      alternateRowStyles: { fillColor: C.bgLight },
      columnStyles:       colStyles,
      didDrawPage: () => { this.page++; this.drawRunningHead(); },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.y = (this.doc as any).lastAutoTable.finalY + 6;
  }

  badge(raw: unknown, bg: RGB, fg: RGB, x: number, y: number): number {
    const text = s(raw);    // badges (HTTP methods) are always ASCII — no reshaping
    if (!text) return 0;
    const d = this.doc;
    d.setFont('helvetica', 'bold');
    d.setFontSize(8);
    const w = d.getTextWidth(text) + 5;
    d.setFillColor(...bg);
    d.roundedRect(x, y - 4, w, 5.5, 1, 1, 'F');
    d.setTextColor(fg[0], fg[1], fg[2]);
    d.text(text, x + 2.5, y);
    return w;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function buildTBRDPdf(
  meta:   PdfMeta,
  labels: PdfLabels,
  tbrd:   TechnicalBRD,
  lang    = 'en',
): Promise<Blob> {
  const isRTL = lang === 'ar';
  const b = new PdfBuilder(meta, labels, isRTL);
  const d = b.doc;

  // Load Arabic font before any text is rendered
  if (isRTL) await loadAmiriFont(d);

  // Convenience: shape a raw value for direct d.text() calls on the cover page
  const shape = (raw: unknown) => {
    const clean = s(raw);
    return isRTL ? shapeArabic(clean) : clean;
  };

  // Text anchor and alignment for the cover page (outside PdfBuilder methods)
  const tx   = isRTL ? PW - ML : ML;
  const talign = isRTL ? ('right' as const) : ('left' as const);

  // ════════════════════════════════════════════════════════════════════════════
  //  COVER PAGE
  // ════════════════════════════════════════════════════════════════════════════
  d.setFillColor(...C.primary);
  d.rect(0, 0, PW, 52, 'F');

  // Project name
  if (isRTL) {
    d.setFont('Amiri', 'normal');
  } else {
    d.setFont('helvetica', 'bold');
  }
  d.setFontSize(22);
  d.setTextColor(C.white[0], C.white[1], C.white[2]);
  const projectName = shape(meta.projectName) || (isRTL ? 'وثيقة المتطلبات التقنية' : 'Technical BRD');
  const nameLines   = d.splitTextToSize(projectName, CW) as string[];
  let ty = 22;
  for (const ln of nameLines) {
    d.text(ln, tx, ty, { align: talign });
    ty += 10;
  }

  // Subtitle
  if (isRTL) {
    d.setFont('Amiri', 'normal');
  } else {
    d.setFont('helvetica', 'normal');
  }
  d.setFontSize(11);
  d.setTextColor(C.coverSub[0], C.coverSub[1], C.coverSub[2]);
  const subtitleTxt = shape(labels.subtitle) || (isRTL ? 'مواصفات المتطلبات التقنية' : 'Technical Requirements Specification');
  d.text(subtitleTxt, tx, Math.min(ty, 46), { align: talign });

  // Metadata box
  const boxY = 62;
  d.setFillColor(...C.bgLight);
  d.setDrawColor(...C.border);
  d.setLineWidth(0.3);
  d.roundedRect(ML, boxY, CW, 32, 2, 2, 'FD');

  if (isRTL) {
    // RTL metadata: two rows per column, all right-aligned from right margin
    d.setFont('Amiri', 'normal');
    d.setFontSize(9.5);
    d.setTextColor(C.text[0], C.text[1], C.text[2]);

    const authorLbl = shape(labels.metaAuthor)   || 'المؤلف';
    const dateLbl   = shape(labels.metaDate)      || 'التاريخ';
    const verLbl    = shape(labels.metaVersion)   || 'الإصدار';
    const powLbl    = shape(labels.metaPoweredBy) || 'مدعوم بواسطة';
    const authorVal = shape(meta.authorName)      || '—';
    const dateVal   = shape(meta.date)            || '—';
    const verVal    = shape(labels.versionLabel)  || '1.0';
    const powVal    = shape(labels.poweredByValue)|| 'BA Bridge';

    const half   = CW / 2;
    const rightX = PW - ML - 5;   // right col: text from here, right-aligned
    const leftX  = ML + half - 5; // left col: text from here, right-aligned

    // Right column (labels/values on right half of box)
    d.text(`${authorLbl}: ${authorVal}`, rightX, boxY + 9,  { align: 'right' });
    d.text(`${dateLbl}: ${dateVal}`,     rightX, boxY + 17, { align: 'right' });
    // Left column
    d.text(`${verLbl}: ${verVal}`,  leftX, boxY + 9,  { align: 'right' });
    d.text(`${powLbl}: ${powVal}`, leftX, boxY + 17, { align: 'right' });
  } else {
    const authorLabel = s(labels.metaAuthor)   || 'Author';
    const dateLabel   = s(labels.metaDate)     || 'Date';
    const verLabel    = s(labels.metaVersion)  || 'Version';
    const powLabel    = s(labels.metaPoweredBy)|| 'Powered by';
    const authorVal   = sr(meta.authorName,  '—');
    const dateVal     = sr(meta.date,        '—');
    const verVal      = s(labels.versionLabel)   || '1.0';
    const powVal      = s(labels.poweredByValue) || 'BA Bridge';
    const half        = CW / 2;

    d.setFontSize(9.5);
    d.setTextColor(C.text[0], C.text[1], C.text[2]);

    // Left column
    d.setFont('helvetica', 'normal');
    d.text(`${authorLabel}:`, ML + 5, boxY + 9);
    d.setFont('helvetica', 'bold');
    d.text(authorVal, ML + 5 + d.getTextWidth(`${authorLabel}: `), boxY + 9);
    d.setFont('helvetica', 'normal');
    d.text(`${dateLabel}:`, ML + 5, boxY + 17);
    d.setFont('helvetica', 'bold');
    d.text(dateVal, ML + 5 + d.getTextWidth(`${dateLabel}: `), boxY + 17);

    // Right column
    d.setFont('helvetica', 'normal');
    d.text(`${verLabel}:`, ML + half, boxY + 9);
    d.setFont('helvetica', 'bold');
    d.text(verVal, ML + half + d.getTextWidth(`${verLabel}: `), boxY + 9);
    d.setFont('helvetica', 'normal');
    d.text(`${powLabel}:`, ML + half, boxY + 17);
    d.setFont('helvetica', 'bold');
    const powMaxW = CW - half - d.getTextWidth(`${powLabel}: `) - 2;
    const powLine = (d.splitTextToSize(powVal, powMaxW) as string[])[0] ?? powVal;
    d.text(powLine, ML + half + d.getTextWidth(`${powLabel}: `), boxY + 17);
  }

  b.y = boxY + 40;

  // ════════════════════════════════════════════════════════════════════════════
  //  IDENTIFIED GAPS
  // ════════════════════════════════════════════════════════════════════════════
  const gaps = toStringArray(tbrd?.missingRequirements);
  if (gaps.length) {
    b.sectionHeader(labels.sectionGaps);
    b.bulletList(gaps, C.amber);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  RECOMMENDATIONS
  // ════════════════════════════════════════════════════════════════════════════
  const recs = toStringArray(tbrd?.recommendations);
  if (recs.length) {
    b.sectionHeader(labels.sectionRecs);
    b.bulletList(recs, C.primary);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  1. TECHNICAL OVERVIEW
  // ════════════════════════════════════════════════════════════════════════════
  b.sectionHeader(labels.sectionOverview);
  const overview = b.txt(tbrd?.technicalOverview);
  if (overview) {
    for (const para of overview.split('\n').filter(Boolean)) {
      b.write(para, 9.5, C.text, false, 0, 5.5);
      b.y += 2;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  2. FUNCTIONAL SPECIFICATION
  // ════════════════════════════════════════════════════════════════════════════
  const funcSpec = Array.isArray(tbrd?.functionalSpecification) ? tbrd.functionalSpecification : [];
  if (funcSpec.length) {
    b.sectionHeader(labels.sectionFuncSpec);
    for (const mod of funcSpec) {
      if (!mod || typeof mod !== 'object') continue;
      const obj     = mod as Record<string, unknown>;
      const modName = b.txt(obj.module)      || '—';
      const modDesc = b.txt(obj.description) || '';
      const details = toStringArray(obj.details).map(x => b.txt(x));

      const descLines = d.splitTextToSize(modDesc || ' ', CW - 6) as string[];
      b.need(10 + descLines.length * 5 + details.length * 5 + 6);

      // Module header box
      d.setFillColor(...C.bgLight);
      d.setDrawColor(...C.border);
      d.setLineWidth(0.2);
      d.roundedRect(ML, b.y - 1, CW, 8.5, 1, 1, 'FD');
      d.setFillColor(...C.primary);
      if (isRTL) {
        d.roundedRect(PW - ML - 3, b.y - 1, 3, 8.5, 0, 1, 'F');
        if (isRTL) d.setFont('Amiri', 'normal'); else d.setFont('helvetica', 'bold');
        d.setFontSize(10);
        d.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
        d.text(modName, PW - ML - 6, b.y + 4.5, { align: 'right' });
      } else {
        d.roundedRect(ML, b.y - 1, 3, 8.5, 1, 0, 'F');
        d.setFont('helvetica', 'bold');
        d.setFontSize(10);
        d.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
        d.text(modName, ML + 6, b.y + 4.5);
      }
      b.y += 11;

      if (modDesc) {
        b.write(modDesc, 9, C.muted, false, 3, 5);
        b.y += 1;
      }
      if (details.length) b.bulletList(details);
      b.y += 4;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  3. NON-FUNCTIONAL SPECIFICATION
  // ════════════════════════════════════════════════════════════════════════════
  const nfSpec = Array.isArray(tbrd?.nonFunctionalSpecification) ? tbrd.nonFunctionalSpecification : [];
  if (nfSpec.length) {
    b.sectionHeader(labels.sectionNonFunc);
    b.table(
      [[s(labels.colCategory), s(labels.colRequirement), s(labels.colMetric)]],
      nfSpec.map(nf => {
        const o = (nf ?? {}) as Record<string, unknown>;
        return [s(o.category) || '—', s(o.requirement) || '—', s(o.metric) || '—'];
      }),
      { 0: 38, 2: 42 },
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  4. DATABASE TABLES
  // ════════════════════════════════════════════════════════════════════════════
  const dbTables = Array.isArray(tbrd?.databaseTables) ? tbrd.databaseTables : [];
  if (dbTables.length) {
    b.sectionHeader(labels.sectionDBTables);
    b.table(
      [[s(labels.colTable), s(labels.colDescription), s(labels.colFields)]],
      dbTables.map(t => {
        const o = (t ?? {}) as Record<string, unknown>;
        return [s(o.name) || '—', s(o.description) || '—', s(o.fields) || '—'];
      }),
      { 0: 38 },
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  5. API SPECIFICATION
  // ════════════════════════════════════════════════════════════════════════════
  const apis = Array.isArray(tbrd?.apis) ? tbrd.apis : [];
  if (apis.length) {
    b.sectionHeader(labels.sectionAPIs);
    for (const api of apis) {
      const o        = (api ?? {}) as Record<string, unknown>;
      const method   = (s(o.method) || 'GET').toUpperCase();
      const endpoint = s(o.endpoint) || '/';
      const desc     = b.txt(o.description);

      const descLines = d.splitTextToSize(desc || ' ', CW - 12) as string[];
      b.need(10 + descLines.length * 5);

      const mc = METHOD_BADGE[method] ?? { bg: C.bgLight, fg: C.text };

      if (isRTL) {
        // RTL: badge on right, endpoint text to its left
        const bw = b.badge(method, mc.bg, mc.fg, PW - ML - 20, b.y);
        d.setFont('helvetica', 'bold');   // endpoints are ASCII — stay LTR
        d.setFontSize(9.5);
        d.setTextColor(C.text[0], C.text[1], C.text[2]);
        const epLine = (d.splitTextToSize(endpoint, CW - bw - 6) as string[])[0] ?? endpoint;
        d.text(epLine, PW - ML - 22, b.y, { align: 'right' });
      } else {
        const bw    = b.badge(method, mc.bg, mc.fg, ML, b.y);
        d.setFont('helvetica', 'bold');
        d.setFontSize(9.5);
        d.setTextColor(C.text[0], C.text[1], C.text[2]);
        const epMaxW = CW - bw - 6;
        const epLine = (d.splitTextToSize(endpoint, epMaxW) as string[])[0] ?? endpoint;
        d.text(epLine, ML + bw + 4, b.y);
      }
      b.y += 6;

      if (desc) {
        b.write(desc, 9, C.muted, false, 4, 5);
      }
      b.y += 4;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  6. USER STORIES
  // ════════════════════════════════════════════════════════════════════════════
  const userStories = Array.isArray(tbrd?.userStories) ? tbrd.userStories : [];
  if (userStories.length) {
    b.sectionHeader(labels.sectionUserStories);
    for (const epic of userStories) {
      const o        = (epic ?? {}) as Record<string, unknown>;
      const epicName = b.txt(o.epic) || '—';
      const stories  = toStringArray(o.stories).map(x => b.txt(x));

      b.need(12);
      const epicLabel = b.txt(labels.epicLabel) || (isRTL ? 'ملحمة' : 'Epic');
      b.write(`${epicLabel}: ${epicName}`, 10.5, C.primary, true, 0, 6);
      b.y += 1;

      for (const story of stories) {
        if (!story) continue;
        const lines = d.splitTextToSize(story, CW - 14) as string[];
        b.need(lines.length * 5 + 4);
        d.setFillColor(...C.primary);
        if (isRTL) {
          d.rect(PW - ML - 5.5, b.y - 3.5, 1.5, lines.length * 5 + 1, 'F');
        } else {
          d.rect(ML + 4, b.y - 3.5, 1.5, lines.length * 5 + 1, 'F');
        }
        if (isRTL) { d.setFont('Amiri', 'normal'); } else { d.setFont('helvetica', 'normal'); }
        d.setFontSize(9.5);
        d.setTextColor(C.text[0], C.text[1], C.text[2]);
        for (const ln of lines) {
          if (isRTL) {
            d.text(ln, PW - ML - 9, b.y, { align: 'right' });
          } else {
            d.text(ln, ML + 9, b.y);
          }
          b.y += 5;
        }
        b.y += 2;
      }
      b.y += 3;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  7. ACCEPTANCE CRITERIA
  // ════════════════════════════════════════════════════════════════════════════
  const acceptance = Array.isArray(tbrd?.acceptanceCriteria) ? tbrd.acceptanceCriteria : [];
  if (acceptance.length) {
    b.sectionHeader(labels.sectionAcceptance);
    for (const ac of acceptance) {
      const o        = (ac ?? {}) as Record<string, unknown>;
      const feature  = b.txt(o.feature)  || '—';
      const criteria = toStringArray(o.criteria).map(x => b.txt(x));

      b.need(14);
      b.write(feature, 10.5, C.text, true, 0, 6);
      b.y += 1;

      for (const criterion of criteria) {
        if (!criterion) continue;
        const lines = d.splitTextToSize(criterion, CW - 14) as string[];
        b.need(lines.length * 5 + 2);

        // Check circle (emerald)
        d.setFillColor(...C.emerald);
        if (isRTL) {
          d.circle(PW - ML - 5, b.y - 1.5, 2, 'F');
          d.setFont('helvetica', 'bold');
          d.setFontSize(8);
          d.setTextColor(C.white[0], C.white[1], C.white[2]);
          d.text('v', PW - ML - 6.2, b.y - 0.2);
        } else {
          d.circle(ML + 5, b.y - 1.5, 2, 'F');
          d.setFont('helvetica', 'bold');
          d.setFontSize(8);
          d.setTextColor(C.white[0], C.white[1], C.white[2]);
          d.text('v', ML + 3.8, b.y - 0.2);
        }

        if (isRTL) { d.setFont('Amiri', 'normal'); } else { d.setFont('helvetica', 'normal'); }
        d.setFontSize(9);
        d.setTextColor(C.text[0], C.text[1], C.text[2]);
        for (const ln of lines) {
          if (isRTL) {
            d.text(ln, PW - ML - 10, b.y, { align: 'right' });
          } else {
            d.text(ln, ML + 10, b.y);
          }
          b.y += 5;
        }
        b.y += 1;
      }
      b.y += 3;
    }
  }

  // ── final footer on last page ─────────────────────────────────────────────
  b.drawFooter();

  return d.output('blob');
}
