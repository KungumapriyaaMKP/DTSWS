import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { ScrollFrameSequence } from '../../components/Opening/ScrollFrameSequence';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';
import { useSmoothScroll } from '../../components/SmoothScroll/SmoothScrollProvider';
import { audioEngine } from '../../utils/audioEngine';

gsap.registerPlugin(ScrollTrigger);

interface CinematicOpeningProps {
  capabilities: ExperienceCapabilities;
}

export const CinematicOpening: React.FC<CinematicOpeningProps> = ({ capabilities }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(capabilities.prefersReducedMotion ? 0.95 : 0);
  const captionRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || capabilities.prefersReducedMotion) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        if (captionRef.current) {
          const fade = Math.max(0, Math.min(1, 1 - (self.progress - 0.45) / 0.32));
          captionRef.current.style.opacity = fade.toFixed(3);
          captionRef.current.style.transform = `translate3d(0, ${((1 - fade) * -12).toFixed(1)}px, 0)`;
        }
      },
    });

    return () => trigger.kill();
  }, [capabilities.prefersReducedMotion]);

  return (
    <section id="scene-01" ref={sectionRef} className="relative h-[220vh] bg-[#040507]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Scroll-Scrubbed 240-Frame Cinema Opening Sequence (Pure Unobstructed Video) */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <ScrollFrameSequence
            frameCount={240}
            progressRef={progressRef}
            prefersReducedMotion={capabilities.prefersReducedMotion}
          />
        </div>

        {/* Subtle Perimeter Cinema Edge Vignette & Top/Bottom Contrast Scrims */}
        <div className="cinema-vignette pointer-events-none absolute inset-0 z-10 opacity-45" />
        <div className="cinema-letterbox-top pointer-events-none absolute inset-x-0 top-0 z-10 h-32 opacity-85" />
        <div className="cinema-letterbox-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 opacity-70" />

        {/* Single-Line Bold Catchy Cinema Tagline Anchored at Top */}
        <div
          ref={captionRef}
          className="pointer-events-none absolute inset-x-4 top-5 z-20 flex justify-center text-center will-change-transform sm:inset-x-8 sm:top-7"
        >
          <h1
            className="whitespace-nowrap font-serif font-bold tracking-[0.11em] text-[#FFFFFF] [text-shadow:0_2px_20px_rgba(4,5,7,0.95)]"
            style={{ fontSize: 'clamp(11.5px, 2.15vw, 31px)' }}
          >
            WHEN <span className="font-bold italic text-[#FFD60A]">NO. 07</span> WALKS IN, TIME
            STANDS STILL.
          </h1>
        </div>

        {/* Text-Free Bottom Scroll Indicator Icon */}
        <div className="pointer-events-auto absolute inset-x-0 bottom-6 z-20 flex justify-center">
          <button
            type="button"
            onClick={() => {
              audioEngine.playCricketWhip();
              scrollTo('#scene-02');
            }}
            aria-label="Scroll to continue"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD60A] text-[#0B0D12] shadow-[0_8px_28px_rgba(255,214,10,0.55)] transition-transform hover:scale-110"
          >
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
