import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EARLY_JOURNEY_CHAPTERS } from '../../data/dhoniData';
import { ArchivalImage } from '../../components/Media/ArchivalImage';
import { ScrollRevealText } from '../../components/Motion/ScrollRevealText';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';

gsap.registerPlugin(ScrollTrigger);

export const EarlyJourneySection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (
        !capabilities.isMobile &&
        !capabilities.prefersReducedMotion &&
        trackWrapperRef.current &&
        trackRef.current
      ) {
        const track = trackRef.current;
        const getScrollDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
        const setSkew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power2.out' });

        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: trackWrapperRef.current,
            start: 'top top',
            end: () => `+=${Math.max(1200, getScrollDistance())}`,
            pin: true,
            scrub: 0.85,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const v = gsap.utils.clamp(-4.5, 4.5, self.getVelocity() / -360);
              setSkew(v);
            },
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [capabilities.isMobile, capabilities.prefersReducedMotion]);

  return (
    <section
      id="scene-02"
      ref={sectionRef}
      className="relative border-t border-[#0B0D12]/10 bg-[#FFFFFF]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_12%,rgba(255,214,10,0.22),transparent_52%)]" />

      {/* Pure Oversized Hook Header */}
      <div className="relative z-10 mx-auto max-w-[1380px] px-6 pb-10 pt-24 sm:px-10 md:pb-14 md:pt-32">
        <div className="space-y-1 sm:space-y-2">
          <ScrollRevealText
            text="BEFORE THE CAPTAIN."
            delay={0.05}
            className="font-serif text-3xl font-light tracking-[0.06em] text-[#525661] sm:text-5xl md:text-6xl"
          />
          <ScrollRevealText
            text="BEFORE THE TROPHIES."
            delay={0.22}
            className="font-serif text-3xl font-light tracking-[0.06em] text-[#0B0D12] sm:text-5xl md:text-6xl"
          />
          <ScrollRevealText
            delay={0.38}
            segments={[
              { text: 'JUST A BOY WITH ' },
              { text: 'A DREAM.', underline: true },
            ]}
            className="font-serif text-4xl font-semibold italic tracking-[0.04em] text-[#E09F00] sm:text-6xl md:text-7xl"
          />
        </div>
      </div>

      {/* Desktop: Full-Bleed Dual-Photo Horizontal Reel */}
      {!capabilities.isMobile ? (
        <div ref={trackWrapperRef} className="relative overflow-hidden py-6 md:h-screen md:py-0">
          <div className="flex h-full items-center pt-6">
            <div ref={trackRef} className="flex items-stretch gap-14 px-8 md:px-16">
              {EARLY_JOURNEY_CHAPTERS.map((chapter, idx) => (
                <article
                  key={chapter.id}
                  data-cursor="REEL"
                  className="relative flex w-[84vw] max-w-[1060px] shrink-0 items-center gap-8"
                >
                  {/* Primary Hero Portrait / Action Plate */}
                  <div className="relative w-[58%]">
                    <div className="pointer-events-none absolute -left-3 -top-12 z-0 select-none font-display text-[96px] font-semibold leading-none text-[#FFD60A]/45">
                      0{idx + 1}
                    </div>
                    <ArchivalImage
                      assetKey={chapter.assetKey}
                      aspectClass="aspect-[4/3]"
                      priority
                      className="relative z-10 shadow-[0_24px_70px_rgba(11,13,18,0.16)]"
                    />
                    <div className="absolute bottom-5 left-5 right-5 z-20">
                      <span className="inline-block bg-[#FFD60A] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0B0D12]">
                        {chapter.era} · {chapter.location}
                      </span>
                      <h3 className="mt-3 font-serif text-3xl font-normal leading-tight text-[#FFFFFF] drop-shadow-lg lg:text-4xl">
                        {chapter.title}
                      </h3>
                    </div>
                  </div>

                  {/* Secondary Offset Parallax Frame */}
                  <div className="flex w-[42%] flex-col justify-between gap-6">
                    <ArchivalImage
                      assetKey={chapter.secondaryAssetKey}
                      aspectClass="aspect-[4/3]"
                      priority
                      className="translate-y-4 shadow-[0_20px_56px_rgba(11,13,18,0.14)]"
                    />
                    <div className="border-l-4 border-[#FFD60A] pl-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#0B0D12]">
                      {chapter.hookTag}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 px-5 pb-20">
          {EARLY_JOURNEY_CHAPTERS.map((chapter, idx) => (
            <article key={chapter.id} className="relative space-y-3">
              <div className="relative shadow-[0_16px_40px_rgba(11,13,18,0.12)]">
                <ArchivalImage assetKey={chapter.assetKey} aspectClass="aspect-[4/3]" priority />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="inline-block bg-[#FFD60A] px-2.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#0B0D12]">
                    0{idx + 1} · {chapter.era}
                  </span>
                  <h3 className="mt-1.5 font-serif text-2xl leading-tight text-[#FFFFFF]">
                    {chapter.title}
                  </h3>
                </div>
              </div>
              <ArchivalImage assetKey={chapter.secondaryAssetKey} aspectClass="aspect-[16/9]" />
              <div className="border-l-4 border-[#FFD60A] pl-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#0B0D12]">
                {chapter.hookTag}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
