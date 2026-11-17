import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface RevealSegment {
  text: string;
  className?: string;
  underline?: boolean;
}

interface ScrollRevealTextProps {
  /** Plain text shorthand if no inline highlight segments are needed */
  text?: string;
  /** Styled inline segments for mixed colors, weights, italics, or underline sweeps */
  segments?: RevealSegment[];
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  /** Seconds between consecutive word entrances */
  stagger?: number;
  /** Extra initial delay (seconds) to sequence stacked lines */
  delay?: number;
  /** ScrollTrigger start position */
  start?: string;
}

/**
 * Masked word-by-word editorial reveal triggered smoothly on scroll.
 */
export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({
  text,
  segments,
  as: Tag = 'h2',
  className = '',
  stagger = 0.052,
  delay = 0,
  start = 'top 86%',
}) => {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll<HTMLElement>('[data-reveal-word]');
      const underlines = el.querySelectorAll<HTMLElement>('[data-reveal-underline]');

      if (words.length > 0) {
        gsap.fromTo(
          words,
          { yPercent: 115, opacity: 0, rotateZ: 1.8 },
          {
            yPercent: 0,
            opacity: 1,
            rotateZ: 0,
            duration: 0.78,
            delay,
            stagger,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (underlines.length > 0) {
        gsap.fromTo(
          underlines,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.75,
            delay: delay + Math.max(0.18, words.length * stagger * 0.7),
            ease: 'power3.out',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, [delay, stagger, start]);

  const resolvedSegments: RevealSegment[] =
    segments && segments.length > 0 ? segments : text ? [{ text }] : [];

  return (
    <Tag
      ref={rootRef as React.RefObject<never>}
      className={className}
    >
      {resolvedSegments.map((seg, sIdx) => {
        const tokens = seg.text.split(/(\s+)/);
        return (
          <span
            key={sIdx}
            className={`relative ${seg.underline ? 'inline-block' : 'inline'} ${seg.className || ''}`}
          >
            {tokens.map((tok, tIdx) => {
              if (/^\s+$/.test(tok)) {
                return <React.Fragment key={tIdx}>{tok}</React.Fragment>;
              }
              return (
                <span
                  key={tIdx}
                  className="inline-block overflow-hidden align-bottom py-[0.12em] -my-[0.12em] px-[0.07em] -mx-[0.07em]"
                >
                  <span data-reveal-word className="inline-block will-change-transform">
                    {tok}
                  </span>
                </span>
              );
            })}
            {seg.underline && (
              <span
                data-reveal-underline
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 left-0 right-0 h-[3px] bg-[#FFD60A] will-change-transform"
              />
            )}
          </span>
        );
      })}
    </Tag>
  );
};

interface ScrollRevealEyebrowProps {
  children: React.ReactNode;
  className?: string;
  start?: string;
}

/**
 * Animated section kicker bar + label that draws in smoothly on scroll.
 */
export const ScrollRevealEyebrow: React.FC<ScrollRevealEyebrowProps> = ({
  children,
  className = '',
  start = 'top 88%',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const bar = el.querySelector<HTMLElement>('[data-eyebrow-bar]');
      const label = el.querySelector<HTMLElement>('[data-eyebrow-label]');

      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.55,
            ease: 'power3.out',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (label) {
        gsap.fromTo(
          label,
          { x: -14, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.65,
            delay: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start,
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, ref);

    return () => ctx.revert();
  }, [start]);

  return (
    <div
      ref={ref}
      className={`flex flex-wrap items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B37800] ${className}`}
    >
      <span data-eyebrow-bar className="inline-block h-[2px] w-8 bg-[#FFD60A] will-change-transform" />
      <span data-eyebrow-label className="inline-flex flex-wrap items-center gap-3 will-change-transform">
        {children}
      </span>
    </div>
  );
};
