import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArchivalImage } from '../../components/Media/ArchivalImage';
import { ScrollRevealText } from '../../components/Motion/ScrollRevealText';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';

gsap.registerPlugin(ScrollTrigger);

export const YellowArmySection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const colLeftRef = useRef<HTMLDivElement>(null);
  const colRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (capabilities.prefersReducedMotion || capabilities.isMobile) return;

      if (colLeftRef.current) {
        gsap.fromTo(
          colLeftRef.current,
          { y: -24 },
          {
            y: 24,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
      if (colRightRef.current) {
        gsap.fromTo(
          colRightRef.current,
          { y: 28 },
          {
            y: -28,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [capabilities.isMobile, capabilities.prefersReducedMotion]);

  return (
    <section
      id="scene-07"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[#0B0D12]/10 bg-[#FAF8F2] py-20 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_12%,rgba(255,214,10,0.34),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="max-w-4xl">
          <ScrollRevealText
            text="IT WAS NEVER JUST ABOUT CRICKET."
            delay={0.05}
            className="font-serif text-4xl font-light leading-[1.06] text-[#525661] sm:text-5xl md:text-6xl"
          />
          <ScrollRevealText
            delay={0.22}
            segments={[
              { text: 'IT WAS ABOUT A CITY THAT FOUND ' },
              { text: 'ITS HERO.', underline: true },
            ]}
            className="mt-1 font-serif text-4xl font-semibold italic leading-[1.06] text-[#D99600] sm:text-6xl md:text-7xl"
          />
        </div>

        {/* High-Impact CSK + Chepauk Parallax Visual Collage */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12">
          <div ref={colLeftRef} className="space-y-5 md:col-span-7">
            <ArchivalImage
              assetKey="chepaukNight"
              aspectClass="aspect-[16/9]"
              priority
              className="shadow-[0_20px_56px_rgba(11,13,18,0.14)]"
            />
            <div className="grid grid-cols-2 gap-5">
              <ArchivalImage
                assetKey="chepaukYellowStands"
                aspectClass="aspect-[4/3]"
                className="shadow-[0_16px_40px_rgba(11,13,18,0.12)]"
              />
              <ArchivalImage
                assetKey="chepaukFloodlight"
                aspectClass="aspect-[4/3]"
                className="shadow-[0_16px_40px_rgba(11,13,18,0.12)]"
              />
            </div>
          </div>

          <div ref={colRightRef} className="space-y-5 md:col-span-5">
            <ArchivalImage
              assetKey="chepaukFan"
              aspectClass="aspect-[4/3]"
              priority
              className="shadow-[0_20px_56px_rgba(11,13,18,0.14)]"
            />
            <ArchivalImage
              assetKey="chepaukCrowd2013"
              aspectClass="aspect-[16/10]"
              className="shadow-[0_16px_40px_rgba(11,13,18,0.12)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
