export function SonoIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Probe transducer head */}
      <rect x="11.5" y="2" width="7" height="9" rx="3.5" fill="currentColor" />
      {/* Probe body/handle — curves down from head and loops back in a hook */}
      <path
        d="M15 11C15 15 14 17.5 12 19.5C10 21.5 7 22 5.5 20.5C4 19 4.5 16.5 6.5 15.5C8 14.7 10.5 15 12.5 11.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Acoustic wave 1 — close */}
      <path
        d="M19.5 4.5C20.7 5.7 20.7 8.3 19.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Acoustic wave 2 — far */}
      <path
        d="M21.5 3C23.3 4.8 23.3 9.2 21.5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}
