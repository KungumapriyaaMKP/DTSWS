import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LEGACY_STATS, PHOTO_ASSETS } from '../../data/dhoniData';
import { ScrollRevealText } from '../../components/Motion/ScrollRevealText';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';

gsap.registerPlugin(ScrollTrigger);

const FORMAT_LEDGER = [
  { format: 'ODIs', matches: '350', runs: '10,773', avg: '50.57', high: '183*', ratio: 100 },
  { format: 'IPL', matches: '278+', runs: '5,439+', avg: '38.30', high: '84*', ratio: 52 },
  { format: 'Tests', matches: '90', runs: '4,876', avg: '38.09', high: '224', ratio: 46 },
  { format: 'T20Is', matches: '98', runs: '1,617', avg: '37.60', high: '56', ratio: 16 },
];

const PHOTO_STRIP = [
  PHOTO_ASSETS.dhoni2011.src,
  PHOTO_ASSETS.csk2018Match.src,
  PHOTO_ASSETS.dhoniBatting.src,
  PHOTO_ASSETS.dhoni2023.src,
  PHOTO_ASSETS.chepaukNight.src,
];

export const LegacyStatsSection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const heroCounterRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (capabilities.prefersReducedMotion) return;

      if (heroCounterRef.current) {
        const obj = { val: 0 };
        gsap.fromTo(
          heroCounterRef.current,
          { scale: 0.65, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.0,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: heroCounterRef.current,
              start: 'top 84%',
              once: true,
            },
          }
        );

        gsap.to(obj, {
          val: 5,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heroCounterRef.current,
            start: 'top 84%',
            once: true,
          },
          onUpdate: () => {
            if (heroCounterRef.current) {
              heroCounterRef.current.textContent = Math.round(obj.val).toString();
            }
          },
        });
      }

      if (rippleRef.current) {
        gsap.fromTo(
          rippleRef.current,
          { scale: 0.4, opacity: 0.85 },
          {
            scale: 2.3,
            opacity: 0,
            duration: 1.8,
            repeat: -1,
            repeatDelay: 1.6,
            ease: 'power2.out',
          }
        );
      }

      sectionRef.current?.querySelectorAll<HTMLElement>('[data-stat-row]').forEach((row, idx) => {
        gsap.fromTo(
          row,
          { x: idx % 2 === 0 ? -28 : 28, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });

      sectionRef.current?.querySelectorAll<HTMLElement>('[data-count-target]').forEach((el) => {
        const target = Number(el.dataset.countTarget || '0');
        const suffix = el.dataset.countSuffix || '';
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 1.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.v).toLocaleString('en-US')}${suffix}`;
          },
        });
      });

      sectionRef.current?.querySelectorAll<HTMLElement>('[data-bar-ratio]').forEach((bar) => {
        const ratio = bar.dataset.barRatio || '0';
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: Number(ratio) / 100,
            duration: 1.25,
            ease: 'power3.out',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: bar,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [capabilities.prefersReducedMotion]);

  return (
    <section
      id="scene-05"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[#0B0D12]/10 bg-[#FAF8F2] py-20 sm:py-32"
    >
      {/* Continuously Gliding CSK + Dhoni Photo Filmstrip */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden opacity-[0.16]">
        <div className="animate-filmstrip flex h-full w-max">
          {[...PHOTO_STRIP, ...PHOTO_STRIP].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-[28vw] min-w-[260px] object-cover object-top filter saturate-50"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F2]/35 via-[#FAF8F2]/70 to-[#FAF8F2]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px] px-6 sm:px-10">
        {/* Monumental Hero Stat Statement */}
        <div className="flex flex-col justify-between gap-8 border-b border-[#0B0D12]/12 pb-14 lg:flex-row lg:items-end">
          <div className="relative flex items-baseline gap-6">
            <div className="relative">
              <div
                ref={rippleRef}
                className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FFD60A]"
              />
              <span
                ref={heroCounterRef}
                className="relative z-10 inline-block font-display text-[124px] font-semibold leading-none tracking-tight text-[#FFD60A] drop-shadow-[0_4px_20px_rgba(255,214,10,0.45)] sm:text-[184px]"
                style={{ WebkitTextStroke: '2px #B37800' }}
              >
                5
              </span>
            </div>
            <div>
              <ScrollRevealText
                as="div"
                text="IPL TROPHIES."
                className="font-serif text-3xl font-medium tracking-[0.06em] text-[#0B0D12] sm:text-5xl"
              />
              <div className="mt-2 inline-block bg-[#FFD60A] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#0B0D12]">
                2010 · 2011 · 2018 · 2021 · 2023
              </div>
            </div>
          </div>

          <ScrollRevealText
            segments={[
              { text: 'ONE UNMATCHED ' },
              { text: 'LEGACY.', underline: true },
            ]}
            delay={0.14}
            className="font-serif text-3xl font-normal italic tracking-[0.04em] text-[#B37800] sm:text-5xl"
          />
        </div>

        {/* Clean Minimalist Staggered Number Grid */}
        <div className="mt-12 grid grid-cols-1 gap-x-14 gap-y-2 md:grid-cols-2">
          {LEGACY_STATS.map((stat, idx) => (
            <div
              key={stat.id}
              data-stat-row
              className="flex items-baseline justify-between gap-6 border-b border-[#0B0D12]/10 py-5 transition-colors hover:border-[#FFD60A]"
            >
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B37800]">
                  0{idx + 1} · {stat.label}
                </div>
                <div className="mt-1 font-sans text-xs text-[#525661] sm:text-sm">
                  {stat.sublabel}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span
                  data-count-target={stat.value}
                  data-count-suffix={stat.suffix || ''}
                  className="font-display text-3xl font-semibold tracking-tight text-[#0B0D12] sm:text-5xl"
                >
                  {stat.value.toLocaleString('en-US')}
                  {stat.suffix || ''}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sleek Animated Format Bars */}
        <div className="mt-14 border border-[#0B0D12]/10 bg-white p-6 shadow-[0_18px_48px_rgba(11,13,18,0.06)] sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FORMAT_LEDGER.map((row) => (
              <div key={row.format} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl font-medium text-[#0B0D12]">
                    {row.format}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#B37800]">
                    {row.runs} RUNS · AVG {row.avg} · HS {row.high}
                  </span>
                </div>
                <div className="h-[4px] w-full overflow-hidden rounded-full bg-[#0B0D12]/[0.08]">
                  <div
                    data-bar-ratio={row.ratio}
                    className="h-full bg-gradient-to-r from-[#F59E0B] via-[#FFD60A] to-[#FFE853]"
                    style={{
                      transform: capabilities.prefersReducedMotion
                        ? `scaleX(${row.ratio / 100})`
                        : undefined,
                      transformOrigin: 'left center',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
