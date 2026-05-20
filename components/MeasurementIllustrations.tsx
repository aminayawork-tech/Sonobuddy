'use client';

// SVG teaching illustrations — show WHERE and HOW to place calipers.
// Dark background mimics ultrasound display. Blue = calipers. Gray = anatomy.
// v2

const C = {
  bg: '#0b1120',
  tissue: '#1a2540',
  wall: '#3d5270',
  lumen: '#1c3050',
  caliper: '#0ea5e9',
  marker: '#f59e0b',
  label: '#94a3b8',
  dim: '#64748b',
  white: '#e2e8f0',
};

function Base({ children, note }: { children: React.ReactNode; note: string }) {
  return (
    <svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" className="w-full rounded-xl">
      <rect width="320" height="210" fill={C.bg} rx="12" />
      {children}
      <text x="160" y="205" textAnchor="middle" fill={C.dim} fontSize="9" fontFamily="system-ui, sans-serif">
        {note}
      </text>
    </svg>
  );
}

function Caliper({ x1, y1, x2, y2 }: {
  x1: number; y1: number; x2: number; y2: number;
}) {
  const s = 5; // × arm half-length
  return (
    <g stroke={C.caliper} strokeWidth="1.5" fill="none">
      {/* Measurement line */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {/* × at start */}
      <line x1={x1 - s} y1={y1 - s} x2={x1 + s} y2={y1 + s} />
      <line x1={x1 - s} y1={y1 + s} x2={x1 + s} y2={y1 - s} />
      {/* × at end */}
      <line x1={x2 - s} y1={y2 - s} x2={x2 + s} y2={y2 + s} />
      <line x1={x2 - s} y1={y2 + s} x2={x2 + s} y2={y2 - s} />
    </g>
  );
}

function Tag({ x, y, text, anchor = 'middle' }: {
  x: number; y: number; text: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={C.label} fontSize="9.5" fontFamily="system-ui, sans-serif">
      {text}
    </text>
  );
}

function CLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill={C.caliper} fontSize="10" fontWeight="bold" fontFamily="monospace">
      {text}
    </text>
  );
}

// ── 1. Abdominal Aorta — transverse, AP outer-to-outer ───────────────────────
export function AortaIllustration() {
  return (
    <Base note="Transverse — AP diameter, outer wall to outer wall">
      {/* Tissue */}
      <ellipse cx="160" cy="100" rx="145" ry="85" fill={C.tissue} />
      {/* Vertebra shadow */}
      <ellipse cx="160" cy="156" rx="26" ry="16" fill="#0a1020" />
      <ellipse cx="160" cy="152" rx="18" ry="12" fill={C.wall} opacity="0.35" />
      {/* Aorta wall */}
      <circle cx="160" cy="100" r="52" fill={C.lumen} stroke={C.wall} strokeWidth="9" />
      {/* Aorta lumen */}
      <circle cx="160" cy="100" r="38" fill="#162840" />
      {/* AP caliper */}
      <Caliper x1={108} y1={100} x2={212} y2={100} />
      <CLabel x={160} y={93} text="AP" />
      {/* Outer wall labels */}
      <Tag x={93} y={87} text="outer" />
      <Tag x={227} y={87} text="outer" />
      {/* Side labels */}
      <Tag x={22} y={104} text="L" />
      <Tag x={298} y={104} text="R" />
    </Base>
  );
}

// ── 2. IVC — subcostal longitudinal, diameter measurement ────────────────────
export function IVCIllustration() {
  return (
    <Base note="Subcostal view — diameter 1–2 cm from RA junction, M-mode or 2D">
      {/* Liver */}
      <rect x="0" y="12" width="320" height="72" fill={C.tissue} />
      <Tag x={28} y={36} text="LIVER" anchor="start" />
      {/* IVC tube (tapers toward RA on right) */}
      <path d="M 15,88 Q 120,76 205,80 L 222,100 Q 120,112 15,118 Z"
        fill={C.lumen} stroke={C.wall} strokeWidth="2" />
      {/* RA junction dashed line */}
      <line x1="218" y1="68" x2="218" y2="138" stroke={C.marker} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="224" y="65" fill={C.marker} fontSize="8.5" fontFamily="system-ui">RA junction</text>
      {/* 1–2 cm bracket */}
      <line x1="176" y1="68" x2="218" y2="68" stroke={C.marker} strokeWidth="1" />
      <line x1="176" y1="65" x2="176" y2="71" stroke={C.marker} strokeWidth="1" />
      <line x1="218" y1="65" x2="218" y2="71" stroke={C.marker} strokeWidth="1" />
      <text x="197" y="62" textAnchor="middle" fill={C.marker} fontSize="8" fontFamily="system-ui">1–2 cm</text>
      {/* Diameter caliper */}
      <Caliper x1={176} y1={82} x2={176} y2={106} />
      <CLabel x={163} y={95} text="D" />
      {/* Flow arrow */}
      <line x1="60" y1="99" x2="185" y2="96" stroke={C.dim} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <polygon points="185,93 193,96 185,99" fill={C.dim} opacity="0.5" />
      <Tag x={110} y={116} text="flow →" anchor="middle" />
    </Base>
  );
}

// ── 3. Carotid PSV — longitudinal, Doppler angle ≤ 60° ──────────────────────
export function CarotidPSVIllustration() {
  return (
    <Base note="Longitudinal ICA — angle ≤ 60°, sample volume in vessel center">
      {/* Tissue */}
      <rect x="0" y="12" width="320" height="190" fill={C.tissue} />
      {/* Vessel */}
      <rect x="10" y="72" width="300" height="68" rx="6" fill={C.lumen} />
      <line x1="10" y1="72" x2="310" y2="72" stroke={C.wall} strokeWidth="2.5" />
      <line x1="10" y1="140" x2="310" y2="140" stroke={C.wall} strokeWidth="2.5" />
      {/* Wall labels */}
      <Tag x={16} y={68} text="ant. wall" anchor="start" />
      <Tag x={16} y={154} text="post. wall" anchor="start" />
      {/* Doppler sample box */}
      <polygon points="138,72 162,72 152,140 128,140"
        fill="none" stroke={C.caliper} strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Angle correction beam line */}
      <line x1="145" y1="72" x2="185" y2="18" stroke={C.caliper} strokeWidth="1.5" />
      {/* Baseline reference */}
      <line x1="145" y1="72" x2="205" y2="72" stroke={C.caliper} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      {/* Angle arc */}
      <path d="M 168,72 A 23,23 0 0 0 185,52" fill="none" stroke={C.marker} strokeWidth="1.5" />
      <text x="190" y="50" fill={C.marker} fontSize="11" fontWeight="bold" fontFamily="monospace">≤60°</text>
      {/* PSV arrow */}
      <line x1="140" y1="108" x2="140" y2="77" stroke={C.marker} strokeWidth="1.5" />
      <polygon points="137,78 143,78 140,71" fill={C.marker} />
      <text x="104" y="108" fill={C.marker} fontSize="9" fontFamily="system-ui">PSV →</text>
      {/* Flow arrow */}
      <line x1="30" y1="106" x2="118" y2="106" stroke={C.dim} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <polygon points="118,103 126,106 118,109" fill={C.dim} opacity="0.5" />
    </Base>
  );
}

// ── 4. Kidney Length — coronal long axis, pole-to-pole ──────────────────────
export function KidneyLengthIllustration() {
  return (
    <Base note="Coronal long axis — superior pole to inferior pole">
      {/* Tissue */}
      <ellipse cx="160" cy="103" rx="145" ry="88" fill={C.tissue} />
      {/* Kidney capsule */}
      <ellipse cx="160" cy="103" rx="58" ry="78" fill={C.lumen} stroke={C.wall} strokeWidth="3" />
      {/* Cortex zone */}
      <ellipse cx="160" cy="103" rx="44" ry="64" fill="#162840" stroke={C.wall} strokeWidth="1" opacity="0.8" />
      {/* Central echo complex (renal sinus) */}
      <ellipse cx="160" cy="103" rx="22" ry="34" fill={C.wall} opacity="0.7" />
      {/* Length caliper */}
      <Caliper x1={160} y1={27} x2={160} y2={179} />
      <CLabel x={138} y={105} text="L" />
      {/* Pole labels */}
      <Tag x={178} y={31} text="superior pole" anchor="start" />
      <Tag x={178} y={177} text="inferior pole" anchor="start" />
      {/* Cortex label */}
      <Tag x={222} y={100} text="cortex" anchor="start" />
      <line x1="220" y1="97" x2="206" y2="90" stroke={C.label} strokeWidth="0.8" opacity="0.5" />
      {/* Sinus label */}
      <Tag x={160} y={107} text="sinus" anchor="middle" />
    </Base>
  );
}

// ── 5. Gallbladder Wall — long axis, anterior wall thickness ─────────────────
export function GallbladderWallIllustration() {
  return (
    <Base note="Long axis — anterior wall measured when fasting ≥ 4 hours">
      {/* Liver */}
      <rect x="0" y="12" width="320" height="72" fill={C.tissue} />
      <Tag x={24} y={38} text="LIVER" anchor="start" />
      {/* GB outer wall */}
      <ellipse cx="160" cy="128" rx="92" ry="52" fill={C.lumen} stroke={C.wall} strokeWidth="5" />
      {/* GB lumen (anechoic bile) */}
      <ellipse cx="160" cy="130" rx="82" ry="43" fill="#0b1828" />
      {/* Zoom callout box on anterior wall */}
      <rect x="118" y="64" width="84" height="24" rx="3"
        fill="none" stroke={C.caliper} strokeWidth="1.2" strokeDasharray="3 2" />
      {/* Wall thickness caliper */}
      <Caliper x1={160} y1={68} x2={160} y2={85} />
      <CLabel x={145} y={78} text="W" />
      {/* Anterior wall label */}
      <Tag x={210} y={78} text="anterior wall" anchor="start" />
      {/* Bile label */}
      <Tag x={160} y={133} text="bile (anechoic)" anchor="middle" />
      {/* Anatomy labels */}
      <Tag x={68} y={148} text="fundus" anchor="middle" />
      <Tag x={248} y={120} text="neck" anchor="middle" />
    </Base>
  );
}

// ── 6. BPD — axial skull, outer-to-inner at thalamic level ──────────────────
export function BPDIllustration() {
  return (
    <Base note="Axial plane — outer skull to inner skull at thalami (CSP visible, no cerebellum)">
      {/* Tissue */}
      <ellipse cx="160" cy="103" rx="148" ry="90" fill={C.tissue} />
      {/* Skull */}
      <ellipse cx="160" cy="103" rx="105" ry="78" fill={C.lumen} stroke={C.wall} strokeWidth="7" />
      {/* Inner skull */}
      <ellipse cx="160" cy="103" rx="94" ry="68" fill="#101f38" />
      {/* Midline falx */}
      <line x1="160" y1="37" x2="160" y2="168" stroke={C.white} strokeWidth="1.5" opacity="0.6" />
      {/* Thalami */}
      <ellipse cx="143" cy="105" rx="14" ry="10" fill={C.wall} opacity="0.85" />
      <ellipse cx="177" cy="105" rx="14" ry="10" fill={C.wall} opacity="0.85" />
      <Tag x={160} y={120} text="thalami" anchor="middle" />
      {/* CSP */}
      <rect x="152" y="91" width="16" height="8" rx="2" fill={C.dim} opacity="0.7" />
      <Tag x={202} y={91} text="CSP" anchor="start" />
      <line x1="200" y1="89" x2="170" y2="95" stroke={C.label} strokeWidth="0.8" opacity="0.5" />
      {/* BPD caliper — outer-to-inner */}
      <Caliper x1={55} y1={103} x2={254} y2={103} />
      <CLabel x={155} y={96} text="BPD" />
      {/* Outer / Inner labels */}
      <Tag x={48} y={123} text="outer" anchor="middle" />
      <Tag x={262} y={123} text="inner" anchor="middle" />
    </Base>
  );
}

// ── 7. Thyroid — transverse, width + AP per lobe ────────────────────────────
export function ThyroidIllustration() {
  return (
    <Base note="Transverse — W and AP per lobe. Repeat in sagittal for length.">
      {/* Tissue */}
      <rect x="0" y="12" width="320" height="190" fill={C.tissue} />
      {/* Right lobe */}
      <ellipse cx="102" cy="105" rx="44" ry="33" fill={C.lumen} stroke={C.wall} strokeWidth="2.5" />
      {/* Left lobe */}
      <ellipse cx="218" cy="105" rx="44" ry="33" fill={C.lumen} stroke={C.wall} strokeWidth="2.5" />
      {/* Isthmus */}
      <rect x="136" y="97" width="48" height="16" fill={C.lumen} />
      {/* Trachea */}
      <circle cx="160" cy="105" r="24" fill={C.wall} stroke={C.white} strokeWidth="1.5" opacity="0.8" />
      <circle cx="160" cy="105" r="17" fill={C.bg} />
      <Tag x={160} y={109} text="trachea" anchor="middle" />
      {/* Right lobe width caliper */}
      <Caliper x1={60} y1={105} x2={144} y2={105} />
      <CLabel x={102} y={97} text="W" />
      {/* Right lobe AP caliper */}
      <Caliper x1={102} y1={74} x2={102} y2={136} />
      <CLabel x={88} y={107} text="AP" />
      {/* Lobe labels */}
      <Tag x={102} y={152} text="R lobe" anchor="middle" />
      <Tag x={218} y={107} text="L lobe" anchor="middle" />
      {/* Side labels */}
      <Tag x={16} y={107} text="R" anchor="middle" />
      <Tag x={304} y={107} text="L" anchor="middle" />
      {/* Sagittal note */}
      <text x="218" y="152" textAnchor="middle" fill={C.dim} fontSize="8.5" fontFamily="system-ui">
        Length on sagittal view
      </text>
    </Base>
  );
}

// Registry keyed by measurement id
export const ILLUSTRATIONS: Record<string, React.FC> = {
  'aorta-diameter': AortaIllustration,
  'ivc-diameter': IVCIllustration,
  'carotid-psv': CarotidPSVIllustration,
  'kidney-size': KidneyLengthIllustration,
  'gallbladder-wall': GallbladderWallIllustration,
  'ob-bpd': BPDIllustration,
  'thyroid-lobe-volume': ThyroidIllustration,
};
