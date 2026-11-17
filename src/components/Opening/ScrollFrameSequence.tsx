import React, { useEffect, useRef, useState } from 'react';

interface ScrollFrameSequenceProps {
  /** Base folder containing frame_0001.webp .. frame_0NNN.webp */
  frameBasePath?: string;
  /** Total extracted frame count */
  frameCount?: number;
  /** Mutable progress ref (0..1) to drive scrubbing with zero React re-renders */
  progressRef?: React.MutableRefObject<number>;
  /** Static fallback progress (0..1) if progressRef is not provided */
  progress?: number;
  /** Defer downloading frames until sequence nears viewport */
  deferUntilNear?: boolean;
  /** Callback fired once initial keyframes are decoded */
  onReady?: () => void;
  /** Respect reduced motion */
  prefersReducedMotion?: boolean;
}

export const ScrollFrameSequence: React.FC<ScrollFrameSequenceProps> = ({
  frameBasePath = '/assets/frames/opening',
  frameCount = 240,
  progressRef,
  progress = 0,
  deferUntilNear = false,
  onReady,
  prefersReducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(Array(frameCount).fill(null));
  const loadedRef = useRef<boolean[]>(Array(frameCount).fill(false));
  const propProgressRef = useRef(progress);
  propProgressRef.current = progress;
  const currentFrameRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const isVisibleRef = useRef(true);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const readyFiredRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const [shouldLoad, setShouldLoad] = useState(!deferUntilNear);

  // Reset storage arrays if sequence source changes
  useEffect(() => {
    framesRef.current = Array(frameCount).fill(null);
    loadedRef.current = Array(frameCount).fill(false);
    lastDrawnRef.current = -1;
    readyFiredRef.current = false;
  }, [frameBasePath, frameCount]);

  useEffect(() => {
    if (!deferUntilNear) {
      setShouldLoad(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '2600px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [deferUntilNear]);

  // Subtle GPU parallax directly in ref without React re-renders
  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouseTargetRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTargetRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [prefersReducedMotion]);

  // Two-wave progressive preloader: Wave 1 keyframes immediately, Wave 2 all remaining frames
  useEffect(() => {
    if (!shouldLoad) return;
    let cancelled = false;

    const frameUrl = (idx: number) =>
      `${frameBasePath}/frame_${String(idx + 1).padStart(4, '0')}.webp`;

    const loadFrame = (index: number): Promise<void> =>
      new Promise((resolve) => {
        if (loadedRef.current[index]) {
          resolve();
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.src = frameUrl(index);

        const markDone = () => {
          if (cancelled) return;
          framesRef.current[index] = img;
          loadedRef.current[index] = true;
          resolve();
        };

        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(markDone).catch(markDone);
          } else {
            markDone();
          }
        };
        img.onerror = () => resolve();
      });

    const runPreload = async () => {
      // 1. Paint the very first frame immediately with zero bandwidth competition
      await loadFrame(0);
      if (cancelled) return;

      // 2. Buffer the immediate opening glide frames + notify ready early
      const leadIndices = [1, 2, 3, 4, 6, 8, 12, 16].filter((idx) => idx < frameCount);
      await Promise.all(leadIndices.map(loadFrame));
      if (!cancelled && !readyFiredRef.current) {
        readyFiredRef.current = true;
        onReadyRef.current?.();
      }

      // 3. Spread coarse scrub keyframes evenly across the whole sequence
      const keyframeIndices: number[] = [];
      for (let i = 20; i < frameCount; i += 8) {
        if (!loadedRef.current[i]) keyframeIndices.push(i);
      }
      if (!loadedRef.current[frameCount - 1]) {
        keyframeIndices.push(frameCount - 1);
      }
      for (let i = 0; i < keyframeIndices.length; i += 6) {
        if (cancelled) break;
        await Promise.all(keyframeIndices.slice(i, i + 6).map(loadFrame));
      }

      // 4. Fill remaining dense frames sorted dynamically around the active playhead
      const batchSize = 4;
      while (!cancelled) {
        const rawProg = progressRef ? progressRef.current : propProgressRef.current;
        const anchor = Math.round(Math.min(1, Math.max(0, rawProg)) * (frameCount - 1));
        const remaining: number[] = [];
        for (let i = 0; i < frameCount; i++) {
          if (!loadedRef.current[i]) remaining.push(i);
        }
        if (remaining.length === 0) break;

        remaining.sort((a, b) => Math.abs(a - anchor) - Math.abs(b - anchor));
        const slice = remaining.slice(0, batchSize);
        await Promise.all(slice.map(loadFrame));
      }
    };

    runPreload();

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, frameBasePath, frameCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawnRef.current = -1;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const findNearestLoaded = (targetIdx: number): number => {
      if (loadedRef.current[targetIdx]) return targetIdx;
      for (let offset = 1; offset < frameCount; offset++) {
        const forward = targetIdx + offset;
        if (forward < frameCount && loadedRef.current[forward]) return forward;
        const backward = targetIdx - offset;
        if (backward >= 0 && loadedRef.current[backward]) return backward;
      }
      return -1;
    };

    const drawCoverImage = (img: HTMLImageElement, alpha = 1) => {
      const iw = img.naturalWidth || 1920;
      const ih = img.naturalHeight || 1080;
      const scale = Math.max(width / iw, height / ih) * 1.02;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (width - dw) * 0.5;
      const dy = (height - dh) * 0.5;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    let rafId = 0;

    const tick = () => {
      if (!isVisibleRef.current) {
        rafId = 0;
        return;
      }

      const rawProg = progressRef ? progressRef.current : propProgressRef.current;
      const clamped = Math.min(1, Math.max(0, rawProg));
      const targetFrame = clamped * (frameCount - 1);

      if (prefersReducedMotion) {
        currentFrameRef.current = targetFrame;
      } else {
        const diff = targetFrame - currentFrameRef.current;
        if (Math.abs(diff) > 0.015) {
          currentFrameRef.current += diff * 0.3;
        } else {
          currentFrameRef.current = targetFrame;
        }
      }

      if (!prefersReducedMotion && stageRef.current) {
        const mc = mouseCurrentRef.current;
        const mt = mouseTargetRef.current;
        const dx = mt.x - mc.x;
        const dy = mt.y - mc.y;
        if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
          mc.x += dx * 0.1;
          mc.y += dy * 0.1;
          stageRef.current.style.transform = `translate3d(${(mc.x * -10).toFixed(2)}px, ${(mc.y * -6).toFixed(2)}px, 0) scale(1.03)`;
        }
      }

      const f = Math.min(frameCount - 1, Math.max(0, currentFrameRef.current));
      const baseIdx = Math.floor(f);
      const nextIdx = Math.min(frameCount - 1, baseIdx + 1);
      const frac = f - baseIdx;

      const resolvedBase = findNearestLoaded(baseIdx);
      const resolvedNext = findNearestLoaded(nextIdx);
      const isScrubbingFast = Math.abs(targetFrame - currentFrameRef.current) > 1.8;

      const stateSignature =
        resolvedBase +
        (isScrubbingFast ? 0 : frac * 0.99) +
        (resolvedNext >= 0 ? 0.001 : 0);

      if (resolvedBase >= 0 && Math.abs(stateSignature - lastDrawnRef.current) > 0.004) {
        const baseImg = framesRef.current[resolvedBase];
        if (baseImg) {
          drawCoverImage(baseImg, 1);

          if (
            !isScrubbingFast &&
            resolvedNext !== resolvedBase &&
            resolvedNext === baseIdx + 1 &&
            frac > 0.12 &&
            frac < 0.88
          ) {
            const nextImg = framesRef.current[resolvedNext];
            if (nextImg) {
              drawCoverImage(nextImg, frac);
            }
          }
          ctx.globalAlpha = 1;
          lastDrawnRef.current = stateSignature;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId && isVisibleRef.current) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const visObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startLoop();
        }
      },
      { rootMargin: '250px 0px' }
    );
    visObserver.observe(container);
    startLoop();

    return () => {
      visObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [frameCount, frameBasePath, progressRef, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden bg-[#040507]">
      <div
        ref={stageRef}
        className="h-full w-full will-change-transform"
        style={prefersReducedMotion ? undefined : { transform: 'scale(1.03)' }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
};
