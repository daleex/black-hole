import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Html, Text } from '@react-three/drei';
import * as THREE from 'three';

// Particelle esplosione supernova
function Particles({ active }) {
  const pointsRef = useRef();
  const count = 300;

  // Posizioni e velocità iniziali
  const particlesData = useMemo(() => {
    const positions = [];
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      velocities.push(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
    }
    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (active && pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += particlesData.velocities[i * 3];
        positions[i * 3 + 1] += particlesData.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particlesData.velocities[i * 3 + 2];
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} visible={active} position={[0, 0, -600]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(particlesData.positions)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="orange"
        size={2.5}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Star({ phase }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.visible = phase === 'intro' || phase === 'star';
      ref.current.rotation.y += 0.008;
      ref.current.rotation.x += 0.005;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -600]} scale={[1, 1, 1]}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial
        emissive="#ffcc33"
        emissiveIntensity={2}
        color="#ffaa00"
        roughness={0.3}
        metalness={0.4}
      />
    </mesh>
  );
}

function Supernova({ trigger }) {
  const ref = useRef();
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      setScale(1);
      setOpacity(1);
    } else {
      setActive(false);
      setScale(0);
      setOpacity(1);
    }
  }, [trigger]);

  useFrame(() => {
    if (active) {
      if (scale < 15) {
        setScale((s) => s + 0.3);
        setOpacity((o) => Math.max(o - 0.02, 0));
      } else {
        setActive(false);
      }
    }
  });

  if (!active) return null;

  return (
    <>
      <mesh ref={ref} position={[0, 0, -600]} scale={[scale, scale, scale]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="orange"
          emissive="red"
          emissiveIntensity={5}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Particles active={active} />
    </>
  );
}

function BlackHole({ visible, scale }) {
  const ref = useRef();
  const ringRef = useRef();

  useFrame(() => {
    if (ref.current) ref.current.rotation.z += 0.015;
    if (ringRef.current) ringRef.current.rotation.z -= 0.025;
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, -500]} scale={[scale, scale, scale]}>
      {/* Buco nero centrale */}
      <mesh ref={ref}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="black" roughness={1} metalness={0} />
      </mesh>

      {/* Anello orizzonte eventi */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.8, 0.4, 30, 100]} />
        <meshBasicMaterial
          color="orange"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Starfield({ visible }) {
  const geometryRef = useRef();
  const count = 4000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1500;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1500;
    positions[i * 3 + 2] = -Math.random() * 1500;
  }

  return (
    <points visible={visible}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="white" size={1.3} sizeAttenuation />
    </points>
  );
}

function NarrativeText({ text }) {
  return (
    <Text
      position={[0, -8, 0]}
      fontSize={1.2}
      color="white"
      maxWidth={60}
      lineHeight={1.5}
      textAlign="center"
    >
      {text}
    </Text>
  );
}

function Scene() {
  const scroll = useScroll();
  const group = useRef();

  const [phase, setPhase] = useState('intro');
  const [exploded, setExploded] = useState(false);
  const [showBlackHole, setShowBlackHole] = useState(false);
  const [enterBlackHole, setEnterBlackHole] = useState(false);
  const [blackHoleScale, setBlackHoleScale] = useState(0.1);

  useFrame(() => {
    const offset = scroll.offset;

    if (offset < 0.25) {
      setPhase('intro');
      setExploded(false);
      setShowBlackHole(false);
      setEnterBlackHole(false);
      setBlackHoleScale(0.1);
    } else if (offset >= 0.25 && offset < 0.5) {
      setPhase('star');
      setExploded(false);
      setShowBlackHole(false);
      setEnterBlackHole(false);
      setBlackHoleScale(0.1);
    } else if (offset >= 0.5 && offset < 0.55) {
      setPhase('explosion');
      setExploded(true);
      setShowBlackHole(false);
      setEnterBlackHole(false);
      setBlackHoleScale(0.1);
    } else if (offset >= 0.55 && offset < 0.9) {
      setPhase('blackhole');
      setShowBlackHole(true);
      setEnterBlackHole(false);
      const scale = THREE.MathUtils.lerp(0.1, 7, (offset - 0.55) / 0.35);
      setBlackHoleScale(scale);
    } else {
      setPhase('inside');
      setEnterBlackHole(true);
      setShowBlackHole(true);
      setBlackHoleScale(7);
    }

    if (group.current) {
      group.current.position.z = offset * 1000;
    }
  });

  const texts = {
    intro: 'Ti stai avvicinando allo spazio profondo...',
    star: 'Ecco la stella in lontananza...',
    explosion: 'La stella esplode in una supernova!',
    blackhole: 'Sta emergendo un buco nero...',
    inside: 'Sei dentro il buco nero. Il tempo si piega...',
  };

  return (
    <group ref={group}>
      <Starfield visible={!enterBlackHole} />
      <Star phase={phase} />
      <Supernova trigger={exploded} />
      <BlackHole visible={showBlackHole} scale={blackHoleScale} />
      <NarrativeText text={texts[phase]} />
    </group>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: 'black' }}
      >
        <Suspense fallback={<Html center>Caricamento...</Html>}>
          <ScrollControls pages={50} damping={0.1}>
            <Scene />
          </ScrollControls>
        </Suspense>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={3} />
      </Canvas>
    </div>
  );
}
