import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';
import { Viewport3DGuard } from '../../components/Viewport3DGuard';
import { FinalWalkCanvas } from '../../scenes/FinalWalkScene/FinalWalkCanvas';

gsap.registerPlugin(ScrollTrigger);

function windowOpacity(
  progress: number,
  start: number,
  peakStart: number,
  peakEnd: number,
  end: number
): number {
  if (progress < start || progress > end) return 0;
  if (progress < peakStart) return (progress - start) / Math.max(0.001, peakStart - start);
  if (progress <= peakEnd) return 1;
  return 1 - (progress - peakEnd) / Math.max(0.001, end - peakEnd);
}

export const FinalWalkSection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(capabilities.prefersReducedMotion ? 0.65 : 0);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const line3Ref = useRef<HTMLParagraphElement>(null);
  const line4Ref = useRef<HTMLParagraphElement>(null);
  const finalBeatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyBeats = (prog: number) => {
      const l1 = windowOpacity(prog, 0.02, 0.09, 0.21, 0.28);
      const l2 = windowOpacity(prog, 0.24, 0.31, 0.43, 0.5);
      const l3 = windowOpacity(prog, 0.46, 0.53, 0.64, 0.71);
      const l4 = windowOpacity(prog, 0.72, 0.78, 0.87, 0.92);
      const fb = prog < 0.88 ? 0 : Math.min(1, (prog - 0.88) / 0.1);

      const updateLine = (el: HTMLElement | null, val: number) => {
        if (!el) return;
        el.style.opacity = val.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - val) * 10).toFixed(2)}px, 0)`;
      };

      updateLine(line1Ref.current, l1);
      updateLine(line2Ref.current, l2);
      updateLine(line3Ref.current, l3);
      updateLine(line4Ref.current, l4);

      if (finalBeatRef.current) {
        finalBeatRef.current.style.opacity = fb.toFixed(3);
        finalBeatRef.current.style.transform = `scale(${(0.97 + fb * 0.03).toFixed(4)})`;
      }
    };

    applyBeats(progressRef.current);

    const el = sectionRef.current;
    if (!el || capabilities.prefersReducedMotion) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        applyBeats(self.progress);
      },
    });

    return () => trigger.kill();
  }, [capabilities.prefersReducedMotion]);

  return (
    <section
      id="scene-08"
      ref={sectionRef}
      className="relative h-[340vh] border-t border-[#0B0D12]/10 bg-[#030406]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D Final Walk Toward the Pavilion */}
        <Viewport3DGuard eager={false} className="absolute inset-0 z-0 h-full w-full">
          <FinalWalkCanvas
            progressRef={progressRef}
            isMobile={capabilities.isMobile}
            prefersReducedMotion={capabilities.prefersReducedMotion}
            webglSupported={capabilities.webglSupported}
          />
        </Viewport3DGuard>

        {/* Deep Film Vignette */}
        <div className="cinema-vignette pointer-events-none absolute inset-0 z-10" />
        <div className="cinema-letterbox-top pointer-events-none absolute inset-x-0 top-0 z-10 h-32" />
        <div className="cinema-letterbox-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44" />

        {/* Sequential Poetic Beats (Direct DOM transform/opacity, zero React re-renders) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
          <p
            ref={line1Ref}
            className="absolute max-w-4xl font-serif text-3xl font-light tracking-[0.14em] text-[#F4EFE6]/90 will-change-transform sm:text-5xl md:text-6xl"
            style={{ opacity: 0 }}
          >
            THE LIGHTS MAY FADE.
          </p>

          <p
            ref={line2Ref}
            className="absolute max-w-4xl font-serif text-3xl font-light tracking-[0.14em] text-[#F4EFE6]/90 will-change-transform sm:text-5xl md:text-6xl"
            style={{ opacity: 0 }}
          >
            THE CROWD MAY GO SILENT.
          </p>

          <p
            ref={line3Ref}
            className="absolute max-w-4xl font-serif text-3xl font-light tracking-[0.14em] text-[#E5C778] will-change-transform sm:text-5xl md:text-6xl"
            style={{ opacity: 0 }}
          >
            THE INNINGS MAY END.
          </p>

          <p
            ref={line4Ref}
            className="absolute max-w-4xl font-serif text-3xl font-normal italic tracking-[0.10em] text-[#F9CD05] will-change-transform sm:text-5xl md:text-6xl"
            style={{ opacity: 0 }}
          >
            BUT LEGENDS NEVER WALK ALONE.
          </p>

          <div
            ref={finalBeatRef}
            className="absolute max-w-5xl will-change-transform"
            style={{ opacity: 0 }}
          >
            <h2 className="text-gold-metallic font-display text-4xl font-semibold tracking-[0.22em] sm:text-6xl md:text-7xl">
              THANK YOU, THALA.
            </h2>
            <p className="mt-5 font-serif text-xl italic tracking-[0.12em] text-[#F4EFE6]/90 sm:text-3xl">
              THE MATCH ENDS. THE LEGACY DOESN&apos;T.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
