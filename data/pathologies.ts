export type Pathology = {
  id: string;
  name: string;
  aliases: string[];
  category: PathologyCategory;
  ultrasoundFindings: string[];
  redFlags: string[];
  differentials: string[];
  clinicalContext: string;
  reportingTips: string;
  tags: string[];
};

export type PathologyCategory =
  | 'vascular'
  | 'abdomen'
  | 'ob'
  | 'thyroid'
  | 'cardiac';

export const pathologies: Pathology[] = [
  {
    id: 'cholecystitis-acute',
    name: 'Acute Cholecystitis',
    aliases: ['acute cholecystitis', 'gallbladder infection'],
    category: 'abdomen',
    ultrasoundFindings: [
      'Gallstones (in >90% of cases)',
      'Wall thickening >3 mm (anterior wall, fasting)',
      'Sonographic Murphy\'s sign (maximal tenderness with probe directly over GB)',
      'Pericholecystic fluid',
      'Gallbladder distension (>5 cm transverse)',
      'Increased wall vascularity on color Doppler',
      'Dirty shadowing from gallstones in neck (obstruction)',
    ],
    redFlags: [
      'GB wall >5 mm — emphysematous (gas in wall) or gangrenous cholecystitis',
      'Absent Murphy\'s sign in diabetics (denervation) — don\'t be falsely reassured',
      'Perforation: pericholecystic complex fluid, defect in GB wall',
      'Intraluminal membranes: gangrenous cholecystitis',
    ],
    differentials: ['Biliary colic (no wall thickening, negative Murphy\'s)', 'Acalculous cholecystitis (ICU patients)', 'Gallbladder carcinoma', 'Hydrops of gallbladder'],
    clinicalContext: 'RUQ pain, fever, elevated WBC. Positive Murphy\'s sign. Most common in women aged 20–50.',
    reportingTips: 'State: "Sonographic Murphy\'s sign positive/negative." Always measure anterior wall thickness and GB size. Note any complications.',
    tags: ['cholecystitis', 'gallbladder', 'gallstones', 'murphy', 'ruq', 'infection'],
  },
  {
    id: 'dvt-acute',
    name: 'Deep Vein Thrombosis (DVT)',
    aliases: ['dvt', 'deep vein thrombosis', 'venous thrombosis'],
    category: 'vascular',
    ultrasoundFindings: [
      'Non-compressible vein (diagnostic criterion)',
      'Expanded vein lumen (acute DVT distends vessel)',
      'Echogenic thrombus visible within lumen (may be hypoechoic acutely)',
      'Absent color fill on color Doppler',
      'Loss of respiratory phasicity',
      'Absent augmentation from distal compression',
    ],
    redFlags: [
      'Floating thrombus (free-floating tip): higher PE risk',
      'Phlegmasia cerulea dolens: massive DVT with arterial occlusion — limb-threatening',
      'IVC thrombus: systemic PE risk',
      'Tumor thrombus (look for vascular invasion, arterial waveform within thrombus)',
    ],
    differentials: ['Chronic DVT (hyperechoic, partially compressible, fibrotic wall)', 'Baker\'s cyst', 'Muscle tear/hematoma', 'Lymphedema', 'Cellulitis'],
    clinicalContext: 'Leg swelling, pain, warmth, elevated D-dimer. Risk factors: prolonged immobility, cancer, surgery, pregnancy, oral contraceptives.',
    reportingTips: 'State extent: "Acute DVT involving CFV, FV from proximal to mid-thigh." Always document to/from specific anatomic landmarks. Note acuity (acute vs chronic vs mixed).',
    tags: ['dvt', 'thrombosis', 'deep vein', 'pulmonary embolism', 'vascular', 'clot'],
  },
  {
    id: 'fatty-liver',
    name: 'Hepatic Steatosis (Fatty Liver)',
    aliases: ['steatosis', 'fatty liver', 'nafld', 'masld'],
    category: 'abdomen',
    ultrasoundFindings: [
      'Diffusely increased liver echogenicity ("bright liver")',
      'Liver more echogenic than right renal cortex',
      'Posterior echo attenuation (deep structures poorly seen)',
      'Loss of visualization of portal vein walls',
      'Diaphragm poorly visualized',
    ],
    redFlags: [
      'Focal fat sparing (geographic hypoechoic area, often periportal or gallbladder fossa) — do not mistake for lesion',
      'Focal steatosis — can mimic mass, but no mass effect and typical location',
      'Hepatomegaly + steatosis: consider alcoholic vs MASLD',
    ],
    differentials: ['Cirrhosis (coarse echotexture, nodular surface)', 'Hepatitis (may appear normal or decreased echogenicity)', 'Infiltrative malignancy'],
    clinicalContext: 'Obesity, diabetes, hyperlipidemia, alcohol use, metabolic syndrome. Elevated ALT/AST.',
    reportingTips: 'Grade: mild (slightly > kidney), moderate (obscures vessels), severe (poor penetration). Cannot differentiate steatohepatitis from simple steatosis on US alone.',
    tags: ['fatty liver', 'steatosis', 'nafld', 'masld', 'liver', 'echogenicity'],
  },
  {
    id: 'hydronephrosis',
    name: 'Hydronephrosis',
    aliases: ['hydronephrosis', 'pyelectasis', 'collecting system dilation'],
    category: 'abdomen',
    ultrasoundFindings: [
      'Anechoic fluid-filled dilation of renal pelvis and calyces',
      'Mild: renal pelvis >10 mm AP (adults), calyces mildly splayed',
      'Moderate: calyceal dilation without cortical thinning',
      'Severe: marked calyceal dilation with cortical thinning',
      'Urothelial thickening within collecting system (infection/transitional cell)',
      'Hydroureter if present: dilated ureter following its course',
    ],
    redFlags: [
      'Absent or reversed renal cortical diastolic flow (RI >0.8): may indicate obstruction',
      'Perinephric fluid + hydronephrosis: consider forniceal rupture',
      'Cortical thinning: chronic obstruction / significant parenchymal loss',
      'Echogenic material in dilated collecting system: infected urine (pyonephrosis) — urgent',
    ],
    differentials: ['Parapelvic cysts (no communication)', 'Extrarenal pelvis (variant, mild)', 'Full bladder (resolve post-void)'],
    clinicalContext: 'Flank pain, hematuria, recurrent UTIs. Causes: ureteral stone, BPH, ureteral stricture, retroperitoneal mass, pregnancy.',
    reportingTips: 'Grade 1–4 by SFU grading or describe as mild/moderate/severe. Always check bladder for post-void residual. Look for shadowing stones at UVJ.',
    tags: ['hydronephrosis', 'kidney', 'obstruction', 'renal pelvis', 'ureter', 'stone'],
  },
  {
    id: 'ovarian-cyst',
    name: 'Ovarian Cyst',
    aliases: ['ovarian cyst', 'functional cyst', 'corpus luteum'],
    category: 'ob',
    ultrasoundFindings: [
      'Simple cyst: thin-walled, anechoic, no internal echoes, posterior acoustic enhancement',
      'Corpus luteum: crenulated ("crumpled") walls, internal vascular ring ("ring of fire")',
      'Hemorrhagic cyst: reticular/cobweb internal echoes, no flow on Doppler',
      'Dermoid (mature teratoma): hyperechoic, fat-fluid level, calcification, acoustic shadowing',
      'Endometrioma: uniform low-level echoes ("ground glass"), no internal flow',
    ],
    redFlags: [
      'Solid component with vascularity: ovarian malignancy concern — IOTA O-RADS 4–5',
      'Papillary projections within cyst: borderline or malignant tumor',
      'Ascites + ovarian mass: peritoneal carcinomatosis concern',
      'Twisted pedicle: absent or reversed ovarian flow (torsion)',
    ],
    differentials: ['Paraovarian cyst (separate from ovary, no follicles)', 'Hydrosalpinx (tubular, folded structure)', 'Peritoneal inclusion cyst'],
    clinicalContext: 'Pelvic pain, incidental finding. Pre-menopausal: functional cysts very common, resolve in 6–8 weeks. Post-menopausal: lower threshold for concern.',
    reportingTips: 'Report size, walls, internal content, vascularity. Use O-RADS US scoring for risk stratification. Simple cyst ≤3 cm in reproductive age: no follow-up needed.',
    tags: ['ovary', 'cyst', 'ovarian', 'dermoid', 'endometrioma', 'corpus luteum', 'ob'],
  },
  {
    id: 'thyroid-cancer-papillary',
    name: 'Papillary Thyroid Carcinoma (PTC) — Ultrasound Features',
    aliases: ['papillary thyroid cancer', 'thyroid malignancy', 'ptc'],
    category: 'thyroid',
    ultrasoundFindings: [
      'Solid, hypoechoic to markedly hypoechoic',
      'Taller-than-wide shape (AP > transverse)',
      'Irregular or spiculated margins',
      'Microcalcifications (punctate echogenic foci) — pathognomonic',
      'Macrocalcifications (less specific)',
      'Intranodular vascularity on Doppler',
      'Loss of halo',
      'Lymph node involvement: cystic, calcified, hyperechoic nodes',
    ],
    redFlags: [
      'Extrathyroidal extension (breach of thyroid capsule)',
      'Lateral neck lymphadenopathy adjacent to thyroid',
      'Any punctate calcifications in hypoechoic solid nodule ≥1 cm: FNA',
    ],
    differentials: ['Follicular carcinoma (iso/hyperechoic, vascular, rarely calcified)', 'Medullary thyroid cancer', 'Benign adenoma', 'Hashimoto\'s thyroiditis nodule'],
    clinicalContext: 'Most common thyroid cancer (80–85%). Often incidentally found. Excellent prognosis with treatment. May present as palpable nodule.',
    reportingTips: 'Calculate TI-RADS score. Report: "TI-RADS X — recommend FNA if ≥Y cm." Do NOT say "cancer" in report — report features and TI-RADS recommendation.',
    tags: ['thyroid', 'cancer', 'papillary', 'malignancy', 'tirads', 'fnab', 'microcalcification'],
  },
  {
    id: 'aaa',
    name: 'Abdominal Aortic Aneurysm (AAA)',
    aliases: ['aaa', 'aortic aneurysm', 'abdominal aneurysm'],
    category: 'vascular',
    ultrasoundFindings: [
      'Aortic diameter ≥3.0 cm (outer wall to outer wall)',
      'Focal saccular or diffuse fusiform dilation',
      'Mural thrombus (crescent-shaped echogenic lining — measure outer wall, not lumen)',
      'Calcified atherosclerotic plaques',
      'Iliac artery aneurysm (common iliac >1.8 cm)',
    ],
    redFlags: [
      'Rapid expansion (>1 cm/year or any growth in short interval)',
      'Symptomatic AAA (new back/abdominal pain in known AAA) = emergency',
      'Retroperitoneal hematoma / periaortic fluid (rupture)',
      'AAA ≥5.5 cm in men, ≥5.0 cm in women: surgical threshold',
    ],
    differentials: ['Tortuous aorta (measure outer-to-outer; tortuous may appear falsely wide in 2D)', 'Aortic pseudoaneurysm (post-procedure)', 'Para-aortic lymphadenopathy'],
    clinicalContext: 'Often asymptomatic — found on screening. Risk factors: male, age >65, smoking, hypertension, family history. One-time screen for men 65–75 who ever smoked.',
    reportingTips: 'ALWAYS measure outer-to-outer AP diameter (includes mural thrombus). Report AP and transverse at maximum diameter. Compare to prior — note any change.',
    tags: ['aaa', 'aorta', 'aneurysm', 'abdominal', 'vascular', 'screening'],
  },
  {
    id: 'placenta-previa',
    name: 'Placenta Previa',
    aliases: ['placenta previa', 'low-lying placenta', 'previa'],
    category: 'ob',
    ultrasoundFindings: [
      'Placenta overlying or immediately adjacent to internal os',
      'Complete previa: placenta covers internal os',
      'Marginal/partial previa: edge within 2 cm of internal os',
      'TVUS is the gold standard (must confirm when suspected)',
      'Placenta may appear to migrate — recheck at 32–34 weeks if low-lying <20 wks',
    ],
    redFlags: [
      'Placenta accreta spectrum (PAS): loss of retroplacental clear space, lacunae within placenta, bridging vessels, irregular bladder interface — especially in prior uterine scar + anterior previa',
      'Vasa previa: vessels running over internal os — must be excluded in low-lying placenta',
      'Painless third-trimester bleeding + previa: obstetric emergency',
    ],
    differentials: ['Low-lying placenta (≥2 cm from os on TVUS — does not meet previa criteria)', 'Focal myometrial contraction (can falsely appear to lower placenta — rescan in 30 min)'],
    clinicalContext: 'Painless vaginal bleeding in 2nd/3rd trimester. Cesaerean delivery typically required. Incidence ~0.5%.',
    reportingTips: 'Always measure distance from placental edge to internal os on TVUS. Report in mm. Describe type. Do NOT perform TVUS if previa known and active bleeding (institution-specific).',
    tags: ['placenta', 'previa', 'low-lying', 'ob', 'bleeding', 'third trimester'],
  },
];

export function searchPathologies(query: string): Pathology[] {
  if (!query.trim()) return pathologies;
  const q = query.toLowerCase();
  return pathologies.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.aliases.some((a) => a.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.clinicalContext.toLowerCase().includes(q)
  );
}
