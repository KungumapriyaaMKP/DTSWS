import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PHOTO_ASSETS } from '../../data/dhoniData';

gsap.registerPlugin(ScrollTrigger);

interface ArchivalImageProps {
  assetKey: string;
  className?: string;
  imgClassName?: string;
  showCaption?: boolean;
  priority?: boolean;
  overlayGradient?: boolean;
  aspectClass?: string;
  kenBurns?: boolean;
  tilt?: boolean;
}

export const ArchivalImage: React.FC<ArchivalImageProps> = ({
  assetKey,
  className = '',
  imgClassName = '',
  showCaption = false,
  priority: _priority = false,
  overlayGradient = true,
  aspectClass = 'aspect-[16/10]',
  kenBurns = true,
  tilt = true,
}) => {
  const asset = PHOTO_ASSETS[assetKey];
  const cardRef = useRef<HTMLElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(10% 0% 10% 0%)', opacity: 0.75, scale: 0.96 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  if (!asset) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!tilt || !cardRef.current) return;
    if (window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 9;
    const rotX = (0.5 - py) * 7;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.015,1.015,1.015)`;
    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255, 214, 10, 0.28), transparent 55%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <figure
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden bg-[#FAF8F2] transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      <div className={`relative w-full overflow-hidden ${aspectClass}`}>
        {!failed ? (
          <img
            src={asset.src}
            alt={asset.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover object-top transition-transform duration-1000 ease-out will-change-transform group-hover:scale-[1.08] filter contrast-[1.06] saturate-[1.05] ${
              kenBurns ? 'animate-ken-burns' : ''
            } ${imgClassName}`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center border border-[#FFD60A]/60 bg-[#FAF8F2] p-6 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#B37800]">
              {asset.commonsFile}
            </span>
          </div>
        )}

        {overlayGradient && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0D12]/80 via-transparent to-transparent" />
        )}

        {/* Dynamic Sunlit Yellow Specular Glare */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        />

        {/* Crisp Bright Yellow Accent Border on Hover */}
        <div className="pointer-events-none absolute inset-0 border border-[#0B0D12]/10 transition-colors duration-300 group-hover:border-2 group-hover:border-[#FFD60A]" />
      </div>

      {showCaption && (
        <figcaption className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#525661]">
          <span className="truncate text-[#0B0D12]/80">{asset.caption}</span>
        </figcaption>
      )}
    </figure>
  );
};
