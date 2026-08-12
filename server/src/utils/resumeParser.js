import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';

// ============================================
// universalTextExtractor — handles PDF, DOCX, DOC, TXT, JSON
// ============================================

const extractTextFromPdf = async (buffer) => {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocument({ data: uint8Array }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
};

const extractTextFromDocx = async (buffer) => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
};

const extractTextFromTxt = (buffer) => {
  return buffer.toString('utf-8').trim();
};

const extractTextFromJson = (buffer) => {
  try {
    const parsed = JSON.parse(buffer.toString('utf-8'));
    return JSON.stringify(parsed, null, 2);
  } catch {
    return buffer.toString('utf-8');
  }
};

const universalTextExtractor = async (buffer, mimetype, originalname) => {
  const ext = originalname?.split('.').pop()?.toLowerCase();

  // DOCX
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return extractTextFromDocx(buffer);
  }

  // DOC (legacy Word — treat as binary, extract readable text)
  if (mimetype === 'application/msword' || ext === 'doc') {
    try {
      return extractTextFromDocx(buffer); // mammoth handles old .doc too
    } catch {
      return buffer.toString('latin1').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  // Plain text
  if (mimetype === 'text/plain' || ext === 'txt') {
    return extractTextFromTxt(buffer);
  }

  // JSON
  if (mimetype === 'application/json' || ext === 'json') {
    return extractTextFromJson(buffer);
  }

  // Default: try PDF
  return extractTextFromPdf(buffer);
};

export default universalTextExtractor;
export { extractTextFromPdf, extractTextFromDocx, extractTextFromTxt };