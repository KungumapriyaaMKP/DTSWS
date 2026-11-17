import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Trophy, Play, Pause, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CSK_TIMELINE_MILESTONES } from '../../data/dhoniData';
import { ArchivalImage } from '../../components/Media/ArchivalImage';
import { ScrollRevealText } from '../../components/Motion/ScrollRevealText';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';
import { audioEngine } from '../../utils/audioEngine';

gsap.registerPlugin(ScrollTrigger);

export const YellowEraSection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inView, setInView] = useState(false);

  const activeMilestone = CSK_TIMELINE_MILESTONES[activeIndex];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);

    const ctx = gsap.context(() => {
      if (glowRef.current && !capabilities.prefersReducedMotion) {
        gsap.fromTo(
          glowRef.current,
          { opacity: 0.18 },
          {
            opacity: 0.65,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              end: 'center center',
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [capabilities.prefersReducedMotion]);

  // Smooth live reel auto-advance when visible
  useEffect(() => {
    if (!autoPlay || !inView || capabilities.prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CSK_TIMELINE_MILESTONES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoPlay, inView, capabilities.prefersReducedMotion]);

  const handleSelect = (idx: number, pauseAuto = true) => {
    if (pauseAuto) setAutoPlay(false);
    setActiveIndex(idx);
    audioEngine.playSubtlePulse(CSK_TIMELINE_MILESTONES[idx].isTitleYear ? 392 : 293.66);
  };

  return (
    <section
      id="scene-03"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-[#0B0D12]/10 bg-[#FAF8F2] py-20 sm:py-28"
    >
      {/* Radiant Sunlit Championship Yellow Glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(255,214,10,0.45),rgba(255,230,59,0.16)_46%,transparent_76%)]"
      />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex flex-col justify-between gap-6 pb-8 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-1 text-[#E09F00]">
              {[0, 1, 2, 3, 4].map((starIdx) => (
                <motion.span
                  key={starIdx}
                  animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2.4,
                    delay: starIdx * 0.25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Star className="h-3.5 w-3.5 fill-[#FFD60A] text-[#B37800]" />
                </motion.span>
              ))}
            </div>
            <ScrollRevealText
              delay={0.08}
              segments={[
                { text: 'ONE CITY. ONE TEAM. ' },
                { text: 'ONE UNBREAKABLE BOND.', className: 'italic text-[#D99600]', underline: true },
              ]}
              className="mt-3 font-serif text-4xl font-normal leading-[1.02] tracking-[0.02em] text-[#0B0D12] sm:text-6xl"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              aria-label={autoPlay ? 'Pause timeline reel' : 'Play timeline reel'}
              className="flex h-11 items-center gap-2 rounded-full border border-[#0B0D12]/15 bg-white px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0B0D12] shadow-sm transition-colors hover:border-[#FFD60A] hover:bg-[#FFD60A]"
            >
              {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{autoPlay ? 'Auto' : 'Paused'}</span>
            </button>

            <button
              type="button"
              aria-label="Previous season"
              onClick={() =>
                handleSelect(
                  (activeIndex - 1 + CSK_TIMELINE_MILESTONES.length) %
                    CSK_TIMELINE_MILESTONES.length
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B0D12]/20 bg-white text-[#0B0D12] shadow-sm transition-colors hover:border-[#FFD60A] hover:bg-[#FFD60A]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next season"
              onClick={() => handleSelect((activeIndex + 1) % CSK_TIMELINE_MILESTONES.length)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B0D12]/20 bg-white text-[#0B0D12] shadow-sm transition-colors hover:border-[#FFD60A] hover:bg-[#FFD60A]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Season Selector Strip */}
        <div className="overflow-x-auto pb-3">
          <div className="flex min-w-max items-center gap-2 sm:gap-2.5">
            {CSK_TIMELINE_MILESTONES.map((item, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={item.year}
                  type="button"
                  data-cursor="SEASON"
                  onClick={() => handleSelect(idx)}
                  className={`relative flex items-center gap-2 overflow-hidden border px-4 py-2.5 transition-all duration-300 ${
                    active
                      ? 'scale-105 border-[#FFD60A] bg-[#FFD60A] text-[#0B0D12] shadow-[0_8px_22px_rgba(255,214,10,0.45)]'
                      : 'border-[#0B0D12]/12 bg-white/90 text-[#525661] hover:border-[#FFD60A] hover:text-[#0B0D12]'
                  }`}
                >
                  <span className="font-mono text-xs font-semibold tracking-[0.16em]">
                    {item.season}
                  </span>
                  {item.isTitleYear && (
                    <Trophy
                      className={`h-3.5 w-3.5 ${active ? 'text-[#0B0D12]' : 'text-[#E09F00]'}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kinetic 3D Spring Visual Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone.year}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
          >
            <div className="relative shadow-[0_24px_70px_rgba(11,13,18,0.16)] lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="pointer-events-none absolute right-5 top-3 z-20 select-none font-display text-6xl font-semibold text-[#FFD60A]/80 drop-shadow sm:text-8xl"
              >
                {activeMilestone.year}
              </motion.div>
              <ArchivalImage
                assetKey={activeMilestone.assetKey}
                aspectClass="aspect-[16/10]"
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 bg-[#FFD60A] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0B0D12]">
                  {activeMilestone.resultBadge}
                </div>
                <h3 className="mt-3 font-serif text-3xl font-normal leading-tight text-[#FFFFFF] sm:text-5xl">
                  {activeMilestone.headline}
                </h3>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-5 lg:col-span-4">
              <ArchivalImage
                assetKey={activeMilestone.secondaryAssetKey}
                aspectClass="aspect-[4/3]"
                priority
                className="shadow-[0_18px_48px_rgba(11,13,18,0.14)]"
              />
              <div className="border-l-4 border-[#FFD60A] bg-white p-5 shadow-[0_12px_36px_rgba(11,13,18,0.08)]">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B37800]">
                  {activeMilestone.venue}
                </div>
                <div className="mt-2 font-mono text-xs font-medium leading-relaxed text-[#0B0D12]">
                  {activeMilestone.verifiedDetail}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
