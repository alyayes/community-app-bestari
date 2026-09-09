import { jsPDF } from 'jspdf';
import { InfoArticle } from '../types';
import { resolveImageUrl } from '../api/client';

interface ContentBlock {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list-item' | 'blockquote';
  text: string;
  listIndex?: number;
  isOrdered?: boolean;
}

/**
 * Parses raw HTML (e.g. from Quill editor) into clean structured blocks,
 * completely stripping HTML tags and decoding all HTML entities like &nbsp;.
 */
const parseHtmlToBlocks = (rawContent: string | string[]): ContentBlock[] => {
  const html = Array.isArray(rawContent) ? rawContent.join('\n') : String(rawContent || '');
  if (!html.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: ContentBlock[] = [];

  const cleanText = (str: string) => {
    return str
      .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  const traverse = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (tag === 'H1') {
        const text = cleanText(el.textContent || '');
        if (text) blocks.push({ type: 'h1', text });
      } else if (tag === 'H2') {
        const text = cleanText(el.textContent || '');
        if (text) blocks.push({ type: 'h2', text });
      } else if (tag === 'H3' || tag === 'H4') {
        const text = cleanText(el.textContent || '');
        if (text) blocks.push({ type: 'h3', text });
      } else if (tag === 'UL' || tag === 'OL') {
        const isOrdered = tag === 'OL';
        let idx = 1;
        el.querySelectorAll(':scope > li').forEach((li) => {
          const text = cleanText(li.textContent || '');
          if (text) {
            blocks.push({
              type: 'list-item',
              text,
              isOrdered,
              listIndex: idx++
            });
          }
        });
      } else if (tag === 'LI') {
        const text = cleanText(el.textContent || '');
        if (text) {
          blocks.push({ type: 'list-item', text, isOrdered: false });
        }
      } else if (tag === 'BLOCKQUOTE') {
        const text = cleanText(el.textContent || '');
        if (text) blocks.push({ type: 'blockquote', text });
      } else if (tag === 'P') {
        const text = cleanText(el.textContent || '');
        if (text) {
          // Detect if paragraph is essentially a bold section title (e.g. <p><strong>Judul</strong></p>)
          const strongEl = el.querySelector('strong, b');
          const isEntirelyBold = strongEl && cleanText(strongEl.textContent || '') === text;
          if (isEntirelyBold && text.length < 80) {
            blocks.push({ type: 'h2', text });
          } else {
            blocks.push({ type: 'paragraph', text });
          }
        }
      } else if (['DIV', 'SECTION', 'ARTICLE', 'MAIN'].includes(tag)) {
        Array.from(el.childNodes).forEach(traverse);
      } else {
        if (el.children.length > 0) {
          Array.from(el.childNodes).forEach(traverse);
        } else {
          const text = cleanText(el.textContent || '');
          if (text) blocks.push({ type: 'paragraph', text });
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = cleanText(node.textContent || '');
      if (text) blocks.push({ type: 'paragraph', text });
    }
  };

  Array.from(doc.body.childNodes).forEach(traverse);
  return blocks;
};

/**
 * Load an image URL into a canvas and convert to base64 JPEG to prevent tainted canvas / CORS issues in jsPDF.
 */
const loadImageDataUrl = async (url: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve({ dataUrl, width: canvas.width, height: canvas.height });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
};

/**
 * Generates and triggers download of a clean, beautifully formatted PDF for an article.
 */
export const downloadArticlePdf = async (article: InfoArticle): Promise<void> => {
  if (!article) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 20;
  const contentWidth = pageWidth - margin * 2; // 170mm
  let yPos = margin;

  // 1. Header Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(44, 66, 25); // #2C4219
  doc.text('KOMUNITAS KWT MELATI SORGUM', margin, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(122, 112, 98); // #7A7062
  doc.text('DOKUMEN INFORMASI & EDUKASI RESMI', pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.setDrawColor(44, 66, 25);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // 2. Article Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(44, 66, 25);
  const titleLines = doc.splitTextToSize(article.title || 'Informasi Edukasi', contentWidth);
  doc.text(titleLines, margin, yPos);
  yPos += titleLines.length * 7.5 + 4;

  // 3. Metadata Card (Kategori, Tanggal, Penulis)
  const metaHeight = 11;
  doc.setFillColor(250, 246, 238); // #FAF6EE
  doc.setDrawColor(230, 225, 213); // #E6E1D5
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, metaHeight, 2, 2, 'FD');

  const metaY = yPos + 7;
  const colWidth = contentWidth / 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  // Kategori
  doc.text('Kategori:', margin + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 66, 25);
  doc.text(article.category || 'Umum', margin + 18, metaY);

  // Tanggal
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Tanggal:', margin + colWidth + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 66, 25);
  doc.text(article.date || 'Rabu, 9 September 2026', margin + colWidth + 18, metaY);

  // Penulis
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Penulis:', margin + colWidth * 2 + 4, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 66, 25);
  const authorName = article.author?.name || 'Admin';
  doc.text(authorName.slice(0, 22), margin + colWidth * 2 + 17, metaY);

  yPos += metaHeight + 8;

  // 4. Featured Image (if available)
  const rawImg = article.gallery?.[0] || article.image;
  if (rawImg) {
    const imgObj = await loadImageDataUrl(resolveImageUrl(rawImg));
    if (imgObj) {
      let imgW = contentWidth;
      let imgH = (imgObj.height * imgW) / imgObj.width;
      const maxImgH = 80;
      if (imgH > maxImgH) {
        imgH = maxImgH;
        imgW = (imgObj.width * imgH) / imgObj.height;
      }

      if (yPos + imgH > pageHeight - margin - 20) {
        doc.addPage();
        yPos = margin + 5;
      }

      const imgX = margin + (contentWidth - imgW) / 2;
      doc.addImage(imgObj.dataUrl, 'JPEG', imgX, yPos, imgW, imgH);
      yPos += imgH + 8;
    }
  }

  // 5. Section Heading: "Detail Informasi"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(44, 66, 25);
  doc.text('Detail Informasi', margin, yPos);
  yPos += 2;

  doc.setDrawColor(200, 210, 180);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, margin + 40, yPos);
  yPos += 7;

  // 6. Content Blocks
  const rawContent = article.content || article.summary || '';
  const blocks = parseHtmlToBlocks(rawContent);

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      yPos = margin + 5;
    }
  };

  if (blocks.length === 0) {
    // Fallback if no blocks
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 55, 50);
    const lines = doc.splitTextToSize(String(article.summary || 'Tidak ada konten.'), contentWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * 5.5;
  } else {
    for (const block of blocks) {
      if (block.type === 'h1' || block.type === 'h2') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(block.type === 'h1' ? 14 : 12);
        doc.setTextColor(44, 66, 25);

        const lines = doc.splitTextToSize(block.text, contentWidth);
        const height = lines.length * 6 + 4;
        checkPageBreak(height);

        yPos += 3;
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5.8 + 2;
      } else if (block.type === 'h3') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(44, 66, 25);

        const lines = doc.splitTextToSize(block.text, contentWidth);
        const height = lines.length * 5.5 + 3;
        checkPageBreak(height);

        yPos += 2;
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5.2 + 2;
      } else if (block.type === 'list-item') {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 55, 50);

        const prefix = block.isOrdered && block.listIndex ? `${block.listIndex}. ` : '• ';
        const prefixWidth = doc.getTextWidth(prefix);
        const indentMargin = margin + 6;
        const listTextWidth = contentWidth - 6;

        const lines = doc.splitTextToSize(block.text, listTextWidth);
        const height = lines.length * 5.2 + 2;
        checkPageBreak(height);

        // Draw bullet/number
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 66, 25);
        doc.text(prefix, margin + 1, yPos);

        // Draw item text
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 55, 50);
        doc.text(lines, indentMargin, yPos);
        yPos += lines.length * 5.2 + 1.5;
      } else if (block.type === 'blockquote') {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(90, 80, 70);

        const indentMargin = margin + 5;
        const blockWidth = contentWidth - 5;
        const lines = doc.splitTextToSize(block.text, blockWidth);
        const height = lines.length * 5 + 3;
        checkPageBreak(height);

        // Left accent border
        doc.setDrawColor(168, 183, 116);
        doc.setLineWidth(0.8);
        doc.line(margin + 1, yPos - 3, margin + 1, yPos + height - 5);

        doc.text(lines, indentMargin, yPos);
        yPos += lines.length * 5 + 3;
      } else {
        // Paragraph
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 55, 50);

        const lines = doc.splitTextToSize(block.text, contentWidth);
        const height = lines.length * 5.2 + 3;
        checkPageBreak(height);

        doc.text(lines, margin, yPos);
        yPos += lines.length * 5.2 + 3;
      }
    }
  }

  // 7. Running Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    const footerY = pageHeight - 12;
    doc.setDrawColor(230, 225, 213);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text('Sistem Informasi Komunitas KWT Melati Sorgum', margin, footerY);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  // 8. Save Document with clean filename
  const cleanTitle = (article.title || 'Dokumen_Informasi')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);
  doc.save(`${cleanTitle}.pdf`);
};
