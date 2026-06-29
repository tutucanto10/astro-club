"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type Finish = "auto" | "matte" | "glossy";

type AstroLogo3DProps = {
  /** Caminho do SVG dentro de /public. Default: /astro-logo.svg */
  src?: string;
  /** Cor das letras. Default: branco. Pra fundo branco use "#0a0a0a". */
  color?: string;
  /** Acabamento do material. "auto" escolhe sozinho pela cor:
   *  cores escuras ficam foscas (mostram o volume), claras ficam brilhantes.
   *  Default: "auto" */
  finish?: Finish;
  /** Profundidade da extrusao (volume das letras). Default: 18 */
  depth?: number;
  /** Velocidade de rotacao (rad/frame). Default: 0.012. Use 0 pra parar. */
  spinSpeed?: number;
  /** Altura do canvas. Default: 300 */
  height?: number;
  /** Cor de fundo do canvas. Default: transparente */
  background?: string;
  /** Posição Z da câmera (quanto maior, mais zoom out). Default: 900 */
  cameraZ?: number;
};

function luminance(hex: string): number {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

function resolveMaterial(color: string, finish: Finish) {
  let metalness: number;
  let roughness: number;

  if (finish === "matte") {
    metalness = 0.0;
    roughness = 0.65;
  } else if (finish === "glossy") {
    metalness = 0.5;
    roughness = 0.3;
  } else {
    const isDark = luminance(color) < 0.35;
    metalness = isDark ? 0.0 : 0.5;
    roughness = isDark ? 0.65 : 0.3;
  }

  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
    side: THREE.DoubleSide,
  });
}

function LogoMesh({
  src,
  color,
  finish,
  depth,
  spinSpeed,
}: Required<
  Pick<AstroLogo3DProps, "src" | "color" | "finish" | "depth" | "spinSpeed">
>) {
  const pivot = useRef<THREE.Group>(null);
  const data = useLoader(SVGLoader, src);

  const group = useMemo(() => {
    const g = new THREE.Group();
    const material = resolveMaterial(color, finish);

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

    g.scale.y = -1;
    return g;
  }, [data, color, finish, depth]);

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
  finish = "auto",
  depth = 18,
  spinSpeed = 0.012,
  height = 300,
  background,
  cameraZ = 900,
}: AstroLogo3DProps) {
  const dark = luminance(color) < 0.35;

  return (
    <div
      style={{
        width: "100%",
        height,
        background: background ?? "transparent",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={dark ? 0.55 : 0.4} />
        <directionalLight position={[1, 1.3, 2]} intensity={dark ? 1.3 : 1.1} />
        <directionalLight position={[-1.2, -0.5, -1]} intensity={dark ? 0.9 : 0.7} />
        {dark && <directionalLight position={[0, -1, 1.5]} intensity={0.6} />}
        <Suspense fallback={null}>
          <LogoMesh
            src={src}
            color={color}
            finish={finish}
            depth={depth}
            spinSpeed={spinSpeed}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
