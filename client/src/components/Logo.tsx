interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  const gradientId = `logo-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      aria-label="MendMate Logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#C2410C' }} />
          <stop offset="100%" style={{ stopColor: '#FBBF24' }} />
        </linearGradient>
      </defs>
      <path
        d="M40 4 C58 4 68 4 72 8 C76 12 76 22 76 40 C76 58 76 68 72 72 C68 76 58 76 40 76 C22 76 12 76 8 72 C4 68 4 58 4 40 C4 22 4 12 8 8 C12 4 22 4 40 4"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M16 54 L28 28 L40 41 L52 23 L64 18"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
