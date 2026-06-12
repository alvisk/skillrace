"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Html, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import type { Group, MeshBasicMaterial } from "three";
import { laneColor } from "@/lib/palette";
import { START_Z, TIME_SCALE, TRACK_LENGTH, type RacePhase } from "@/lib/race";
import type { SkillSummary } from "@/lib/results";

const LANE_X = [-5.6, -2.8, 0, 2.8, 5.6, -7.2];
const ROAD_SCROLL_SPEED = 9;
const FALLBACK_DURATION_S = 30;

type RaceTimeRef = { current: number };

type SceneProps = {
  summary: SkillSummary[];
  phase: RacePhase;
  raceTime: RaceTimeRef;
};

type CarSpec = {
  id: string;
  lane: number;
  color: string;
  durationS: number;
  /** world-units per second of wall clock */
  speed: number;
  /** finishing position by speed (1 = fastest) */
  place: number;
  label: string;
  sublabel: string;
  winner: boolean;
};

/** Advances the shared race clock while running; exposes debug state for tooling. */
const RaceClock = ({ phase, raceTime }: { phase: RacePhase; raceTime: RaceTimeRef }) => {
  useFrame((_, delta) => {
    if (phase === "running") raceTime.current += delta;
    (window as any).__skillrace = {
      phase,
      raceTime: raceTime.current,
      benchTime: raceTime.current * TIME_SCALE,
    };
  });
  return null;
};

/**
 * Drone flythrough rig.
 * idle: slow orbit around the start grid. running/paused: weaving chase that
 * swoops across lanes and altitude. finished: victory orbit around the gate.
 */
const CameraRig = ({
  phase,
  raceTime,
  packSpeed,
}: {
  phase: RacePhase;
  raceTime: RaceTimeRef;
  packSpeed: number;
}) => {
  const look = useRef(new Vector3(0, 0.8, START_Z));

  useFrame(({ camera, clock }, delta) => {
    const t = clock.elapsedTime;
    const packProgress = Math.min(raceTime.current * packSpeed, TRACK_LENGTH);
    const packZ = START_Z - packProgress;
    const finishZ = START_Z - TRACK_LENGTH;

    let target: [number, number, number];
    let lookTarget: [number, number, number];

    if (phase === "idle") {
      const a = t * 0.22;
      target = [Math.sin(a) * 10, 3.4 + Math.sin(t * 0.35) * 0.9, START_Z + 2 + Math.cos(a) * 10];
      lookTarget = [0, 0.6, START_Z - 2];
    } else if (phase === "finished") {
      const a = t * 0.18;
      target = [Math.sin(a) * 10, 3.2 + Math.sin(t * 0.3) * 1.0, finishZ + 2 + Math.cos(a) * 10];
      lookTarget = [0, 0.6, finishZ - 1];
    } else {
      target = [
        Math.sin(t * 0.35) * 5.5,
        2.0 + Math.sin(t * 0.27) * 1.4,
        packZ + 11 + Math.sin(t * 0.19) * 2.5,
      ];
      lookTarget = [Math.sin(t * 0.21) * 1.5, 0.7, packZ - 5];
    }

    const k = Math.min(1, delta * 2.2);
    camera.position.x += (target[0] - camera.position.x) * k;
    camera.position.y += (target[1] - camera.position.y) * k;
    camera.position.z += (target[2] - camera.position.z) * k;
    look.current.x += (lookTarget[0] - look.current.x) * k;
    look.current.y += (lookTarget[1] - look.current.y) * k;
    look.current.z += (lookTarget[2] - look.current.z) * k;
    camera.lookAt(look.current);
  });
  return null;
};

const Car = ({ spec, phase, raceTime }: { spec: CarSpec; phase: RacePhase; raceTime: RaceTimeRef }) => {
  const group = useRef<Group>(null);
  const streakMat = useRef<MeshBasicMaterial>(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (phase === "idle") setFinished(false);
  }, [phase]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    const baseProgress = Math.min(raceTime.current * spec.speed, TRACK_LENGTH);
    const atFinish = baseProgress >= TRACK_LENGTH;
    if (atFinish && !finished) setFinished(true);

    // Visual surge: cars jockey mid-race, but the envelope is zero at the start
    // and finish lines so true finish times and order are preserved.
    const envelope = Math.sin(Math.PI * (baseProgress / TRACK_LENGTH));
    const surge = Math.sin(raceTime.current * (0.9 + spec.lane * 0.17) + spec.lane * 1.9) * 1.4 * envelope;
    const progress = Math.min(Math.max(baseProgress + surge, 0), TRACK_LENGTH);

    const moving = phase === "running" && !atFinish;
    const swayPhase = t * 0.8 + spec.lane * 2.3;

    group.current.position.z = START_Z - progress;
    group.current.position.y = 0.45 + Math.sin(t * 2.1 + spec.lane * 1.7) * 0.05;
    group.current.position.x = LANE_X[spec.lane] + (moving ? Math.sin(swayPhase) * 0.28 : 0);
    // bank into the sway, nose slightly into the surge
    group.current.rotation.z = moving ? -Math.cos(swayPhase) * 0.18 : 0;
    group.current.rotation.y = moving ? -Math.cos(swayPhase) * 0.1 : 0;

    if (streakMat.current) {
      streakMat.current.opacity = moving ? 0.35 + 0.25 * Math.sin(t * 7 + spec.lane * 2) : 0.15;
    }
  });

  const tagText = finished ? `P${spec.place} · ${spec.durationS}s` : spec.sublabel;

  return (
    <group ref={group} position={[LANE_X[spec.lane], 0.45, START_Z]}>
      <mesh>
        <boxGeometry args={[1.1, 0.34, 2.4]} />
        <meshStandardMaterial
          color="#0a0a14"
          emissive={spec.color}
          emissiveIntensity={0.55}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 0.3, -0.1]}>
        <boxGeometry args={[0.8, 0.26, 1.1]} />
        <meshStandardMaterial
          color="#05050c"
          emissive={spec.color}
          emissiveIntensity={0.25}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.05, 1.21]}>
        <boxGeometry args={[1.0, 0.12, 0.04]} />
        <meshStandardMaterial color="#000000" emissive={spec.color} emissiveIntensity={3.2} />
      </mesh>
      <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 3.1]} />
        <meshBasicMaterial color={spec.color} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, 4.2]}>
        <boxGeometry args={[0.16, 0.06, 5.6]} />
        <meshBasicMaterial ref={streakMat} color={spec.color} transparent opacity={0.15} />
      </mesh>
      <Html
        center
        distanceFactor={9}
        position={[0, 1.35 + (spec.lane % 2) * 0.8, 0]}
        wrapperClass="car-label"
        zIndexRange={[5, 0]}
      >
        <div
          className={`car-tag${spec.winner ? " car-tag-winner" : ""}${finished ? " car-tag-finished" : ""}`}
          style={{ borderColor: spec.color, color: spec.color }}
        >
          <strong>{spec.label}</strong>
          <span>{tagText}</span>
        </div>
      </Html>
    </group>
  );
};

const Road = ({ phase }: { phase: RacePhase }) => {
  const scroller = useRef<Group>(null);
  const scroll = useRef(0);

  useFrame((_, delta) => {
    if (!scroller.current) return;
    // full speed while racing, gentle ambient drift otherwise
    const speed = phase === "running" ? ROAD_SCROLL_SPEED : 0.8;
    scroll.current += delta * speed;
    scroller.current.position.z = scroll.current % 5;
  });

  return (
    <>
      <group ref={scroller}>
        <Grid
          args={[220, 220]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#1b2c5a"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#00f0ff"
          fadeDistance={95}
          fadeStrength={2}
          position={[0, 0, 0]}
        />
      </group>
      <mesh position={[0, -0.02, -60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 240]} />
        <meshStandardMaterial color="#06020f" roughness={0.9} metalness={0.1} />
      </mesh>
    </>
  );
};

const TrackLines = () => (
  <>
    {/* start line */}
    <mesh position={[0, 0.02, START_Z + 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12.8, 0.3]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0.85} />
    </mesh>
    {/* finish line */}
    <mesh position={[0, 0.02, START_Z - TRACK_LENGTH - 1.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12.8, 0.8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
    </mesh>
    {/* finish gate posts */}
    {[-6.6, 6.6].map((x) => (
      <mesh key={x} position={[x, 1.6, START_Z - TRACK_LENGTH - 1.4]}>
        <boxGeometry args={[0.16, 3.2, 0.16]} />
        <meshStandardMaterial color="#000000" emissive="#ffffff" emissiveIntensity={1.6} />
      </mesh>
    ))}
  </>
);

const Rails = () => {
  const rails = useRef<Group>(null);

  useFrame(({ clock }) => {
    const pulse = 2.2 + Math.sin(clock.elapsedTime * 2.4) * 0.8;
    rails.current?.children.forEach((child) => {
      const material = (child as any).material;
      if (material?.emissiveIntensity !== undefined) material.emissiveIntensity = pulse;
    });
  });

  return (
    <group ref={rails}>
      <mesh position={[-6.6, 0.5, -60]}>
        <boxGeometry args={[0.12, 0.12, 240]} />
        <meshStandardMaterial color="#000000" emissive="#ff00e5" emissiveIntensity={2.5} />
      </mesh>
      <mesh position={[6.6, 0.5, -60]}>
        <boxGeometry args={[0.12, 0.12, 240]} />
        <meshStandardMaterial color="#000000" emissive="#00f0ff" emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
};

const Sun = () => (
  <mesh position={[0, 9, -110]}>
    <circleGeometry args={[11, 64]} />
    <meshBasicMaterial color="#ff2d95" fog={false} />
  </mesh>
);

export const RaceScene = ({ summary, phase, raceTime }: SceneProps) => {
  const cars = useMemo<CarSpec[]>(() => {
    const contenders = summary.slice(0, LANE_X.length);
    const byDuration = [...contenders].sort(
      (a, b) => (a.medianDurationS ?? FALLBACK_DURATION_S) - (b.medianDurationS ?? FALLBACK_DURATION_S),
    );
    return contenders.map((s, i) => {
      const durationS = s.medianDurationS ?? FALLBACK_DURATION_S;
      return {
        id: s.skillId,
        lane: i,
        color: laneColor(i),
        durationS,
        speed: (TRACK_LENGTH * TIME_SCALE) / durationS,
        place: byDuration.findIndex((d) => d.skillId === s.skillId) + 1,
        label: s.skillId,
        sublabel: `${durationS}s · Q ${(s.medianQuality ?? 0).toFixed(2)}`,
        winner: i === 0,
      };
    });
  }, [summary]);

  return (
    <div className="scene">
      <Canvas camera={{ position: [0, 3.4, 9], fov: 60 }} gl={{ antialias: true }}>
        <color attach="background" args={["#040112"]} />
        <fog attach="fog" args={["#040112", 18, 100]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[0, 10, 6]} intensity={0.6} color="#88aaff" />
        <Stars radius={130} depth={60} count={3000} factor={3} fade speed={0.6} />
        <RaceClock phase={phase} raceTime={raceTime} />
        <CameraRig
          phase={phase}
          raceTime={raceTime}
          packSpeed={cars.reduce((sum, c) => sum + c.speed, 0) / Math.max(1, cars.length)}
        />
        <Sun />
        <Road phase={phase} />
        <TrackLines />
        <Rails />
        {cars.map((car) => (
          <Car key={car.id} spec={car} phase={phase} raceTime={raceTime} />
        ))}
        <EffectComposer>
          <Bloom intensity={1.15} luminanceThreshold={0.18} mipmapBlur radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default RaceScene;
