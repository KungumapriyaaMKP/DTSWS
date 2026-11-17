import React, { lazy, useState } from 'react';
import { Crosshair, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TACTICAL_MOMENTS } from '../../data/dhoniData';
import { ExperienceCapabilities } from '../../hooks/useExperienceState';
import { audioEngine } from '../../utils/audioEngine';
import { Viewport3DGuard } from '../../components/Viewport3DGuard';
import { ArchivalImage } from '../../components/Media/ArchivalImage';

const StadiumCanvas = lazy(() =>
  import('../../scenes/StadiumScene/StadiumEnvironment').then((m) => ({ default: m.StadiumCanvas }))
);

export const CaptainSection: React.FC<{ capabilities: ExperienceCapabilities }> = ({
  capabilities,
}) => {
  const [selectedMomentIdx, setSelectedMomentIdx] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const activeMoment = TACTICAL_MOMENTS[selectedMomentIdx];

  const handleSelectMoment = (idx: number) => {
    setSelectedMomentIdx(idx);
    audioEngine.playSubtlePulse(329.63);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (capabilities.isMobile || capabilities.prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseOffset({ x: nx, y: -ny });
  };

  return (
    <section
      id="scene-04"
      className="relative border-t border-[#0B0D12]/10 bg-[#FFFFFF] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B37800]">
              <span className="inline-block h-[2px] w-8 bg-[#FFD60A]" />
              <span>Scene 04 · The Captain · Interactive 3D Field</span>
            </div>
            <h2 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-[1.02] tracking-[0.02em] text-[#0B0D12] sm:text-6xl">
              WHEN THE WORLD PANICKED,{' '}
              <span className="italic text-[#D99600]">HE STAYED CALM.</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#525661]">
            <Compass className="h-3.5 w-3.5 text-[#E09F00]" />
            <span>Switch camera angles</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Interactive 3D Stadium Viewport */}
          <div
            data-cursor="ORBIT"
            onMouseMove={handleMouseMove}
            className="relative h-[420px] overflow-hidden border border-[#0B0D12]/15 bg-[#050609] shadow-[0_24px_70px_rgba(11,13,18,0.16)] sm:h-[520px] lg:col-span-8 lg:h-[600px]"
          >
            <Viewport3DGuard className="h-full w-full">
              <StadiumCanvas
                mode="captain"
                progress={0.85}
                cameraPreset={activeMoment.cameraPreset}
                mouseOffset={mouseOffset}
                isMobile={capabilities.isMobile}
                prefersReducedMotion={capabilities.prefersReducedMotion}
                webglSupported={capabilities.webglSupported}
              />
            </Viewport3DGuard>

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-[#040507]/85 to-transparent px-5 py-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#FFD60A]">
                <Crosshair className="h-3.5 w-3.5" />
                <span>{activeMoment.code}</span>
              </div>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[#E5E7EB] sm:inline">
                {activeMoment.dateAndVenue}
              </span>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040507] via-[#040507]/80 to-transparent p-5 sm:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#FFD60A]">
                {activeMoment.matchContext}
              </div>
              <div className="mt-1 font-serif text-2xl text-[#FFFFFF] sm:text-4xl">
                {activeMoment.title}
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-[#FFE853]">
                {activeMoment.verifiedScoreline}
              </div>
            </div>
          </div>

          {/* Real Action Frame + Camera Vantage Switcher */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMoment.id}
                initial={{ opacity: 0.4, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.35 }}
                className="relative shadow-[0_18px_48px_rgba(11,13,18,0.14)]"
              >
                <ArchivalImage
                  assetKey={activeMoment.actionAssetKey}
                  aspectClass="aspect-[16/10]"
                  priority
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                  <div className="font-serif text-lg italic text-[#FFFFFF]">
                    &ldquo;{activeMoment.hookQuote}&rdquo;
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              {TACTICAL_MOMENTS.map((moment, idx) => {
                const isSelected = idx === selectedMomentIdx;
                return (
                  <button
                    key={moment.id}
                    type="button"
                    data-cursor="CAMERA"
                    onClick={() => handleSelectMoment(idx)}
                    className={`border p-3.5 text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-[#FFD60A] bg-[#FFD60A] text-[#0B0D12] shadow-[0_10px_28px_rgba(255,214,10,0.4)]'
                        : 'border-[#0B0D12]/12 bg-[#FAF8F2] text-[#525661] hover:border-[#FFD60A] hover:bg-white'
                    }`}
                  >
                    <div
                      className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.22em] ${
                        isSelected ? 'text-[#0B0D12]/80' : 'text-[#B37800]'
                      }`}
                    >
                      {moment.code}
                    </div>
                    <div className="mt-1 font-serif text-lg font-medium leading-snug text-[#0B0D12]">
                      {moment.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
