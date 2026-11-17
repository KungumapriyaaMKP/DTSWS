import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { createCricketBallTextures } from '../../utils/proceduralTextures';
import {
  createCricketBatTextures,
  createRealisticWillowBladeGeometry,
} from '../../utils/batGeometryAndTextures';
import { Viewport3DGuard, useCanvasActive } from '../Viewport3DGuard';

interface SpinningCricketBallProps {
  /** Loading progress 0..100 */
  progress: number;
  ready: boolean;
  /** True from click through shutter exit (triggers 3D bat windup & swing) */
  hitting?: boolean;
  /** True at moment of bat impact (kicks ball forward & spins fast) */
  launching?: boolean;
  /** Optional click handler attached directly to the centered ball hitbox */
  onBallClick?: () => void;
  spinSpeedOverride?: number;
}

const CricketBatMesh: React.FC<{ active: boolean }> = ({ active }) => {
  const batRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const batTextures = useMemo(() => createCricketBatTextures(), []);
  const bladeGeo = useMemo(() => createRealisticWillowBladeGeometry(), []);

  useEffect(() => {
    return () => {
      batTextures.dispose();
      bladeGeo.dispose();
    };
  }, [batTextures, bladeGeo]);

  useEffect(() => {
    if (!active) {
      elapsedRef.current = 0;
    }
  }, [active]);

  useFrame((_, delta) => {
    const bat = batRef.current;
    if (!bat || !active) return;

    elapsedRef.current += Math.min(delta, 0.05);
    const t = elapsedRef.current;

    const cockEnd = 0.30;
    const impactTime = 0.54;
    const followEnd = 1.15;

    if (t <= cockEnd) {
      // Phase 1: Bat sweeps cleanly into clear right-side view showing sculpted 3D face & edges
      const u = THREE.MathUtils.clamp(t / cockEnd, 0, 1);
      const easeOut = 1 - Math.pow(1 - u, 3);
      bat.position.set(
        THREE.MathUtils.lerp(2.15, 1.14, easeOut),
        THREE.MathUtils.lerp(0.45, 0.14, easeOut),
        THREE.MathUtils.lerp(0.35, 0.56, easeOut)
      );
      bat.rotation.set(
        THREE.MathUtils.lerp(0.28, 0.22, easeOut),
        THREE.MathUtils.lerp(-0.92, -0.5, easeOut),
        THREE.MathUtils.lerp(-0.95, -0.66, easeOut)
      );
    } else if (t <= impactTime) {
      // Phase 2: Whip drive directly through the red ball sweet-spot
      const u = THREE.MathUtils.clamp((t - cockEnd) / (impactTime - cockEnd), 0, 1);
      const whip = u * u;
      bat.position.set(
        THREE.MathUtils.lerp(1.14, 0.44, whip),
        THREE.MathUtils.lerp(0.14, -0.04, whip),
        THREE.MathUtils.lerp(0.56, 0.52, whip)
      );
      bat.rotation.set(
        THREE.MathUtils.lerp(0.22, 0.08, whip),
        THREE.MathUtils.lerp(-0.5, -0.22, whip),
        THREE.MathUtils.lerp(-0.66, 0.26, whip)
      );
    } else {
      // Phase 3: Helicopter follow-through across left side revealing V-spine ridge
      const q = THREE.MathUtils.clamp((t - impactTime) / (followEnd - impactTime), 0, 1);
      const easeOut = 1 - Math.pow(1 - q, 3);
      bat.position.set(
        THREE.MathUtils.lerp(0.44, -1.25, easeOut),
        THREE.MathUtils.lerp(-0.04, 0.28, easeOut),
        THREE.MathUtils.lerp(0.52, 0.15, easeOut)
      );
      bat.rotation.set(
        THREE.MathUtils.lerp(0.08, -0.22, easeOut),
        THREE.MathUtils.lerp(-0.22, 0.72, easeOut),
        THREE.MathUtils.lerp(0.26, 1.18, easeOut)
      );
    }
  });

  if (!active) return null;

  return (
    <group ref={batRef} position={[2.15, 0.45, 0.35]} rotation={[0.28, -0.92, -0.95]}>
      {/* Lofted 3D Grade-1A English Willow Blade with Pressed Bow & V-Spine */}
      <mesh geometry={bladeGeo}>
        <meshPhysicalMaterial
          map={batTextures.bladeMap}
          roughnessMap={batTextures.bladeRoughness}
          bumpMap={batTextures.bladeBump}
          bumpScale={0.011}
          roughness={0.38}
          metalness={0.06}
          clearcoat={0.58}
          clearcoatRoughness={0.22}
          envMapIntensity={1.45}
        />
      </mesh>

      {/* Oval Rubber Handle Collar Skirt Blending Into Shoulders */}
      <mesh position={[0, 0.35, -0.004]} scale={[1.08, 1, 0.88]}>
        <cylinderGeometry args={[0.047, 0.06, 0.09, 24]} />
        <meshStandardMaterial color="#14161e" roughness={0.82} metalness={0.05} />
      </mesh>

      {/* Oval Cane Handle with Diamond-Knurled Black & Championship Yellow Rubber Grip */}
      <mesh position={[0, 0.65, -0.004]} scale={[1.08, 1, 0.88]}>
        <cylinderGeometry args={[0.043, 0.047, 0.56, 24]} />
        <meshStandardMaterial
          map={batTextures.gripMap}
          bumpMap={batTextures.gripBump}
          bumpScale={0.012}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      {/* Molded Chamfered Grip Top Cap + Gold Ring */}
      <mesh position={[0, 0.935, -0.004]} scale={[1.08, 1, 0.88]}>
        <cylinderGeometry args={[0.048, 0.045, 0.032, 24]} />
        <meshStandardMaterial color="#14161e" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.953, -0.004]} scale={[1.06, 0.55, 0.86]}>
        <sphereGeometry args={[0.046, 20, 12]} />
        <meshStandardMaterial color="#ffd60a" roughness={0.34} metalness={0.25} />
      </mesh>
    </group>
  );
};

const CricketBallMesh: React.FC<SpinningCricketBallProps> = ({
  progress,
  ready,
  hitting = false,
  launching = false,
  spinSpeedOverride,
}) => {
  const spinGroupRef = useRef<THREE.Group>(null);
  const scaleGroupRef = useRef<THREE.Group>(null);
  const impactLightRef = useRef<THREE.PointLight>(null);
  const stitchMeshRef = useRef<THREE.InstancedMesh>(null);
  const textures = useMemo(() => createCricketBallTextures(), []);

  const stitchCount = 160; // 40 stitches around x 4 seam rows

  useEffect(() => {
    return () => {
      textures.map.dispose();
      textures.roughnessMap.dispose();
      textures.bumpMap.dispose();
    };
  }, [textures]);

  // Populate flush tangential herringbone cotton stitches tightly against the equator seam
  useEffect(() => {
    const mesh = stitchMeshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    dummy.rotation.order = 'YXZ';

    const rowOffsets = [-0.056, -0.022, 0.022, 0.056];
    const stitchesPerRow = 40;
    const radius = 1.001;

    let idx = 0;
    for (let r = 0; r < rowOffsets.length; r++) {
      const y = rowOffsets[r];
      const ringR = Math.sqrt(Math.max(0.01, radius * radius - y * y));
      const slant = r % 2 === 0 ? 0.24 : -0.24;

      for (let i = 0; i < stitchesPerRow; i++) {
        const theta = (i / stitchesPerRow) * Math.PI * 2 + (r % 2) * 0.035;
        dummy.position.set(Math.cos(theta) * ringR, y, Math.sin(theta) * ringR);
        dummy.rotation.set(Math.PI / 2 + slant, -theta, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (spinGroupRef.current) {
      const spinSpeed =
        spinSpeedOverride ??
        (launching ? 24.0 : hitting ? 11.0 : ready ? 1.5 : 5.2 - (progress / 100) * 2.8);
      spinGroupRef.current.rotation.y += dt * spinSpeed;
    }

    if (scaleGroupRef.current && spinSpeedOverride === undefined) {
      if (launching) {
        // Kicked cleanly forward & left toward camera after bat strike
        const s = THREE.MathUtils.lerp(scaleGroupRef.current.scale.x, 4.4, 0.11);
        scaleGroupRef.current.scale.set(s, s, s);
        scaleGroupRef.current.position.x = THREE.MathUtils.lerp(
          scaleGroupRef.current.position.x,
          -0.42,
          0.1
        );
        scaleGroupRef.current.position.y = THREE.MathUtils.lerp(
          scaleGroupRef.current.position.y,
          0.24,
          0.1
        );
        scaleGroupRef.current.position.z = THREE.MathUtils.lerp(
          scaleGroupRef.current.position.z,
          2.0,
          0.12
        );
      } else {
        scaleGroupRef.current.scale.set(1, 1, 1);
      }
    }

    if (impactLightRef.current) {
      const targetIntensity = launching ? 6.5 : 0;
      impactLightRef.current.intensity = THREE.MathUtils.lerp(
        impactLightRef.current.intensity,
        targetIntensity,
        0.22
      );
    }
  });

  return (
    <>
      <pointLight
        ref={impactLightRef}
        position={[0.7, 0.1, 1.4]}
        intensity={0}
        distance={6}
        color="#ffe853"
      />
      <group ref={scaleGroupRef} rotation={[0.28, 0, -0.35]}>
        <group ref={spinGroupRef}>
          {/* Main Lacquered Cowhide Sphere */}
          <mesh>
            <sphereGeometry args={[1, 64, 48]} />
            <meshPhysicalMaterial
              map={textures.map}
              roughnessMap={textures.roughnessMap}
              bumpMap={textures.bumpMap}
              bumpScale={0.014}
              roughness={0.28}
              metalness={0.04}
              clearcoat={0.86}
              clearcoatRoughness={0.14}
              envMapIntensity={1.45}
            />
          </mesh>

          {/* Flush Raised Hand-Stitched Equatorial Seam */}
          <instancedMesh ref={stitchMeshRef} args={[undefined, undefined, stitchCount]}>
            <capsuleGeometry args={[0.0085, 0.034, 4, 8]} />
            <meshStandardMaterial color="#faf5e8" roughness={0.68} metalness={0.02} />
          </instancedMesh>
        </group>
      </group>
      {spinSpeedOverride === undefined && <CricketBatMesh active={hitting} />}
    </>
  );
};

interface CricketBallCanvasStageProps extends SpinningCricketBallProps {
  envResolution?: number;
  dpr?: [number, number];
  respectActive?: boolean;
  cameraZ?: number;
}

const CricketBallCanvasStage: React.FC<CricketBallCanvasStageProps> = ({
  progress,
  ready,
  hitting = false,
  launching = false,
  spinSpeedOverride,
  envResolution = 64,
  dpr = [1, 2],
  respectActive = false,
  cameraZ = 3.05,
}) => {
  const isCanvasActive = useCanvasActive();
  const frameloop = respectActive && !isCanvasActive ? 'never' : 'always';

  return (
    <Canvas
      frameloop={frameloop}
      dpr={dpr}
      camera={{ position: [0, 0.08, cameraZ], fov: 40 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
    >
      <ambientLight intensity={0.68} color="#fff9eb" />
      <directionalLight position={[4, 5, 5]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-4, -2, 3]} intensity={1.7} color="#ffd60a" />
      <pointLight position={[0, 3, -3]} intensity={2.0} color="#ffe853" />

      <Environment resolution={envResolution}>
        <Lightformer
          form="circle"
          intensity={3.0}
          color="#ffffff"
          scale={[4, 4, 1]}
          position={[3, 4, 4]}
        />
        <Lightformer
          form="circle"
          intensity={2.4}
          color="#ffd60a"
          scale={[5, 5, 1]}
          position={[-4, 1, 2]}
        />
      </Environment>

      <CricketBallMesh
        progress={progress}
        ready={ready}
        hitting={hitting}
        launching={launching}
        spinSpeedOverride={spinSpeedOverride}
      />
    </Canvas>
  );
};

export const SpinningCricketBall: React.FC<SpinningCricketBallProps> = ({
  progress,
  ready,
  hitting = false,
  launching = false,
  onBallClick,
}) => {
  return (
    <div className="relative mx-auto flex h-80 w-full max-w-[1080px] items-center justify-center sm:h-[430px] md:h-[490px]">
      {/* Soft Warm Ground Shadow Directly Under Centered Ball */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 h-7 w-48 -translate-x-1/2 rounded-full bg-[#0B0D12]/18 blur-xl sm:w-64" />

      {/* Impact Shockwave Ring on Willow Bat Contact */}
      {launching && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-4 border-[#FFD60A]/85 sm:h-96 sm:w-96"
        />
      )}

      <div className="pointer-events-none h-full w-full">
        <CricketBallCanvasStage
          progress={progress}
          ready={ready}
          hitting={hitting}
          launching={launching}
          cameraZ={3.3}
        />
      </div>

      {/* Circular Clickable Hit Zone Over the Crimson Ball */}
      {onBallClick && !hitting && !launching && (
        <button
          type="button"
          onClick={onBallClick}
          data-cursor="STRIKE"
          aria-label="Strike cricket ball to open page"
          className="group absolute left-1/2 top-1/2 z-20 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-200 hover:scale-[1.03] focus:outline-none sm:h-80 sm:w-80 md:h-[360px] md:w-[360px]"
        >
          <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#FFD60A]/0 transition-all duration-300 group-hover:ring-[#FFD60A]/55" />
        </button>
      )}
    </div>
  );
};

const MiniCricketBallFallback = () => (
  <div className="h-full w-full scale-[0.82] rounded-full bg-[radial-gradient(circle_at_35%_30%,#d42432_0%,#8b0012_58%,#450008_100%)] shadow-[0_6px_18px_rgba(139,0,18,0.28)]" />
);

/**
 * Compact spinning 3D crimson cricket ball centerpiece cleanly paused when off-screen.
 */
export const RevolvingCricketBall: React.FC<{ className?: string }> = ({
  className = 'h-12 w-12 sm:h-14 sm:w-14',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Viewport3DGuard
        eager={false}
        className="relative h-full w-full"
        fallback={<MiniCricketBallFallback />}
      >
        <CricketBallCanvasStage
          progress={100}
          ready
          spinSpeedOverride={1.35}
          envResolution={32}
          dpr={[1, 1.35]}
          respectActive
        />
      </Viewport3DGuard>
    </div>
  );
};
