"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type AstroLogo3DProps = {
  /** Caminho do SVG dentro de /public. Default: /astro-logo.svg */
  src?: string;
  /** Cor das letras. Default: branco */
  color?: string;
  /** Profundidade da extrusão (volume das letras). Default: 18 */
  depth?: number;
  /** Velocidade de rotação (rad/frame). Default: 0.012. Use 0 pra parar. */
  spinSpeed?: number;
  /** Altura do canvas. Default: 300 */
  height?: number;
  /** Cor de fundo do canvas. Default: transparente */
  background?: string;
};

function LogoMesh({
  src,
  color,
  depth,
  spinSpeed,
}: Required<Pick<AstroLogo3DProps, "src" | "color" | "depth" | "spinSpeed">>) {
  const pivot = useRef<THREE.Group>(null);
  const data = useLoader(SVGLoader, src);

  const group = useMemo(() => {
    const g = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.5,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });

    data.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 2,
          bevelSize: 1.5,
          bevelSegments: 2,
        });
        g.add(new THREE.Mesh(geometry, material));
      });
    });

    // SVG usa eixo Y pra baixo; invertemos pra ficar de pé.
    g.scale.y = -1;
    return g;
  }, [data, color, depth]);

  useFrame(() => {
    if (pivot.current) pivot.current.rotation.y += spinSpeed;
  });

  return (
    <group ref={pivot}>
      <Center>
        <primitive object={group} />
      </Center>
    </group>
  );
}

export default function AstroLogo3D({
  src = "/astro-logo.svg",
  color = "#ffffff",
  depth = 18,
  spinSpeed = 0.012,
  height = 300,
  background,
}: AstroLogo3DProps) {
  return (
    <div
      style={{
        width: "100%",
        height,
        background: background ?? "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 620], fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[1, 1, 2]} intensity={1.1} />
        <directionalLight position={[-1, -0.5, -1]} intensity={0.7} />
        <Suspense fallback={null}>
          <LogoMesh src={src} color={color} depth={depth} spinSpeed={spinSpeed} />
        </Suspense>
      </Canvas>
    </div>
  );
}
