import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TROPHY_EXHIBITS } from '../../data/dhoniData';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';
import { audioEngine } from '../../utils/audioEngine';
import { Viewport3DGuard } from '../../components/Viewport3DGuard';
import { ScrollRevealText } from '../../components/Motion/ScrollRevealText';
import { TrophyGalleryCanvas } from '../../scenes/TrophyScene/TrophyGalleryScene';

gsap.registerPlugin(ScrollTrigger);

export const TrophyRoomSection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userLocked, setUserLocked] = useState(false);

  const activeExhibit = TROPHY_EXHIBITS[activeIndex];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 65%',
      end: 'bottom 35%',
      scrub: true,
      onUpdate: (self) => {
        if (!userLocked) {
          const idx = Math.min(
            TROPHY_EXHIBITS.length - 1,
            Math.floor(self.progress * TROPHY_EXHIBITS.length)
          );
          setActiveIndex((prev) => (prev === idx ? prev : idx));
        }
      },
    });

    return () => trigger.kill();
  }, [userLocked]);

  const handleSelectExhibit = (idx: number) => {
    setUserLocked(true);
    setActiveIndex(idx);
    audioEngine.playSubtlePulse(440);
  };

  return (
    <section
      id="scene-06"
      ref={sectionRef}
      className="relative border-t border-[#0B0D12]/10 bg-[#FFFFFF] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <ScrollRevealText
              delay={0.08}
              segments={[
                { text: 'SILVERWARE FORGED IN ' },
                { text: 'SILENCE.', className: 'italic text-[#D99600]', underline: true },
              ]}
              className="font-serif text-4xl font-light tracking-[0.02em] text-[#0B0D12] sm:text-6xl"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous trophy exhibit"
              onClick={() =>
                handleSelectExhibit(
                  (activeIndex - 1 + TROPHY_EXHIBITS.length) % TROPHY_EXHIBITS.length
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B0D12]/20 bg-[#FAF8F2] text-[#0B0D12] transition-colors hover:border-[#FFD60A] hover:bg-[#FFD60A]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next trophy exhibit"
              onClick={() => handleSelectExhibit((activeIndex + 1) % TROPHY_EXHIBITS.length)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0B0D12]/20 bg-[#FAF8F2] text-[#0B0D12] transition-colors hover:border-[#FFD60A] hover:bg-[#FFD60A]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3D Reflective Museum Gallery */}
        <div
          data-cursor="INSPECT"
          className="relative mt-8 h-[420px] overflow-hidden border border-[#0B0D12]/15 bg-[#040507] shadow-[0_24px_70px_rgba(11,13,18,0.16)] sm:h-[510px]"
        >
          <Viewport3DGuard eager={false} className="h-full w-full">
            <TrophyGalleryCanvas
              exhibits={TROPHY_EXHIBITS}
              activeIndex={activeIndex}
              onSelect={handleSelectExhibit}
              isMobile={capabilities.isMobile}
              prefersReducedMotion={capabilities.prefersReducedMotion}
              webglSupported={capabilities.webglSupported}
            />
          </Viewport3DGuard>

          <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 bg-[#FFD60A] px-4 py-2 shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0B0D12]" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0B0D12]">
              0{activeIndex + 1} / 0{TROPHY_EXHIBITS.length} · {activeExhibit.competition}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040507] via-[#040507]/85 to-transparent px-6 pb-6 pt-14 sm:px-10">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#FFD60A]">
                  {activeExhibit.year} · {activeExhibit.team}
                </div>
                <h3 className="mt-1 font-serif text-3xl text-[#FFFFFF] sm:text-4xl">
                  {activeExhibit.title}
                </h3>
              </div>
              <div className="space-y-0.5 text-left font-mono text-[11px] md:text-right">
                <div className="text-[#FFE853]">{activeExhibit.scoreline}</div>
                <div className="text-[#FFD60A]">
                  {activeExhibit.margin} · {activeExhibit.venue}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plinth Selector Bar */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {TROPHY_EXHIBITS.map((exhibit, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={exhibit.id}
                type="button"
                onClick={() => handleSelectExhibit(idx)}
                className={`border px-3 py-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-[#FFD60A] bg-[#FFD60A] text-[#0B0D12] shadow-[0_8px_22px_rgba(255,214,10,0.4)]'
                    : 'border-[#0B0D12]/12 bg-[#FAF8F2] text-[#525661] hover:border-[#FFD60A]'
                }`}
              >
                <div
                  className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] ${
                    isSelected ? 'text-[#0B0D12]/80' : 'text-[#B37800]'
                  }`}
                >
                  {exhibit.competition}
                </div>
                <div className="mt-0.5 font-serif text-base font-medium text-[#0B0D12]">
                  {exhibit.year}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
