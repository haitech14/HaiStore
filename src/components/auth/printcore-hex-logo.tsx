export function PrintcoreHexLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 2L42 13V35L24 46L6 35V13L24 2Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M24 10L34 17V31L24 38L14 31V17L24 10Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="24" cy="24" r="4" fill="#000" />
    </svg>
  );
}
