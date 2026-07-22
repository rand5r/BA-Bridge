/**
 * Arabic text support for jsPDF.
 *
 * jsPDF renders glyphs strictly left-to-right and has no built-in knowledge of
 * the Unicode Bidirectional Algorithm or Arabic contextual letter forms.
 * Two steps are required before passing any Arabic string to jsPDF:
 *
 *   1. RESHAPE – convertArabic() maps each Arabic character to its correct
 *      contextual presentation form (initial / medial / final / isolated) so
 *      letters visually connect inside the glyph stream.
 *
 *   2. REORDER – bidi.getReorderedString() applies the Unicode Bidirectional
 *      Algorithm (UBA, TR#9) and returns a string whose codepoint sequence is
 *      in visual/display order: when jsPDF renders it left-to-right, the
 *      reader perceives correct right-to-left Arabic text.
 *
 * loadAmiriFont() fetches Amiri-Regular.ttf from the Vite public folder and
 * registers it with a jsPDF instance so Arabic glyphs are available.
 */

// Vite automatically handles CJS → ESM interop; both packages work with a
// regular default import even though they ship as CommonJS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no bundled type declarations
import reshaper from 'arabic-persian-reshaper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – no bundled type declarations
import bidi from 'bidi-js';

// arabic-persian-reshaper exposes { ArabicShaper, PersianShaper };
// each shaper is a module with a convertArabic() function.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertArabic: (s: string) => string = (reshaper as any).ArabicShaper.convertArabic;

/** True when the string contains at least one Arabic codepoint. */
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
export function hasArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

/**
 * Reshape + visually reorder an Arabic string for LTR jsPDF rendering.
 *
 * Non-Arabic strings (no Arabic codepoints) are returned unchanged so this
 * function is safe to call unconditionally on any text.
 */
export function shapeArabic(text: string): string {
  if (!text || !hasArabic(text)) return text;
  // Step 1: contextual letter forms
  const reshaped = convertArabic(text);
  // Step 2: visual/display order via UBA
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const levels = (bidi as any).getEmbeddingLevels(reshaped);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (bidi as any).getReorderedString(reshaped, levels);
}

/**
 * Fetch Amiri-Regular.ttf from the Vite public folder and register it with
 * the provided jsPDF instance.
 * Must be called once before any Arabic text is rendered.
 */
export async function loadAmiriFont(doc: import('jspdf').jsPDF): Promise<void> {
  const url = `${import.meta.env.BASE_URL}fonts/Amiri-Regular.ttf`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Arabic font load failed (${res.status}): ${url}`);

  const buf   = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // Convert binary buffer → latin-1 string → base64.
  // Individual character appends are safe regardless of buffer size.
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const b64 = btoa(binary);
  doc.addFileToVFS('Amiri-Regular.ttf', b64);
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
}
