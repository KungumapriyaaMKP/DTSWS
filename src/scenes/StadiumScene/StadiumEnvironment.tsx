import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import {
  createOutfieldTextures,
  createPitchTextures,
  createCricketerSilhouetteTexture,
  createSoftGroundShadowTexture,
  createWillowTextures,
} from '../../utils/proceduralTextures';
import { useCanvasActive } from '../../components/Viewport3DGuard';

export interface StadiumCameraTarget {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  floodlightColor?: string;
  showTrajectory?: boolean;
}

interface StadiumSceneProps {
  /** 'opening' | 'captain' */
  mode: 'opening' | 'captain';
  /** Normalized 0..1 progress within the section */
  progress: number;
  /** Optional interactive camera preset for Scene 04 */
  cameraPreset?: StadiumCameraTarget;
  /** Interactive mouse parallax normalized -1..1 */
  mouseOffset?: { x: number; y: number };
  /** Reduce particle counts / shadow map cost on mobile */
  isMobile?: boolean;
  prefersReducedMotion?: boolean;
}

const VOLUMETRIC_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const VOLUMETRIC_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;

  void main() {
    // Soft edge Fresnel fade so cone edges dissolve realistically
    float fresnel = pow(abs(dot(vNormalView, vViewDir)), 1.85);
    // Longitudinal decay from floodlight source (top vUv.y = 1) down toward pitch (0)
    float lengthFade = smoothstep(0.0, 0.42, vUv.y) * smoothstep(1.0, 0.72, vUv.y * 0.92);
    // Subtle atmospheric dust drift shimmer
    float shimmer = 0.88 + 0.12 * sin(vUv.y * 14.0 - uTime * 0.35 + vUv.x * 6.2831);
    float alpha = fresnel * lengthFade * uIntensity * shimmer * 0.16;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.34));
  }
`;

const DUST_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aScale;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.18 + aPhase) * 0.65;
    pos.y += cos(uTime * 0.14 + aPhase * 1.3) * 0.38;
    pos.z += sin(uTime * 0.16 + aPhase * 0.7) * 0.55;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * aScale * (180.0 / max(-mvPos.z, 1.0));
    // Fade near camera and at far edges
    float distFade = smoothstep(85.0, 18.0, length(pos.xz));
    vAlpha = distFade * (0.28 + 0.35 * sin(uTime * 0.5 + aPhase));
    gl_Position = projectionMatrix * mvPos;
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float r = length(center);
    if (r > 0.5) discard;
    float soft = pow(1.0 - r * 2.0, 2.2);
    gl_FragColor = vec4(uColor, soft * max(vAlpha, 0.05) * uIntensity);
  }
`;

/**
 * Architectural Floodlight Tower + Volumetric Light Cone
 */
const FloodlightTower: React.FC<{
  position: [number, number, number];
  lookAt?: [number, number, number];
  intensity: number;
  beamColor: string;
}> = ({ position, intensity, beamColor }) => {
  const coneMatRef = useRef<THREE.ShaderMaterial>(null);

  const beamUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(beamColor) },
      uIntensity: { value: intensity },
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (coneMatRef.current) {
      coneMatRef.current.uniforms.uTime.value = clock.getElapsedTime();
      coneMatRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        coneMatRef.current.uniforms.uIntensity.value,
        intensity,
        0.08
      );
      coneMatRef.current.uniforms.uColor.value.lerp(new THREE.Color(beamColor), 0.06);
    }
  });

  // Compute rotation pointing light bank toward stadium pitch center [0, 1, 0]
  const bankOrientation = useMemo(() => {
    const towerTop = new THREE.Vector3(position[0], 34, position[2]);
    const dir = new THREE.Vector3(0, 1, 0).sub(towerTop).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    return new THREE.Euler().setFromQuaternion(quat);
  }, [position]);

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Steel Pylon Mast */}
      <mesh position={[0, 17, 0]}>
        <cylinderGeometry args={[0.42, 0.92, 34, 8]} />
        <meshStandardMaterial color="#181b24" metalness={0.85} roughness={0.42} />
      </mesh>
      {/* Cross-brace collar rings */}
      {[10, 20, 29].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.35, 8]} />
          <meshStandardMaterial color="#232836" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}
      {/* Floodlight Head & Volumetric Beam */}
      <group position={[0, 34, 0]} rotation={bankOrientation}>
        {/* Floodlight Rack Housing */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[6.4, 0.65, 3.2]} />
          <meshStandardMaterial color="#10131a" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* High-Output Emissive LED Panel */}
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.8, 2.7]} />
          <meshBasicMaterial
            color={beamColor}
            transparent
            opacity={Math.min(1, 0.08 + intensity * 0.92)}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Volumetric Beam Cone */}
        <mesh position={[0, -28, 0]}>
          <coneGeometry args={[17, 56, 28, 1, true]} />
          <shaderMaterial
            ref={coneMatRef}
            vertexShader={VOLUMETRIC_VERTEX}
            fragmentShader={VOLUMETRIC_FRAGMENT}
            uniforms={beamUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Multi-tier Chepauk-inspired Concrete Bowl & Tensile Canopy Ribs (Instanced)
 */
const StadiumArchitecture: React.FC<{ illumination: number }> = ({ illumination }) => {
  const ribRef = useRef<THREE.InstancedMesh>(null);
  const ribCount = 48;

  useEffect(() => {
    if (!ribRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const radius = 56;
      dummy.position.set(Math.cos(angle) * radius, 13.5, Math.sin(angle) * radius);
      dummy.rotation.set(0, -angle + Math.PI / 2, 0);
      dummy.updateMatrix();
      ribRef.current.setMatrixAt(i, dummy.matrix);
    }
    ribRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Lower Bowl Tier */}
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[58, 43, 6.4, 64, 1, true]} />
        <meshStandardMaterial
          color="#0b0d13"
          roughness={0.9}
          metalness={0.15}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Upper Bowl Tier */}
      <mesh position={[0, 10.4, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[66, 56, 8.2, 64, 1, true]} />
        <meshStandardMaterial
          color="#090b10"
          roughness={0.92}
          metalness={0.12}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Subtle Architectural Fascia Ring with Controlled Gold Telemetry Glow */}
      <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[56.2, 0.16, 8, 96]} />
        <meshStandardMaterial
          color="#231c0d"
          emissive="#f9cd05"
          emissiveIntensity={0.22 * illumination}
          roughness={0.4}
        />
      </mesh>
      {/* Boundary Cushion Perimeter */}
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[37.8, 0.28, 10, 96]} />
        <meshStandardMaterial
          color="#131620"
          emissive="#d4af37"
          emissiveIntensity={0.08 * illumination}
          roughness={0.65}
        />
      </mesh>
      {/* Tensile Canopy Roof Ring & Structural Ribs */}
      <mesh position={[0, 18.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[55, 0.45, 8, 64]} />
        <meshStandardMaterial color="#161923" metalness={0.78} roughness={0.35} />
      </mesh>
      <instancedMesh ref={ribRef} args={[undefined, undefined, ribCount]}>
        <boxGeometry args={[0.42, 11.5, 4.2]} />
        <meshStandardMaterial color="#12151e" metalness={0.7} roughness={0.45} />
      </instancedMesh>
    </group>
  );
};

/**
 * Cricket Stumps, Bails & Sculpted Willow Bat / Helmet Resting Near Crease
 */
const PitchEquipment: React.FC<{ showDetailedGear: boolean }> = ({ showDetailedGear }) => {
  const willow = useMemo(() => createWillowTextures(), []);

  useEffect(() => {
    return () => {
      willow.map.dispose();
      willow.roughnessMap.dispose();
    };
  }, [willow]);

  const stumpPositions = [-0.115, 0, 0.115];

  const renderWicketSet = (zPos: number) => (
    <group position={[0, 0, zPos]}>
      {stumpPositions.map((x, idx) => (
        <mesh key={idx} position={[x, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.019, 0.02, 0.72, 12]} />
          <meshStandardMaterial color="#d8c094" roughness={0.42} metalness={0.05} />
        </mesh>
      ))}
      {/* Bails */}
      <mesh position={[-0.057, 0.725, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.105, 8]} />
        <meshStandardMaterial color="#e5c778" roughness={0.35} />
      </mesh>
      <mesh position={[0.057, 0.725, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.105, 8]} />
        <meshStandardMaterial color="#e5c778" roughness={0.35} />
      </mesh>
    </group>
  );

  return (
    <group>
      {renderWicketSet(-9.9)}
      {renderWicketSet(9.9)}

      {showDetailedGear && (
        <group position={[1.4, 0.02, 8.8]} rotation={[0, -0.45, 0]}>
          {/* Sculpted English Willow Bat leaning gently */}
          <group position={[0.42, 0.38, 0]} rotation={[0.35, 0.18, -0.25]}>
            {/* Blade */}
            <mesh castShadow>
              <boxGeometry args={[0.115, 0.56, 0.042]} />
              <meshStandardMaterial
                map={willow.map}
                roughnessMap={willow.roughnessMap}
                roughness={0.55}
              />
            </mesh>
            {/* V-Spine Back Ridge */}
            <mesh position={[0, -0.02, -0.024]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.032, 0.52, 3]} />
              <meshStandardMaterial map={willow.map} roughness={0.55} />
            </mesh>
            {/* Rubber Grip Handle */}
            <mesh position={[0, 0.41, 0]}>
              <cylinderGeometry args={[0.017, 0.019, 0.28, 12]} />
              <meshStandardMaterial color="#181b22" roughness={0.85} />
            </mesh>
            {/* Brushed Gold #7 Collar Band */}
            <mesh position={[0, 0.285, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.035, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.22} />
            </mesh>
          </group>

          {/* Detailed Cricket Helmet resting on the turf */}
          <group position={[-0.25, 0.14, 0.22]} rotation={[0.08, 0.65, 0]}>
            {/* Outer Shell */}
            <mesh castShadow>
              <sphereGeometry args={[0.145, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.68]} />
              <meshPhysicalMaterial
                color="#0d1b33"
                metalness={0.25}
                roughness={0.28}
                clearcoat={0.75}
                clearcoatRoughness={0.18}
              />
            </mesh>
            {/* Peak Visor */}
            <mesh position={[0, 0.02, 0.13]} rotation={[0.32, 0, 0]}>
              <cylinderGeometry args={[0.135, 0.148, 0.022, 20, 1, false, -0.85, 1.7]} />
              <meshPhysicalMaterial color="#0b162b" roughness={0.32} clearcoat={0.6} />
            </mesh>
            {/* Metallic Face Grille Bars */}
            {[-0.03, -0.065, -0.1].map((y, idx) => (
              <mesh key={idx} position={[0, y, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.095, 0.0045, 8, 24, Math.PI * 0.85]} />
                <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.24} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};

/**
 * Golden Parabolic Six Trajectory Arc + Live Animated Match Ball Pulse (Scene 04)
 */
const ShotTrajectoryArc: React.FC<{ visible: boolean }> = ({ visible }) => {
  const ballRef = useRef<THREE.Group>(null);
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.85, 8.8),
      new THREE.Vector3(2.2, 7.2, -2.0),
      new THREE.Vector3(6.8, 13.8, -18.0),
      new THREE.Vector3(12.5, 11.4, -34.0),
      new THREE.Vector3(18.0, 4.0, -49.0),
    ]);
  }, []);

  useFrame(({ clock }) => {
    if (!visible || !ballRef.current) return;
    const t = (clock.getElapsedTime() * 0.36) % 1;
    const pos = curve.getPointAt(t);
    ballRef.current.position.copy(pos);
    ballRef.current.rotation.x += 0.14;
    ballRef.current.rotation.z += 0.08;
  });

  if (!visible) return null;

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 72, 0.06, 8, false]} />
        <meshBasicMaterial color="#ffd60a" transparent opacity={0.72} />
      </mesh>
      <group ref={ballRef}>
        <mesh>
          <sphereGeometry args={[0.26, 20, 16]} />
          <meshStandardMaterial
            color="#ffd60a"
            emissive="#ffd60a"
            emissiveIntensity={2.4}
            roughness={0.2}
          />
        </mesh>
        <pointLight intensity={3.5} distance={10} color="#ffd60a" />
      </group>
    </group>
  );
};

const StadiumInner: React.FC<StadiumSceneProps> = ({
  mode,
  progress,
  cameraPreset,
  mouseOffset = { x: 0, y: 0 },
  isMobile = false,
  prefersReducedMotion = false,
}) => {
  const { camera } = useThree();
  const pitchTex = useMemo(() => createPitchTextures(), []);
  const outfieldTex = useMemo(() => createOutfieldTextures(), []);
  const silhouetteTex = useMemo(() => createCricketerSilhouetteTexture('standing'), []);
  const shadowTex = useMemo(() => createSoftGroundShadowTexture(), []);
  const dustMatRef = useRef<THREE.ShaderMaterial>(null);
  const lookTargetRef = useRef(new THREE.Vector3(0, 2.2, -12));

  useEffect(() => {
    return () => {
      pitchTex.map.dispose();
      pitchTex.roughnessMap.dispose();
      pitchTex.bumpMap.dispose();
      outfieldTex.map.dispose();
      outfieldTex.roughnessMap.dispose();
      outfieldTex.bumpMap.dispose();
      silhouetteTex.dispose();
      shadowTex.dispose();
    };
  }, [pitchTex, outfieldTex, silhouetteTex, shadowTex]);

  // Floodlight illumination progression
  const floodlightPower = useMemo(() => {
    if (mode === 'opening') {
      // Progressive awakening from darkness (0.04) -> dramatic backlit silhouette (0.95)
      return THREE.MathUtils.clamp(0.05 + progress * 1.15, 0.05, 1.0);
    }
    return 0.92;
  }, [mode, progress]);

  const beamColor = cameraPreset?.floodlightColor ?? '#f5e2a8';

  // Atmospheric Dust Particle Geometry
  const dustCount = isMobile ? 650 : 1850;
  const dustGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);
    const scales = new Float32Array(dustCount);
    const phases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      const r = 6 + Math.random() * 52;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = 0.6 + Math.random() * 24;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      scales[i] = 0.4 + Math.random() * 1.4;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [dustCount]);

  useEffect(() => {
    return () => dustGeometry.dispose();
  }, [dustGeometry]);

  const dustUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: isMobile ? 1.8 : 2.5 },
      uColor: { value: new THREE.Color('#f6e09e') },
      uIntensity: { value: floodlightPower },
    }),
    [isMobile]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (dustMatRef.current) {
      dustMatRef.current.uniforms.uTime.value = prefersReducedMotion ? 0 : t;
      dustMatRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        dustMatRef.current.uniforms.uIntensity.value,
        floodlightPower,
        0.08
      );
    }

    // Cinema Camera Rig Choreography
    const px = prefersReducedMotion ? 0 : mouseOffset.x * 0.85;
    const py = prefersReducedMotion ? 0 : mouseOffset.y * 0.45;

    if (mode === 'opening') {
      // Travel smoothly from high outer stadium dark corridor down to a heroic low-angle frame
      // where both the cricketer silhouette AND the illuminated floodlight towers fill the frame
      const camZ = THREE.MathUtils.lerp(34, 13.8, Math.min(1, progress * 1.15));
      const camY = THREE.MathUtils.lerp(7.2, 1.52, Math.min(1, progress * 1.15));
      const camX = THREE.MathUtils.lerp(-3.5, 0.18, Math.min(1, progress * 1.15));

      camera.position.lerp(new THREE.Vector3(camX + px, camY + py, camZ), 0.06);
      lookTargetRef.current.lerp(new THREE.Vector3(0, 2.35, -14), 0.06);
      camera.lookAt(lookTargetRef.current);
    } else if (cameraPreset) {
      const targetPos = new THREE.Vector3(
        cameraPreset.position[0] + px * 1.1,
        cameraPreset.position[1] + py * 0.55,
        cameraPreset.position[2]
      );
      camera.position.lerp(targetPos, 0.055);
      lookTargetRef.current.lerp(new THREE.Vector3(...cameraPreset.target), 0.055);
      camera.lookAt(lookTargetRef.current);
      if (camera instanceof THREE.PerspectiveCamera && cameraPreset.fov) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, cameraPreset.fov, 0.05);
        camera.updateProjectionMatrix();
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#040507']} />
      <fogExp2 attach="fog" args={['#05070c', mode === 'opening' ? 0.017 : 0.012]} />

      <ambientLight intensity={0.08 + floodlightPower * 0.22} color="#c9d4e8" />
      <directionalLight
        position={[-28, 36, -34]}
        intensity={0.3 + floodlightPower * 1.85}
        color="#ffe7ad"
        castShadow={!isMobile}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[30, 34, -30]}
        intensity={0.2 + floodlightPower * 1.4}
        color="#fff1cf"
      />
      <pointLight
        position={[0, 4.2, -2]}
        intensity={floodlightPower * 1.6}
        distance={26}
        color="#f9cd05"
      />

      {/* Procedural Studio Night Reflections */}
      <Environment resolution={64}>
        <Lightformer
          form="rect"
          intensity={1.6 * floodlightPower}
          color="#ffe39c"
          scale={[14, 4, 1]}
          position={[-20, 22, -25]}
        />
        <Lightformer
          form="rect"
          intensity={1.4 * floodlightPower}
          color="#e8eef8"
          scale={[14, 4, 1]}
          position={[20, 22, -25]}
        />
      </Environment>

      {/* Outfield Grass Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[52, 72]} />
        <meshStandardMaterial
          map={outfieldTex.map}
          roughnessMap={outfieldTex.roughnessMap}
          bumpMap={outfieldTex.bumpMap}
          bumpScale={0.04}
          roughness={0.84}
          metalness={0.04}
        />
      </mesh>

      {/* 22-Yard Cricket Pitch */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.05, 22.5]} />
        <meshStandardMaterial
          map={pitchTex.map}
          roughnessMap={pitchTex.roughnessMap}
          bumpMap={pitchTex.bumpMap}
          bumpScale={0.03}
          roughness={0.9}
          metalness={0.02}
        />
      </mesh>

      <PitchEquipment showDetailedGear={mode === 'captain'} />

      {/* Back-Facing Cricketer Silhouette Standing in Middle of Pitch (Scene 01) */}
      {mode === 'opening' && (
        <group position={[0, 0, 1.5]}>
          {/* Rim-lit realistic optical silhouette matte */}
          <mesh position={[0, 1.04, 0]}>
            <planeGeometry args={[1.46, 2.2]} />
            <meshBasicMaterial
              map={silhouetteTex}
              transparent
              alphaTest={0.03}
              depthWrite={false}
              opacity={THREE.MathUtils.clamp(0.18 + progress * 0.92, 0.18, 0.98)}
            />
          </mesh>
          {/* Soft Tapered Floodlight Ground Shadow */}
          <mesh position={[0.08, 0.018, 2.35]} rotation={[-Math.PI / 2, 0, -0.04]}>
            <planeGeometry args={[1.45, 5.4]} />
            <meshBasicMaterial
              map={shadowTex}
              transparent
              opacity={0.72 * floodlightPower}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Tactical Six Arc (Scene 04) */}
      {mode === 'captain' && <ShotTrajectoryArc visible={Boolean(cameraPreset?.showTrajectory)} />}

      {/* Stadium Concrete Tiers & Canopy */}
      <StadiumArchitecture illumination={floodlightPower} />

      {/* 4 Monumental Floodlight Towers */}
      <FloodlightTower position={[-42, 0, -44]} intensity={floodlightPower} beamColor={beamColor} />
      <FloodlightTower position={[42, 0, -44]} intensity={floodlightPower} beamColor={beamColor} />
      <FloodlightTower
        position={[-42, 0, 44]}
        intensity={floodlightPower * 0.72}
        beamColor={beamColor}
      />
      <FloodlightTower
        position={[42, 0, 44]}
        intensity={floodlightPower * 0.72}
        beamColor={beamColor}
      />

      {/* Atmospheric Stadium Dust Motes */}
      <points geometry={dustGeometry}>
        <shaderMaterial
          ref={dustMatRef}
          vertexShader={DUST_VERTEX}
          fragmentShader={DUST_FRAGMENT}
          uniforms={dustUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

export const StadiumCanvas: React.FC<
  StadiumSceneProps & { webglSupported?: boolean; className?: string }
> = ({ webglSupported = true, className = '', ...props }) => {
  const isCanvasActive = useCanvasActive();

  if (!webglSupported) {
    return (
      <div
        className={`relative h-full w-full bg-[radial-gradient(ellipse_at_50%_20%,rgba(249,205,5,0.16),#040507_70%)] ${className}`}
      />
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Canvas
        frameloop={isCanvasActive ? 'always' : 'demand'}
        shadows={!props.isMobile}
        dpr={props.isMobile ? [1, 1.2] : [1, 1.5]}
        camera={{ position: [-3.5, 7.2, 34], fov: 44, near: 0.1, far: 220 }}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
      >
        <StadiumInner {...props} />
      </Canvas>
    </div>
  );
};
