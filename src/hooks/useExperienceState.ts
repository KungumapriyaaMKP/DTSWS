import { useEffect, useState } from 'react';

export interface ExperienceCapabilities {
  webglSupported: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  dpr: [number, number];
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function useExperienceCapabilities(): ExperienceCapabilities {
  const [caps, setCaps] = useState<ExperienceCapabilities>(() => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const prefersReducedMotion =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    return {
      webglSupported: typeof window !== 'undefined' ? detectWebGL() : true,
      isMobile,
      prefersReducedMotion,
      dpr: isMobile ? [1, 1.25] : [1, 1.85],
    };
  });

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const mobile = window.innerWidth < 768;
      setCaps({
        webglSupported: detectWebGL(),
        isMobile: mobile,
        prefersReducedMotion: mqMotion.matches,
        dpr: mobile ? [1, 1.25] : [1, 1.85],
      });
    };
    window.addEventListener('resize', update);
    mqMotion.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      mqMotion.removeEventListener('change', update);
    };
  }, []);

  return caps;
}
