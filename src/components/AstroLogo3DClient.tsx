"use client";

import dynamicImport from "next/dynamic";

const AstroLogo3D = dynamicImport(() => import("@/components/AstroLogo3D"), {
  ssr: false,
  loading: () => <div style={{ height: 260 }} />,
});

export default function AstroLogo3DClient() {
  return <AstroLogo3D height={280} depth={8} spinSpeed={0.010} cameraZ={1100} />;
}
