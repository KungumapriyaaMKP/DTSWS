import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface KineticMarqueeProps {
  items: string[];
  variant?: 'yellow' | 'white';
  reverse?: boolean;
}

export const KineticMarquee: React.FC<KineticMarqueeProps> = ({
  items,
  variant = 'yellow',
  reverse = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const anim = reverse
        ? gsap.fromTo(
            track,
            { xPercent: -50 },
            {
              xPercent: 0,
              duration: 24,
              ease: 'none',
              repeat: -1,
            }
          )
        : gsap.to(track, {
            xPercent: -50,
            duration: 24,
            ease: 'none',
            repeat: -1,
          });

      const setScale = gsap.quickTo(anim, 'timeScale', {
        duration: 0.35,
        ease: 'power2.out',
      });

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const velocity = Math.min(4.5, Math.abs(self.getVelocity()) / 450);
          setScale(1 + velocity);
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [reverse]);

  const isYellow = variant === 'yellow';
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden border-y py-3.5 select-none ${
        isYellow
          ? 'border-[#0B0D12]/15 bg-[#FFD60A] text-[#0B0D12]'
          : 'border-[#0B0D12]/10 bg-[#FFFFFF] text-[#0B0D12]'
      }`}
    >
      <div ref={trackRef} className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform">
        {repeated.map((text, idx) => (
          <span
            key={idx}
            className="flex items-center gap-8 font-display text-xs font-semibold uppercase tracking-[0.28em] sm:text-sm"
          >
            <span>{text}</span>
            <span
              className={`inline-block h-2 w-2 rotate-45 ${
                isYellow ? 'bg-[#0B0D12]' : 'bg-[#FFD60A]'
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
};
