"use client";

import Image from "next/image";

interface SecuProLogoProps {
  /** Hauteur en px — la largeur est calculée proportionnellement (logo carré 1:1) */
  height?: number;
  className?: string;
}

export default function SecuProLogo({ height = 48, className }: SecuProLogoProps) {
  return (
    <Image
      src="/secupro-logo-official.png"
      alt="SecuPRO"
      width={height}
      height={height}
      className={className}
      priority
    />
  );
}
