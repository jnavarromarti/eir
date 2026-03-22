import { useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
   TUNABLE PARAMETERS — adjust these to fine-tune the visual feel
   ═══════════════════════════════════════════════════════════════════════════ */
const CONFIG = {
  /* Geometry */
  planeWidth: 14,
  planeHeight: 10,
  segmentsX: 192,
  segmentsY: 128,

  /* Noise layers (vertex displacement) */
  noise: {
    layer1: { frequency: 0.35, amplitude: 0.48, speed: 0.07 },
    layer2: { frequency: 1.1, amplitude: 0.14, speed: 0.14 },
    layer3: { frequency: 2.6, amplitude: 0.04, speed: 0.22 },
  },

  /* Mouse interaction */
  mouseInfluence: 0.35,
  mouseRadius: 1.8,
  cameraParallax: { x: 0.25, y: 0.15 },
  cameraLerp: 0.025,

  /* Camera */
  cameraPosition: [0, -0.6, 3.2] as [number, number, number],
  cameraFov: 48,

  /* Colors — IMD brand palette */
  colors: {
    deep: '#3a0f42',
    mid: '#6a1b7c',
    high: '#be3d9d',
    accent: '#fb923c',
    fog: '#2d0a35',
  },

  /* Rendering */
  fogDensity: 0.1,
  meshRotationX: -Math.PI * 0.4,
  wireframeOpacity: 0.06,
  gridLineWidth: 0.012,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   GLSL — Vertex Shader
   Multi-layered simplex noise displacement with cursor interaction,
   coordinate rotation between layers for organic feel
   ═══════════════════════════════════════════════════════════════════════════ */
const vertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uMouseInfluence;
  uniform float uMouseRadius;

  uniform float uFreq1;  uniform float uAmp1;  uniform float uSpeed1;
  uniform float uFreq2;  uniform float uAmp2;  uniform float uSpeed2;
  uniform float uFreq3;  uniform float uAmp3;  uniform float uSpeed3;

  varying vec2  vUv;
  varying float vElevation;
  varying float vMouseProximity;

  /* ─── Simplex 3D noise (Ashima Arts) ─── */
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  /* Rotate 2D coordinates for layer separation */
  vec2 rotate2D(vec2 v, float a) {
    float s = sin(a); float c = cos(a);
    return mat2(c, -s, s, c) * v;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    /* Layer 1 — large, slow primary undulation */
    vec2 coords1 = pos.xy * uFreq1;
    float n1 = snoise(vec3(coords1, uTime * uSpeed1)) * uAmp1;

    /* Layer 2 — medium detail, rotated coordinates */
    vec2 coords2 = rotate2D(pos.xy, 0.6) * uFreq2;
    float n2 = snoise(vec3(coords2, uTime * uSpeed2 + 50.0)) * uAmp2;

    /* Layer 3 — fine detail, counter-rotated */
    vec2 coords3 = rotate2D(pos.xy, -1.1) * uFreq3;
    float n3 = snoise(vec3(coords3, uTime * uSpeed3 + 100.0)) * uAmp3;

    /* Compose displacement */
    float displacement = n1 + n2 + n3;

    /* Cursor interaction — local amplitude modulation */
    vec2 mouseWorld = uMouse * vec2(4.0, 3.0);
    float mouseDist = length(pos.xy - mouseWorld);
    float mouseEffect = smoothstep(uMouseRadius, 0.0, mouseDist) * uMouseInfluence;
    displacement += mouseEffect * snoise(vec3(pos.xy * 2.0, uTime * 0.3)) * 0.25;
    displacement *= 1.0 + mouseEffect * 0.5;

    /* ─── Edge falloff: pin borders flat so underside is never visible ─── */
    float edgeX = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x);
    float edgeY = smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.82, uv.y);
    float edgeMask = edgeX * edgeY;
    displacement *= edgeMask;

    /* Clamp: only allow upward displacement (positive Z) */
    displacement = max(displacement, 0.0);

    vMouseProximity = mouseEffect;
    pos.z = displacement;
    vElevation = displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   GLSL — Fragment Shader
   Elevation-mapped brand colors, subtle wireframe grid overlay,
   fresnel rim, depth vignette, cursor glow
   ═══════════════════════════════════════════════════════════════════════════ */
const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3  uColorDeep;
  uniform vec3  uColorMid;
  uniform vec3  uColorHigh;
  uniform vec3  uColorAccent;
  uniform float uWireframeOpacity;
  uniform float uGridLineWidth;

  varying vec2  vUv;
  varying float vElevation;
  varying float vMouseProximity;

  void main() {
    /* ─── Elevation color mapping ─── */
    float t = smoothstep(-0.4, 0.4, vElevation);
    vec3 color = mix(uColorDeep, uColorMid, smoothstep(0.0, 0.45, t));
    color = mix(color, uColorHigh, smoothstep(0.4, 0.85, t));
    color = mix(color, uColorAccent, smoothstep(0.8, 1.0, t) * 0.3);

    /* ─── Subtle tech grid overlay ─── */
    vec2 grid = abs(fract(vUv * vec2(48.0, 32.0) - 0.5) - 0.5);
    float line = 1.0 - smoothstep(0.0, uGridLineWidth, min(grid.x, grid.y));
    float gridAlpha = line * uWireframeOpacity * (0.5 + 0.5 * t);
    color = mix(color, vec3(1.0), gridAlpha);

    /* ─── Depth vignette ─── */
    float vignette = smoothstep(0.0, 0.6, 0.5 - length(vUv - 0.5));
    color = mix(color * 0.65, color, vignette * 0.55 + 0.45);

    /* ─── Fresnel-style rim from elevation ─── */
    float rim = pow(1.0 - abs(vElevation * 1.8), 4.0) * 0.06;
    color += rim;

    /* ─── Cursor highlight glow ─── */
    color += vMouseProximity * uColorHigh * 0.15;

    /* ─── Subtle temporal breathing ─── */
    color *= 0.97 + 0.03 * sin(uTime * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   ProceduralMesh — R3F component with custom ShaderMaterial
   ═══════════════════════════════════════════════════════════════════════════ */
function ProceduralMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const smoothMouse = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseInfluence: { value: CONFIG.mouseInfluence },
      uMouseRadius: { value: CONFIG.mouseRadius },

      uFreq1: { value: CONFIG.noise.layer1.frequency },
      uAmp1: { value: CONFIG.noise.layer1.amplitude },
      uSpeed1: { value: CONFIG.noise.layer1.speed },
      uFreq2: { value: CONFIG.noise.layer2.frequency },
      uAmp2: { value: CONFIG.noise.layer2.amplitude },
      uSpeed2: { value: CONFIG.noise.layer2.speed },
      uFreq3: { value: CONFIG.noise.layer3.frequency },
      uAmp3: { value: CONFIG.noise.layer3.amplitude },
      uSpeed3: { value: CONFIG.noise.layer3.speed },

      uColorDeep: { value: new THREE.Color(CONFIG.colors.deep) },
      uColorMid: { value: new THREE.Color(CONFIG.colors.mid) },
      uColorHigh: { value: new THREE.Color(CONFIG.colors.high) },
      uColorAccent: { value: new THREE.Color(CONFIG.colors.accent) },

      uWireframeOpacity: { value: CONFIG.wireframeOpacity },
      uGridLineWidth: { value: CONFIG.gridLineWidth },
    }),
    [],
  );

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    /* Smooth mouse interpolation for fluid parallax */
    smoothMouse.current.lerp(pointer, CONFIG.cameraLerp * 2);
    uniforms.uMouse.value.copy(smoothMouse.current);
  });

  return (
    <mesh ref={meshRef} rotation={[CONFIG.meshRotationX, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[CONFIG.planeWidth, CONFIG.planeHeight, CONFIG.segmentsX, CONFIG.segmentsY]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WorldBackdrop — single large flat quad fills the entire background void
   2 triangles, zero displacement, matches fog/clear color exactly
   ═══════════════════════════════════════════════════════════════════════════ */
function WorldBackdrop() {
  return (
    <mesh position={[0, 0, -2.5]}>
      <planeGeometry args={[80, 60]} />
      <meshBasicMaterial color={CONFIG.colors.fog} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CameraRig — smooth cursor-driven parallax
   ═══════════════════════════════════════════════════════════════════════════ */
function CameraRig() {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const smoothMouse = useRef(new THREE.Vector2(0, 0));

  useFrame(({ pointer }) => {
    smoothMouse.current.lerp(pointer, CONFIG.cameraLerp);
    camera.position.x +=
      (smoothMouse.current.x * CONFIG.cameraParallax.x - camera.position.x) * CONFIG.cameraLerp;
    const targetY = CONFIG.cameraPosition[1] + smoothMouse.current.y * CONFIG.cameraParallax.y;
    camera.position.y += (Math.max(targetY, CONFIG.cameraPosition[1]) - camera.position.y) * CONFIG.cameraLerp;
    camera.lookAt(target);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   AuthInteractiveScene — public component, mounts R3F Canvas
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AuthInteractiveScene() {
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const onCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    gl.setClearColor(CONFIG.colors.fog, 1);
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, []);

  return (
    <div className="relative h-full overflow-hidden rounded-[32px] shadow-[0_40px_120px_rgba(58,16,74,0.38)]">
      {/* 3D procedural mesh background */}
      {!reducedMotion && (
        <Canvas
          className="!absolute inset-0"
          camera={{ position: CONFIG.cameraPosition, fov: CONFIG.cameraFov, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          onCreated={onCreated}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <fog attach="fog" args={[CONFIG.colors.fog, 4, 11]} />
          <WorldBackdrop />
          <ProceduralMesh />
          <CameraRig />
        </Canvas>
      )}

      {/* Reduced-motion fallback */}
      {reducedMotion && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${CONFIG.colors.deep} 0%, ${CONFIG.colors.mid} 50%, ${CONFIG.colors.high} 100%)`,
          }}
        />
      )}

      {/* Logo overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        {/* Radial scrim behind logo for contrast */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_center,rgba(45,10,53,0.55)_0%,transparent_100%)]" />

        <div className="relative flex flex-col items-center gap-6">
          <img
            src="/resources/images/LOGO-IMD-CENTRO-MEDICO_VERTICAL_COLOR.png"
            alt="IMD Centro Médico"
            className="h-32 w-auto drop-shadow-[0_4px_40px_rgba(255,255,255,0.35)] xl:h-40"
          />
          <div className="rounded-full border border-white/20 bg-white/15 px-6 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/95">
              Plataforma clínica interna
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}