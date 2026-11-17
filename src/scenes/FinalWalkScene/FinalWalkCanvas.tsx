import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createCricketerSilhouetteTexture,
  createOutfieldTextures,
  createPitchTextures,
  createSoftGroundShadowTexture,
} from '../../utils/proceduralTextures';
import { useCanvasActive } from '../../components/Viewport3DGuard';

interface FinalWalkCanvasProps {
  /** Mutable ref holding normalized 0..1 progress through Scene 08 */
  progressRef?: React.MutableRefObject<number>;
  /** Static fallback progress if progressRef is omitted */
  progress?: number;
  isMobile?: boolean;
  prefersReducedMotion?: boolean;
  webglSupported?: boolean;
}

const FinalWalkInner: React.FC<FinalWalkCanvasProps> = ({
  progressRef,
  progress = 0,
  isMobile = false,
  prefersReducedMotion = false,
}) => {
  const { camera } = useThree();
  const pitchTex = useMemo(() => createPitchTextures(), []);
  const outfieldTex = useMemo(() => createOutfieldTextures(), []);
  const walkingTex = useMemo(() => createCricketerSilhouetteTexture('walking'), []);
  const shadowTex = useMemo(() => createSoftGroundShadowTexture(), []);

  const figureGroupRef = useRef<THREE.Group>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const tunnelGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const flood1MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const flood2MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const dustMatRef = useRef<THREE.PointsMaterial>(null);

  const lookTargetRef = useRef(new THREE.Vector3(0, 1.65, -18));
  const camGoalRef = useRef(new THREE.Vector3(0.28, 1.48, 13.7));
  const lookGoalRef = useRef(new THREE.Vector3(0, 2.05, -11.8));
  const propProgressRef = useRef(progress);
  propProgressRef.current = progress;

  useEffect(() => {
    return () => {
      pitchTex.map.dispose();
      pitchTex.roughnessMap.dispose();
      pitchTex.bumpMap.dispose();
      outfieldTex.map.dispose();
      outfieldTex.roughnessMap.dispose();
      outfieldTex.bumpMap.dispose();
      walkingTex.dispose();
      shadowTex.dispose();
    };
  }, [pitchTex, outfieldTex, walkingTex, shadowTex]);

  // Subtle dust particles drifting in the twilight beams
  const particleCount = isMobile ? 350 : 900;
  const particleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = 0.5 + Math.random() * 14;
      pos[i * 3 + 2] = -36 + Math.random() * 52;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [particleCount]);

  useEffect(() => {
    return () => particleGeo.dispose();
  }, [particleGeo]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = THREE.MathUtils.clamp(
      progressRef ? progressRef.current : propProgressRef.current,
      0,
      1
    );
    const lightFade = THREE.MathUtils.clamp(1.0 - p * 0.86, 0.08, 1.0);

    if (fogRef.current) fogRef.current.density = 0.011 + p * 0.009;
    if (ambientRef.current) ambientRef.current.intensity = 0.22 + lightFade * 0.32;
    if (dirLightRef.current) dirLightRef.current.intensity = 0.45 + lightFade * 1.95;
    if (pointLightRef.current) pointLightRef.current.intensity = 0.6 + lightFade * 2.8;
    if (tunnelGlowMatRef.current) tunnelGlowMatRef.current.opacity = 0.14 + lightFade * 0.28;
    if (flood1MatRef.current) flood1MatRef.current.opacity = 0.1 + lightFade * 0.72;
    if (flood2MatRef.current) flood2MatRef.current.opacity = 0.1 + lightFade * 0.72;
    if (shadowMatRef.current) shadowMatRef.current.opacity = 0.68 * lightFade;
    if (dustMatRef.current) dustMatRef.current.opacity = 0.28 * lightFade;

    // Silhouette walks slowly away from center crease toward pavilion tunnel (z: 4 -> -26)
    const walkZ = THREE.MathUtils.lerp(4.2, -26.0, p);
    const subtleStep = prefersReducedMotion ? 0 : Math.abs(Math.sin(t * 2.2)) * 0.025;

    if (figureGroupRef.current) {
      figureGroupRef.current.position.z = THREE.MathUtils.lerp(
        figureGroupRef.current.position.z,
        walkZ,
        0.1
      );
      figureGroupRef.current.position.y = subtleStep;
    }

    // Camera follows patiently behind at respectful low documentary angle
    const targetCamZ = walkZ + 9.5;
    camGoalRef.current.set(0.28, 1.48, targetCamZ);
    lookGoalRef.current.set(0, 2.05, walkZ - 16);
    camera.position.lerp(camGoalRef.current, 0.075);
    lookTargetRef.current.lerp(lookGoalRef.current, 0.075);
    camera.lookAt(lookTargetRef.current);
  });

  return (
    <>
      <color attach="background" args={['#04060a']} />
      <fogExp2 ref={fogRef} attach="fog" args={['#040508', 0.011]} />

      <ambientLight ref={ambientRef} intensity={0.54} color="#dce4f2" />
      <directionalLight ref={dirLightRef} position={[0, 26, -42]} intensity={2.4} color="#ffe5a3" />
      <pointLight ref={pointLightRef} position={[0, 4.5, -36]} intensity={3.4} distance={48} color="#ffd60a" />

      {/* Outfield Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[52, 64]} />
        <meshStandardMaterial
          map={outfieldTex.map}
          roughnessMap={outfieldTex.roughnessMap}
          roughness={0.86}
          metalness={0.04}
        />
      </mesh>

      {/* Cricket Pitch */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.05, 22.5]} />
        <meshStandardMaterial
          map={pitchTex.map}
          roughnessMap={pitchTex.roughnessMap}
          roughness={0.92}
        />
      </mesh>

      {/* Distant Pavilion Tunnel Silhouette */}
      <group position={[0, 0, -44]}>
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[18, 8, 4]} />
          <meshStandardMaterial color="#07090e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.2, 2.05]}>
          <planeGeometry args={[4.4, 4.4]} />
          <meshBasicMaterial ref={tunnelGlowMatRef} color="#f5ce58" transparent opacity={0.42} />
        </mesh>
      </group>

      {/* Darkened Stadium Bowl Ring */}
      <mesh position={[0, 6.2, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[60, 46, 12, 56, 1, true]} />
        <meshStandardMaterial color="#07080d" roughness={0.94} side={THREE.BackSide} />
      </mesh>

      {/* Fading Floodlight Banks at Pavilion End */}
      {[-34, 34].map((x, idx) => (
        <group key={idx} position={[x, 0, -42]}>
          <mesh position={[0, 16, 0]}>
            <cylinderGeometry args={[0.38, 0.82, 32, 8]} />
            <meshStandardMaterial color="#12141c" metalness={0.85} roughness={0.45} />
          </mesh>
          <mesh position={[0, 32, 0.4]}>
            <planeGeometry args={[5.2, 2.4]} />
            <meshBasicMaterial
              ref={idx === 0 ? flood1MatRef : flood2MatRef}
              color="#f9cd05"
              transparent
              opacity={0.82}
            />
          </mesh>
        </group>
      ))}

      {/* Back-Facing Walking Cricketer Silhouette */}
      <group ref={figureGroupRef} position={[0, 0, 4.2]}>
        <mesh position={[0, 1.04, 0]}>
          <planeGeometry args={[1.45, 2.18]} />
          <meshBasicMaterial map={walkingTex} transparent alphaTest={0.03} depthWrite={false} />
        </mesh>
        <mesh position={[0.06, 0.018, 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.3, 4.4]} />
          <meshBasicMaterial
            ref={shadowMatRef}
            map={shadowTex}
            transparent
            opacity={0.68}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Quiet Settling Night Dust */}
      <points geometry={particleGeo}>
        <pointsMaterial
          ref={dustMatRef}
          size={0.14}
          color="#e5c778"
          transparent
          opacity={0.28}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

export const FinalWalkCanvas: React.FC<FinalWalkCanvasProps> = (props) => {
  const isCanvasActive = useCanvasActive();

  if (props.webglSupported === false) {
    return (
      <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_30%,rgba(249,205,5,0.12),#040507_72%)]" />
    );
  }

  return (
    <Canvas
      frameloop={isCanvasActive ? 'always' : 'never'}
      dpr={props.isMobile ? [1, 1.2] : [1, 1.35]}
      camera={{ position: [0.28, 1.48, 13.7], fov: 40, near: 0.1, far: 160 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <FinalWalkInner {...props} />
    </Canvas>
  );
};
