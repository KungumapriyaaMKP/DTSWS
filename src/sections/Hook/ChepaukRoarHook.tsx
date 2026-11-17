import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Volume2, RotateCcw } from 'lucide-react';
import { PHOTO_ASSETS } from '../../data/dhoniData';
import { audioEngine } from '../../utils/audioEngine';

gsap.registerPlugin(ScrollTrigger);

const FLASH_IMAGES = [
  PHOTO_ASSETS.chepaukNight.src,
  PHOTO_ASSETS.csk2018Match.src,
  PHOTO_ASSETS.dhoni2011.src,
  PHOTO_ASSETS.dhoni2023.src,
  PHOTO_ASSETS.chepaukCrowd2013.src,
];

const EQ_BAR_COUNT = 28;

export const ChepaukRoarHook: React.FC = () => {
  const [holding, setHolding] = useState(false);
  const [charge, setCharge] = useState(0); // 0..1
  const [erupted, setErupted] = useState(false);
  const [flashIdx, setFlashIdx] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const chargeRef = useRef(0);
  const holdingRef = useRef(false);

  holdingRef.current = holding;

  useEffect(() => {
    const el = headerRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 38, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (erupted || (!holding && chargeRef.current <= 0)) {
      return;
    }

    let lastTime = performance.now();
    let lastDholTime = 0;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (holdingRef.current) {
        chargeRef.current = Math.min(1, chargeRef.current + dt * 0.56);
        const beatGapMs = 380 - chargeRef.current * 220;
        if (now - lastDholTime >= beatGapMs) {
          lastDholTime = now;
          audioEngine.playDholThump(0.45 + chargeRef.current * 0.55);
        }
        if (chargeRef.current >= 1) {
          setErupted(true);
          setHolding(false);
          setCharge(1);
          audioEngine.setRoarBoost(0);
          audioEngine.playWhistlePoduEruption();
          return;
        }
      } else {
        chargeRef.current = Math.max(0, chargeRef.current - dt * 0.45);
      }

      setCharge(chargeRef.current);
      audioEngine.setRoarBoost(chargeRef.current);

      if (holdingRef.current || chargeRef.current > 0) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [holding, erupted]);

  // Rapid frame montage while charging or right on eruption
  useEffect(() => {
    if (!holding && !erupted) return;
    const interval = window.setInterval(() => {
      setFlashIdx((prev) => (prev + 1) % FLASH_IMAGES.length);
    }, holding ? 140 : 1800);
    return () => window.clearInterval(interval);
  }, [holding, erupted]);

  const dbLevel = (84 + charge * 40.8).toFixed(1);
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const shakeX = holding && !erupted ? (Math.random() - 0.5) * charge * 8 : 0;
  const shakeY = holding && !erupted ? (Math.random() - 0.5) * charge * 6 : 0;

  const startHold = () => {
    if (erupted) return;
    audioEngine.prepareInteractiveFx();
    setHolding(true);
  };

  const stopHold = () => {
    setHolding(false);
  };

  const handleReset = () => {
    chargeRef.current = 0;
    setCharge(0);
    setErupted(false);
    audioEngine.setRoarBoost(0);
  };

  return (
    <section
      id="roar-hook"
      className="relative overflow-hidden border-t border-[#0B0D12]/10 bg-[#FAF8F2] px-4 py-16 select-none sm:px-8 sm:py-24"
    >
      {/* Floodlit Chepauk Broadcast Decibel Stage */}
      <div
        className="relative mx-auto max-w-[1280px] overflow-hidden border border-[#FFD60A]/40 bg-[#0B0D12] px-6 py-16 text-[#FFFFFF] shadow-[0_32px_90px_rgba(11,13,18,0.22)] sm:px-12 sm:py-24"
        style={{ transform: `translate3d(${shakeX}px, ${shakeY}px, 0)` }}
      >
        {/* Subtle Night Stadium Photo Backdrop */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ opacity: erupted ? 0.2 : 0.08 + charge * 0.16 }}
        >
          <img
            src={FLASH_IMAGES[flashIdx]}
            alt=""
            className="h-full w-full object-cover object-center filter saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D12]/80 via-[#0B0D12]/45 to-[#0B0D12]" />
        </div>

        {/* Twin Floodlight Diagonal Cones & Expanding Yellow Core Aura */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(255,214,10,0.18), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(255,214,10,0.18), transparent 45%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background:
              'radial-gradient(circle at 50% 62%, rgba(255,214,10,0.34) 0%, rgba(255,214,10,0.1) 36%, transparent 68%)',
            opacity: erupted ? 1 : 0.35 + charge * 0.65,
          }}
        />

        {/* Faint Architectural Grid & Ghost 07 Watermark */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFD60A 1px, transparent 1px), linear-gradient(to bottom, #FFD60A 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden font-display text-[220px] font-bold leading-none text-[#FFD60A]/[0.04] sm:text-[340px]">
          07
        </div>

        {/* Corner Telemetry Framing Ticks */}
        <span className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-[#FFD60A]/70" />
        <span className="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-[#FFD60A]/70" />
        <span className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-[#FFD60A]/70" />
        <span className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-[#FFD60A]/70" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
          <div ref={headerRef} className="will-change-transform">
            <span className="inline-flex items-center gap-2 bg-[#FFD60A] px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#0B0D12] shadow-[0_6px_20px_rgba(255,214,10,0.35)]">
              <Volume2 className="h-3.5 w-3.5" />
              <span>Interactive Soundwave Experience</span>
            </span>

            <h2 className="mt-7 font-serif text-4xl font-light tracking-[0.03em] text-[#FFFFFF] sm:text-6xl md:text-7xl">
              {erupted ? (
                <>
                  <span className="font-semibold text-[#FFD60A]">124.8 dB.</span> WHEN NO. 7 WALKED
                  IN.
                </>
              ) : (
                <>
                  PRESS &amp; HOLD TO HEAR{' '}
                  <span className="font-semibold italic text-[#FFD60A]">CHEPAUK ROAR.</span>
                </>
              )}
            </h2>
          </div>

          {/* High-Contrast Spectrum Analyzer Panel */}
          <div className="mt-10 w-full max-w-2xl border border-[#FFD60A]/25 bg-[#12151F]/90 px-5 py-6 sm:px-8">
            <div className="mb-4 flex items-center justify-between font-mono text-[9.5px] font-semibold uppercase tracking-[0.24em] text-[#FFFFFF]/55">
              <span>BASELINE · 84.0 dB</span>
              <span className="text-[#FFD60A]">
                {erupted ? 'PEAK SURGE · LOCKED' : holding ? 'CROWD SURGING' : 'CHEPAUK STANDS'}
              </span>
              <span>RECORD · 124.8 dB</span>
            </div>

            {/* Live Breathing & Surging Stadium Equalizer Bars */}
            <div className="flex h-16 items-end justify-center gap-1.5 sm:gap-2">
              {Array.from({ length: EQ_BAR_COUNT }).map((_, i) => {
                const centerBias = 1 - Math.abs(i - (EQ_BAR_COUNT - 1) / 2) / (EQ_BAR_COUNT / 2);
                const idleBase = 28 + Math.round(centerBias * 58);
                const liveLevel = holding
                  ? Math.round(
                      (0.32 + Math.abs(Math.sin(charge * 18 + i * 0.7)) * 0.35 + centerBias * 0.45) *
                        (0.38 + charge * 0.62) *
                        100
                    )
                  : erupted
                    ? Math.round((0.42 + centerBias * 0.58) * 100)
                    : idleBase;

                return (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-colors duration-150 sm:w-2 ${
                      !holding ? 'animate-eq-bar' : ''
                    }`}
                    style={{
                      height: `${Math.min(100, Math.max(18, liveLevel))}%`,
                      animationDelay: `${((i * 0.11) % 1.2).toFixed(2)}s`,
                      background:
                        charge > 0.55 || erupted
                          ? 'linear-gradient(to top, #E09F00, #FFD60A, #FFF6B0)'
                          : 'linear-gradient(to top, rgba(255,214,10,0.45), #FFD60A)',
                      boxShadow:
                        charge > 0.6 || erupted ? '0 0 12px rgba(255,214,10,0.55)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Prominent Telemetry Decibel Meter */}
            <div className="mt-5 flex items-baseline justify-center gap-3 border-t border-[#FFFFFF]/10 pt-4">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#FFFFFF]/60">
                STADIUM LEVEL
              </span>
              <span className="font-display text-3xl font-semibold tracking-wider text-[#FFD60A] sm:text-4xl">
                {dbLevel}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFFFFF]/80">
                dB
              </span>
            </div>
          </div>

          {/* Central Turbine Press-and-Hold Ignition Trigger */}
          <div className="mt-10">
            <AnimatePresence mode="wait">
              {!erupted ? (
                <motion.button
                  key="hold-btn"
                  type="button"
                  data-cursor="HOLD"
                  onPointerDown={startHold}
                  onPointerUp={stopHold}
                  onPointerLeave={stopHold}
                  onPointerCancel={stopHold}
                  whileTap={{ scale: 0.94 }}
                  className="group relative flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[#131722] shadow-[0_0_50px_rgba(255,214,10,0.28)] transition-shadow duration-300 hover:shadow-[0_0_72px_rgba(255,214,10,0.55)]"
                >
                  {/* Subtle Sonar Invite Ping at Rest */}
                  {!holding && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-[#FFD60A]/35 opacity-60"
                    />
                  )}

                  {/* Outer Orbit Dashed Reticle */}
                  <svg
                    className="animate-orbit-slow pointer-events-none absolute -inset-3 h-[184px] w-[184px] opacity-65"
                    viewBox="0 0 184 184"
                  >
                    <circle
                      cx="92"
                      cy="92"
                      r="88"
                      fill="none"
                      stroke="#FFD60A"
                      strokeWidth="1"
                      strokeDasharray="4 8"
                    />
                  </svg>

                  {/* Circular Progress Arc */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,214,10,0.18)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      fill="none"
                      stroke="#FFD60A"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - charge)}
                    />
                  </svg>

                  <Flame
                    className={`h-7 w-7 transition-transform ${
                      holding
                        ? 'scale-125 text-[#FFD60A] drop-shadow-[0_0_12px_rgba(255,214,10,0.9)]'
                        : 'text-[#FFD60A] group-hover:scale-110'
                    }`}
                  />
                  <span className="mt-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-[#FFFFFF]">
                    {holding ? 'CHARGING...' : 'HOLD HERE'}
                  </span>
                </motion.button>
              ) : (
                <motion.div
                  key="erupted-state"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <button
                    type="button"
                    onClick={() => audioEngine.playWhistlePoduEruption()}
                    className="inline-flex items-center gap-3 border-2 border-[#FFFFFF]/25 bg-[#FFD60A] px-8 py-4 font-display text-xl font-semibold tracking-[0.2em] text-[#0B0D12] shadow-[0_14px_45px_rgba(255,214,10,0.55)] transition-transform hover:scale-105 hover:bg-[#FFE63B] sm:text-2xl"
                  >
                    <Volume2 className="h-5 w-5" />
                    <span>WHISTLE PODU · THALA 07</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FFFFFF]/65 transition-colors hover:text-[#FFD60A]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Replay Roar</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
