"use client";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Slow auto-rotation
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = elapsedTime * 0.04;
      meshRef.current.rotation.x = elapsedTime * 0.015;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsedTime * 0.04;
      pointsRef.current.rotation.x = elapsedTime * 0.015;
    }
  });

  // Dotted matrix for the globe surface
  const pointPositions = useMemo(() => {
    const positions = [];
    const count = 750;
    for (let i = 0; i < count; i++) {
      // Uniform spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0; // radius

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.push(x, y, z);
    }
    return new Float32Array(positions);
  }, []);

  return (
    <group>
      {/* Outer grid wireframe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.01, 18, 18]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Surface points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#3b82f6"
          size={0.035}
          sizeAttenuation={true}
          transparent
          opacity={0.45}
        />
      </points>
    </group>
  );
}

function AnimatedDot({ points, delay }: { points: THREE.Vector3[]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.getElapsedTime() + delay;
    const progress = (time * 0.25) % 1; // travel speed factor
    const index = Math.floor(progress * (points.length - 1));
    const point = points[index];
    if (point) {
      ref.current.position.copy(point);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshBasicMaterial color="#22d3ee" toneMapped={false} />
    </mesh>
  );
}

function FlightPaths() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.04;
      groupRef.current.rotation.x = clock.getElapsedTime() * 0.015;
    }
  });

  // Generate fixed curved paths and three.js Line objects
  const flightPaths = useMemo(() => {
    const list = [];
    const count = 5;
    for (let i = 0; i < count; i++) {
      // Starting and ending points
      const v1 = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ).normalize().multiplyScalar(2.0);

      const v2 = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ).normalize().multiplyScalar(2.0);

      // Mid-point arched outward
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(2.0 + dist * 0.3); // arch height proportional to distance

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(50);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color("#3b82f6"),
        transparent: true,
        opacity: 0.15,
      });
      const lineObj = new THREE.Line(lineGeometry, lineMaterial);

      list.push({ points, lineObj });
    }
    return list;
  }, []);

  return (
    <group ref={groupRef}>
      {flightPaths.map((path, idx) => (
        <group key={idx}>
          <primitive object={path.lineObj} />
          <AnimatedDot points={path.points} delay={idx * 0.8} />
        </group>
      ))}
    </group>
  );
}

export default function Globe() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-transparent">
        <div className="w-12 h-12 rounded-full border border-blue-500/20 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] relative select-none">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <GlobeMesh />
        <FlightPaths />
      </Canvas>
    </div>
  );
}
