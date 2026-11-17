import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollContextValue {
  scrollTo: (target: string | number) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  scrollTo: (target) => {
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  },
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export const SmoothScrollProvider: React.FC<{
  children: React.ReactNode;
  prefersReducedMotion?: boolean;
  onGlobalScroll?: (progress: number) => void;
}> = ({ children, prefersReducedMotion = false, onGlobalScroll }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const callbackRef = useRef(onGlobalScroll);
  callbackRef.current = onGlobalScroll;

  useEffect(() => {
    if (prefersReducedMotion) {
      const onScrollFallback = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        callbackRef.current?.(window.scrollY / max);
      };
      window.addEventListener('scroll', onScrollFallback, { passive: true });
      return () => window.removeEventListener('scroll', onScrollFallback);
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.3,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e: { progress?: number }) => {
      ScrollTrigger.update();
      if (typeof e.progress === 'number') {
        callbackRef.current?.(e.progress);
      }
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [prefersReducedMotion]);

  const scrollTo = (target: string | number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.45 });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
