import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Volume2, VolumeX } from 'lucide-react';
import { SmoothScrollProvider } from './components/SmoothScroll/SmoothScrollProvider';
import { CinematicLoader } from './components/Loader/CinematicLoader';
import { CustomCursor } from './components/Cursor/CustomCursor';
import { CinematicOpening } from './sections/Hero/CinematicOpening';
import { TrophiesSequenceSection } from './sections/Hero/TrophiesSequenceSection';
import { EarlyJourneySection } from './sections/EarlyJourney/EarlyJourneySection';
import { YellowEraSection } from './sections/YellowEra/YellowEraSection';
import { LegacyStatsSection } from './sections/LegacyStats/LegacyStatsSection';
import { TrophyRoomSection } from './sections/TrophyRoom/TrophyRoomSection';
import { YellowArmySection } from './sections/YellowArmy/YellowArmySection';
import { FinalWalkSection } from './sections/FinalWalk/FinalWalkSection';
import { ClosingSection } from './sections/Closing/ClosingSection';
import { DocumentaryFooter } from './components/Footer/DocumentaryFooter';
import { KineticMarquee } from './components/Motion/KineticMarquee';
import { ChepaukRoarHook } from './sections/Hook/ChepaukRoarHook';
import { useExperienceCapabilities } from './hooks/useExperienceState';
import { audioEngine } from './utils/audioEngine';

const ExperienceShell: React.FC = () => {
  const capabilities = useExperienceCapabilities();
  const [loaderDone, setLoaderDone] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshId = window.setTimeout(() => {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.refresh();
    }, 450);

    return () => {
      window.clearTimeout(refreshId);
    };
  }, [loaderDone]);

  const handleToggleAudio = async () => {
    const active = await audioEngine.toggle();
    setIsAudioPlaying(active);
  };

  const handleEnterWithSound = async () => {
    const active = await audioEngine.enable();
    setIsAudioPlaying(active);
  };

  return (
    <SmoothScrollProvider
      prefersReducedMotion={capabilities.prefersReducedMotion}
      onGlobalScroll={(prog) => {
        if (progressBarRef.current) {
          const clamped = Math.min(1, Math.max(0, prog));
          progressBarRef.current.style.transform = `scaleX(${clamped})`;
        }
        audioEngine.updateAtmosphere(prog);
      }}
    >
      {/* Subtle 35mm Cinema Film Grain */}
      <div className="film-grain-overlay" aria-hidden="true" />

      {/* Custom Desktop Cursor */}
      <CustomCursor enabled={!capabilities.isMobile && !capabilities.prefersReducedMotion} />

      {/* Opening Calibration Loader */}
      {!loaderDone && (
        <CinematicLoader
          onComplete={() => setLoaderDone(true)}
          onEnterWithSound={handleEnterWithSound}
        />
      )}

      {/* Subtle 3px Bright Yellow Scroll Progress Hairline (GPU-composited scaleX, zero React re-renders) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-[#0B0D12]/[0.08]">
        <div
          ref={progressBarRef}
          className="h-full w-full origin-left bg-gradient-to-r from-[#F59E0B] via-[#FFD60A] to-[#FFE853] will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Floating Audio Toggle Pill */}
      <button
        type="button"
        onClick={handleToggleAudio}
        aria-label={isAudioPlaying ? 'Mute ambient score' : 'Play ambient score'}
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[#FFD60A] bg-[#FFFFFF]/95 text-[#0B0D12] shadow-[0_8px_24px_rgba(11,13,18,0.14)] transition-colors hover:bg-[#FFD60A]"
      >
        {isAudioPlaying ? (
          <Volume2 className="h-4 w-4 text-[#0B0D12]" />
        ) : (
          <VolumeX className="h-4 w-4 text-[#525661]" />
        )}
      </button>

      {/* Continuous Cinematic Documentary */}
      <main className="relative bg-[#FFFFFF]">
        <CinematicOpening capabilities={capabilities} />
        <TrophiesSequenceSection capabilities={capabilities} />
        <KineticMarquee
          variant="yellow"
          items={['MS DHONI 07', 'CAPTAIN COOL', 'FIVE IPL TROPHIES', 'WHISTLE PODU', 'THALA FOREVER']}
        />
        <ChepaukRoarHook />
        <EarlyJourneySection capabilities={capabilities} />
        <YellowEraSection capabilities={capabilities} />
        <KineticMarquee
          variant="white"
          reverse
          items={['2010', '2011', '2018', '2021', '2023', '235 MATCHES AS CAPTAIN', '205 IPL DISMISSALS']}
        />
        <LegacyStatsSection capabilities={capabilities} />
        <TrophyRoomSection capabilities={capabilities} />
        <YellowArmySection capabilities={capabilities} />
        <FinalWalkSection capabilities={capabilities} />
        <ClosingSection />
      </main>

      <DocumentaryFooter />
    </SmoothScrollProvider>
  );
};

export default function App() {
  return <ExperienceShell />;
}
