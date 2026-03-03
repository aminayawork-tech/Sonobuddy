export type CalculatorField = {
  id: string;
  label: string;
  unit: string;
  placeholder: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
};

export type Calculator = {
  id: string;
  name: string;
  shortName: string;
  category: CalculatorCategory;
  description: string;
  formula: string;
  fields: CalculatorField[];
  tags: string[];
  reference?: string;
};

export type CalculatorCategory = 'vascular' | 'abdomen' | 'ob' | 'general';

export const CALC_CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  vascular: 'Vascular',
  abdomen: 'Abdomen',
  ob: 'OB/GYN',
  general: 'General',
};

// Calculator result types
export type CalcResult = {
  value: string;
  unit: string;
  interpretation?: string;
  color?: 'green' | 'amber' | 'red' | 'blue';
};

// ── CALCULATION FUNCTIONS ────────────────────────────────────────────────────
export function calcABI(ankleDP: number, anklePT: number, brachialR: number, brachialL: number): CalcResult {
  const ankle = Math.max(ankleDP, anklePT);
  const brachial = Math.max(brachialR, brachialL);
  if (!ankle || !brachial) return { value: '—', unit: '' };
  const abi = ankle / brachial;
  let interpretation = '';
  let color: CalcResult['color'] = 'green';
  if (abi > 1.4) { interpretation = 'Non-compressible — consider TBI'; color = 'amber'; }
  else if (abi >= 1.0) { interpretation = 'Normal'; color = 'green'; }
  else if (abi >= 0.91) { interpretation = 'Borderline'; color = 'amber'; }
  else if (abi >= 0.41) { interpretation = 'Mild–Moderate PAD'; color = 'amber'; }
  else { interpretation = 'Severe PAD / critical ischemia'; color = 'red'; }
  return { value: abi.toFixed(2), unit: 'ratio', interpretation, color };
}

export function calcResistiveIndex(psv: number, edv: number): CalcResult {
  if (!psv || psv === 0) return { value: '—', unit: '' };
  const ri = (psv - edv) / psv;
  let interpretation = '';
  let color: CalcResult['color'] = 'green';
  if (ri < 0.58) { interpretation = 'Low — hyperperfusion'; color = 'blue'; }
  else if (ri <= 0.70) { interpretation = 'Normal'; color = 'green'; }
  else if (ri <= 0.80) { interpretation = 'Mildly elevated — medical renal disease'; color = 'amber'; }
  else { interpretation = 'Significantly elevated — obstruction / rejection concern'; color = 'red'; }
  return { value: ri.toFixed(2), unit: 'RI', interpretation, color };
}

export function calcVolume(length: number, width: number, height: number): CalcResult {
  const vol = 0.52 * length * width * height;
  return { value: vol.toFixed(1), unit: 'mL', color: 'blue' };
}

export function calcPSVRatio(psv1: number, psv2: number, label?: string): CalcResult {
  if (!psv1 || !psv2) return { value: '—', unit: '' };
  const ratio = psv1 / psv2;
  return { value: ratio.toFixed(2), unit: 'ratio', interpretation: label, color: 'blue' };
}

export function calcAFI(q1: number, q2: number, q3: number, q4: number): CalcResult {
  const afi = q1 + q2 + q3 + q4;
  let interpretation = '';
  let color: CalcResult['color'] = 'green';
  if (afi < 5) { interpretation = 'Oligohydramnios'; color = 'red'; }
  else if (afi < 8) { interpretation = 'Borderline oligohydramnios'; color = 'amber'; }
  else if (afi <= 24) { interpretation = 'Normal'; color = 'green'; }
  else { interpretation = 'Polyhydramnios'; color = 'amber'; }
  return { value: afi.toFixed(1), unit: 'cm', interpretation, color };
}

export function calcBMI(weightKg: number, heightCm: number): CalcResult {
  if (!weightKg || !heightCm) return { value: '—', unit: '' };
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  let interpretation = '';
  let color: CalcResult['color'] = 'green';
  if (bmi < 18.5) { interpretation = 'Underweight'; color = 'amber'; }
  else if (bmi < 25) { interpretation = 'Normal'; color = 'green'; }
  else if (bmi < 30) { interpretation = 'Overweight'; color = 'amber'; }
  else { interpretation = 'Obese'; color = 'red'; }
  return { value: bmi.toFixed(1), unit: 'kg/m²', interpretation, color };
}

export function calcGestationalAge(crl: number): CalcResult {
  // Robinson & Fleming formula
  if (!crl) return { value: '—', unit: '' };
  const ga = 8.052 * Math.sqrt(crl * 1.037) + 23.73;
  const weeks = Math.floor(ga / 7);
  const days = Math.round(ga % 7);
  return { value: `${weeks}w ${days}d`, unit: 'GA', color: 'blue', interpretation: 'Based on CRL (Robinson)' };
}

export function calcEDD(lmpDate: string): CalcResult {
  if (!lmpDate) return { value: '—', unit: '' };
  const lmp = new Date(lmpDate);
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280); // Naegele's rule: LMP + 280 days
  const formatted = edd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return { value: formatted, unit: 'EDD', color: 'blue', interpretation: 'Naegele\'s rule (LMP + 280 days)' };
}

export function calcThyroidVolume(rL: number, rW: number, rH: number, lL: number, lW: number, lH: number): CalcResult {
  const rVol = 0.52 * rL * rW * rH;
  const lVol = 0.52 * lL * lW * lH;
  const total = rVol + lVol;
  let interpretation = '';
  let color: CalcResult['color'] = 'green';
  if (total > 25) { interpretation = 'Goiter (male threshold)'; color = 'amber'; }
  else if (total > 18) { interpretation = 'Goiter (female threshold)'; color = 'amber'; }
  else { interpretation = 'Normal total volume'; color = 'green'; }
  return { value: `R: ${rVol.toFixed(1)} + L: ${lVol.toFixed(1)} = ${total.toFixed(1)}`, unit: 'mL', interpretation, color };
}

export const calculators: Calculator[] = [
  {
    id: 'abi',
    name: 'Ankle-Brachial Index (ABI)',
    shortName: 'ABI',
    category: 'vascular',
    description: 'Ratio of ankle systolic pressure to brachial systolic pressure. Used to diagnose peripheral arterial disease (PAD).',
    formula: 'ABI = Highest ankle pressure (DP or PT) ÷ Highest brachial pressure',
    fields: [
      { id: 'ankleDP', label: 'Ankle Dorsalis Pedis PSV', unit: 'mmHg', placeholder: '120', hint: 'Systolic pressure at DP' },
      { id: 'anklePT', label: 'Ankle Posterior Tibial PSV', unit: 'mmHg', placeholder: '115', hint: 'Systolic pressure at PT' },
      { id: 'brachialR', label: 'Right Brachial Pressure', unit: 'mmHg', placeholder: '130', hint: 'Highest systolic arm pressure' },
      { id: 'brachialL', label: 'Left Brachial Pressure', unit: 'mmHg', placeholder: '128', hint: 'Highest systolic arm pressure' },
    ],
    tags: ['abi', 'ankle-brachial', 'pad', 'peripheral arterial', 'vascular'],
    reference: 'ACC/AHA PAD Guidelines 2016',
  },
  {
    id: 'resistive-index',
    name: 'Resistive Index (RI)',
    shortName: 'Resistive Index',
    category: 'vascular',
    description: 'Calculated from spectral Doppler. Reflects downstream vascular resistance. Used in renal, hepatic, and transplant evaluation.',
    formula: 'RI = (PSV − EDV) ÷ PSV',
    fields: [
      { id: 'psv', label: 'Peak Systolic Velocity (PSV)', unit: 'cm/s', placeholder: '60', hint: 'Highest point of waveform' },
      { id: 'edv', label: 'End Diastolic Velocity (EDV)', unit: 'cm/s', placeholder: '20', hint: 'Lowest point at end of diastole' },
    ],
    tags: ['ri', 'resistive index', 'renal', 'doppler', 'kidney', 'transplant'],
  },
  {
    id: 'volume-ellipsoid',
    name: 'Organ Volume (Ellipsoid)',
    shortName: 'Volume',
    category: 'general',
    description: 'Ellipsoid formula used to calculate volume of ovaries, kidneys, bladder, lymph nodes, masses, and more.',
    formula: 'Volume = 0.52 × Length × Width × Height',
    fields: [
      { id: 'length', label: 'Length', unit: 'cm', placeholder: '5.0', hint: 'Longest dimension' },
      { id: 'width', label: 'Width', unit: 'cm', placeholder: '3.0', hint: 'Perpendicular dimension' },
      { id: 'height', label: 'Height (Depth)', unit: 'cm', placeholder: '2.5', hint: 'Depth / AP dimension' },
    ],
    tags: ['volume', 'ellipsoid', 'ovary', 'kidney', 'bladder', 'mass', 'organ'],
  },
  {
    id: 'afi',
    name: 'Amniotic Fluid Index (AFI)',
    shortName: 'AFI',
    category: 'ob',
    description: 'Sum of the deepest vertical fluid pocket in each of the 4 uterine quadrants. Assesses amniotic fluid volume.',
    formula: 'AFI = Q1 + Q2 + Q3 + Q4 (deepest vertical pocket each quadrant)',
    fields: [
      { id: 'q1', label: 'Right Upper Quadrant', unit: 'cm', placeholder: '4.5', hint: 'Deepest vertical pocket (cm)' },
      { id: 'q2', label: 'Right Lower Quadrant', unit: 'cm', placeholder: '4.0', hint: 'Deepest vertical pocket (cm)' },
      { id: 'q3', label: 'Left Upper Quadrant', unit: 'cm', placeholder: '5.0', hint: 'Deepest vertical pocket (cm)' },
      { id: 'q4', label: 'Left Lower Quadrant', unit: 'cm', placeholder: '4.5', hint: 'Deepest vertical pocket (cm)' },
    ],
    tags: ['afi', 'amniotic fluid', 'ob', 'oligohydramnios', 'polyhydramnios'],
    reference: 'Phelan et al., 1987',
  },
  {
    id: 'gestational-age-crl',
    name: 'Gestational Age from CRL',
    shortName: 'GA from CRL',
    category: 'ob',
    description: 'Calculates gestational age from Crown-Rump Length. Most accurate dating method 7–13 weeks.',
    formula: 'GA = 8.052 × √(CRL × 1.037) + 23.73 days (Robinson & Fleming)',
    fields: [
      { id: 'crl', label: 'Crown-Rump Length (CRL)', unit: 'mm', placeholder: '45', min: 1, max: 84, hint: 'Measure in neutral position (not flexed)' },
    ],
    tags: ['crl', 'gestational age', 'dating', 'first trimester', 'ob'],
    reference: 'Robinson & Fleming, 1975',
  },
  {
    id: 'edd-lmp',
    name: 'EDD from Last Menstrual Period',
    shortName: 'EDD from LMP',
    category: 'ob',
    description: 'Estimated due date calculated from last menstrual period using Naegele\'s rule.',
    formula: 'EDD = LMP + 280 days (40 weeks)',
    fields: [
      { id: 'lmpDate', label: 'First Day of Last Menstrual Period', unit: 'date', placeholder: '', hint: 'Select date from calendar' },
    ],
    tags: ['edd', 'due date', 'lmp', 'naegele', 'ob', 'dating'],
  },
  {
    id: 'thyroid-volume',
    name: 'Thyroid Volume (Bilateral)',
    shortName: 'Thyroid Volume',
    category: 'general',
    description: 'Calculates volume of each thyroid lobe and total gland volume. Goiter threshold: >18 mL (female), >25 mL (male).',
    formula: 'Lobe Volume = 0.52 × L × W × H; Total = Right + Left',
    fields: [
      { id: 'rL', label: 'Right Lobe Length', unit: 'cm', placeholder: '4.0' },
      { id: 'rW', label: 'Right Lobe Width', unit: 'cm', placeholder: '2.0' },
      { id: 'rH', label: 'Right Lobe Height', unit: 'cm', placeholder: '1.8' },
      { id: 'lL', label: 'Left Lobe Length', unit: 'cm', placeholder: '3.8' },
      { id: 'lW', label: 'Left Lobe Width', unit: 'cm', placeholder: '1.9' },
      { id: 'lH', label: 'Left Lobe Height', unit: 'cm', placeholder: '1.7' },
    ],
    tags: ['thyroid', 'volume', 'goiter', 'lobe'],
  },
  {
    id: 'psv-ratio',
    name: 'Velocity Ratio',
    shortName: 'PSV Ratio',
    category: 'vascular',
    description: 'Calculates ratio between two velocity measurements. Used for ICA/CCA ratio, renal-aortic ratio (RAR), and others.',
    formula: 'Ratio = Vessel 1 PSV ÷ Vessel 2 PSV',
    fields: [
      { id: 'psv1', label: 'Vessel 1 PSV (stenosed / distal)', unit: 'cm/s', placeholder: '250', hint: 'e.g. ICA PSV or renal artery PSV' },
      { id: 'psv2', label: 'Vessel 2 PSV (reference)', unit: 'cm/s', placeholder: '70', hint: 'e.g. CCA PSV or aortic PSV' },
    ],
    tags: ['ratio', 'psv', 'ica-cca', 'rar', 'stenosis', 'vascular'],
  },
];

export function searchCalculators(query: string): Calculator[] {
  if (!query.trim()) return calculators;
  const q = query.toLowerCase();
  return calculators.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.shortName.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q)
  );
}
