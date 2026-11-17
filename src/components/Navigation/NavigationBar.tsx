import React, { useState } from 'react';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SceneNavItem {
  id: string;
  numeral: string;
  label: string;
}

export const SCENE_NAV_ITEMS: SceneNavItem[] = [
  { id: 'scene-01', numeral: '01', label: 'The Opening' },
  { id: 'scene-02', numeral: '02', label: 'Behind the Helmet' },
  { id: 'scene-03', numeral: '03', label: 'The Yellow Era' },
  { id: 'scene-04', numeral: '04', label: 'The Captain' },
  { id: 'scene-05', numeral: '05', label: 'The Numbers' },
  { id: 'scene-06', numeral: '06', label: 'Trophy Room' },
  { id: 'scene-07', numeral: '07', label: 'Yellow Army' },
  { id: 'scene-08', numeral: '08', label: 'The Final Walk' },
  { id: 'scene-09', numeral: '09', label: 'Immortal Legacy' },
];

interface NavigationBarProps {
  activeSceneId: string;
  scrollProgress: number;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onNavigate: (id: string) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeSceneId,
  scrollProgress,
  isAudioPlaying,
  onToggleAudio,
  onNavigate,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeScene = SCENE_NAV_ITEMS.find((s) => s.id === activeSceneId) ?? SCENE_NAV_ITEMS[0];

  const handleJump = (id: string) => {
    setDrawerOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 border-b border-[#F4EFE6]/[0.06] bg-[#040507]/82 backdrop-blur-xl transition-colors">
        {/* Global Hairline Scroll Progress Bar */}
        <div className="h-[2px] w-full bg-[#F4EFE6]/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-[#8A6D29] via-[#F9CD05] to-[#E5C778] transition-[width] duration-75"
            style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
          />
        </div>

        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
          {/* Left Wordmark */}
          <button
            type="button"
            onClick={() => handleJump('scene-01')}
            className="pointer-events-auto group flex items-center gap-3 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#040507]/75 font-display text-xs tracking-wider text-[#F9CD05] backdrop-blur-md transition-colors group-hover:border-[#F9CD05]">
              7
            </span>
            <div className="hidden sm:block">
              <div className="font-display text-xs tracking-[0.24em] text-[#F4EFE6]">
                THE LAST INNINGS.
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#9E998F]">
                MS Dhoni · Legacy Film
              </div>
            </div>
          </button>

          {/* Center Current Chapter Telemetry */}
          <div className="pointer-events-auto hidden items-center gap-2.5 rounded-full border border-[#F4EFE6]/10 bg-[#040507]/70 px-4 py-1.5 backdrop-blur-md md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F9CD05]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E5C778]">
              SCENE {activeScene.numeral}
            </span>
            <span className="text-[#F4EFE6]/20">/</span>
            <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-[#F4EFE6]/85">
              {activeScene.label}
            </span>
          </div>

          {/* Right Audio & Chapter Index */}
          <div className="pointer-events-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={isAudioPlaying ? 'Mute ambient score' : 'Play ambient score'}
              className="flex items-center gap-2 rounded-full border border-[#F4EFE6]/15 bg-[#040507]/75 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#F4EFE6]/85 backdrop-blur-md transition-colors hover:border-[#F9CD05]/60 hover:text-[#F9CD05]"
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#F9CD05]" />
                  <span className="hidden sm:inline">Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-[#9E998F]" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open chapters menu"
              className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#040507]/75 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#E5C778] backdrop-blur-md transition-colors hover:border-[#F9CD05] hover:text-[#F9CD05]"
            >
              <Menu className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chapters</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editorial Fullscreen Chapters Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[80] flex flex-col justify-between bg-[#040507]/95 px-6 py-8 backdrop-blur-xl sm:px-14"
          >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-[#F4EFE6]/10 pb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                  Documentary Reel Index
                </span>
                <div className="mt-1 font-display text-lg tracking-[0.2em] text-[#F4EFE6]">
                  THE LAST INNINGS.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close chapters menu"
                className="flex items-center gap-2 rounded-full border border-[#F4EFE6]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#F4EFE6] transition-colors hover:border-[#F9CD05] hover:text-[#F9CD05]"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>

            <nav className="mx-auto my-auto grid w-full max-w-6xl grid-cols-1 gap-x-12 gap-y-2 py-6 sm:grid-cols-2 lg:grid-cols-3">
              {SCENE_NAV_ITEMS.map((item) => {
                const isActive = item.id === activeSceneId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleJump(item.id)}
                    className={`group flex items-baseline gap-4 border-b py-3.5 text-left transition-all ${
                      isActive
                        ? 'border-[#F9CD05]/70 text-[#F9CD05]'
                        : 'border-[#F4EFE6]/10 text-[#F4EFE6]/80 hover:border-[#D4AF37]/50 hover:text-[#F4EFE6]'
                    }`}
                  >
                    <span className="font-mono text-xs tracking-[0.2em] text-[#D4AF37]">
                      {item.numeral}
                    </span>
                    <span className="font-serif text-2xl tracking-[0.04em] transition-transform duration-300 group-hover:translate-x-1.5">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[#F4EFE6]/10 pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9E998F]">
              <span>THE MATCH ENDS. THE LEGACY DOESN&apos;T.</span>
              <span>CHEPAUK · RANCHI · WANKHEDE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
