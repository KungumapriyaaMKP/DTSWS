import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    ringX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    ringY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  });

  const [label, setLabel] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('custom-cursor-active');
      setVisible(false);
      return;
    }

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) {
      document.body.classList.remove('custom-cursor-active');
      return;
    }

    let rafId = 0;

    const updatePositions = (clientX: number, clientY: number, snapRing = false) => {
      posRef.current.x = clientX;
      posRef.current.y = clientY;
      if (snapRing) {
        posRef.current.ringX = clientX;
        posRef.current.ringY = clientY;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      if (snapRing && ringRef.current) {
        ringRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        document.body.classList.remove('custom-cursor-active');
        setVisible(false);
        return;
      }

      setVisible((prev) => {
        if (!prev) {
          updatePositions(e.clientX, e.clientY, true);
          document.body.classList.add('custom-cursor-active');
        } else {
          updatePositions(e.clientX, e.clientY, false);
        }
        return true;
      });

      const target = e.target as HTMLElement | null;
      const cursorTarget = target?.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        setLabel(cursorTarget.getAttribute('data-cursor') || 'EXPLORE');
      } else if (target?.closest('a, button, [role="button"], input, textarea')) {
        setLabel('');
      } else {
        setLabel(null);
      }
    };

    const syncTargetAtPoint = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      const cursorTarget = el?.closest('[data-cursor]') as HTMLElement | null;
      if (cursorTarget) {
        setLabel(cursorTarget.getAttribute('data-cursor') || 'EXPLORE');
      } else if (el?.closest('a, button, [role="button"], input, textarea')) {
        setLabel('');
      } else {
        setLabel(null);
      }
    };

    const onDown = () => setIsPressed(true);
    const onUp = () => {
      setIsPressed(false);
      // Clear stale hover badges (e.g. "STRIKE") if clicked button unmounts underneath cursor
      window.setTimeout(() => {
        syncTargetAtPoint(posRef.current.x, posRef.current.y);
      }, 60);
    };
    const onLeave = () => {
      document.body.classList.remove('custom-cursor-active');
      setVisible(false);
    };

    const animate = () => {
      posRef.current.ringX += (posRef.current.x - posRef.current.ringX) * 0.16;
      posRef.current.ringY += (posRef.current.y - posRef.current.ringY) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${posRef.current.ringX}px, ${posRef.current.ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isExpanded = label !== null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* High-Contrast Precision Core Dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 -ml-1.5 -mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0B0D12] bg-[#FFD60A] shadow-[0_0_14px_rgba(255,214,10,0.9)] transition-opacity duration-150"
        style={{ opacity: isExpanded && label ? 0 : 1 }}
      />

      {/* Damped Outer Bright Yellow Ring */}
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 flex items-center justify-center rounded-full border-2 transition-[width,height,margin,border-color,background-color] duration-200 ease-out ${
          isExpanded
            ? label
              ? '-ml-10 -mt-10 h-20 w-20 border-[#FFD60A] bg-[#0B0D12]/90 shadow-lg backdrop-blur-sm'
              : '-ml-6 -mt-6 h-12 w-12 border-[#FFD60A] bg-[#FFD60A]/25'
            : '-ml-4 -mt-4 h-8 w-8 border-[#E5A900]/90'
        } ${isPressed ? 'scale-90' : 'scale-100'}`}
      >
        {label && (
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-[#FFD60A]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
