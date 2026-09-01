export interface CertificateConfig {
  title: string;
  subtitle: string;
  orgName: string;
  bodyText: string;
  picName: string;
  picTitle: string;
  signatureUrl: string;
  logoUrl: string;
  borderStyle: 'classic' | 'modern' | 'elegant' | 'floral' | 'batik' | 'feminine';
  numberFormat: string;
  isActive?: boolean;
}

export const isCertificateActive = (templateStr?: string | null): boolean => {
  if (!templateStr) return false;
  try {
    const parsed = JSON.parse(templateStr);
    return parsed.isActive !== false;
  } catch {
    return false;
  }
};

const MONTHS_ID_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const formatAgendaDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${MONTHS_ID_FULL[d.getMonth()]} ${d.getFullYear()}`;
};

export const drawCertificateOnCanvas = (
  canvas: HTMLCanvasElement,
  config: CertificateConfig,
  participantName: string = 'Nama Peserta',
  agenda?: any,
  logoImg?: HTMLImageElement | null,
  sigImg?: HTMLImageElement | null
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 1600;
  const H = 1131; // ~A4 landscape ratio
  canvas.width = W;
  canvas.height = H;

  // Clear background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  const theme = config.borderStyle || 'classic';

  if (theme === 'classic') {
    // --- CLASSIC THEME (KWT Green, Batik/Kawung Pattern) ---
    // Watermark Pattern
    ctx.strokeStyle = 'rgba(44, 66, 25, 0.04)'; // Faint green
    ctx.lineWidth = 2;
    const size = 80;
    for (let y = 0; y < H; y += size) {
      for (let x = 0; x < W; x += size) {
        ctx.strokeRect(x + 15, y + 15, size - 30, size - 30);
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y); ctx.lineTo(x + size / 2, y + size);
        ctx.moveTo(x, y + size / 2); ctx.lineTo(x + size, y + size / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Outer thick dark green border
    ctx.fillStyle = '#2C4219';
    ctx.fillRect(0, 0, W, 25);
    ctx.fillRect(0, H - 25, W, 25);
    ctx.fillRect(0, 0, 25, H);
    ctx.fillRect(W - 25, 0, 25, H);

    // Inner light green border
    ctx.fillStyle = '#607829';
    ctx.fillRect(25, 25, W - 50, 12);
    ctx.fillRect(25, H - 37, W - 50, 12);
    ctx.fillRect(25, 25, 12, H - 50);
    ctx.fillRect(W - 37, 25, 12, H - 50);

    // Corner Ornaments
    ctx.fillStyle = '#2C4219';
    ctx.beginPath(); ctx.moveTo(W - 25, 25); ctx.lineTo(W - 350, 25);
    ctx.bezierCurveTo(W - 250, 150, W - 150, 250, W - 25, 350); ctx.fill();
    ctx.fillStyle = '#607829';
    ctx.beginPath(); ctx.moveTo(W - 25, 25); ctx.lineTo(W - 250, 25);
    ctx.bezierCurveTo(W - 180, 100, W - 100, 180, W - 25, 250); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(W - 100, 100, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 160, 60, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 60, 160, 10, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#2C4219';
    ctx.beginPath(); ctx.moveTo(25, H - 25); ctx.lineTo(350, H - 25);
    ctx.bezierCurveTo(250, H - 150, 150, H - 250, 25, H - 350); ctx.fill();
    ctx.fillStyle = '#607829';
    ctx.beginPath(); ctx.moveTo(25, H - 25); ctx.lineTo(250, H - 25);
    ctx.bezierCurveTo(180, H - 100, 100, H - 180, 25, H - 250); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(100, H - 100, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(160, H - 60, 10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(60, H - 160, 10, 0, Math.PI * 2); ctx.fill();

    // Clouds
    const drawCloud = (cx: number, cy: number, scale: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 40 * scale, cy - 10 * scale, 40 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 80 * scale, cy + 10 * scale, 35 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(150, 150, 1, 'rgba(96, 120, 41, 0.15)');
    drawCloud(W - 250, H - 200, 1.5, 'rgba(96, 120, 41, 0.15)');
  } 
  else if (theme === 'modern') {
    // --- MODERN THEME (Geometric, Orange & Green) ---
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#FAFAFA');
    bgGrad.addColorStop(1, '#F3F4F6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Abstract geometric shapes
    ctx.fillStyle = '#D97706'; // Vibrant orange
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(400, 0);
    ctx.lineTo(0, 400);
    ctx.fill();

    ctx.fillStyle = 'rgba(217, 119, 6, 0.2)'; // Light orange
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(550, 0);
    ctx.lineTo(0, 550);
    ctx.fill();

    ctx.fillStyle = '#607829'; // Green bean
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W - 600, H);
    ctx.lineTo(W, H - 600);
    ctx.fill();

    ctx.fillStyle = 'rgba(96, 120, 41, 0.2)'; // Light green
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W - 800, H);
    ctx.lineTo(W, H - 800);
    ctx.fill();

    // Small circles
    ctx.fillStyle = '#B45309';
    ctx.beginPath(); ctx.arc(150, H - 150, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2C4219';
    ctx.beginPath(); ctx.arc(W - 200, 150, 20, 0, Math.PI * 2); ctx.fill();
  }
  else if (theme === 'elegant') {
    // --- ELEGANT THEME (Minimalist, Gold & Dark Green) ---
    ctx.fillStyle = '#FDFCF6'; // Off-white luxury background
    ctx.fillRect(0, 0, W, H);

    const margin = 50;
    
    // Outer thin gold border
    ctx.strokeStyle = '#D4AF37'; // Gold
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

    // Inner thin dark green border
    ctx.strokeStyle = '#1A2F1D'; // Very dark green
    ctx.lineWidth = 4;
    ctx.strokeRect(margin + 15, margin + 15, W - (margin + 15) * 2, H - (margin + 15) * 2);

    // Third thin gold border
    ctx.strokeStyle = '#D4AF37'; 
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 25, margin + 25, W - (margin + 25) * 2, H - (margin + 25) * 2);

    // Gold corner boxes
    ctx.fillStyle = '#D4AF37';
    const boxSize = 25;
    ctx.fillRect(margin + 15, margin + 15, boxSize, boxSize);
    ctx.fillRect(W - margin - 15 - boxSize, margin + 15, boxSize, boxSize);
    ctx.fillRect(margin + 15, H - margin - 15 - boxSize, boxSize, boxSize);
    ctx.fillRect(W - margin - 15 - boxSize, H - margin - 15 - boxSize, boxSize, boxSize);

    // Center Top Gold Ornament (Simple Diamond)
    ctx.beginPath();
    ctx.moveTo(W / 2, margin + 15);
    ctx.lineTo(W / 2 + 15, margin + 30);
    ctx.lineTo(W / 2, margin + 45);
    ctx.lineTo(W / 2 - 15, margin + 30);
    ctx.fill();

    // Center Bottom Gold Ornament
    ctx.beginPath();
    ctx.moveTo(W / 2, H - margin - 15);
    ctx.lineTo(W / 2 + 15, H - margin - 30);
    ctx.lineTo(W / 2, H - margin - 45);
    ctx.lineTo(W / 2 - 15, H - margin - 30);
    ctx.fill();
  }
  else if (theme === 'floral') {
    // --- FLORAL THEME (Soft pinks, natural/motherly feel) ---
    ctx.fillStyle = '#FFF5F8'; // Very soft pink/cream
    ctx.fillRect(0, 0, W, H);

    const margin = 40;
    
    // Outer border
    ctx.strokeStyle = '#F48FB1'; // Soft pink
    ctx.lineWidth = 12;
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);
    
    // Inner border
    ctx.strokeStyle = '#FCE4EC';
    ctx.lineWidth = 4;
    ctx.strokeRect(margin + 16, margin + 16, W - (margin + 16) * 2, H - (margin + 16) * 2);

    // Floral corner decorations (abstract petals)
    const drawPetal = (x: number, y: number, color: string, radius: number) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCornerFloral = (cx: number, cy: number, dx: number, dy: number) => {
      drawPetal(cx, cy, '#F48FB1', 40);
      drawPetal(cx + dx * 40, cy, '#F8BBD0', 30);
      drawPetal(cx, cy + dy * 40, '#F8BBD0', 30);
      drawPetal(cx + dx * 30, cy + dy * 30, '#FCE4EC', 20);
      
      // leaves
      ctx.fillStyle = '#C8E6C9';
      ctx.beginPath();
      ctx.ellipse(cx + dx * 60, cy + dy * 20, 15, 30, Math.PI/4 * (dx*dy), 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + dx * 20, cy + dy * 60, 15, 30, Math.PI/4 * (-dx*dy), 0, Math.PI*2);
      ctx.fill();
    };

    drawCornerFloral(margin, margin, 1, 1);
    drawCornerFloral(W - margin, margin, -1, 1);
    drawCornerFloral(margin, H - margin, 1, -1);
    drawCornerFloral(W - margin, H - margin, -1, -1);
  }
  else if (theme === 'batik') {
    // --- BATIK TRADISIONAL (Warm browns, geometric patterns) ---
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, W, H);

    const margin = 45;
    
    // Base border background
    ctx.fillStyle = '#8D6E63'; // Brown
    ctx.fillRect(margin, margin, W - margin * 2, H - margin * 2);
    
    // Inner content area
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(margin + 20, margin + 20, W - (margin + 20) * 2, H - (margin + 20) * 2);

    // Draw some repeating pattern in the border (simple diamonds to simulate batik parang/kawung structure)
    ctx.fillStyle = '#5D4037'; // Darker brown
    for (let x = margin + 5; x < W - margin; x += 30) {
      // Top border pattern
      ctx.beginPath(); ctx.moveTo(x + 15, margin + 2); ctx.lineTo(x + 28, margin + 10); ctx.lineTo(x + 15, margin + 18); ctx.lineTo(x + 2, margin + 10); ctx.fill();
      // Bottom border pattern
      ctx.beginPath(); ctx.moveTo(x + 15, H - margin - 18); ctx.lineTo(x + 28, H - margin - 10); ctx.lineTo(x + 15, H - margin - 2); ctx.lineTo(x + 2, H - margin - 10); ctx.fill();
    }
    for (let y = margin + 5; y < H - margin; y += 30) {
      // Left border pattern
      if (y < H - margin - 20) {
        ctx.beginPath(); ctx.moveTo(margin + 2, y + 15); ctx.lineTo(margin + 10, y + 28); ctx.lineTo(margin + 18, y + 15); ctx.lineTo(margin + 10, y + 2); ctx.fill();
      }
      // Right border pattern
      if (y < H - margin - 20) {
        ctx.beginPath(); ctx.moveTo(W - margin - 18, y + 15); ctx.lineTo(W - margin - 10, y + 28); ctx.lineTo(W - margin - 2, y + 15); ctx.lineTo(W - margin - 10, y + 2); ctx.fill();
      }
    }
  }
  else if (theme === 'feminine') {
    // --- FEMININE LEMBUT (Soft Purple/Lavender & Gold) ---
    ctx.fillStyle = '#FDFCF6'; // Off-white
    ctx.fillRect(0, 0, W, H);
    
    // Add soft watercolor-like splotches at corners
    const drawGradientCircle = (x: number, y: number, r: number, color1: string, color2: string) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };

    drawGradientCircle(0, 0, 400, 'rgba(206, 147, 216, 0.4)', 'rgba(253, 252, 246, 0)'); // Lavender top-left
    drawGradientCircle(W, H, 500, 'rgba(244, 143, 177, 0.3)', 'rgba(253, 252, 246, 0)'); // Soft pink bottom-right
    drawGradientCircle(W, 0, 300, 'rgba(255, 224, 130, 0.3)', 'rgba(253, 252, 246, 0)'); // Soft gold top-right

    const margin = 50;
    
    // Thin gold elegant border
    ctx.strokeStyle = '#D4AF37'; // Gold
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);
    
    // Second inner thin line (lavender)
    ctx.strokeStyle = '#CE93D8'; 
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 10, margin + 10, W - (margin + 10) * 2, H - (margin + 10) * 2);
  }

  // --- LAYOUT VARIABLES ---
  let align: CanvasTextAlign = 'center';
  let contentX = W / 2;
  let logoX = W / 2;
  
  // Set signature position to center or bottom right depending on preference.
  // Standard formal certificates usually put it on the right or center. We'll use center for simplicity and symmetry,
  // except for classic which looks good on the right. 
  // Let's just put all signatures in the center to make them all identical in layout as requested.
  let sigX = W / 2;
  let yPos = 240;

  const isElegantTheme = theme === 'elegant' || theme === 'feminine' || theme === 'floral';
  ctx.textAlign = align;

  // Organization Name
  ctx.font = isElegantTheme ? 'bold 24px "Times New Roman", Georgia, serif' : 'bold 26px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = theme === 'elegant' ? '#1A2F1D' : (theme === 'modern' ? '#D97706' : (theme === 'feminine' ? '#6A1B9A' : (theme === 'batik' ? '#4E342E' : (theme === 'floral' ? '#880E4F' : '#2C4219'))));
  const orgNameUpper = (config.orgName || 'UNIVERSITAS MUHAMMADIYAH PONOROGO').toUpperCase();
  
  if (isElegantTheme) (ctx as any).letterSpacing = '4px';
  else (ctx as any).letterSpacing = '2px';
  
  ctx.fillText(orgNameUpper, contentX, yPos);
  (ctx as any).letterSpacing = '0px';

  if (isElegantTheme && theme !== 'floral') {
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    const orgW = ctx.measureText(orgNameUpper).width + (orgNameUpper.length * 4);
    ctx.beginPath(); ctx.moveTo(contentX - orgW/2 - 50, yPos - 6); ctx.lineTo(contentX - orgW/2 - 15, yPos - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(contentX + orgW/2 + 15, yPos - 6); ctx.lineTo(contentX + orgW/2 + 50, yPos - 6); ctx.stroke();
  }

  // Certificate title
  yPos += 80;
  ctx.font = isElegantTheme ? 'bold 64px "Times New Roman", Georgia, serif' : '900 68px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = theme === 'elegant' ? '#1A2F1D' : (theme === 'modern' ? '#111827' : (theme === 'feminine' ? '#4A148C' : (theme === 'batik' ? '#3E2723' : (theme === 'floral' ? '#880E4F' : '#000000'))));
  
  if (!isElegantTheme) (ctx as any).letterSpacing = '6px';
  ctx.fillText(config.title || 'SERTIFIKAT PENGHARGAAN', contentX, yPos);
  if (!isElegantTheme) (ctx as any).letterSpacing = '0px';

  // Certificate Number
  yPos += 45;
  const eventDateObj = agenda?.date ? new Date(agenda.date) : null;
  const seqStr = '001';
  const eventYearStr = eventDateObj ? eventDateObj.getFullYear().toString() : '2026';
  const numText = (config.numberFormat || 'CERT/ORG/{YEAR}/{NUM}').replace('{YEAR}', eventYearStr).replace('{NUM}', seqStr);
  
  if (theme === 'elegant' || theme === 'feminine') {
    ctx.font = 'italic 16px "Times New Roman", Georgia, serif';
    ctx.fillStyle = theme === 'feminine' ? '#9C27B0' : '#433A30';
    ctx.fillText(`Nomor: ${numText}`, contentX, yPos);
  } else if (theme === 'batik' || theme === 'floral') {
    ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = theme === 'floral' ? '#F48FB1' : '#8D6E63';
    ctx.fillText(numText, contentX, yPos);
  } else {
    // Pill background for classic/modern
    const pillW = 300;
    const pillH = 36;
    ctx.fillStyle = theme === 'modern' ? '#FEF3C7' : '#FAF6EE';
    ctx.beginPath();
    let pillX = contentX - pillW / 2;
    ctx.roundRect(pillX, yPos - 24, pillW, pillH, 18);
    ctx.fill();
    
    ctx.font = 'bold 14px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = theme === 'modern' ? '#B45309' : '#607829';
    ctx.fillText(`NOMOR: ${numText}`, pillX + pillW / 2, yPos);
  }

  // Subtitle
  yPos += 70;
  ctx.font = isElegantTheme ? 'italic 20px "Times New Roman", Georgia, serif' : '20px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#7A7062';
  ctx.fillText(config.subtitle || 'Diberikan kepada:', contentX, yPos);

  // Participant Name
  yPos += 75;
  ctx.font = 'bold 56px "Times New Roman", Georgia, serif';
  ctx.fillStyle = theme === 'elegant' ? '#1A2F1D' : (theme === 'modern' ? '#D97706' : (theme === 'feminine' ? '#4A148C' : (theme === 'batik' ? '#3E2723' : (theme === 'floral' ? '#880E4F' : '#2C4219'))));
  ctx.fillText(participantName.toUpperCase(), contentX, yPos);

  // Solid Underline for name
  yPos += 20;
  const nameW = ctx.measureText(participantName).width;
  const underlineW = Math.max(nameW + 100, 400); 
  
  let lineStartX = contentX - underlineW / 2;
  let lineEndX = contentX + underlineW / 2;
  
  ctx.strokeStyle = isElegantTheme ? '#D4AF37' : (theme === 'modern' ? '#D97706' : '#333333');
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(lineStartX, yPos); ctx.lineTo(lineEndX, yPos); ctx.stroke();

  // "Sebagai :"
  yPos += 50;
  ctx.font = isElegantTheme ? 'italic 24px "Georgia", serif' : '24px "Georgia", "Times New Roman", serif';
  ctx.fillStyle = '#555555';
  ctx.fillText('Sebagai :', contentX, yPos);

  // "PESERTA"
  yPos += 45;
  ctx.font = isElegantTheme ? 'bold 28px "Times New Roman", Georgia, serif' : 'bold 30px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = theme === 'elegant' ? '#1A2F1D' : '#000000';
  (ctx as any).letterSpacing = '8px';
  ctx.fillText('PESERTA', contentX, yPos);
  (ctx as any).letterSpacing = '0px';

  // Body text
  yPos += 60;
  ctx.font = isElegantTheme ? '22px "Georgia", serif' : '22px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#333333';
  
  const bodyLine1 = config.bodyText || 'Dalam kegiatan';
  const bodyLine2 = agenda ? `"${agenda.title}"` : '"Nama Kegiatan"';
  const bodyLine3 = agenda
    ? `yang diselenggarakan pada tanggal ${formatAgendaDate(agenda.date)}`
    : 'yang diselenggarakan pada tanggal ...';
  
  ctx.fillText(`${bodyLine1} ${bodyLine2}`, contentX, yPos);
  yPos += 30;
  ctx.fillText(bodyLine3, contentX, yPos);
  
  if (agenda?.location) {
    yPos += 30;
    ctx.fillText(`bertempat di ${agenda.location}`, contentX, yPos);
  }

  // --- SIGNATURE SECTION ---
  yPos += 120;
  ctx.textAlign = 'center'; // Signatures are always internally centered relative to their sigX

  yPos += 40;
  ctx.font = isElegantTheme ? 'bold 34px "Georgia", serif' : 'bold 34px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#000000';
  const picNameText = config.picName || '.............................';
  ctx.fillText(picNameText, sigX, yPos);
  
  const picW = ctx.measureText(picNameText).width;
  ctx.strokeStyle = '#000000'; 
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(sigX - picW / 2 - 20, yPos + 8); ctx.lineTo(sigX + picW / 2 + 20, yPos + 8); ctx.stroke();

  yPos += 40;
  ctx.font = isElegantTheme ? 'italic 26px "Georgia", serif' : 'bold 26px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#555555';
  ctx.fillText(config.picTitle || 'KETUA PELAKSANA', sigX, yPos);

  const drawImageContain = (img: HTMLImageElement, cx: number, cy: number, maxW: number, maxH: number, alignBottom: boolean = false) => {
    const imgAspect = img.width / img.height;
    const boxAspect = maxW / maxH;
    
    let drawW, drawH;
    if (imgAspect > boxAspect) {
      drawW = maxW;
      drawH = maxW / imgAspect;
    } else {
      drawH = maxH;
      drawW = maxH * imgAspect;
    }
    
    const drawX = cx - drawW / 2;
    const drawY = alignBottom ? cy - drawH : cy - drawH / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };

  // Draw Logo and Signature if provided
  if (logoImg) {
    // Logo Y is standard 145 (midpoint between 50 and 240)
    drawImageContain(logoImg, logoX, 145, 240, 130, false);
  }

  if (sigImg) {
    // Signature bottom aligned above the name line
    drawImageContain(sigImg, sigX, yPos - 60, 240, 110, true);
  }
};
