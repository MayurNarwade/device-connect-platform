import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function ParticleField({ count = 200 }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    mesh.current.rotation.y += 0.0005;
  });

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 10;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#6C5CE7" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export default function BackgroundParticles() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <ParticleField />
        </Float>
      </Canvas>
    </div>
  );
}