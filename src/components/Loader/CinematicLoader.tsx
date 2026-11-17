import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../../utils/audioEngine';
import { SpinningCricketBall } from './SpinningCricketBall';

interface CinematicLoaderProps {
  onComplete: () => void;
  onEnterWithSound: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({
  onComplete,
  onEnterWithSound,
}) => {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [hitting, setHitting] = useState(false);
  const [impacted, setImpacted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    audioEngine.preload();
    let raf = 0;
    const start = performance.now();
    const duration = 680;

    const tick = (now: number) => {
      const elapsed = now - start;
      const raw = Math.min(1, elapsed / duration);
      const pct = Math.min(100, Math.round(raw * 100));
      setProgress(pct);
      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setReady(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const handleBegin = () => {
    if (hitting || exiting) return;
    setHitting(true);
    onEnterWithSound();

    // Sweet-spot willow contact at 540ms (after clear 3D backlift + drive whip)
    timersRef.current.push(
      window.setTimeout(() => {
        setImpacted(true);
        audioEngine.playBatStrike();
      }, 540)
    );

    // Let viewer watch follow-through + launched ball before splitting shutters open
    timersRef.current.push(
      window.setTimeout(() => {
        setExiting(true);
      }, 960)
    );

    // Unmount loader once shutters clear
    timersRef.current.push(window.setTimeout(onComplete, 1780));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] overflow-hidden select-none">
        {/* Clean White + Bright Yellow Cinema Shutters */}
        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: exiting ? '-100%' : '0%' }}
          transition={{ duration: 0.82, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#FFFFFF]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,214,10,0.28),transparent_68%)]" />
        </motion.div>

        <motion.div
          initial={{ y: '0%' }}
          animate={{ y: exiting ? '100%' : '0%' }}
          transition={{ duration: 0.82, ease: [0.76, 0, 0.24, 1] }}
          className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#FFFFFF]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,214,10,0.32),transparent_68%)]" />
        </motion.div>

        {/* Minimal Centerpiece: Clickable Spinning 3D Cricket Ball (+ Willow Bat Kickoff) & Click Trigger */}
        <motion.div
          animate={{
            opacity: exiting ? 0 : 1,
            scale: exiting ? 1.06 : 1,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center"
        >
          <SpinningCricketBall
            progress={progress}
            ready={ready}
            hitting={hitting}
            launching={impacted}
            onBallClick={handleBegin}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: ready && !hitting ? 1 : 0,
              y: ready && !hitting ? 0 : 10,
            }}
            transition={{ duration: 0.35 }}
            className={`mt-6 flex items-center justify-center ${
              ready && !hitting ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <button
              type="button"
              data-cursor="CLICK"
              onClick={handleBegin}
              className="bg-[#FFD60A] px-10 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.34em] text-[#0B0D12] shadow-[0_14px_34px_rgba(255,214,10,0.45)] transition-all duration-300 hover:scale-105 hover:bg-[#FFE63B]"
            >
              CLICK
            </button>
          </motion.div>
        </motion.div>

        {/* Seam Flash on Shutter Open */}
        {exiting && (
          <motion.div
            initial={{ opacity: 0.95, scaleX: 0.2 }}
            animate={{ opacity: 0, scaleX: 1.4 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-x-0 top-1/2 z-30 h-[3px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#FFD60A] to-transparent shadow-[0_0_32px_#FFD60A]"
          />
        )}
      </div>
    </AnimatePresence>
  );
};
