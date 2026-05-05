"use client";

import Image from "next/image";

interface SecuProLogoProps {
  /** Hauteur en px — la largeur est calculée sur le ratio naturel du SVG (480:128 = 3.75:1) */
  height?: number;
  className?: string;
}

export default function SecuProLogo({ height = 48, className }: SecuProLogoProps) {
  // Le SVG secupro-logo.svg a un viewBox 480×128 → ratio 3.75
  const width = Math.round(height * 3.75);
  return (
    <Image
      src="/secupro-logo.svg"
      alt="SecuPRO"
      width={width}
      height={height}
      className={className}
      priority
      unoptimized
    />
  );
}
