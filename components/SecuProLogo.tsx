"use client";

interface SecuProLogoProps {
  /** "full" = icon + wordmark (default), "icon" = shield only */
  variant?: "full" | "icon";
  /** Height in px — width scales proportionally */
  height?: number;
  className?: string;
}

export default function SecuProLogo({
  variant = "full",
  height = 48,
  className,
}: SecuProLogoProps) {
  if (variant === "icon") {
    const size = height;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 96 96"
        width={size}
        height={size}
        className={className}
        aria-label="SecuPRO icon"
      >
        <defs>
          <linearGradient id="sp-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d1ff" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="sp-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050d1a" stopOpacity="0.98" />
          </linearGradient>
          <filter id="sp-gl">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sp-gc">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M8,6 L88,6 L88,54 Q88,82 48,92 Q8,82 8,54 Z" fill="url(#sp-bg)" />
        <path d="M8,6 L88,6 L88,54 Q88,82 48,92 Q8,82 8,54 Z"
              fill="none" stroke="url(#sp-g)" strokeWidth="2.5" filter="url(#sp-gl)" />
        <path d="M14,12 L82,12 L82,54 Q82,78 48,88 Q14,78 14,54 Z"
              fill="none" stroke="url(#sp-g)" strokeWidth="0.6" opacity="0.2" />
        <rect x="28" y="30" width="40" height="40" rx="4"
              fill="none" stroke="url(#sp-g)" strokeWidth="2" filter="url(#sp-gl)" />
        <rect x="35" y="37" width="26" height="26" rx="2"
              fill="url(#sp-g)" fillOpacity="0.07" stroke="url(#sp-g)" strokeWidth="0.8" opacity="0.5" />
        <circle cx="48" cy="50" r="5" fill="url(#sp-g)" filter="url(#sp-gc)" />
        {[40, 60].flatMap((cx) =>
          [40, 60].map((cy) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" fill="url(#sp-g)" filter="url(#sp-gl)" />
          ))
        )}
        {/* Pins */}
        {[36, 44, 50, 56, 64].map((y) => (
          <g key={y}>
            <line x1="28" y1={y} x2="18" y2={y} stroke="url(#sp-g)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-gl)" />
            <line x1="68" y1={y} x2="78" y2={y} stroke="url(#sp-g)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-gl)" />
          </g>
        ))}
        {[35, 42, 48, 54, 61].map((x) => (
          <g key={x}>
            <line x1={x} y1="30" x2={x} y2="20" stroke="url(#sp-g)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-gl)" />
            <line x1={x} y1="70" x2={x} y2="80" stroke="url(#sp-g)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-gl)" />
          </g>
        ))}
      </svg>
    );
  }

  // Full logo
  const width = Math.round(height * (480 / 128));
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 480 128"
      width={width}
      height={height}
      className={className}
      aria-label="SecuPRO"
    >
      <defs>
        <linearGradient id="sp-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d1ff" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="sp-shield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a1628" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#050d1a" stopOpacity="0.96" />
        </linearGradient>
        <filter id="sp-glow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sp-core">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sp-text-blue">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield */}
      <path d="M18,8 L112,8 L112,68 Q112,100 65,122 Q18,100 18,68 Z" fill="url(#sp-shield)" />
      <path d="M18,8 L112,8 L112,68 Q112,100 65,122 Q18,100 18,68 Z"
            fill="none" stroke="url(#sp-icon)" strokeWidth="2.5" filter="url(#sp-glow)" />
      <path d="M26,16 L104,16 L104,68 Q104,95 65,114 Q26,95 26,68 Z"
            fill="none" stroke="url(#sp-icon)" strokeWidth="0.6" opacity="0.2" />

      {/* CPU chip */}
      <rect x="43" y="44" width="44" height="44" rx="4"
            fill="none" stroke="url(#sp-icon)" strokeWidth="2" filter="url(#sp-glow)" />
      <rect x="51" y="52" width="28" height="28" rx="2"
            fill="url(#sp-icon)" fillOpacity="0.07" stroke="url(#sp-icon)" strokeWidth="0.9" opacity="0.45" />
      <circle cx="65" cy="66" r="5.5" fill="url(#sp-icon)" filter="url(#sp-core)" />
      {[54, 76].flatMap((cx) =>
        [55, 77].map((cy) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="url(#sp-icon)" filter="url(#sp-glow)" />
        ))
      )}

      {/* Left/Right pins */}
      {[51, 58, 66, 74, 81].map((y) => (
        <g key={y}>
          <line x1="43" y1={y} x2="32" y2={y} stroke="url(#sp-icon)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-glow)" />
          <line x1="87" y1={y} x2="98" y2={y} stroke="url(#sp-icon)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-glow)" />
        </g>
      ))}
      {/* Top/Bottom pins */}
      {[50, 57, 65, 73, 80].map((x) => (
        <g key={x}>
          <line x1={x} y1="44" x2={x} y2="33" stroke="url(#sp-icon)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-glow)" />
          <line x1={x} y1="88" x2={x} y2="99" stroke="url(#sp-icon)" strokeWidth="1.8" strokeLinecap="round" filter="url(#sp-glow)" />
        </g>
      ))}

      {/* Separator */}
      <line x1="132" y1="20" x2="132" y2="108" stroke="url(#sp-icon)" strokeWidth="0.9" opacity="0.3" />

      {/* Wordmark */}
      <text
        x="150"
        y="75"
        fontFamily="Montserrat, 'Arial Black', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="52"
        letterSpacing="1"
      >
        <tspan fill="#00d1ff" filter="url(#sp-text-blue)">SECU</tspan>
        <tspan fill="white">PRO</tspan>
      </text>

      {/* Tagline */}
      <text
        x="152"
        y="96"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="400"
        fontSize="8.5"
        fill="#00d1ff"
        fillOpacity="0.5"
        letterSpacing="4"
      >
        SÉCURITÉ · INTELLIGENCE · PERFORMANCE
      </text>
    </svg>
  );
}
