// Reloop brand mark: a continuous loop forming a lens (with a focus dot),
// framed by scan-frame corners, with a forward-motion arrow and an "R" tail.
// Electric Mint on transparent — matches the brand guide.

export default function Logo({
  className = "h-8 w-8",
  color = "#55E6A5",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-label="Reloop logo">
      <g stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {/* scan-frame corners */}
        <path d="M7 14V8h6" />
        <path d="M35 8h6v6" />
        <path d="M41 34v6h-6" />
        <path d="M13 40H7v-6" />
        {/* lens / loop */}
        <circle cx="21" cy="20" r="11" />
        {/* forward-motion arrow over the loop */}
        <path d="M26.5 10.5a11 11 0 0 1 5.5 6.5" />
        <path d="M29.5 9.5l3 1-1 3" />
        {/* R tail */}
        <path d="M21 31l10 10" />
      </g>
      {/* focus dot */}
      <circle cx="21" cy="20" r="2.4" fill={color} />
    </svg>
  );
}
