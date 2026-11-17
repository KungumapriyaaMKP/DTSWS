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
          loading="lazy"
          className="animate-ken-burns h-full w-full object-cover object-center opacity-[0.14] filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF]/80 to-[#FAF8F2]" />
        <div className="animate-aura absolute inset-0 bg-[radial-gradient(ellipse_at_50%_54%,rgba(255,214,10,0.45),transparent_62%)]" />
      </div>

      {/* Rotating Championship Halo Ring + Centered Spinning Cricket Ball Behind MS DHONI */}
      <div className="pointer-events-none absolute z-[5] flex items-center justify-center">
        <div className="relative flex h-[440px] w-[440px] items-center justify-center sm:h-[620px] sm:w-[620px]">
          <svg className="animate-orbit-slow h-full w-full opacity-60" viewBox="0 0 320 320">
            <circle
              cx="160"
              cy="160"
              r="152"
              fill="none"
              stroke="#FFD60A"
              strokeWidth="1.2"
              strokeDasharray="6 10"
            />
            <circle
              cx="160"
              cy="160"
              r="134"
              fill="none"
              stroke="#E5A900"
              strokeOpacity="0.55"
              strokeWidth="0.9"
            />
          </svg>

          {/* Big 3D Spinning Cricket Ball Centered Directly Inside the Halo Circle */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.42]">
            <RevolvingCricketBall className="h-[370px] w-[370px] sm:h-[520px] sm:w-[520px]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="space-y-2 [text-shadow:0_2px_18px_rgba(255,255,255,0.92)]">
          <ScrollRevealText
            as="p"
            text="NOT EVERY HERO NEEDS A CROWN."
            delay={0.05}
            className="font-serif text-2xl font-light tracking-[0.08em] text-[#0B0D12]/80 sm:text-4xl"
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

        <div className="closing-stagger mx-auto my-12 h-[2px] w-24 bg-[#FFD60A]" />

        <ScrollRevealText
          text="MS DHONI."
          delay={0.1}
          stagger={0.08}
          className="font-display text-5xl font-semibold tracking-[0.22em] text-[#0B0D12] [text-shadow:0_0_24px_rgba(255,255,255,0.96),0_2px_12px_rgba(255,255,255,0.9)] sm:text-7xl md:text-8xl"
        />
        <ScrollRevealText
          as="p"
          text="A LEGACY BEYOND THE BOUNDARIES."
          delay={0.26}
          className="mt-4 font-serif text-lg font-semibold uppercase tracking-[0.24em] text-[#9A6300] [text-shadow:0_2px_16px_rgba(255,255,255,0.95)] sm:text-2xl"
        />

        {/* Authentic Signature in Crisp Dark Ink */}
        {!sigError && (
          <div className="closing-stagger mt-10 flex flex-col items-center">
            <img
              src={PHOTO_ASSETS.dhoniSignature.src}
              alt={PHOTO_ASSETS.dhoniSignature.alt}
              onError={() => setSigError(true)}
              className="h-14 w-auto opacity-85"
            />
            <span className="mt-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.26em] text-[#525661]">
              Jersey No. 07 · Ranchi · Chennai
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
