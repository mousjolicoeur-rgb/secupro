"use client";

interface SecuProLogoProps {
  /** Hauteur en px — la largeur suit le ratio naturel du SVG (480:128 = 3.75:1) */
  height?: number;
  className?: string;
}

export default function SecuProLogo({ height = 48, className }: SecuProLogoProps) {
  const width = Math.round(height * 3.75);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/secupro-logo.svg"
      alt="SecuPRO"
      width={width}
      height={height}
      className={className}
    />
  );
}
