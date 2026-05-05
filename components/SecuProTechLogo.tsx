"use client";

interface SecuProTechLogoProps {
  width?: number;
  className?: string;
}

export default function SecuProTechLogo({ width = 360, className }: SecuProTechLogoProps) {
  const height = Math.round((width * 72) / 360);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 360 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SecuPRO Tech"
      role="img"
    >
      <defs>
        <clipPath id="sptl-shield-clip">
          <path d="M8 5 L64 5 L64 50 L36 67 L8 50 Z" />
        </clipPath>
        <filter id="sptl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sptl-orange-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="360" height="72" rx="5" fill="#0B1828" />

      {/* Shield body */}
      <path d="M8 5 L64 5 L64 50 L36 67 L8 50 Z" fill="#091521" />

      {/* Orange left stripe — clipped to shield */}
      <rect
        x="8"
        y="5"
        width="13"
        height="45"
        fill="#F5822A"
        clipPath="url(#sptl-shield-clip)"
        filter="url(#sptl-orange-glow)"
      />

      {/* Cyan shield outline */}
      <path
        d="M8 5 L64 5 L64 50 L36 67 L8 50 Z"
        stroke="#00C8F0"
        strokeWidth="1.8"
        filter="url(#sptl-glow)"
      />

      {/* Checkmark inside shield */}
      <path
        d="M24 33 L34 43 L54 22"
        stroke="#00C8F0"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sptl-glow)"
      />

      {/* "Secu" — white */}
      <text
        x="76"
        y="46"
        fontFamily="'Geist Sans', 'Helvetica Neue', Arial, sans-serif"
        fontSize="34"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="-0.5"
      >
        Secu
      </text>

      {/* "PRO" — orange */}
      <text
        x="160"
        y="46"
        fontFamily="'Geist Sans', 'Helvetica Neue', Arial, sans-serif"
        fontSize="34"
        fontWeight="800"
        fill="#F5822A"
        letterSpacing="-0.5"
        filter="url(#sptl-orange-glow)"
      >
        PRO
      </text>

      {/* "TECH" — small cyan superscript */}
      <text
        x="232"
        y="25"
        fontFamily="'Geist Sans', 'Helvetica Neue', Arial, sans-serif"
        fontSize="11.5"
        fontWeight="700"
        fill="#00C8F0"
        letterSpacing="3"
        filter="url(#sptl-glow)"
      >
        TECH
      </text>

      {/* Separator */}
      <line
        x1="76"
        y1="52"
        x2="330"
        y2="52"
        stroke="rgba(0,200,240,0.13)"
        strokeWidth="0.5"
      />

      {/* Subtitle */}
      <text
        x="76"
        y="64"
        fontFamily="'Geist Sans', 'Helvetica Neue', Arial, sans-serif"
        fontSize="8"
        fontWeight="400"
        fill="#4A5C70"
        letterSpacing="2.2"
      >
        GESTION · CONFORMITÉ · TERRAIN
      </text>
    </svg>
  );
}
