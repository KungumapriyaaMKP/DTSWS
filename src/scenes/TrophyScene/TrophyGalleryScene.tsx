import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { TrophyExhibit } from '../../data/dhoniData';
import { createBasaltFloorTexture } from '../../utils/proceduralTextures';
import { useCanvasActive } from '../../components/Viewport3DGuard';

interface TrophyGallerySceneProps {
  exhibits: TrophyExhibit[];
  activeIndex: number;
  onSelect: (index: number) => void;
  scrollProgress?: number;
  isMobile?: boolean;
  prefersReducedMotion?: boolean;
  webglSupported?: boolean;
}

const MUSEUM_BEAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const MUSEUM_BEAM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(abs(dot(vNormalView, vViewDir)), 2.0);
    float fade = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.72, vUv.y * 0.92);
    gl_FragColor = vec4(uColor, fresnel * fade * uOpacity);
  }
`;

/**
 * Generates museum-grade multi-curve lathe profile for each trophy silhouette
 */
function buildTrophyLatheGeometry(profile: TrophyExhibit['cupProfile']): THREE.LatheGeometry {
  let pts: THREE.Vector2[];

  if (profile === 'icc-wc') {
    pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.32, 0.0),
      new THREE.Vector2(0.30, 0.14),
      new THREE.Vector2(0.24, 0.24),
      new THREE.Vector2(0.20, 0.34),
      new THREE.Vector2(0.14, 0.56),
      new THREE.Vector2(0.18, 0.72),
      new THREE.Vector2(0.10, 0.82),
      new THREE.Vector2(0.24, 0.92),
      new THREE.Vector2(0.34, 1.10),
      new THREE.Vector2(0.35, 1.24),
      new THREE.Vector2(0.26, 1.40),
      new THREE.Vector2(0.0, 1.46),
    ];
  } else if (profile === 'clt20') {
    pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.29, 0.0),
      new THREE.Vector2(0.27, 0.12),
      new THREE.Vector2(0.16, 0.22),
      new THREE.Vector2(0.09, 0.48),
      new THREE.Vector2(0.13, 0.62),
      new THREE.Vector2(0.26, 0.92),
      new THREE.Vector2(0.34, 1.28),
      new THREE.Vector2(0.38, 1.38),
      new THREE.Vector2(0.32, 1.40),
      new THREE.Vector2(0.24, 1.05),
      new THREE.Vector2(0.0, 0.88),
    ];
  } else {
    pts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.34, 0.0),
      new THREE.Vector2(0.33, 0.09),
      new THREE.Vector2(0.27, 0.16),
      new THREE.Vector2(0.23, 0.25),
      new THREE.Vector2(0.11, 0.38),
      new THREE.Vector2(0.14, 0.50),
      new THREE.Vector2(0.09, 0.65),
      new THREE.Vector2(0.16, 0.78),
      new THREE.Vector2(0.30, 0.98),
      new THREE.Vector2(0.38, 1.24),
      new THREE.Vector2(0.41, 1.38),
      new THREE.Vector2(0.36, 1.41),
      new THREE.Vector2(0.28, 1.12),
      new THREE.Vector2(0.0, 0.92),
    ];
  }

  return new THREE.LatheGeometry(pts, 48);
}

const SculptedTrophyExhibit: React.FC<{
  exhibit: TrophyExhibit;
  index: number;
  isActive: boolean;
  xPos: number;
  onSelect: () => void;
  prefersReducedMotion?: boolean;
}> = ({ exhibit, isActive, xPos, onSelect, prefersReducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null);
  const beamMatRef = useRef<THREE.ShaderMaterial>(null);
  const latheGeo = useMemo(() => buildTrophyLatheGeometry(exhibit.cupProfile), [exhibit.cupProfile]);

  const handleCurveL = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.28, 0.95, 0),
        new THREE.Vector3(-0.52, 1.08, 0),
        new THREE.Vector3(-0.50, 1.30, 0),
        new THREE.Vector3(-0.37, 1.33, 0),
      ]),
    []
  );

  const handleCurveR = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.28, 0.95, 0),
        new THREE.Vector3(0.52, 1.08, 0),
        new THREE.Vector3(0.50, 1.30, 0),
        new THREE.Vector3(0.37, 1.33, 0),
      ]),
    []
  );

  const beamUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#ffe28a') },
      uOpacity: { value: isActive ? 0.14 : 0.035 },
    }),
    []
  );

  useEffect(() => {
    return () => latheGeo.dispose();
  }, [latheGeo]);

  useFrame(({ clock }) => {
    if (beamMatRef.current) {
      beamMatRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        beamMatRef.current.uniforms.uOpacity.value,
        isActive ? 0.15 : 0.03,
        0.08
      );
    }

    if (!groupRef.current) return;
    if (!prefersReducedMotion) {
      groupRef.current.rotation.y = isActive
        ? clock.getElapsedTime() * 0.36
        : Math.sin(clock.getElapsedTime() * 0.25 + xPos) * 0.14;
    }
    const targetScale = isActive ? 1.08 : 0.94;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
  });

  const primaryColor =
    exhibit.metallicTone === 'silver-gold'
      ? '#dcd6c8'
      : exhibit.metallicTone === 'champagne'
        ? '#f0d27a'
        : '#e2ba46';

  return (
    <group position={[xPos, 0, 0]} onClick={onSelect}>
      {/* Fluted Octagonal Dark Obsidian Museum Plinth */}
      <mesh position={[0, 0.62, 0]} receiveShadow>
        <cylinderGeometry args={[0.56, 0.64, 1.24, 8]} />
        <meshStandardMaterial color="#0b0d13" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Brushed Brass Plinth Collar */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.57, 0.57, 0.035, 32]} />
        <meshStandardMaterial color="#e5c778" metalness={0.92} roughness={0.22} />
      </mesh>
      {/* Illuminated Base Ring on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.96, 48]} />
        <meshBasicMaterial
          color={isActive ? '#f9cd05' : '#d4af37'}
          transparent
          opacity={isActive ? 0.42 : 0.08}
        />
      </mesh>

      {/* Soft Volumetric Overhead Museum Spotlight */}
      <mesh position={[0, 3.6, 0]}>
        <coneGeometry args={[1.3, 4.4, 28, 1, true]} />
        <shaderMaterial
          ref={beamMatRef}
          vertexShader={MUSEUM_BEAM_VERTEX}
          fragmentShader={MUSEUM_BEAM_FRAGMENT}
          uniforms={beamUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Overhead Pin-Light Source */}
      {isActive && (
        <pointLight position={[0, 3.4, 1.2]} intensity={6.5} distance={8.5} color="#ffe8a8" />
      )}

      {/* Sculpted Metallic Trophy Group */}
      <group ref={groupRef} position={[0, 1.28, 0]}>
        <mesh geometry={latheGeo} castShadow>
          <meshPhysicalMaterial
            color={primaryColor}
            metalness={0.94}
            roughness={0.16}
            clearcoat={0.75}
            clearcoatRoughness={0.14}
            envMapIntensity={2.1}
          />
        </mesh>

        {exhibit.cupProfile !== 'icc-wc' && (
          <>
            <mesh>
              <tubeGeometry args={[handleCurveL, 24, 0.032, 10, false]} />
              <meshPhysicalMaterial
                color="#f3d678"
                metalness={0.94}
                roughness={0.16}
                clearcoat={0.65}
                envMapIntensity={1.9}
              />
            </mesh>
            <mesh>
              <tubeGeometry args={[handleCurveR, 24, 0.032, 10, false]} />
              <meshPhysicalMaterial
                color="#f3d678"
                metalness={0.94}
                roughness={0.16}
                clearcoat={0.65}
                envMapIntensity={1.9}
              />
            </mesh>
          </>
        )}

        {exhibit.cupProfile === 'icc-wc' &&
          [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.25, 0.72, Math.sin(angle) * 0.25]}
              rotation={[Math.sin(angle) * 0.14, 0, -Math.cos(angle) * 0.14]}
            >
              <cylinderGeometry args={[0.022, 0.034, 1.15, 10]} />
              <meshPhysicalMaterial
                color="#ece6d6"
                metalness={0.95}
                roughness={0.15}
                envMapIntensity={1.9}
              />
            </mesh>
          ))}
      </group>
    </group>
  );
};

const TrophyGalleryInner: React.FC<TrophyGallerySceneProps> = ({
  exhibits,
  activeIndex,
  onSelect,
  isMobile = false,
  prefersReducedMotion = false,
}) => {
  const { camera } = useThree();
  const basaltTex = useMemo(() => createBasaltFloorTexture(), []);
  const lookTargetRef = useRef(new THREE.Vector3(0, 1.9, 0));
  const camGoalRef = useRef(new THREE.Vector3());
  const lookGoalRef = useRef(new THREE.Vector3());
  const spacing = 3.2;

  useEffect(() => {
    return () => basaltTex.dispose();
  }, [basaltTex]);

  const activeX = (activeIndex - (exhibits.length - 1) / 2) * spacing;

  useFrame(() => {
    camGoalRef.current.set(activeX, isMobile ? 2.5 : 2.35, isMobile ? 5.6 : 4.75);
    camera.position.lerp(camGoalRef.current, 0.08);
    lookGoalRef.current.set(activeX, 1.95, 0);
    lookTargetRef.current.lerp(lookGoalRef.current, 0.08);
    camera.lookAt(lookTargetRef.current);
  });

  return (
    <>
      <color attach="background" args={['#040507']} />
      <fog attach="fog" args={['#040507', 9, 28]} />

      <ambientLight intensity={0.42} color="#d4dae6" />
      <directionalLight position={[5, 9, 6]} intensity={2.4} color="#fff2d2" />
      <directionalLight position={[-6, 7, -4]} intensity={1.35} color="#c5d4ee" />

      {/* Lightweight Architectural Studio Lightformers (Zero GPU Hang) */}
      <Environment resolution={64}>
        <Lightformer
          form="rect"
          intensity={3.2}
          color="#ffe39f"
          scale={[18, 2.5, 1]}
          position={[0, 7, 3]}
          rotation={[Math.PI / 2.6, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#e4ebf5"
          scale={[16, 1.6, 1]}
          position={[-8, 5, -5]}
          rotation={[0, Math.PI / 4, 0]}
        />
        <Lightformer
          form="ring"
          intensity={2.2}
          color="#f9cd05"
          scale={[4, 4, 1]}
          position={[8, 4, 2]}
          rotation={[0, -Math.PI / 3, 0]}
        />
      </Environment>

      {/* Dark Architectural Back Wall & Columns */}
      <mesh position={[0, 4.5, -3.6]}>
        <planeGeometry args={[48, 12]} />
        <meshStandardMaterial color="#07090e" roughness={0.85} metalness={0.22} />
      </mesh>
      {Array.from({ length: 11 }).map((_, idx) => (
        <mesh key={idx} position={[(idx - 5) * 3.6, 4.2, -3.2]}>
          <boxGeometry args={[0.38, 10, 0.45]} />
          <meshStandardMaterial color="#0f131c" roughness={0.62} metalness={0.42} />
        </mesh>
      ))}

      {/* Honed Specular Dark Basalt Museum Floor (Fast, Zero Render-Target Loop) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[48, 24]} />
        <meshPhysicalMaterial
          map={basaltTex}
          color="#0e1118"
          roughness={0.28}
          metalness={0.55}
          clearcoat={0.85}
          clearcoatRoughness={0.22}
          envMapIntensity={1.25}
        />
      </mesh>

      {exhibits.map((exhibit, idx) => {
        const xPos = (idx - (exhibits.length - 1) / 2) * spacing;
        return (
          <SculptedTrophyExhibit
            key={exhibit.id}
            exhibit={exhibit}
            index={idx}
            isActive={idx === activeIndex}
            xPos={xPos}
            onSelect={() => onSelect(idx)}
            prefersReducedMotion={prefersReducedMotion}
          />
        );
      })}
    </>
  );
};

export const TrophyGalleryCanvas: React.FC<TrophyGallerySceneProps> = (props) => {
  const isCanvasActive = useCanvasActive();

  if (props.webglSupported === false) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#06080c] via-[#0d1018] to-[#040507] text-xs tracking-widest text-[#E5C778]">
        MUSEUM ARCHIVE · {props.exhibits[props.activeIndex]?.title.toUpperCase()}
      </div>
    );
  }

  return (
    <Canvas
      frameloop={isCanvasActive ? 'always' : 'never'}
      dpr={props.isMobile ? [1, 1.2] : [1, 1.35]}
      camera={{ position: [0, 2.35, 4.75], fov: 38, near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
    >
      <TrophyGalleryInner {...props} />
    </Canvas>
  );
};
