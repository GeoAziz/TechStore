const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 200 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      {`.text { font: 700 20px "Space Mono", monospace; }`}
    </style>
    <defs>
      <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent))" />
      </linearGradient>
    </defs>
    <text x="0" y="20" className="text" fill="url(#glow)">ZIZO</text>
    <text x="60" y="20" className="text" fill="hsl(var(--foreground))">_OrderVerse</text>
  </svg>
);

export default Logo;
