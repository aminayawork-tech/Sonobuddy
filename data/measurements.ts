export type NormalRange = {
  min?: number;
  max?: number;
  unit: string;
  label: string;
  notes?: string;
};

export type Measurement = {
  id: string;
  name: string;
  category: MeasurementCategory;
  subcategory?: string;
  ranges: NormalRange[];
  clinicalNote?: string;
  tags: string[];
};

export type MeasurementCategory =
  | 'vascular'
  | 'abdomen'
  | 'ob'
  | 'thyroid'
  | 'cardiac'
  | 'musculoskeletal'
  | 'superficial';

export const CATEGORY_LABELS: Record<MeasurementCategory, string> = {
  vascular: 'Vascular',
  abdomen: 'Abdomen',
  ob: 'OB/GYN',
  thyroid: 'Thyroid',
  cardiac: 'Cardiac',
  musculoskeletal: 'MSK',
  superficial: 'Superficial',
};

export const CATEGORY_COLORS: Record<MeasurementCategory, string> = {
  vascular: 'bg-red-100 text-red-700 border-red-200',
  abdomen: 'bg-amber-100 text-amber-700 border-amber-200',
  ob: 'bg-pink-100 text-pink-700 border-pink-200',
  thyroid: 'bg-purple-100 text-purple-700 border-purple-200',
  cardiac: 'bg-blue-100 text-blue-700 border-blue-200',
  musculoskeletal: 'bg-green-100 text-green-700 border-green-200',
  superficial: 'bg-teal-100 text-teal-700 border-teal-200',
};

export const measurements: Measurement[] = [
  // ── VASCULAR ────────────────────────────────────────────────────────────────
  {
    id: 'aorta-diameter',
    name: 'Abdominal Aorta Diameter',
    category: 'vascular',
    subcategory: 'Aorta',
    ranges: [
      { max: 3.0, unit: 'cm', label: 'Normal (AP diameter)' },
      { min: 3.0, max: 5.4, unit: 'cm', label: 'Aneurysm (AAA)', notes: 'Monitor with ultrasound' },
      { min: 5.5, unit: 'cm', label: 'Surgical threshold', notes: 'Refer to vascular surgery' },
    ],
    clinicalNote: 'Measure outer wall to outer wall in AP plane. AAA defined as >3.0 cm or 1.5× the normal diameter.',
    tags: ['aorta', 'aaa', 'aneurysm', 'vascular', 'abdominal'],
  },
  {
    id: 'carotid-imt',
    name: 'Carotid IMT (Intima-Media Thickness)',
    category: 'vascular',
    subcategory: 'Carotid',
    ranges: [
      { max: 0.9, unit: 'mm', label: 'Normal' },
      { min: 0.9, max: 1.5, unit: 'mm', label: 'Borderline / Early atherosclerosis' },
      { min: 1.5, unit: 'mm', label: 'Plaque present', notes: 'Significant atherosclerotic burden' },
    ],
    clinicalNote: 'Measure far wall of CCA, 1 cm proximal to bifurcation. Use high-frequency linear transducer.',
    tags: ['carotid', 'imt', 'intima-media', 'atherosclerosis', 'cca'],
  },
  {
    id: 'carotid-psv',
    name: 'Carotid PSV (ICA)',
    category: 'vascular',
    subcategory: 'Carotid',
    ranges: [
      { max: 125, unit: 'cm/s', label: 'Normal ICA PSV (<50% stenosis)' },
      { min: 125, max: 229, unit: 'cm/s', label: '50–69% stenosis' },
      { min: 230, unit: 'cm/s', label: '≥70% stenosis', notes: 'Consider surgical intervention' },
    ],
    clinicalNote: 'SRU/SVU consensus criteria. Also check ICA:CCA ratio (>4 = >70% stenosis). Angle ≤60°.',
    tags: ['carotid', 'ica', 'psv', 'stenosis', 'doppler', 'velocity'],
  },
  {
    id: 'carotid-ica-cca-ratio',
    name: 'ICA/CCA PSV Ratio',
    category: 'vascular',
    subcategory: 'Carotid',
    ranges: [
      { max: 2.0, unit: 'ratio', label: 'Normal (<50% stenosis)' },
      { min: 2.0, max: 4.0, unit: 'ratio', label: '50–69% stenosis' },
      { min: 4.0, unit: 'ratio', label: '≥70% stenosis' },
    ],
    clinicalNote: 'Used in conjunction with ICA PSV for stenosis grading.',
    tags: ['carotid', 'ica', 'cca', 'ratio', 'stenosis'],
  },
  {
    id: 'vertebral-artery-flow',
    name: 'Vertebral Artery Direction',
    category: 'vascular',
    subcategory: 'Carotid',
    ranges: [
      { label: 'Normal', unit: 'direction', notes: 'Antegrade (toward brain)' },
    ],
    clinicalNote: 'Retrograde flow = subclavian steal syndrome. Confirm with arm exercise provocative test.',
    tags: ['vertebral', 'subclavian', 'steal', 'retrograde'],
  },
  {
    id: 'portal-vein-diameter',
    name: 'Portal Vein Diameter',
    category: 'vascular',
    subcategory: 'Abdominal Veins',
    ranges: [
      { max: 13, unit: 'mm', label: 'Normal' },
      { min: 13, unit: 'mm', label: 'Portal hypertension concern', notes: 'Correlate with clinical findings' },
    ],
    clinicalNote: 'Measure at hepatic hilum. Respiratory variation normally present. Absent phasicity → consider hepatic/cardiac disease.',
    tags: ['portal', 'vein', 'portal hypertension', 'liver', 'hepatic'],
  },
  {
    id: 'portal-vein-velocity',
    name: 'Portal Vein Velocity',
    category: 'vascular',
    subcategory: 'Abdominal Veins',
    ranges: [
      { min: 15, max: 40, unit: 'cm/s', label: 'Normal (hepatopetal flow)' },
      { max: 15, unit: 'cm/s', label: 'Slow flow — portal HTN concern' },
    ],
    clinicalNote: 'Hepatofugal (away from liver) flow is pathological — suggests severe portal hypertension.',
    tags: ['portal', 'vein', 'velocity', 'hepatopetal', 'portal hypertension'],
  },
  {
    id: 'renal-artery-rai',
    name: 'Renal Artery Resistive Index (RI)',
    category: 'vascular',
    subcategory: 'Renal',
    ranges: [
      { min: 0.58, max: 0.7, unit: 'RI', label: 'Normal' },
      { min: 0.7, max: 0.8, unit: 'RI', label: 'Mildly elevated — medical renal disease' },
      { min: 0.8, unit: 'RI', label: 'Significantly elevated — obstruction / rejection', notes: 'In transplant: consider rejection' },
    ],
    clinicalNote: 'RI = (PSV - EDV) / PSV. Measure in 3 locations: upper, mid, lower pole. Average.',
    tags: ['renal', 'kidney', 'resistive index', 'ri', 'doppler'],
  },
  {
    id: 'renal-artery-psv',
    name: 'Renal Artery PSV',
    category: 'vascular',
    subcategory: 'Renal',
    ranges: [
      { max: 180, unit: 'cm/s', label: 'Normal' },
      { min: 180, unit: 'cm/s', label: 'Renal artery stenosis concern', notes: 'RAR >3.5 confirms significant stenosis' },
    ],
    clinicalNote: 'Renal-Aortic Ratio (RAR) = Renal PSV / Aortic PSV. RAR >3.5 = hemodynamically significant stenosis.',
    tags: ['renal', 'artery', 'psv', 'stenosis', 'doppler'],
  },
  {
    id: 'abi',
    name: 'Ankle-Brachial Index (ABI)',
    category: 'vascular',
    subcategory: 'Peripheral Arterial',
    ranges: [
      { min: 1.0, max: 1.4, unit: 'ratio', label: 'Normal' },
      { min: 0.91, max: 0.99, unit: 'ratio', label: 'Borderline' },
      { min: 0.41, max: 0.9, unit: 'ratio', label: 'Mild–moderate PAD' },
      { max: 0.4, unit: 'ratio', label: 'Severe PAD / critical ischemia' },
      { min: 1.4, unit: 'ratio', label: 'Non-compressible vessels (calcification)', notes: 'Consider toe-brachial index' },
    ],
    clinicalNote: 'ABI = Ankle systolic / Brachial systolic (highest arm). Use highest ankle pressure (DP or PT).',
    tags: ['abi', 'ankle-brachial', 'pad', 'peripheral arterial', 'doppler'],
  },

  // ── ABDOMEN ─────────────────────────────────────────────────────────────────
  {
    id: 'liver-span',
    name: 'Liver Span',
    category: 'abdomen',
    subcategory: 'Liver',
    ranges: [
      { min: 13, max: 17, unit: 'cm', label: 'Normal (mid-clavicular line, AP)' },
      { min: 17, unit: 'cm', label: 'Hepatomegaly' },
      { max: 13, unit: 'cm', label: 'Small liver — cirrhosis concern' },
    ],
    clinicalNote: 'Measure craniocaudal length in mid-clavicular line. Surface echotexture: normally smooth, homogeneous.',
    tags: ['liver', 'hepatomegaly', 'span', 'cirrhosis', 'abdomen'],
  },
  {
    id: 'spleen-length',
    name: 'Spleen Length',
    category: 'abdomen',
    subcategory: 'Spleen',
    ranges: [
      { max: 12, unit: 'cm', label: 'Normal' },
      { min: 12, max: 15, unit: 'cm', label: 'Mild splenomegaly' },
      { min: 15, unit: 'cm', label: 'Moderate–severe splenomegaly' },
    ],
    clinicalNote: 'Measure longest axis in coronal plane. Thickness >4 cm alone can indicate splenomegaly.',
    tags: ['spleen', 'splenomegaly', 'portal hypertension', 'abdomen'],
  },
  {
    id: 'gallbladder-wall',
    name: 'Gallbladder Wall Thickness',
    category: 'abdomen',
    subcategory: 'Gallbladder',
    ranges: [
      { max: 3, unit: 'mm', label: 'Normal (fasting)' },
      { min: 3, unit: 'mm', label: 'Thickened — cholecystitis, hepatitis, other', notes: 'Must correlate with clinical (Murphy\'s sign, fever)' },
    ],
    clinicalNote: 'Measure anterior wall when fasting ≥4h. Diffuse thickening: also consider hypoalbuminemia, CHF, hepatitis.',
    tags: ['gallbladder', 'wall', 'cholecystitis', 'murphy', 'abdomen'],
  },
  {
    id: 'common-bile-duct',
    name: 'Common Bile Duct (CBD) Diameter',
    category: 'abdomen',
    subcategory: 'Biliary',
    ranges: [
      { max: 6, unit: 'mm', label: 'Normal (non-dilated)' },
      { max: 8, unit: 'mm', label: 'Acceptable post-cholecystectomy' },
      { min: 7, unit: 'mm', label: 'Dilated — obstruction/cholangiopathy concern' },
      { label: '+1 mm/decade >60 yrs', unit: 'rule', notes: 'Age-adjusted: up to 10 mm may be acceptable' },
    ],
    clinicalNote: 'Measure at porta hepatis, inner wall to inner wall. Always report with maximum diameter.',
    tags: ['cbd', 'bile duct', 'biliary', 'obstruction', 'gallstone'],
  },
  {
    id: 'kidney-size',
    name: 'Kidney Length',
    category: 'abdomen',
    subcategory: 'Kidneys',
    ranges: [
      { min: 9, max: 12, unit: 'cm', label: 'Normal adult' },
      { max: 9, unit: 'cm', label: 'Small — chronic renal disease' },
      { min: 13, unit: 'cm', label: 'Large — hydronephrosis, polycystic, lymphoma' },
    ],
    clinicalNote: 'Normal cortical thickness ≥1.5 cm. Increased echogenicity = medical renal disease. Asymmetry >2 cm is clinically significant.',
    tags: ['kidney', 'renal', 'hydronephrosis', 'pyelonephritis', 'size'],
  },
  {
    id: 'bladder-post-void',
    name: 'Post-Void Residual (PVR)',
    category: 'abdomen',
    subcategory: 'Bladder',
    ranges: [
      { max: 50, unit: 'mL', label: 'Normal (adequate emptying)' },
      { min: 100, max: 299, unit: 'mL', label: 'Elevated — consider urinary retention workup' },
      { min: 300, unit: 'mL', label: 'Significant retention', notes: 'Correlate with symptoms' },
    ],
    clinicalNote: 'Volume = 0.52 × L × W × H (ellipsoid formula). Scan within 10 minutes of voiding.',
    tags: ['bladder', 'pvr', 'post-void', 'retention', 'urinary'],
  },
  {
    id: 'pancreas-duct',
    name: 'Pancreatic Duct Diameter',
    category: 'abdomen',
    subcategory: 'Pancreas',
    ranges: [
      { max: 3, unit: 'mm', label: 'Normal (body)' },
      { min: 3, unit: 'mm', label: 'Dilated — pancreatitis, malignancy concern' },
    ],
    clinicalNote: 'Wirsungian duct visible in ~75% of patients. Beaded appearance with side branch involvement → IPMN concern.',
    tags: ['pancreas', 'duct', 'wirsungian', 'pancreatitis', 'ipmn'],
  },

  // ── OB / GYN ────────────────────────────────────────────────────────────────
  {
    id: 'uterus-length',
    name: 'Uterine Length',
    category: 'ob',
    subcategory: 'Uterus',
    ranges: [
      { min: 7, max: 9, unit: 'cm', label: 'Normal reproductive-age (non-gravid)' },
      { max: 7, unit: 'cm', label: 'Small — consider hypogonadism, prepubertal' },
      { min: 10, unit: 'cm', label: 'Enlarged — fibroids, adenomyosis, pregnancy' },
    ],
    clinicalNote: 'Measure fundus to cervix (long axis). Width 4–6 cm, AP 3–5 cm normal. Postmenopausal: 3.5–6.5 cm.',
    tags: ['uterus', 'uterine', 'fibroids', 'adenomyosis', 'gynecology'],
  },
  {
    id: 'endometrium',
    name: 'Endometrial Thickness',
    category: 'ob',
    subcategory: 'Uterus',
    ranges: [
      { max: 4, unit: 'mm', label: 'Postmenopausal normal (no HRT)', notes: 'Biopsy if >4 mm with bleeding' },
      { min: 8, max: 14, unit: 'mm', label: 'Secretory phase (premenopausal)' },
      { min: 4, max: 8, unit: 'mm', label: 'Proliferative phase' },
      { max: 4, unit: 'mm', label: 'Menstrual / early proliferative' },
    ],
    clinicalNote: 'Measure double-layer (both layers) in sagittal plane. Post-menopausal bleeding + >4 mm → biopsy.',
    tags: ['endometrium', 'endometrial', 'postmenopausal', 'bleeding', 'gynecology'],
  },
  {
    id: 'ovary-size',
    name: 'Ovary Size',
    category: 'ob',
    subcategory: 'Ovaries',
    ranges: [
      { label: 'Normal (premenopausal)', unit: 'volume', notes: '≤10 mL (L×W×H×0.52)' },
      { label: 'Postmenopausal', unit: 'volume', notes: '≤4 mL — larger may need follow-up' },
    ],
    clinicalNote: 'Volume = 0.52 × L × W × H. Asymmetry >1.5× should be noted. Dominant follicle normal up to 2.5 cm.',
    tags: ['ovary', 'ovaries', 'follicle', 'cyst', 'postmenopausal'],
  },
  {
    id: 'ob-gest-sac',
    name: 'Gestational Sac (1st Trimester)',
    category: 'ob',
    subcategory: 'First Trimester',
    ranges: [
      { label: 'Visible on TVUS', unit: 'GA', notes: '~4.5–5 weeks (MSD ≥5 mm)' },
      { label: 'Yolk sac visible', unit: 'GA', notes: '~5.5 weeks (MSD ≥8 mm)' },
      { label: 'Embryo + cardiac activity', unit: 'GA', notes: '~6 weeks (CRL ~5 mm)' },
    ],
    clinicalNote: 'MSD ≥25 mm without embryo = anembryonic pregnancy (blighted ovum). Always confirm on follow-up if borderline.',
    tags: ['gestational sac', 'msd', 'first trimester', 'early pregnancy', 'ob'],
  },
  {
    id: 'ob-crl',
    name: 'Crown-Rump Length (CRL)',
    category: 'ob',
    subcategory: 'First Trimester',
    ranges: [
      { label: '6 weeks', unit: 'approx', notes: '~5 mm' },
      { label: '8 weeks', unit: 'approx', notes: '~16 mm' },
      { label: '10 weeks', unit: 'approx', notes: '~31 mm' },
      { label: '12 weeks', unit: 'approx', notes: '~55 mm' },
      { label: '13 weeks', unit: 'approx', notes: '~70 mm' },
    ],
    clinicalNote: 'Most accurate dating 7–13 weeks. Machine calculates GA automatically. Measure longest axis, neutral position.',
    tags: ['crl', 'crown-rump', 'first trimester', 'dating', 'ob'],
  },
  {
    id: 'ob-nt',
    name: 'Nuchal Translucency (NT)',
    category: 'ob',
    subcategory: 'First Trimester',
    ranges: [
      { max: 3.0, unit: 'mm', label: 'Normal (11–13+6 weeks)' },
      { min: 3.0, unit: 'mm', label: 'Increased — Down syndrome / cardiac defect risk', notes: 'Refer for genetic counseling' },
    ],
    clinicalNote: 'CRL must be 45–84 mm. Neutral head position, image magnified. Calipers on inner edge of each line. AIUM certified exam.',
    tags: ['nuchal', 'nt', 'downs', 'trisomy', 'first trimester', 'screening'],
  },
  {
    id: 'ob-bpd',
    name: 'Biparietal Diameter (BPD)',
    category: 'ob',
    subcategory: 'Second/Third Trimester',
    ranges: [
      { label: '18 weeks', unit: 'approx', notes: '~44 mm' },
      { label: '20 weeks', unit: 'approx', notes: '~50 mm' },
      { label: '24 weeks', unit: 'approx', notes: '~61 mm' },
      { label: '28 weeks', unit: 'approx', notes: '~72 mm' },
      { label: '32 weeks', unit: 'approx', notes: '~83 mm' },
      { label: '36 weeks', unit: 'approx', notes: '~92 mm' },
      { label: '40 weeks', unit: 'approx', notes: '~97 mm' },
    ],
    clinicalNote: 'Measure outer-to-inner at widest point (thalami + CSP visible, no cerebellum). Part of EFW biometry.',
    tags: ['bpd', 'biparietal', 'ob', 'biometry', 'second trimester'],
  },
  {
    id: 'ob-fl',
    name: 'Femur Length (FL)',
    category: 'ob',
    subcategory: 'Second/Third Trimester',
    ranges: [
      { label: '18 weeks', unit: 'approx', notes: '~28 mm' },
      { label: '20 weeks', unit: 'approx', notes: '~34 mm' },
      { label: '24 weeks', unit: 'approx', notes: '~44 mm' },
      { label: '28 weeks', unit: 'approx', notes: '~53 mm' },
      { label: '32 weeks', unit: 'approx', notes: '~62 mm' },
      { label: '36 weeks', unit: 'approx', notes: '~70 mm' },
      { label: '40 weeks', unit: 'approx', notes: '~78 mm' },
    ],
    clinicalNote: 'Measure the ossified diaphysis only — exclude epiphyses. The transducer should be perpendicular to the femur.',
    tags: ['femur', 'fl', 'ob', 'biometry', 'second trimester', 'growth'],
  },
  {
    id: 'amniotic-fluid',
    name: 'Amniotic Fluid Index (AFI)',
    category: 'ob',
    subcategory: 'Fluid Assessment',
    ranges: [
      { min: 8, max: 24, unit: 'cm', label: 'Normal AFI' },
      { min: 5, max: 7.9, unit: 'cm', label: 'Borderline oligohydramnios' },
      { max: 5, unit: 'cm', label: 'Oligohydramnios', notes: 'Or MVP <2 cm — consider delivery' },
      { min: 24, unit: 'cm', label: 'Polyhydramnios', notes: 'Or MVP >8 cm — GDM, fetal anomaly' },
    ],
    clinicalNote: 'Sum of deepest vertical pocket in all 4 quadrants. Single Deepest Pocket (SDP/MVP) >2 cm is alternative method.',
    tags: ['afi', 'amniotic fluid', 'oligohydramnios', 'polyhydramnios', 'ob'],
  },
  {
    id: 'cervical-length',
    name: 'Cervical Length (TVUS)',
    category: 'ob',
    subcategory: 'Cervix',
    ranges: [
      { min: 30, unit: 'mm', label: 'Normal (16–24 weeks)' },
      { min: 20, max: 29, unit: 'mm', label: 'Short cervix — progesterone therapy' },
      { max: 20, unit: 'mm', label: 'Very short — preterm birth risk', notes: 'Consult MFM' },
    ],
    clinicalNote: 'Transvaginal. Bladder empty. Measure internal to external os, linear canal. Three images, shortest measurement reported.',
    tags: ['cervix', 'cervical length', 'preterm', 'incompetent cervix', 'ob'],
  },

  // ── THYROID ──────────────────────────────────────────────────────────────────
  {
    id: 'thyroid-lobe-volume',
    name: 'Thyroid Lobe Volume',
    category: 'thyroid',
    subcategory: 'Thyroid',
    ranges: [
      { label: 'Normal female', unit: 'mL', notes: '4–8 mL per lobe (total <18 mL)' },
      { label: 'Normal male', unit: 'mL', notes: '5–10 mL per lobe (total <25 mL)' },
    ],
    clinicalNote: 'Volume = L × W × H × 0.52 per lobe. Isthmus usually ≤3–5 mm AP. Goiter: total volume >18 mL (F) or >25 mL (M).',
    tags: ['thyroid', 'volume', 'goiter', 'lobe'],
  },
  {
    id: 'thyroid-nodule',
    name: 'Thyroid Nodule Characterization',
    category: 'thyroid',
    subcategory: 'Nodules',
    ranges: [
      { label: 'ACR TI-RADS 1: 0 pts', unit: 'risk', notes: 'Benign — no biopsy needed' },
      { label: 'ACR TI-RADS 2: 0 pts', unit: 'risk', notes: 'Not suspicious — no biopsy' },
      { label: 'ACR TI-RADS 3: 3 pts', unit: 'risk', notes: 'Mildly suspicious — FNA if ≥2.5 cm' },
      { label: 'ACR TI-RADS 4: 4–6 pts', unit: 'risk', notes: 'Moderately suspicious — FNA if ≥1.5 cm' },
      { label: 'ACR TI-RADS 5: ≥7 pts', unit: 'risk', notes: 'Highly suspicious — FNA if ≥1 cm' },
    ],
    clinicalNote: 'Score based on: composition, echogenicity, shape, margin, echogenic foci. Report: size (3 dimensions), location, vascularity.',
    tags: ['thyroid', 'nodule', 'tirads', 'fnab', 'biopsy', 'cancer'],
  },

  // ── CARDIAC (BASIC) ──────────────────────────────────────────────────────────
  {
    id: 'aortic-root',
    name: 'Aortic Root Diameter',
    category: 'cardiac',
    subcategory: 'Aorta',
    ranges: [
      { max: 3.7, unit: 'cm', label: 'Normal (women)' },
      { max: 4.0, unit: 'cm', label: 'Normal (men)' },
      { min: 4.0, unit: 'cm', label: 'Dilated — Marfan / bicuspid AV concern', notes: 'Monitor annually' },
    ],
    clinicalNote: 'Measure at sinus of Valsalva (inner edge method, at end-diastole). Body surface area indexing preferred.',
    tags: ['aortic root', 'cardiac', 'echo', 'marfan', 'aorta'],
  },
  {
    id: 'lv-ef',
    name: 'Left Ventricular Ejection Fraction (LVEF)',
    category: 'cardiac',
    subcategory: 'LV Function',
    ranges: [
      { min: 55, unit: '%', label: 'Normal (≥55%)' },
      { min: 41, max: 54, unit: '%', label: 'Mildly reduced (HFmrEF)' },
      { min: 36, max: 40, unit: '%', label: 'Moderately reduced' },
      { max: 35, unit: '%', label: 'Severely reduced (HFrEF)', notes: 'ICD consideration' },
    ],
    clinicalNote: 'Biplane Simpson\'s method preferred (A4C + A2C). Visual estimate acceptable in poor windows. Report as range.',
    tags: ['ef', 'ejection fraction', 'lv', 'heart failure', 'cardiac', 'echo'],
  },
  {
    id: 'ivc-diameter',
    name: 'IVC Diameter / Collapsibility',
    category: 'cardiac',
    subcategory: 'Volume Status',
    ranges: [
      { max: 2.1, unit: 'cm', label: 'Normal IVC diameter' },
      { label: '>50% collapse with sniff', unit: 'collapse', notes: 'CVP ≤5 mmHg — euvolemic/hypovolemic' },
      { label: '<50% collapse with sniff', unit: 'collapse', notes: 'CVP ≥10 mmHg — elevated RA pressure' },
    ],
    clinicalNote: 'Subcostal view, measure 1–2 cm from RA junction, in M-mode. POCUS essential skill.',
    tags: ['ivc', 'inferior vena cava', 'cvp', 'volume', 'pocus', 'cardiac'],
  },
];

export function searchMeasurements(query: string): Measurement[] {
  if (!query.trim()) return measurements;
  const q = query.toLowerCase();
  return measurements.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.subcategory?.toLowerCase().includes(q) ||
      m.clinicalNote?.toLowerCase().includes(q)
  );
}

export function getMeasurementsByCategory(category: MeasurementCategory): Measurement[] {
  return measurements.filter((m) => m.category === category);
}
