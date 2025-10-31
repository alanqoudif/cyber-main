"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, PointMaterial, Points } from "@react-three/drei";
import { Color, Group, Vector3 } from "three";

type Theme = "light" | "dark";

type ThreatGlobeProps = {
  theme: Theme;
};

type Palette = {
  core: string;
  halo: string;
  arc: string;
  arcSecondary: string;
  particles: string;
  grid: string;
};

const RADIUS = 1;

const flows = [
  { from: [25.2048, 55.2708], to: [40.7128, -74.006], weight: 0.48 },
  { from: [24.7136, 46.6753], to: [51.5072, -0.1276], weight: 0.55 },
  { from: [35.6764, 139.65], to: [37.7749, -122.4194], weight: 0.68 },
  { from: [48.8566, 2.3522], to: [1.3521, 103.8198], weight: 0.34 },
];

const paletteFor = (theme: Theme): Palette =>
  theme === "dark"
    ? {
        core: "#0d1b3f",
        halo: "#274bff",
        arc: "#68a7ff",
        arcSecondary: "#94bfff",
        particles: "#77b0ff",
        grid: "rgba(64, 101, 196, 0.25)",
      }
    : {
        core: "#1f2f70",
        halo: "#3f64ff",
        arc: "#2f58e8",
        arcSecondary: "#88a4ff",
        particles: "#4168ff",
        grid: "rgba(82, 112, 206, 0.18)",
      };

function latLngToVector(lat: number, lng: number, radius = RADIUS): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Core({ palette }: { palette: Palette }) {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.12;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[0.68, 2]} />
        <meshStandardMaterial color={palette.core} metalness={0.45} roughness={0.2} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.96, 3]} />
        <meshStandardMaterial color={palette.grid} wireframe />
      </mesh>
    </group>
  );
}

function FlowArcs({ palette }: { palette: Palette }) {
  const arcs = useMemo(() => {
    return flows.map((flow) => {
      const start = latLngToVector(flow.from[0], flow.from[1], RADIUS + 0.02);
      const end = latLngToVector(flow.to[0], flow.to[1], RADIUS + 0.02);
      const arcPoints: [number, number, number][] = [];
      const lift = 0.3 + flow.weight * 0.3;

      for (let i = 0; i <= 48; i += 1) {
        const t = i / 48;
        const mid = new Vector3().lerpVectors(start, end, t);
        const curve = Math.sin(Math.PI * t) * lift;
        mid.normalize().multiplyScalar(RADIUS + curve);
        arcPoints.push([mid.x, mid.y, mid.z]);
      }

      const color = new Color(palette.arc).lerp(new Color(palette.arcSecondary), flow.weight * 0.4);

      return {
        points: arcPoints,
        color: color.getStyle(),
        opacity: 0.55 + flow.weight * 0.3,
      };
    });
  }, [palette]);

  return (
    <group>
      {arcs.map((arc, index) => (
        <Line
          key={`arc-${index}`}
          points={arc.points}
          color={arc.color}
          lineWidth={1.2}
          transparent
          opacity={arc.opacity}
        />
      ))}
    </group>
  );
}

function ParticleField({ palette }: { palette: Palette }) {
  const positions = useMemo(() => {
    const pts: number[] = [];
    flows.forEach((flow) => {
      const hotspot = latLngToVector(flow.to[0], flow.to[1], RADIUS + 0.08);
      pts.push(hotspot.x, hotspot.y, hotspot.z);
    });

    for (let i = 0; i < 520; i += 1) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = RADIUS + 0.1 + Math.random() * 0.06;
      pts.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    return new Float32Array(pts);
  }, []);

  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          size={0.018}
          transparent
          opacity={0.85}
          color={palette.particles}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function OrbitBands({ palette }: { palette: Palette }) {
  const rings = useMemo(
    () => [
      { radius: 1.1, tilt: 0.6, speed: 0.14 },
      { radius: 1.2, tilt: -0.4, speed: -0.1 },
    ],
    []
  );

  return (
    <group>
      {rings.map((ring, index) => (
        <OrbitBand key={`ring-${index}`} {...ring} color={palette.grid} />
      ))}
    </group>
  );
}

function OrbitBand({
  radius,
  tilt,
  speed,
  color,
}: {
  radius: number;
  tilt: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<Group>(null);
  const points = useMemo(() => {
    const curve: [number, number, number][] = [];
    const steps = 128;
    for (let i = 0; i <= steps; i += 1) {
      const t = (i / steps) * Math.PI * 2;
      curve.push([Math.cos(t) * radius, 0, Math.sin(t) * radius]);
    }
    return curve;
  }, [radius]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Line points={points} color={color} transparent opacity={0.5} lineWidth={0.6} />
    </group>
  );
}

export function ThreatGlobe({ theme }: ThreatGlobeProps) {
  const palette = paletteFor(theme);

  return (
    <div className="relative h-72 w-72 overflow-hidden rounded-full md:h-[24rem] md:w-[24rem]">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} className="!bg-transparent" style={{ borderRadius: "9999px" }}>
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[2.5, 1.5, 4]} intensity={1.2} color={palette.halo} />
        <Suspense fallback={null}>
          <group>
            <Core palette={palette} />
            <FlowArcs palette={palette} />
            <ParticleField palette={palette} />
            <OrbitBands palette={palette} />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.35} enablePan={false} />
      </Canvas>
    </div>
  );
}

export default ThreatGlobe;
