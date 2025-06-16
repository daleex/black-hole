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
  }
}, [trigger]);

useFrame(() => {
  if (active) {
    if (scale < 30) {
      setScale((s) => s + 0.2);
      setOpacity((o) => Math.max(o - 0.004, 0));
    } else {
      setActive(false); // hides supernova when done
      setScale(0);      // fully shrink it to be sure
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
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) coreRef.current.rotation.y += 0.01;
    if (ring1Ref.current) ring1Ref.current.rotation.z += 0.015;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= 0.02;
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + 0.2 * Math.sin(t * 2);
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, -500]} scale={[scale, scale, scale]}>
      {/* Black Hole Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#000000"
          roughness={1}
          metalness={0}
          emissive="#110000"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner Event Horizon Ring - now vertical */}
      <mesh ref={ring1Ref} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.9, 0.15, 30, 100]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Outer Event Horizon Ring - now vertical */}
      <mesh ref={ring2Ref} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[2.3, 0.3, 30, 100]} />
        <meshBasicMaterial
          color="#ffcc33"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Outer Glow Ring - now vertical */}
      <mesh ref={glowRef} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[2.5, 3.5, 64]} />
        <meshBasicMaterial
          color="#ffdd88"
          transparent
          opacity={0.3}
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


function Scene() {
  const scroll = useScroll();
  const group = useRef();

  const [phase, setPhase] = useState('intro');
  const [exploded, setExploded] = useState(false);
  const [showBlackHole, setShowBlackHole] = useState(false);
  const [enterBlackHole, setEnterBlackHole] = useState(false);
  const [blackHoleScale, setBlackHoleScale] = useState(0.1);

  const [recoiling, setRecoiling] = useState(false);
  const [recoilZ, setRecoilZ] = useState(null);
  const recoilStartRef = useRef(null);

  // Locks for black hole and inside phases
  const [lockedToBlackHole, setLockedToBlackHole] = useState(false);
  const [lockedInside, setLockedInside] = useState(false);

  const prevOffsetRef = useRef(0);

 useFrame(() => {
  let offset = scroll.offset;

  // Lock scroll inside
  if (lockedInside) {
    // Prevent scrolling up (offset decrease) below current offset
    if (offset < prevOffsetRef.current) {
      offset = prevOffsetRef.current;
    }
  } else if (lockedToBlackHole) {
    offset = Math.max(offset, 0.65);
  }

  prevOffsetRef.current = offset;

  const offsetAdjusted = offset + 0.03;

  // Phase switching logic with adjusted offset
  if (offsetAdjusted < 0.25) {
    setPhase('intro');
    setExploded(false);
    setShowBlackHole(false);
    setEnterBlackHole(false);
    setBlackHoleScale(0.1);
    setLockedToBlackHole(false);
    setLockedInside(false);
  } else if (offsetAdjusted >= 0.25 && offsetAdjusted < 0.6) {
    setPhase('star');
    setExploded(false);
    setShowBlackHole(false);
    setEnterBlackHole(false);
    setBlackHoleScale(0.1);
    setLockedToBlackHole(false);
    setLockedInside(false);
  } else if (offsetAdjusted >= 0.6 && offsetAdjusted < 0.65) {
    setPhase('explosion');
    if (!exploded) {
      setExploded(true);
      setRecoiling(true);
      recoilStartRef.current = Date.now();
    }
    setShowBlackHole(false);
    setEnterBlackHole(false);
    setBlackHoleScale(0.1);
    setLockedToBlackHole(false);
    setLockedInside(false);
  } else if (offsetAdjusted >= 0.65 && offsetAdjusted < 0.74) {
    setPhase('blackhole');
    setEnterBlackHole(false);
    const scale = THREE.MathUtils.lerp(0.1, 7, (offsetAdjusted - 0.65) / 0.25);
    setBlackHoleScale(scale);
    if (!recoiling) {
      setShowBlackHole(true);
    }
    setLockedInside(false);
  } else {
    setPhase('inside');
    setEnterBlackHole(true);
    setShowBlackHole(true);
    setBlackHoleScale(7);
    setLockedInside(true);
  }

  // Handle recoil animation
  if (recoiling) {
    const elapsed = (Date.now() - recoilStartRef.current) / 1000;
    const duration = 1.5;
    const maxRecoil = 500;

    if (elapsed < duration) {
      const recoilProgress = elapsed / duration;
      const zOffset = -maxRecoil * Math.sin(Math.PI * recoilProgress);
      setRecoilZ(scroll.offset * 1000 + zOffset);
    } else {
      setRecoiling(false);
      setRecoilZ(null);
      setShowBlackHole(true);
      setLockedToBlackHole(true);
    }
  }

  // Update group position with or without recoil
  if (group.current) {
    const recoilEnded = exploded && !recoiling;
    const recoilPushBack = 200; // tweak this to adjust push back distance

    let targetZ =
      recoilZ !== null
        ? recoilZ
        : recoilEnded
        ? scroll.offset * 1000 - recoilPushBack
        : scroll.offset * 1000;

    // Clamp position.z when inside phase to prevent scrolling up visually
    if (lockedInside) {
      const minZ = 0.74 * 1000; // minimum z allowed inside
      if (targetZ < minZ) {
        targetZ = minZ;
      }
    }

    group.current.position.z = targetZ;
  }
});



  return (
    <group ref={group}>
      <Starfield visible={!enterBlackHole} />
      <Star phase={phase} />
      <Supernova trigger={exploded} />
      <BlackHole visible={showBlackHole} scale={blackHoleScale} />
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
