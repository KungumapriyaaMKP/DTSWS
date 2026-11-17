import React, { Component, createContext, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { PHOTO_ASSETS } from '../data/dhoniData';

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const CanvasActiveContext = createContext<boolean>(true);
export const useCanvasActive = () => useContext(CanvasActiveContext);

interface Viewport3DGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  eager?: boolean;
  className?: string;
}

/**
 * Keeps 3D WebGL canvases mounted cleanly while pausing off-screen frameloops.
 */
export const Viewport3DGuard: React.FC<Viewport3DGuardProps> = ({
  children,
  fallback,
  eager = true,
  className = 'h-full w-full',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(eager);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasMounted(true);
        }
        setInView(entry.isIntersecting);
      },
      { rootMargin: '1400px 0px' }
    );

    observer.observe(el);

    // Pre-warm off-screen 3D contexts quietly once hero settle idle time arrives
    let idleTimer = 0;
    if (!hasMounted) {
      const win = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (win.requestIdleCallback) {
        const ricId = win.requestIdleCallback(() => setHasMounted(true), { timeout: 2800 });
        return () => {
          observer.disconnect();
          win.cancelIdleCallback?.(ricId);
        };
      }
      idleTimer = window.setTimeout(() => setHasMounted(true), 2400);
    }

    return () => {
      observer.disconnect();
      if (idleTimer) window.clearTimeout(idleTimer);
    };
  }, [hasMounted]);

  const defaultFallback = fallback || (
    <div className="relative h-full w-full overflow-hidden bg-[#040507]">
      <img
        src={PHOTO_ASSETS.chepaukNight.src}
        alt={PHOTO_ASSETS.chepaukNight.alt}
        className="h-full w-full object-cover object-center opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#040507] via-[#040507]/30 to-[#040507]/70" />
    </div>
  );

  return (
    <div ref={hostRef} className={className}>
      {hasMounted ? (
        <CanvasActiveContext.Provider value={inView}>
          <CanvasErrorBoundary fallback={defaultFallback}>
            <Suspense fallback={defaultFallback}>{children}</Suspense>
          </CanvasErrorBoundary>
        </CanvasActiveContext.Provider>
      ) : (
        defaultFallback
      )}
    </div>
  );
};
