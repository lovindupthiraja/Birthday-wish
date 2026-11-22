import { FilterId, FrameStyleId, PlacedEmoji, StickerId } from '../types';

export const PHOTO_W = 380;
export const PHOTO_H = 475; // Exact 4:5 aspect ratio

// Precomputed 256-entry channel lookup tables & cached buffers for ultra-fast mobile filtering
const LUT_SOFT_R = new Uint8ClampedArray(256);
const LUT_SOFT_G = new Uint8ClampedArray(256);
const LUT_SOFT_B = new Uint8ClampedArray(256);

const LUT_PEACH_R = new Uint8ClampedArray(256);
const LUT_PEACH_G = new Uint8ClampedArray(256);
const LUT_PEACH_B = new Uint8ClampedArray(256);

const LUT_FAIRY_R = new Uint8ClampedArray(256);
const LUT_FAIRY_G = new Uint8ClampedArray(256);
const LUT_FAIRY_B = new Uint8ClampedArray(256);

const LUT_Y2K_R = new Uint8ClampedArray(256);
const LUT_Y2K_G = new Uint8ClampedArray(256);
const LUT_Y2K_B = new Uint8ClampedArray(256);

for (let v = 0; v < 256; v++) {
  LUT_SOFT_R[v] = v * 1.07 + 22;
  LUT_SOFT_G[v] = v * 0.98 + 10;
  LUT_SOFT_B[v] = v * 1.03 + 18;

  LUT_PEACH_R[v] = v * 1.09 + 20;
  LUT_PEACH_G[v] = v * 1.03 + 11;
  LUT_PEACH_B[v] = v * 0.93 + 6;

  LUT_FAIRY_R[v] = v * 1.04 + 18;
  LUT_FAIRY_G[v] = v * 1.0 + 11;
  LUT_FAIRY_B[v] = v * 1.08 + 24;

  LUT_Y2K_R[v] = (v * 1.08 + 12 - 128) * 1.14 + 132;
  LUT_Y2K_G[v] = (v * 1.02 + 6 - 128) * 1.12 + 128;
  LUT_Y2K_B[v] = (v * 0.92 - 4 - 128) * 1.1 + 122;
}

let cachedPixelCanvas: HTMLCanvasElement | null = null;
let cachedOutImage: ImageData | null = null;
let cachedFairyOverlay: { w: number; h: number; canvas: HTMLCanvasElement } | null = null;

/**
 * Draws an illustrated Coquette 15th birthday portrait for Demo mode
 */
export function drawDemoPortrait(canvas: HTMLCanvasElement) {
  canvas.width = PHOTO_W;
  canvas.height = PHOTO_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const grad = ctx.createLinearGradient(0, 0, PHOTO_W, PHOTO_H);
  grad.addColorStop(0, '#FFE3EE');
  grad.addColorStop(0.55, '#FFF5F9');
  grad.addColorStop(1, '#FFC2D8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, PHOTO_W, PHOTO_H);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  [
    [64, 90, 34],
    [310, 115, 44],
    [88, 365, 40],
    [300, 385, 32],
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Shoulders
  ctx.fillStyle = '#FFACC9';
  ctx.beginPath();
  ctx.roundRect(108, 266, 164, 150, [60, 60, 0, 0]);
  ctx.fill();

  // Hair back
  ctx.fillStyle = '#4A2334';
  ctx.beginPath();
  ctx.arc(PHOTO_W / 2, 194, 62, Math.PI, 0);
  ctx.fill();

  // Face
  ctx.fillStyle = '#FDE2D4';
  ctx.beginPath();
  ctx.arc(PHOTO_W / 2, 206, 52, 0, Math.PI * 2);
  ctx.fill();

  // Blush
  ctx.fillStyle = 'rgba(235, 124, 164, 0.45)';
  ctx.beginPath();
  ctx.ellipse(158, 218, 10, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(222, 218, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Happy eyes & smile
  ctx.strokeStyle = '#4A2334';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(172, 202, 7, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(208, 202, 7, Math.PI, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(PHOTO_W / 2, 220, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  ctx.font = '44px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎀', PHOTO_W / 2, 134);

  ctx.fillStyle = '#D45887';
  ctx.font = '600 22px Georgia, serif';
  ctx.fillText('15th Birthday ✨', PHOTO_W / 2, 434);
}

/**
 * Draws a soft 4-point sparkle on canvas for Fairy Sparkle filter
 */
function drawCanvasSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  const inner = r * 0.28;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const na = a + Math.PI / 4;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(na) * inner, Math.sin(na) * inner);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function getFairyOverlayCanvas(w: number, h: number): HTMLCanvasElement {
  if (cachedFairyOverlay && cachedFairyOverlay.w === w && cachedFairyOverlay.h === h) {
    return cachedFairyOverlay.canvas;
  }
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const oCtx = c.getContext('2d');
  if (oCtx) {
    const mist = oCtx.createLinearGradient(0, 0, w, h);
    mist.addColorStop(0, 'rgba(255, 214, 240, 0.22)');
    mist.addColorStop(0.5, 'rgba(236, 214, 255, 0.12)');
    mist.addColorStop(1, 'rgba(255, 226, 238, 0.24)');
    oCtx.fillStyle = mist;
    oCtx.fillRect(0, 0, w, h);

    const sparkles = [
      [0.14, 0.16, 12, '#FFFDF9', 0.92],
      [0.86, 0.14, 14, '#FFE3EE', 0.9],
      [0.2, 0.78, 10, '#FFFDF9', 0.85],
      [0.84, 0.72, 13, '#FFE3EE', 0.9],
      [0.11, 0.45, 8, '#FFE3EE', 0.8],
      [0.9, 0.42, 9, '#FFFDF9', 0.85],
      [0.5, 0.09, 10, '#FFFDF9', 0.82],
    ] as const;
    for (const [sx, sy, sr, col, al] of sparkles) {
      drawCanvasSparkle(oCtx, w * sx, h * sy, sr * (w / 380), col, al);
    }
  }
  cachedFairyOverlay = { w, h, canvas: c };
  return c;
}

/**
 * Applies classic & girly pixel-manipulation filters to the target canvas
 * using cached ImageData buffers and 256-entry LUTs for zero-GC speed on old phones.
 */
export function applyPixelFilter(
  src: HTMLCanvasElement,
  dst: HTMLCanvasElement,
  filterId: FilterId
) {
  const w = src.width;
  const h = src.height;
  if (dst.width !== w || dst.height !== h) {
    dst.width = w;
    dst.height = h;
  }
  const dstCtx = dst.getContext('2d', { willReadFrequently: true });
  const srcCtx = src.getContext('2d', { willReadFrequently: true });
  if (!dstCtx || !srcCtx) return;

  if (filterId === 'normal') {
    dstCtx.drawImage(src, 0, 0, w, h);
    return;
  }

  if (filterId === 'pixel') {
    const pixelSize = Math.max(8, Math.round(w / 42));
    const smallW = Math.max(1, Math.floor(w / pixelSize));
    const smallH = Math.max(1, Math.floor(h / pixelSize));
    if (!cachedPixelCanvas) {
      cachedPixelCanvas = document.createElement('canvas');
    }
    if (cachedPixelCanvas.width !== smallW || cachedPixelCanvas.height !== smallH) {
      cachedPixelCanvas.width = smallW;
      cachedPixelCanvas.height = smallH;
    }
    const tmpCtx = cachedPixelCanvas.getContext('2d');
    if (!tmpCtx) return;
    tmpCtx.drawImage(src, 0, 0, smallW, smallH);
    dstCtx.imageSmoothingEnabled = false;
    dstCtx.clearRect(0, 0, w, h);
    dstCtx.drawImage(cachedPixelCanvas, 0, 0, smallW, smallH, 0, 0, w, h);
    dstCtx.imageSmoothingEnabled = true;
    return;
  }

  const srcImage = srcCtx.getImageData(0, 0, w, h);
  const sData = srcImage.data;
  if (!cachedOutImage || cachedOutImage.width !== w || cachedOutImage.height !== h) {
    cachedOutImage = dstCtx.createImageData(w, h);
  }
  const data = cachedOutImage.data;
  const len = sData.length;

  if (filterId === 'vector') {
    const step = 255 / 4;
    for (let i = 0; i < len; i += 4) {
      const r0 = sData[i];
      const g0 = sData[i + 1];
      const b0 = sData[i + 2];
      const avg = (r0 + g0 + b0) * 0.333333;
      const r = (avg + (r0 - avg) * 1.35 - 128) * 1.2 + 128;
      const g = (avg + (g0 - avg) * 1.35 - 128) * 1.2 + 128;
      const b = (avg + (b0 - avg) * 1.35 - 128) * 1.2 + 128;
      data[i] = Math.round(r / step) * step;
      data[i + 1] = Math.round(g / step) * step;
      data[i + 2] = Math.round(b / step) * step;
      data[i + 3] = 255;
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
    return;
  }

  if (filterId === 'softpink') {
    for (let i = 0; i < len; i += 4) {
      data[i] = LUT_SOFT_R[sData[i]];
      data[i + 1] = LUT_SOFT_G[sData[i + 1]];
      data[i + 2] = LUT_SOFT_B[sData[i + 2]];
      data[i + 3] = 255;
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
    const bloom = dstCtx.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.8);
    bloom.addColorStop(0, 'rgba(255, 227, 238, 0.14)');
    bloom.addColorStop(1, 'rgba(235, 124, 164, 0.22)');
    dstCtx.fillStyle = bloom;
    dstCtx.fillRect(0, 0, w, h);
    return;
  }

  if (filterId === 'peachglow') {
    for (let i = 0; i < len; i += 4) {
      data[i] = LUT_PEACH_R[sData[i]];
      data[i + 1] = LUT_PEACH_G[sData[i + 1]];
      data[i + 2] = LUT_PEACH_B[sData[i + 2]];
      data[i + 3] = 255;
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
    const sun = dstCtx.createRadialGradient(w * 0.22, h * 0.18, 10, w * 0.22, h * 0.18, w * 0.78);
    sun.addColorStop(0, 'rgba(255, 226, 198, 0.36)');
    sun.addColorStop(0.55, 'rgba(255, 196, 178, 0.14)');
    sun.addColorStop(1, 'rgba(255, 172, 185, 0.16)');
    dstCtx.fillStyle = sun;
    dstCtx.fillRect(0, 0, w, h);
    return;
  }

  if (filterId === 'fairydust') {
    for (let i = 0; i < len; i += 4) {
      data[i] = LUT_FAIRY_R[sData[i]];
      data[i + 1] = LUT_FAIRY_G[sData[i + 1]];
      data[i + 2] = LUT_FAIRY_B[sData[i + 2]];
      data[i + 3] = 255;
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
    dstCtx.drawImage(getFairyOverlayCanvas(w, h), 0, 0);
    return;
  }

  if (filterId === 'y2k') {
    for (let i = 0; i < len; i += 4) {
      const grain = ((i * 2654435761) & 15) - 7;
      data[i] = LUT_Y2K_R[sData[i]] + grain;
      data[i + 1] = LUT_Y2K_G[sData[i + 1]] + grain;
      data[i + 2] = LUT_Y2K_B[sData[i + 2]] + grain;
      data[i + 3] = 255;
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
    const vig = dstCtx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.78);
    vig.addColorStop(0, 'rgba(255, 240, 220, 0.06)');
    vig.addColorStop(1, 'rgba(42, 19, 36, 0.28)');
    dstCtx.fillStyle = vig;
    dstCtx.fillRect(0, 0, w, h);

    dstCtx.save();
    dstCtx.font = `bold ${Math.round(w * 0.048)}px monospace`;
    dstCtx.textAlign = 'right';
    dstCtx.fillStyle = 'rgba(255, 88, 120, 0.6)';
    dstCtx.fillText("'26 11 15", w - 15, h - 15);
    dstCtx.fillStyle = '#FF8A5B';
    dstCtx.fillText("'26 11 15", w - 16, h - 16);
    dstCtx.restore();
    return;
  }

  if (filterId === 'bw') {
    for (let i = 0; i < len; i += 4) {
      const lum = 0.299 * sData[i] + 0.587 * sData[i + 1] + 0.114 * sData[i + 2];
      const c = (lum - 128) * 1.24 + 130;
      data[i] = c;
      data[i + 1] = c;
      data[i + 2] = c;
      data[i + 3] = 255;
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
    return;
  }

  if (filterId === 'glitch') {
    const shift = Math.max(6, Math.round(w * 0.025));
    for (let y = 0; y < h; y++) {
      const rowJitter = y % 28 < 4 ? (y % 8 === 0 ? 10 : -8) : 0;
      const rowOffset = y * w;
      const scan = y % 4 === 0 ? 0.85 : 1;
      for (let x = 0; x < w; x++) {
        const rx = Math.min(w - 1, Math.max(0, x + shift + rowJitter));
        const gx = Math.min(w - 1, Math.max(0, x + rowJitter));
        const bx = Math.min(w - 1, Math.max(0, x - shift + rowJitter));
        const di = (rowOffset + x) * 4;
        data[di] = sData[(rowOffset + rx) * 4] * scan;
        data[di + 1] = sData[(rowOffset + gx) * 4 + 1] * scan;
        data[di + 2] = sData[(rowOffset + bx) * 4 + 2] * scan;
        data[di + 3] = 255;
      }
    }
    dstCtx.putImageData(cachedOutImage, 0, 0);
  }
}

/**
 * Draws the Polaroid Frame background onto a target rect (for Polaroid PNG export)
 */
export function drawPolaroidFrameBackground(
  ctx: CanvasRenderingContext2D,
  frameStyle: FrameStyleId,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.shadowColor = 'rgba(212, 88, 135, 0.28)';
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 20;

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);

  if (frameStyle === 'classic') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  } else if (frameStyle === 'blush') {
    ctx.fillStyle = '#FFE3EE';
    ctx.fill();
  } else if (frameStyle === 'y2kblack') {
    ctx.fillStyle = '#1E131B';
    ctx.fill();
  } else if (frameStyle === 'holo') {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#FFE3EE');
    g.addColorStop(0.5, '#F5E6FF');
    g.addColorStop(1, '#FFF7DC');
    ctx.fillStyle = g;
    ctx.fill();
  } else {
    ctx.fillStyle = '#FFFDF9';
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);
  ctx.clip();

  if (frameStyle === 'gingham') {
    const cell = 42;
    ctx.fillStyle = 'rgba(255, 194, 216, 0.38)';
    for (let row = 0; row * cell < h; row++) {
      for (let col = 0; col * cell < w; col++) {
        if (row % 2 === 0 || col % 2 === 0) {
          ctx.fillRect(x + col * cell, y + row * cell, cell, cell);
        }
      }
    }
  } else if (frameStyle === 'polka') {
    ctx.fillStyle = 'rgba(235, 124, 164, 0.32)';
    const step = 64;
    for (let py = y + 24; py < y + h; py += step) {
      for (let px = x + 24; px < x + w; px += step) {
        const offset = Math.floor((py - y) / step) % 2 === 0 ? 0 : step / 2;
        ctx.beginPath();
        ctx.arc(px + offset, py, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/**
 * Exports full 1080x1920 9:16 Polaroid PNG with filtered photo, placed emojis, frame style & stickers
 */
export function exportIgStoryPng(params: {
  filteredPhoto: HTMLCanvasElement;
  frameStyle: FrameStyleId;
  stickers: StickerId[];
  placedEmojis: PlacedEmoji[];
}) {
  const { filteredPhoto, frameStyle, stickers, placedEmojis } = params;
  const story = document.createElement('canvas');
  story.width = 1080;
  story.height = 1920;
  const ctx = story.getContext('2d');
  if (!ctx) return;

  const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
  bg.addColorStop(0, '#FFF5F9');
  bg.addColorStop(0.5, '#FFE3EE');
  bg.addColorStop(1, '#FFC2D8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  [
    [180, 260, 130],
    [920, 400, 160],
    [160, 1520, 140],
    [900, 1660, 120],
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#D45887';
  ctx.font = '600 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('happy 15th birthday, Thenumi! 🎀', 540, 220);

  const frameX = 120;
  const frameY = 300;
  const frameW = 840;
  const frameH = 1170;
  drawPolaroidFrameBackground(ctx, frameStyle, frameX, frameY, frameW, frameH);

  const pX = frameX + 40;
  const pY = frameY + 40;
  const pW = 760;
  const pH = 950;
  ctx.drawImage(filteredPhoto, pX, pY, pW, pH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(pX, pY, pW, pH);
  ctx.clip();
  ctx.translate(pX, pY);

  for (const item of placedEmojis) {
    const ex = (item.xPct / 100) * pW;
    const ey = (item.yPct / 100) * pH;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.font = `${Math.round(78 * item.scale)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, 0, 0);
    ctx.restore();
  }
  ctx.restore();

  ctx.strokeStyle = frameStyle === 'y2kblack' ? 'rgba(255,194,216,0.4)' : 'rgba(255,194,216,0.75)';
  ctx.lineWidth = 3;
  ctx.strokeRect(pX, pY, pW, pH);

  const isDarkFrame = frameStyle === 'y2kblack';
  ctx.fillStyle = isDarkFrame ? '#FFE3EE' : '#4A2334';
  ctx.font = 'italic 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Happy Birthday Thenumi ✨', 540, frameY + 1075);

  ctx.fillStyle = isDarkFrame ? '#FF9EC2' : '#EB7CA4';
  ctx.font = '600 26px sans-serif';
  ctx.fillText('NOV 15 · BIRTHDAY EDITION', 540, frameY + 1125);

  ctx.font = '74px serif';
  if (stickers.includes('bows')) {
    ctx.fillText('🎀', frameX + 58, frameY + 66);
    ctx.fillText('🎀', frameX + frameW - 58, frameY + frameH - 42);
  }
  if (stickers.includes('sparkles')) {
    ctx.fillText('✨', frameX + frameW - 58, frameY + 72);
    ctx.fillText('✨', frameX + 64, frameY + frameH - 48);
  }
  if (stickers.includes('15th')) {
    ctx.save();
    ctx.translate(frameX + frameW - 95, frameY + 130);
    ctx.rotate(0.14);
    ctx.fillStyle = '#FFE3EE';
    ctx.strokeStyle = '#EB7CA4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-78, -32, 156, 64, 32);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#D45887';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎂 15th', 0, 2);
    ctx.restore();
  }
  if (stickers.includes('iconic')) {
    ctx.save();
    ctx.translate(frameX + 108, frameY + frameH - 135);
    ctx.rotate(-0.12);
    ctx.fillStyle = '#FFF7FA';
    ctx.strokeStyle = '#FFC2D8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-84, -30, 168, 60, 30);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#D45887';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🤍 iconic', 0, 2);
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(74, 35, 52, 0.55)';
  ctx.font = '600 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('happy 15th, Thenumi 🎀✨', 540, 1815);

  const link = document.createElement('a');
  link.download = '15th-birthday-polaroid-story.png';
  link.href = story.toDataURL('image/png');
  link.click();
}
