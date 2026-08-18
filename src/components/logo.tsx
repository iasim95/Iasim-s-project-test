export function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Gastos"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="logo-vignette" x1="0%" y1="60%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="logo-gloss" cx="32%" cy="18%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="512" height="512" rx="115" fill="url(#logo-bg)" />
      <rect width="512" height="512" rx="115" fill="url(#logo-vignette)" />
      <rect width="512" height="512" rx="115" fill="url(#logo-gloss)" />

      <text
        x="256"
        y="362"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="292"
        fill="#0f2454"
        opacity="0.25"
      >
        €
      </text>
      <text
        x="256"
        y="356"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="292"
        fill="#ffffff"
      >
        €
      </text>
    </svg>
  );
}
