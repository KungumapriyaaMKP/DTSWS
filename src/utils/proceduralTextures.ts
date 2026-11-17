import * as THREE from 'three';

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');
  return [canvas, ctx];
}

export interface PBRTextureSet {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

/**
 * Generates a realistic 22-yard cricket pitch texture with creases,
 * rolled dry clay micro-grain, and subtle bowler landing wear.
 */
export function createPitchTextures(): PBRTextureSet {
  const w = 512;
  const h = 1024;
  const [albedoCanvas, aCtx] = makeCanvas(w, h);
  const [roughCanvas, rCtx] = makeCanvas(w, h);
  const [bumpCanvas, bCtx] = makeCanvas(w, h);

  // Base rolled dry clay tone
  const baseGrad = aCtx.createLinearGradient(0, 0, w, 0);
  baseGrad.addColorStop(0, '#5a5543');
  baseGrad.addColorStop(0.12, '#7d705a');
  baseGrad.addColorStop(0.5, '#8f8067');
  baseGrad.addColorStop(0.88, '#7c6f59');
  baseGrad.addColorStop(1, '#585341');
  aCtx.fillStyle = baseGrad;
  aCtx.fillRect(0, 0, w, h);

  // Roughness base (very matte dry soil ~0.88)
  rCtx.fillStyle = '#e0e0e0';
  rCtx.fillRect(0, 0, w, h);

  // Bump base
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);

  // Fine mineral grain & dried clay cracks
  for (let i = 0; i < 16000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const size = 0.8 + Math.random() * 2.2;
    const v = Math.random();
    aCtx.fillStyle = v > 0.5 ? 'rgba(210,192,160,0.06)' : 'rgba(35,30,22,0.08)';
    aCtx.fillRect(x, y, size, size);

    const bVal = Math.floor(110 + (Math.random() - 0.5) * 60);
    bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.fillRect(x, y, size, size);
  }

  // Subtle footmark scuff patches near both bowling/popping creases
  const drawWearZone = (cx: number, cy: number, rx: number, ry: number) => {
    const grad = aCtx.createRadialGradient(cx, cy, 4, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, 'rgba(54,47,36,0.38)');
    grad.addColorStop(0.6, 'rgba(65,57,44,0.16)');
    grad.addColorStop(1, 'rgba(65,57,44,0)');
    aCtx.fillStyle = grad;
    aCtx.beginPath();
    aCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    aCtx.fill();

    const rGrad = rCtx.createRadialGradient(cx, cy, 4, cx, cy, Math.max(rx, ry));
    rGrad.addColorStop(0, 'rgba(255,255,255,0.45)');
    rGrad.addColorStop(1, 'rgba(255,255,255,0)');
    rCtx.fillStyle = rGrad;
    rCtx.beginPath();
    rCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    rCtx.fill();
  };

  drawWearZone(w * 0.37, h * 0.14, 34, 65);
  drawWearZone(w * 0.63, h * 0.86, 34, 65);

  // Subtle dried grass tufts at extreme pitch flanks
  for (let i = 0; i < 2400; i++) {
    const side = Math.random() > 0.5 ? Math.random() * 44 : w - Math.random() * 44;
    const y = Math.random() * h;
    aCtx.fillStyle = 'rgba(42, 62, 34, 0.25)';
    aCtx.fillRect(side, y, 2, 5);
  }

  // Official White Crease Markings (subtle chalk-painted look)
  const drawChalkLine = (x1: number, y1: number, x2: number, y2: number, lw = 4) => {
    aCtx.strokeStyle = 'rgba(244, 240, 232, 0.78)';
    aCtx.lineWidth = lw;
    aCtx.beginPath();
    aCtx.moveTo(x1, y1);
    aCtx.lineTo(x2, y2);
    aCtx.stroke();
  };

  const topBowlingY = h * 0.095;
  const topPoppingY = h * 0.155;
  const botBowlingY = h * 0.905;
  const botPoppingY = h * 0.845;
  const retLeftX = w * 0.27;
  const retRightX = w * 0.73;

  // Top end creases
  drawChalkLine(w * 0.18, topBowlingY, w * 0.82, topBowlingY, 3.5);
  drawChalkLine(w * 0.08, topPoppingY, w * 0.92, topPoppingY, 4);
  drawChalkLine(retLeftX, topBowlingY - 36, retLeftX, topPoppingY, 3.5);
  drawChalkLine(retRightX, topBowlingY - 36, retRightX, topPoppingY, 3.5);

  // Bottom end creases
  drawChalkLine(w * 0.18, botBowlingY, w * 0.82, botBowlingY, 3.5);
  drawChalkLine(w * 0.08, botPoppingY, w * 0.92, botPoppingY, 4);
  drawChalkLine(retLeftX, botPoppingY, retLeftX, botBowlingY + 36, 3.5);
  drawChalkLine(retRightX, botPoppingY, retRightX, botBowlingY + 36, 3.5);

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);

  return { map, roughnessMap, bumpMap };
}

/**
 * Generates realistic night-stadium mowed turf textures with subtle dew variation.
 */
export function createOutfieldTextures(): PBRTextureSet {
  const size = 1024;
  const [albedoCanvas, aCtx] = makeCanvas(size, size);
  const [roughCanvas, rCtx] = makeCanvas(size, size);
  const [bumpCanvas, bCtx] = makeCanvas(size, size);

  aCtx.fillStyle = '#0c1f13';
  aCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#b8b8b8';
  rCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Subtle concentric & radial stadium mowing rings
  const cx = size / 2;
  const cy = size / 2;
  const rings = 14;
  for (let i = rings; i >= 1; i--) {
    const radius = (i / rings) * (size * 0.49);
    aCtx.fillStyle = i % 2 === 0 ? '#0e2517' : '#0a1c11';
    aCtx.beginPath();
    aCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    aCtx.fill();

    // Alternate grass nap roughness so floodlights catch mowed bands organically
    rCtx.fillStyle = i % 2 === 0 ? '#9e9e9e' : '#c6c6c6';
    rCtx.beginPath();
    rCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    rCtx.fill();
  }

  // Cross-mow linear stripes subtly blended
  aCtx.globalAlpha = 0.25;
  const stripeW = size / 24;
  for (let x = 0; x < size; x += stripeW * 2) {
    aCtx.fillStyle = '#122c1b';
    aCtx.fillRect(x, 0, stripeW, size);
  }
  aCtx.globalAlpha = 1;

  // Fine turf blade texture
  for (let i = 0; i < 24000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const tone = Math.random() > 0.5 ? 'rgba(40,86,52,0.16)' : 'rgba(4,12,7,0.22)';
    aCtx.fillStyle = tone;
    aCtx.fillRect(x, y, 1.5, 2.5);

    const b = Math.floor(105 + Math.random() * 50);
    bCtx.fillStyle = `rgb(${b},${b},${b})`;
    bCtx.fillRect(x, y, 1.5, 2.5);
  }

  // Crisp 30-yard inner circle & boundary chalk line
  aCtx.strokeStyle = 'rgba(244, 239, 230, 0.48)';
  aCtx.lineWidth = 2.2;
  aCtx.beginPath();
  aCtx.arc(cx, cy, size * 0.21, 0, Math.PI * 2);
  aCtx.stroke();

  aCtx.strokeStyle = 'rgba(249, 205, 5, 0.35)';
  aCtx.lineWidth = 3.5;
  aCtx.beginPath();
  aCtx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
  aCtx.stroke();

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);

  return { map, roughnessMap, bumpMap };
}

/**
 * Soft tapered ground shadow gradient so pitch shadows have zero rectangular edges.
 */
export function createSoftGroundShadowTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);

  // Two overlapping soft elongated ellipses tapering away from the boots
  const grad = ctx.createRadialGradient(w * 0.5, h * 0.22, 8, w * 0.5, h * 0.52, h * 0.48);
  grad.addColorStop(0, 'rgba(2, 3, 5, 0.72)');
  grad.addColorStop(0.35, 'rgba(2, 3, 5, 0.42)');
  grad.addColorStop(0.75, 'rgba(2, 3, 5, 0.14)');
  grad.addColorStop(1, 'rgba(2, 3, 5, 0)');

  ctx.save();
  ctx.translate(w * 0.5, h * 0.5);
  ctx.scale(0.65, 1.0);
  ctx.translate(-w * 0.5, -h * 0.5);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates an anatomical, cinema-grade back-facing cricketer silhouette matte
 * (deep opaque obsidian interior + crisp subtle floodlight rim highlight, zero translucency).
 */
export function createCricketerSilhouetteTexture(mode: 'standing' | 'walking'): THREE.CanvasTexture {
  const w = 1024;
  const h = 1536;
  const [canvas, ctx] = makeCanvas(w, h);
  ctx.clearRect(0, 0, w, h);

  // Helper to draw the anatomical body path once so we can fill solid AND rim-light cleanly
  const cx = w * 0.5;
  const drawBody = (offsetY = 0) => {
    // Helmet dome + peak guard
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.165 + offsetY, 54, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 48, h * 0.185 + offsetY);
    ctx.quadraticCurveTo(cx, h * 0.225 + offsetY, cx + 48, h * 0.185 + offsetY);
    ctx.lineTo(cx + 42, h * 0.214 + offsetY);
    ctx.quadraticCurveTo(cx, h * 0.242 + offsetY, cx - 42, h * 0.214 + offsetY);
    ctx.closePath();
    ctx.fill();

    // Neck & Jersey Collar
    ctx.beginPath();
    ctx.moveTo(cx - 25, h * 0.21 + offsetY);
    ctx.lineTo(cx + 25, h * 0.21 + offsetY);
    ctx.lineTo(cx + 40, h * 0.255 + offsetY);
    ctx.lineTo(cx - 40, h * 0.255 + offsetY);
    ctx.closePath();
    ctx.fill();

    // Athletic Shoulders & Tapered Jersey Torso
    ctx.beginPath();
    ctx.moveTo(cx - 40, h * 0.245 + offsetY);
    ctx.quadraticCurveTo(cx - 122, h * 0.26 + offsetY, cx - 134, h * 0.315 + offsetY);
    ctx.quadraticCurveTo(cx - 118, h * 0.42 + offsetY, cx - 94, h * 0.53 + offsetY);
    ctx.quadraticCurveTo(cx, h * 0.548 + offsetY, cx + 94, h * 0.53 + offsetY);
    ctx.quadraticCurveTo(cx + 118, h * 0.42 + offsetY, cx + 134, h * 0.315 + offsetY);
    ctx.quadraticCurveTo(cx + 122, h * 0.26 + offsetY, cx + 40, h * 0.245 + offsetY);
    ctx.closePath();
    ctx.fill();

    if (mode === 'standing') {
      // Left arm relaxed
      ctx.beginPath();
      ctx.moveTo(cx - 124, h * 0.295 + offsetY);
      ctx.quadraticCurveTo(cx - 156, h * 0.39 + offsetY, cx - 140, h * 0.505 + offsetY);
      ctx.lineTo(cx - 112, h * 0.515 + offsetY);
      ctx.quadraticCurveTo(cx - 114, h * 0.42 + offsetY, cx - 96, h * 0.34 + offsetY);
      ctx.closePath();
      ctx.fill();

      // Right arm resting on cricket bat handle
      ctx.beginPath();
      ctx.moveTo(cx + 124, h * 0.295 + offsetY);
      ctx.quadraticCurveTo(cx + 158, h * 0.385 + offsetY, cx + 146, h * 0.515 + offsetY);
      ctx.lineTo(cx + 114, h * 0.52 + offsetY);
      ctx.quadraticCurveTo(cx + 116, h * 0.42 + offsetY, cx + 96, h * 0.34 + offsetY);
      ctx.closePath();
      ctx.fill();

      // Cricket Bat resting on pitch
      ctx.save();
      ctx.translate(cx + 136, h * 0.51 + offsetY);
      ctx.rotate(0.09);
      ctx.fillRect(-7, -12, 14, 155);
      ctx.beginPath();
      ctx.moveTo(-24, 138);
      ctx.lineTo(24, 138);
      ctx.lineTo(25, 476);
      ctx.quadraticCurveTo(0, 488, -25, 476);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Left & Right Legs with realistic batting pad taper
      ctx.beginPath();
      ctx.moveTo(cx - 92, h * 0.525 + offsetY);
      ctx.lineTo(cx - 14, h * 0.525 + offsetY);
      ctx.lineTo(cx - 24, h * 0.72 + offsetY);
      ctx.quadraticCurveTo(cx - 26, h * 0.85 + offsetY, cx - 34, h * 0.92 + offsetY);
      ctx.lineTo(cx - 86, h * 0.92 + offsetY);
      ctx.quadraticCurveTo(cx - 98, h * 0.79 + offsetY, cx - 92, h * 0.525 + offsetY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 14, h * 0.525 + offsetY);
      ctx.lineTo(cx + 92, h * 0.525 + offsetY);
      ctx.quadraticCurveTo(cx + 98, h * 0.79 + offsetY, cx + 86, h * 0.92 + offsetY);
      ctx.lineTo(cx + 34, h * 0.92 + offsetY);
      ctx.quadraticCurveTo(cx + 26, h * 0.85 + offsetY, cx + 24, h * 0.72 + offsetY);
      ctx.closePath();
      ctx.fill();

      // Boots
      ctx.beginPath();
      ctx.ellipse(cx - 60, h * 0.93 + offsetY, 36, 14, -0.06, 0, Math.PI * 2);
      ctx.ellipse(cx + 60, h * 0.93 + offsetY, 36, 14, 0.06, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Walking stride toward pavilion
      ctx.beginPath();
      ctx.moveTo(cx - 124, h * 0.295 + offsetY);
      ctx.quadraticCurveTo(cx - 150, h * 0.39 + offsetY, cx - 130, h * 0.515 + offsetY);
      ctx.lineTo(cx - 104, h * 0.518 + offsetY);
      ctx.quadraticCurveTo(cx - 110, h * 0.42 + offsetY, cx - 96, h * 0.34 + offsetY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 122, h * 0.295 + offsetY);
      ctx.quadraticCurveTo(cx + 154, h * 0.38 + offsetY, cx + 132, h * 0.485 + offsetY);
      ctx.lineTo(cx + 102, h * 0.485 + offsetY);
      ctx.quadraticCurveTo(cx + 108, h * 0.40 + offsetY, cx + 96, h * 0.34 + offsetY);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(cx + 126, h * 0.475 + offsetY);
      ctx.rotate(-0.4);
      ctx.fillRect(-7, -92, 13, 142);
      ctx.beginPath();
      ctx.moveTo(-22, 46);
      ctx.lineTo(22, 46);
      ctx.lineTo(24, 342);
      ctx.quadraticCurveTo(0, 354, -24, 342);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(cx - 90, h * 0.525 + offsetY);
      ctx.lineTo(cx - 12, h * 0.525 + offsetY);
      ctx.lineTo(cx - 34, h * 0.90 + offsetY);
      ctx.lineTo(cx - 80, h * 0.90 + offsetY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 12, h * 0.525 + offsetY);
      ctx.lineTo(cx + 90, h * 0.525 + offsetY);
      ctx.lineTo(cx + 78, h * 0.935 + offsetY);
      ctx.lineTo(cx + 28, h * 0.935 + offsetY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx - 56, h * 0.908 + offsetY, 34, 14, -0.05, 0, Math.PI * 2);
      ctx.ellipse(cx + 54, h * 0.942 + offsetY, 34, 14, 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 1. Subtle gold backlight rim halo rendered strictly behind body edge
  ctx.save();
  ctx.filter = 'blur(4px)';
  ctx.fillStyle = 'rgba(249, 205, 5, 0.42)';
  drawBody(-3);
  ctx.restore();

  // 2. Crisp opaque deep obsidian silhouette core
  ctx.fillStyle = '#040507';
  drawBody(0);

  // 3. Soft contact shadow anchor right under boots
  const footGrad = ctx.createRadialGradient(cx, h * 0.945, 8, cx, h * 0.945, 130);
  footGrad.addColorStop(0, 'rgba(0,0,0,0.68)');
  footGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = footGrad;
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.945, 130, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Whisper-subtle metallic gold "7" on the jersey back
  ctx.font = '600 84px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(229, 199, 120, 0.16)';
  ctx.fillText('7', cx, h * 0.398);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates English willow grain + sweet-spot ball markings for the 3D bat.
 */
export function createWillowTextures(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const w = 512;
  const h = 1024;
  const [canvas, ctx] = makeCanvas(w, h);
  const [rCanvas, rCtx] = makeCanvas(w, h);

  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#c8ab7d');
  grad.addColorStop(0.35, '#dec59a');
  grad.addColorStop(0.5, '#e7d0aa');
  grad.addColorStop(0.65, '#dbc093');
  grad.addColorStop(1, '#bfa171');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  rCtx.fillStyle = '#8a8a8a';
  rCtx.fillRect(0, 0, w, h);

  // Straight natural willow grain lines
  for (let i = 0; i < 22; i++) {
    const x = 22 + i * 22 + (Math.random() - 0.5) * 4;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(130, 96, 54, 0.24)' : 'rgba(150, 114, 68, 0.14)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 4, h * 0.33, x - 3, h * 0.66, x + 2, h);
    ctx.stroke();
  }

  // Subtle seasoned leather ball scuff near the sweet spot
  const scuffGrad = ctx.createRadialGradient(w * 0.52, h * 0.65, 6, w * 0.52, h * 0.65, 64);
  scuffGrad.addColorStop(0, 'rgba(128, 32, 28, 0.22)');
  scuffGrad.addColorStop(0.7, 'rgba(128, 32, 28, 0.08)');
  scuffGrad.addColorStop(1, 'rgba(128, 32, 28, 0)');
  ctx.fillStyle = scuffGrad;
  ctx.beginPath();
  ctx.arc(w * 0.52, h * 0.65, 64, 0, Math.PI * 2);
  ctx.fill();

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  return { map, roughnessMap };
}

/**
 * Honed basalt dark mineral floor texture for the 3D Trophy Room gallery.
 */
export function createBasaltFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size, size);
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = 8 + Math.floor(Math.random() * 14);
    ctx.fillStyle = `rgb(${v},${v + 1},${v + 3})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle architectural tile seams
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const pos = (i / 4) * size;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates authentic lacquered cherry-red cowhide cricket ball textures
 * with micro leather pores, seam channel, and subtle gold #07 foil stamp.
 */
export function createCricketBallTextures(): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const w = 1024;
  const h = 512;
  const [albedoCanvas, aCtx] = makeCanvas(w, h);
  const [roughCanvas, rCtx] = makeCanvas(w, h);
  const [bumpCanvas, bCtx] = makeCanvas(w, h);

  // Rich lacquered crimson-red match leather gradient
  const grad = aCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#850812');
  grad.addColorStop(0.4, '#c71120');
  grad.addColorStop(0.5, '#9d0c16');
  grad.addColorStop(0.6, '#c71120');
  grad.addColorStop(1, '#850812');
  aCtx.fillStyle = grad;
  aCtx.fillRect(0, 0, w, h);

  // Glossy lacquered base roughness (~0.24)
  rCtx.fillStyle = '#404040';
  rCtx.fillRect(0, 0, w, h);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);

  // Fine organic leather grain pores
  for (let i = 0; i < 22000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const tone = Math.random() > 0.5 ? 'rgba(255,140,140,0.04)' : 'rgba(30,2,4,0.09)';
    aCtx.fillStyle = tone;
    aCtx.fillRect(x, y, 2, 2);

    const bVal = 116 + Math.floor(Math.random() * 26);
    bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.fillRect(x, y, 2, 2);
  }

  // Subtle dark leather seam groove along equator (y = h/2)
  const seamY = h * 0.5;
  aCtx.fillStyle = '#4f090d';
  aCtx.fillRect(0, seamY - 14, w, 28);
  rCtx.fillStyle = '#b0b0b0';
  rCtx.fillRect(0, seamY - 14, w, 28);
  bCtx.fillStyle = '#505050';
  bCtx.fillRect(0, seamY - 14, w, 28);

  // Inner ridge & double-row raised twine stitch guide
  aCtx.strokeStyle = 'rgba(250, 245, 232, 0.9)';
  aCtx.lineWidth = 2.2;
  for (const dy of [-8, -3.5, 3.5, 8]) {
    aCtx.setLineDash([7, 5]);
    aCtx.beginPath();
    aCtx.moveTo(0, seamY + dy);
    aCtx.lineTo(w, seamY + dy);
    aCtx.stroke();
  }
  aCtx.setLineDash([]);

  // Subtle gold foil "07" crest embossed cleanly on upper hemisphere
  aCtx.save();
  aCtx.font = '600 44px "Cinzel", Georgia, serif';
  aCtx.textAlign = 'center';
  aCtx.fillStyle = 'rgba(255, 214, 10, 0.88)';
  aCtx.fillText('07', w * 0.25, h * 0.27);
  aCtx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  aCtx.fillStyle = 'rgba(255, 230, 120, 0.8)';
  aCtx.fillText('MATCH EDITION', w * 0.25, h * 0.315);
  aCtx.restore();

  const map = new THREE.CanvasTexture(albedoCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;

  return { map, roughnessMap, bumpMap };
}
