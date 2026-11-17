import * as THREE from 'three';

export interface BatTextureBundle {
  bladeMap: THREE.CanvasTexture;
  bladeRoughness: THREE.CanvasTexture;
  bladeBump: THREE.CanvasTexture;
  gripMap: THREE.CanvasTexture;
  gripBump: THREE.CanvasTexture;
  dispose: () => void;
}

/**
 * Generates a realistic lofted 3D English-willow cricket bat blade with:
 * - Rounded arched toe silhouette (no square box corners)
 * - Pronounced mid-lower sweet-spot swell & high triangular V-spine back
 * - Convex pressed striking face & graceful shoulder taper into handle splice
 */
export function createRealisticWillowBladeGeometry(): THREE.BufferGeometry {
  const rings = 44;
  const segs = 36;
  const height = 0.96;
  const yStart = -0.64; // Toe bottom at y = -0.64, shoulder top at y = +0.32

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rings; r++) {
    const v = r / rings; // 0 = toe bottom, 1 = shoulder neck
    const y = yStart + v * height;

    // 1. Half-width profile: curved arched toe -> full wide blade -> concave scoop shoulders
    let halfW: number;
    if (v < 0.08) {
      const t = v / 0.08;
      halfW = 0.045 + 0.145 * Math.sin((t * Math.PI) / 2);
    } else if (v < 0.80) {
      const midT = (v - 0.08) / 0.72;
      halfW = 0.19 + 0.012 * Math.sin(midT * Math.PI);
    } else {
      const topT = (v - 0.80) / 0.20;
      const smooth = topT * topT * (3 - 2 * topT);
      halfW = THREE.MathUtils.lerp(0.19, 0.052, smooth);
    }

    // 2. Thickness profile: muscular sweet-spot swell peaking at ~38% up from toe
    const swell = Math.exp(-Math.pow((v - 0.36) / 0.34, 2));
    const taperTop = v > 0.78 ? 1 - ((v - 0.78) / 0.22) * 0.55 : 1;
    const spineDepth = (0.045 + 0.088 * swell) * taperTop;
    const edgeThickness = (0.018 + 0.024 * swell) * (v < 0.06 ? 0.65 + (v / 0.06) * 0.35 : taperTop);

    // Subtle classic pressed bow curve pushing sweet-spot face slightly forward
    const pressedBow = 0.016 * Math.sin(v * Math.PI);

    for (let s = 0; s <= segs; s++) {
      const frac = s / segs;
      const angle = frac * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const x = halfW * cosA;
      let z: number;

      if (sinA >= 0) {
        // Front pressing face (subtle convex sweet-spot curve toward +Z, flat-ish face with rounded bevel edges)
        const centerFactor = Math.pow(sinA, 0.38);
        z = pressedBow + edgeThickness * 0.45 + centerFactor * 0.012;
      } else {
        // Back V-spine ridge profile toward -Z
        const backDepthSin = -sinA; // 0 at edge, 1 at center spine
        const ridgeCurve = Math.pow(backDepthSin, 1.35);
        z = pressedBow + edgeThickness * 0.45 - edgeThickness * (0.9 * (1 - ridgeCurve)) - spineDepth * ridgeCurve;
      }

      positions.push(x, y, z);

      // Dual-region UV: left half [0.02..0.48] = Front Face, right half [0.52..0.98] = Back V-Spine
      const edgeXNorm = Math.min(1, Math.max(-1, cosA)) * 0.5 + 0.5;
      const u = sinA >= 0 ? 0.02 + edgeXNorm * 0.46 : 0.52 + (1 - edgeXNorm) * 0.46;
      uvs.push(u, v);
    }
  }

  const stride = segs + 1;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segs; s++) {
      const i00 = r * stride + s;
      const i10 = (r + 1) * stride + s;
      const i01 = r * stride + (s + 1);
      const i11 = (r + 1) * stride + (s + 1);

      indices.push(i00, i10, i01);
      indices.push(i10, i11, i01);
    }
  }

  // Close bottom toe cap cleanly with outward -Y winding
  const toeCenterIdx = positions.length / 3;
  positions.push(0, yStart, 0);
  uvs.push(0.25, 0);
  for (let s = 0; s < segs; s++) {
    indices.push(toeCenterIdx, s, s + 1);
  }

  // Close top neck cap cleanly with outward +Y winding
  const topRingStart = rings * stride;
  const topCenterIdx = positions.length / 3;
  positions.push(0, yStart + height, 0);
  uvs.push(0.25, 1);
  for (let s = 0; s < segs; s++) {
    indices.push(topCenterIdx, topRingStart + s + 1, topRingStart + s);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates high-res PBR texture maps (Color + Roughness + Bump) for both
 * the pressed English-willow blade (with minimalist MS Dhoni 07 decals) and diamond-knurled grip.
 */
export function createCricketBatTextures(): BatTextureBundle {
  const size = 1024;

  // 1. Color Map (Left half = Front willow face, Right half = Back V-spine)
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  // Base vertical heartwood-to-sapwood willow tone across both halves
  const paintWillowHalf = (xOffset: number, w: number, isBack: boolean) => {
    const grad = ctx.createLinearGradient(xOffset, 0, xOffset + w, 0);
    grad.addColorStop(0, '#c6934c'); // sapwood amber edge
    grad.addColorStop(0.22, '#e3be7e');
    grad.addColorStop(0.5, isBack ? '#e8ca91' : '#f1dab0'); // creamy blonde Grade-1A heartwood center
    grad.addColorStop(0.78, '#e3be7e');
    grad.addColorStop(1, '#c6934c'); // matching outer edge for seamless UV wrap
    ctx.fillStyle = grad;
    ctx.fillRect(xOffset, 0, w, size);

    // Fine straight vertical English-willow grain lines + subtle growth variation
    for (let i = 0; i < 92; i++) {
      const gx = xOffset + (i / 92) * w + (Math.random() - 0.5) * 2.5;
      const isDarkFiber = i % 5 === 0 || i % 7 === 0;
      ctx.strokeStyle = isDarkFiber
        ? `rgba(128, 78, 28, ${0.14 + Math.random() * 0.14})`
        : 'rgba(255, 248, 228, 0.22)';
      ctx.lineWidth = isDarkFiber ? 1.1 + Math.random() * 1.4 : 1.0;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      const drift1 = (Math.random() - 0.5) * 6;
      const drift2 = (Math.random() - 0.5) * 6;
      ctx.bezierCurveTo(gx + drift1, 320, gx + drift2, 680, gx + (Math.random() - 0.5) * 3, size);
      ctx.stroke();
    }

    // Fine horizontal wood-cell micro-sheen
    ctx.fillStyle = 'rgba(130, 80, 30, 0.025)';
    for (let y = 0; y < size; y += 6) {
      ctx.fillRect(xOffset, y, w, 1);
    }
  };

  paintWillowHalf(0, 512, false);
  paintWillowHalf(512, 512, true);

  // Subtle dark toe guard & splice collar stain (Canvas y=size is bottom v=0, y=0 is top v=1)
  const toeGrad = ctx.createLinearGradient(0, size - 70, 0, size);
  toeGrad.addColorStop(0, 'rgba(18, 20, 26, 0)');
  toeGrad.addColorStop(0.35, 'rgba(18, 20, 26, 0.92)');
  toeGrad.addColorStop(1, '#111319');
  ctx.fillStyle = toeGrad;
  ctx.fillRect(0, size - 65, size, 65);

  // Top shoulder dark twine whipping band (canvas top y = 0..76)
  ctx.fillStyle = '#14171f';
  ctx.fillRect(0, 0, size, 68);
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(0, 56, size, 12);

  // Front Face Minimalist Pro Player Sticker (on Left Half around upper-mid x=256, y=250..560)
  // Note: Canvas top y=0 maps to v=1 (shoulder), y=1024 maps to v=0 (toe)
  ctx.save();
  ctx.fillStyle = '#0f1219';
  ctx.beginPath();
  ctx.moveTo(156, 220);
  ctx.lineTo(356, 220);
  ctx.lineTo(334, 495);
  ctx.lineTo(256, 540);
  ctx.lineTo(178, 495);
  ctx.closePath();
  ctx.fill();

  // Bright Championship Yellow & Gold foil border accents on Front Sticker
  ctx.strokeStyle = '#ffd60a';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Inner geometric speed chevrons
  ctx.fillStyle = '#ffd60a';
  ctx.beginPath();
  ctx.moveTo(186, 250);
  ctx.lineTo(326, 250);
  ctx.lineTo(318, 286);
  ctx.lineTo(194, 286);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0b0d12';
  ctx.font = '700 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAPTAIN COOL', 256, 275);

  ctx.fillStyle = '#ffd60a';
  ctx.font = '700 94px Georgia, serif';
  ctx.fillText('07', 256, 396);

  ctx.fillStyle = '#f8f2e4';
  ctx.font = '600 20px monospace';
  ctx.fillText('ENGLISH WILLOW', 256, 442);

  ctx.fillStyle = '#e5a900';
  ctx.fillRect(216, 466, 80, 4);
  ctx.restore();

  // Back V-Spine Crown Decals (Centered on x=768, streaking up & down the spine peak!)
  ctx.save();
  const spineGrad = ctx.createLinearGradient(730, 140, 806, 780);
  spineGrad.addColorStop(0, '#0f1219');
  spineGrad.addColorStop(0.5, '#191d28');
  spineGrad.addColorStop(1, '#0b0d12');
  ctx.fillStyle = spineGrad;
  ctx.beginPath();
  ctx.moveTo(712, 160);
  ctx.lineTo(824, 160);
  ctx.lineTo(806, 700);
  ctx.lineTo(768, 760);
  ctx.lineTo(730, 700);
  ctx.closePath();
  ctx.fill();

  // Gold foil spine pinstripe down center crest
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(760, 175, 16, 555);
  ctx.fillStyle = '#0b0d12';
  ctx.font = '700 26px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd60a';
  ctx.fillText('07', 768, 138);
  ctx.restore();

  // 2. Roughness Map (polished clearcoated wood ~0.30, glossy metallic sticker foil ~0.16, matte rubber toe/grip ~0.85)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#525252'; // satin polished willow wood (~0.32 roughness)
  rCtx.fillRect(0, 0, size, size);
  rCtx.fillStyle = '#282828'; // glossy stickers (~0.16)
  rCtx.fillRect(156, 220, 200, 320);
  rCtx.fillRect(712, 160, 112, 600);
  rCtx.fillStyle = '#dcdcdc'; // matte toe guard & twine collar
  rCtx.fillRect(0, size - 65, size, 65);
  rCtx.fillRect(0, 0, size, 68);

  // 3. Bump Map (willow fibers + twine winding grooves + raised foil stickers)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < 120; i++) {
    const x = (i / 120) * size;
    bCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    bCtx.fillRect(x, 68, 2, size - 133);
  }
  // Raised twine ridges along shoulder whipping
  for (let y = 0; y < 68; y += 6) {
    bCtx.fillStyle = y % 12 === 0 ? '#b8b8b8' : '#585858';
    bCtx.fillRect(0, y, size, 3);
  }
  // Subtle embossed sticker edge
  bCtx.fillStyle = '#9e9e9e';
  bCtx.fillRect(156, 220, 200, 320);
  bCtx.fillRect(712, 160, 112, 600);

  // 4. Diamond-Knurled Pro Rubber Grip Map + Bump Map
  const gripSize = 512;
  const gripCanvas = document.createElement('canvas');
  gripCanvas.width = gripSize;
  gripCanvas.height = gripSize;
  const gCtx = gripCanvas.getContext('2d')!;
  gCtx.fillStyle = '#14161e';
  gCtx.fillRect(0, 0, gripSize, gripSize);

  // Classic MS Dhoni bright Championship Yellow spiral/rings across black grip
  [70, 190, 320, 420].forEach((gy) => {
    gCtx.fillStyle = '#ffd60a';
    gCtx.fillRect(0, gy, gripSize, 26);
    gCtx.fillStyle = 'rgba(11,13,18,0.35)';
    gCtx.fillRect(0, gy + 22, gripSize, 4);
  });

  const gripBumpCanvas = document.createElement('canvas');
  gripBumpCanvas.width = gripSize;
  gripBumpCanvas.height = gripSize;
  const gbCtx = gripBumpCanvas.getContext('2d')!;
  gbCtx.fillStyle = '#686868';
  gbCtx.fillRect(0, 0, gripSize, gripSize);
  gbCtx.fillStyle = '#c8c8c8';
  const step = 16;
  for (let y = 0; y < gripSize; y += step) {
    for (let x = 0; x < gripSize; x += step) {
      gbCtx.beginPath();
      gbCtx.moveTo(x + step * 0.5, y + 2);
      gbCtx.lineTo(x + step - 2, y + step * 0.5);
      gbCtx.lineTo(x + step * 0.5, y + step - 2);
      gbCtx.lineTo(x + 2, y + step * 0.5);
      gbCtx.closePath();
      gbCtx.fill();
    }
  }

  const makeTex = (canvas: HTMLCanvasElement, isColor: boolean, repeatWrap = false) => {
    const tex = new THREE.CanvasTexture(canvas);
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    if (repeatWrap) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    }
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  };

  const bladeMap = makeTex(colorCanvas, true);
  const bladeRoughness = makeTex(roughCanvas, false);
  const bladeBump = makeTex(bumpCanvas, false);
  const gripMap = makeTex(gripCanvas, true, true);
  const gripBump = makeTex(gripBumpCanvas, false, true);

  return {
    bladeMap,
    bladeRoughness,
    bladeBump,
    gripMap,
    gripBump,
    dispose: () => {
      bladeMap.dispose();
      bladeRoughness.dispose();
      bladeBump.dispose();
      gripMap.dispose();
      gripBump.dispose();
    },
  };
}
