import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PHOTO_ASSETS } from '../../data/dhoniData';
import { ScrollRevealText } from '../../components/Motion/ScrollRevealText';
import { RevolvingCricketBall } from '../../components/Loader/SpinningCricketBall';

gsap.registerPlugin(ScrollTrigger);

export const ClosingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [sigError, setSigError] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('.closing-stagger'), {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.14,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 72%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scene-09"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-t border-[#0B0D12]/10 bg-[#FFFFFF] px-6 py-28 text-center"
    >
      {/* Sunlit White + Radiant Yellow Stadium Backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={PHOTO_ASSETS.chepaukNight.src}
          alt={PHOTO_ASSETS.chepaukNight.alt}
          loading="eager"
          decoding="async"
          className="animate-ken-burns h-full w-full object-cover object-center opacity-[0.14] filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/80 to-[#FAF8F2]" />
        <div className="animate-aura absolute inset-0 bg-[radial-gradient(ellipse_at_50%_54%,rgba(255,214,10,0.45),transparent_62%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <div className="space-y-2">
          <ScrollRevealText
            as="p"
            text="NOT EVERY HERO NEEDS A CROWN."
            delay={0.05}
            className="font-serif text-2xl font-light tracking-[0.08em] text-[#525661] sm:text-4xl"
          />
          <ScrollRevealText
            as="p"
            delay={0.2}
            segments={[
              { text: 'SOME JUST NEED ' },
              { text: 'A HELMET.', underline: true },
            ]}
            className="font-serif text-3xl font-medium italic tracking-[0.06em] text-[#0B0D12] sm:text-5xl"
          />
        </div>

        <div className="closing-stagger mx-auto my-8 h-[2px] w-24 bg-[#FFD60A]" />

        {/* Big Championship Halo Circle Holding the Clear Deep Red Spinning Cricket Ball */}
        <div className="relative flex h-[370px] w-[370px] items-center justify-center sm:h-[520px] sm:w-[520px]">
          <svg
            className="animate-orbit-slow pointer-events-none absolute inset-0 h-full w-full opacity-75"
            viewBox="0 0 320 320"
          >
            <circle
              cx="160"
              cy="160"
              r="152"
              fill="none"
              stroke="#FFD60A"
              strokeWidth="1.4"
              strokeDasharray="6 10"
            />
            <circle
              cx="160"
              cy="160"
              r="134"
              fill="none"
              stroke="#E5A900"
              strokeOpacity="0.65"
              strokeWidth="1"
            />
          </svg>

          {/* Full-Opacity Clear Deep Red Spinning 3D Cricket Ball */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <RevolvingCricketBall className="h-[340px] w-[340px] sm:h-[490px] sm:w-[490px]" />
          </div>

          {/* Crisp High-Contrast Overlay Inside the Crimson Sphere */}
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <ScrollRevealText
              text="MS DHONI."
              delay={0.1}
              stagger={0.08}
              className="font-display text-3xl font-semibold tracking-[0.16em] text-[#FFFFFF] [text-shadow:0_3px_22px_rgba(35,0,5,0.9)] sm:text-5xl"
            />
            <ScrollRevealText
              as="p"
              text="A LEGACY BEYOND THE BOUNDARIES."
              delay={0.24}
              className="mt-2 font-serif text-xs font-semibold uppercase tracking-[0.18em] text-[#FFD60A] [text-shadow:0_2px_14px_rgba(35,0,5,0.92)] sm:text-sm"
            />

            {!sigError && (
              <div className="closing-stagger mt-5 flex flex-col items-center">
                <img
                  src={PHOTO_ASSETS.dhoniSignature.src}
                  alt={PHOTO_ASSETS.dhoniSignature.alt}
                  onError={() => setSigError(true)}
                  className="h-10 w-auto brightness-0 invert drop-shadow-[0_2px_8px_rgba(35,0,5,0.85)] sm:h-12"
                />
                <span className="mt-1 font-mono text-[8.5px] font-medium uppercase tracking-[0.24em] text-[#FFFFFF]/90 [text-shadow:0_1px_10px_rgba(35,0,5,0.9)]">
                  Jersey No. 07 · Ranchi · Chennai
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
