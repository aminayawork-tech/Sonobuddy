export type ProtocolStep = {
  step: number;
  title: string;
  description: string;
  probe?: string;
  tips?: string[];
};

export type Protocol = {
  id: string;
  name: string;
  shortName: string;
  category: ProtocolCategory;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  probe: string;
  patient: string;
  indication: string;
  steps: ProtocolStep[];
  keyImages: string[];
  commonFindings: string[];
  reportChecklist: string[];
  tags: string[];
};

export type ProtocolCategory = 'vascular' | 'abdomen' | 'ob' | 'thyroid' | 'cardiac' | 'msk';

export const PROTOCOL_CATEGORY_LABELS: Record<ProtocolCategory, string> = {
  vascular: 'Vascular',
  abdomen: 'Abdomen',
  ob: 'OB/GYN',
  thyroid: 'Thyroid',
  cardiac: 'Cardiac',
  msk: 'MSK',
};

export const DIFFICULTY_COLORS = {
  beginner: 'text-green-400 bg-green-900/30 border-green-700',
  intermediate: 'text-amber-400 bg-amber-900/30 border-amber-700',
  advanced: 'text-red-400 bg-red-900/30 border-red-700',
};

export const protocols: Protocol[] = [
  // ── VASCULAR ─────────────────────────────────────────────────────────────────
  {
    id: 'carotid-duplex',
    name: 'Carotid Duplex Ultrasound',
    shortName: 'Carotid Duplex',
    category: 'vascular',
    duration: '30–45 min',
    difficulty: 'intermediate',
    probe: 'High-frequency linear (7–12 MHz)',
    patient: 'Supine, neck slightly hyperextended, head turned 30–45° away from side being examined',
    indication: 'TIA, stroke, carotid bruit, pre-op workup, surveillance of known stenosis',
    steps: [
      {
        step: 1,
        title: 'Grayscale Survey — CCA',
        description: 'Begin at the proximal CCA in transverse. Sweep from clavicle to bifurcation. Evaluate plaque, wall thickening, and luminal diameter.',
        probe: 'Linear 9–12 MHz',
        tips: ['Note any plaque: size, echogenicity (soft/calcified), surface (smooth/irregular)', 'Measure IMT at the far wall, 1 cm proximal to the bifurcation'],
      },
      {
        step: 2,
        title: 'Grayscale Survey — Bifurcation & ICA/ECA',
        description: 'Rotate to sagittal. Identify the bifurcation, ICA (lateral, posterior, larger, no branches), and ECA (medial, anterior, branches present).',
        tips: ['ICA has a bulbous proximal segment (carotid sinus)', 'ECA: tap temporal artery to confirm with "bouncing" waveform on spectral Doppler'],
      },
      {
        step: 3,
        title: 'Doppler — Proximal CCA',
        description: 'Angle correct to ≤60°. Sample gate in mid-vessel. Record PSV, EDV, waveform morphology.',
        tips: ['Normal CCA: low-resistance waveform with forward diastolic flow', 'Angle MUST be ≤60° — never perpendicular'],
      },
      {
        step: 4,
        title: 'Doppler — Distal CCA & Bifurcation',
        description: 'Sample 2 cm proximal to bulb. Record PSV. Note any turbulence at bifurcation.',
        tips: ['Turbulence at the bulb is physiologically normal', 'Aliasing here does not indicate stenosis'],
      },
      {
        step: 5,
        title: 'Doppler — ICA (proximal, mid, distal)',
        description: 'Sample proximal (just past bulb), mid, and as distal as visible. Record PSV and EDV. Calculate ICA/CCA ratio.',
        tips: ['Normal ICA: low-resistance, high-diastolic waveform', 'Focally elevated PSV = stenosis at that level'],
      },
      {
        step: 6,
        title: 'Doppler — ECA',
        description: 'Sample ECA at proximal segment. Record PSV. Confirm with temporal tap.',
        tips: ['ECA: high-resistance waveform (normal)', 'ECA branches are useful collateral route in ICA occlusion'],
      },
      {
        step: 7,
        title: 'Vertebral Arteries',
        description: 'Sweep between transverse processes (C3–C6 level). Confirm antegrade flow. Record PSV.',
        tips: ['Turn probe to visualize between vertebral shadows', 'Color helps quickly identify direction', 'Retrograde = subclavian steal'],
      },
      {
        step: 8,
        title: 'Repeat on contralateral side',
        description: 'Reposition patient, repeat steps 1–7 for opposite carotid.',
        tips: ['Compare both sides before finishing'],
      },
    ],
    keyImages: [
      'CCA transverse (grayscale) with measurement',
      'CCA sagittal — spectral Doppler (proximal)',
      'CCA sagittal — spectral Doppler (distal)',
      'ICA proximal — spectral Doppler with PSV/EDV',
      'ICA mid — spectral Doppler',
      'ECA — spectral Doppler',
      'Vertebral — color Doppler + spectral',
      'Bifurcation — color Doppler overview',
      'Any plaque: sagittal + transverse measurement',
    ],
    commonFindings: [
      'Atherosclerotic plaque (calcified/soft)',
      'ICA stenosis (mild/moderate/severe)',
      'ICA occlusion',
      'Subclavian steal (retrograde vertebral)',
      'Carotid dissection',
    ],
    reportChecklist: [
      'CCA: PSV, EDV, waveform',
      'Bifurcation: plaque description',
      'ICA: PSV, EDV, ICA/CCA ratio, stenosis grade',
      'ECA: PSV, patency',
      'Vertebral: direction of flow, PSV',
      'IMT measurement (if indicated)',
      'Plaque: location, size, echogenicity',
    ],
    tags: ['carotid', 'duplex', 'ica', 'cca', 'stenosis', 'stroke', 'tia', 'vascular'],
  },
  {
    id: 'dvt-lower',
    name: 'Lower Extremity Venous Duplex (DVT)',
    shortName: 'LE Venous DVT',
    category: 'vascular',
    duration: '30–45 min',
    difficulty: 'intermediate',
    probe: 'Linear 5–9 MHz (curvilinear for deep pelvic)',
    patient: 'Reverse Trendelenburg (legs dependent) — aids vein distension. Leg externally rotated, knee slightly flexed.',
    indication: 'Leg swelling, pain, calf tenderness, elevated D-dimer, pre-op, cancer surveillance',
    steps: [
      {
        step: 1,
        title: 'Survey — Common Femoral Vein (CFV)',
        description: 'Transverse at femoral crease. Identify CFV (medial) and CFA (lateral). Assess compressibility — walls must completely collapse.',
        tips: ['Full compression = vessel walls touch = no thrombus', 'Incompressibility = DVT until proven otherwise', 'Do NOT use color or Doppler to diagnose DVT — use compression'],
      },
      {
        step: 2,
        title: 'Survey — Saphenofemoral Junction (SFJ)',
        description: 'Identify where GSV joins CFV. Evaluate for thrombus extending from GSV into deep system.',
        tips: ['SFJ thrombus = important — anticoagulation decision', 'Can be missed if not specifically looked for'],
      },
      {
        step: 3,
        title: 'Survey — Femoral Vein (proximal, mid, distal)',
        description: 'Compress every 1–2 cm down the medial thigh. Femoral vein runs with the superficial femoral artery.',
        tips: ['The "superficial" femoral vein is part of the DEEP system — DVT here = treat!', 'Hunter\'s canal can be difficult — use color to locate vessel'],
      },
      {
        step: 4,
        title: 'Survey — Popliteal Vein',
        description: 'Flex knee, scan from popliteal fossa. Popliteal vein is superficial to popliteal artery here. Compress from trifurcation to above knee.',
        tips: ['Have patient lie prone or sit with leg hanging if needed', 'Trifurcation: anterior tibial diverges anteriorly, tibial-peroneal trunk continues'],
      },
      {
        step: 5,
        title: 'Survey — Calf Veins (if indicated)',
        description: 'Paired peroneal, posterior tibial, and anterior tibial veins. Compress medial and lateral calf. Important in high-risk patients.',
        tips: ['Calf DVT: institution-specific protocol — some only scan if symptomatic', 'Isolated calf DVT: lower PE risk but can propagate'],
      },
      {
        step: 6,
        title: 'Doppler — Augmentation & Phasicity',
        description: 'Sample CFV and popliteal vein for spectral Doppler. Confirm respiratory phasicity and augmentation with calf squeeze.',
        tips: ['Normal: flow varies with respiration (faster with expiration)', 'Absent phasicity proximally: consider central obstruction (iliac/IVC)', 'Augmentation confirms patent segment distal to sample site'],
      },
    ],
    keyImages: [
      'CFV — uncompressed + compressed (transverse)',
      'SFJ — transverse',
      'Femoral vein — proximal, mid, distal (compressed + uncompressed)',
      'Popliteal — uncompressed + compressed',
      'CFV — spectral Doppler (phasicity)',
      'Popliteal — augmentation',
      'Any thrombus: location, extent, echogenicity (acute vs chronic)',
    ],
    commonFindings: [
      'Acute DVT (echogenic, non-compressible, expanded vein)',
      'Chronic DVT (hyperechoic, partially compressible, thickened wall)',
      'Superficial thrombophlebitis (GSV)',
      'Baker\'s cyst (posterior knee — can mimic DVT)',
      'Patent veins — negative study',
    ],
    reportChecklist: [
      'All named veins: compressible (Y/N)',
      'Phasicity at CFV and popliteal',
      'Augmentation response',
      'Any thrombus: acuity, level, extent',
      'SFJ evaluated',
      'Calf veins: if evaluated, findings',
    ],
    tags: ['dvt', 'venous', 'lower extremity', 'deep vein thrombosis', 'le duplex', 'compression'],
  },
  {
    id: 'aorta-screening',
    name: 'Abdominal Aorta Screening (AAA)',
    shortName: 'AAA Screen',
    category: 'vascular',
    duration: '15–20 min',
    difficulty: 'beginner',
    probe: 'Curvilinear 2–5 MHz',
    patient: 'Supine. NPO 4–6h ideally (reduces bowel gas). May need lateral decubitus if gas-obscured.',
    indication: 'Men ≥65 with ever-smoking history (1× screen), family history, known AAA surveillance',
    steps: [
      {
        step: 1,
        title: 'Proximal Aorta',
        description: 'Start just below xiphoid, transverse orientation. Identify aorta (pulsatile, left of midline). Measure AP diameter outer-to-outer.',
        tips: ['Aorta is left of spine; IVC is right and non-pulsatile', 'Fan probe cephalad to see celiac and SMA origins'],
      },
      {
        step: 2,
        title: 'Mid Aorta (pararenal)',
        description: 'Sweep caudally in transverse. Measure at widest point. Note renal arteries as landmarks.',
        tips: ['Most AAAs are infrarenal', 'Eccentric thrombus: measure outer wall to outer wall — not lumen'],
      },
      {
        step: 3,
        title: 'Distal Aorta & Bifurcation',
        description: 'Continue caudally to bifurcation into iliac arteries (usually at L4). Note any iliac aneurysm.',
        probe: 'May need to angle probe caudally',
        tips: ['Normal iliac arteries <1.5 cm', 'Common iliac aneurysm: >1.8 cm'],
      },
      {
        step: 4,
        title: 'Sagittal View',
        description: 'Rotate probe to sagittal. Confirm measurements, assess overall morphology, and identify any angulation.',
        tips: ['Document length of aneurysm if present', 'Note neck length and angulation for surgical planning'],
      },
    ],
    keyImages: [
      'Proximal aorta — transverse with measurement',
      'Mid aorta — transverse at widest point',
      'Distal aorta — transverse',
      'Bifurcation — transverse',
      'Aorta — sagittal',
    ],
    commonFindings: [
      'Normal aorta (<3 cm)',
      'AAA (≥3 cm) — document maximum diameter',
      'Mural thrombus',
      'Iliac aneurysm',
      'Atherosclerotic calcification',
    ],
    reportChecklist: [
      'Maximum AP diameter (outer-to-outer)',
      'Transverse diameter',
      'Length of aorta evaluated',
      'Relation to renal arteries (infra- vs juxta-renal)',
      'Iliac artery diameters',
      'Presence of mural thrombus',
      'Comparison to prior if available',
    ],
    tags: ['aaa', 'aorta', 'aneurysm', 'screening', 'abdominal', 'vascular'],
  },

  // ── ABDOMEN ──────────────────────────────────────────────────────────────────
  {
    id: 'ruo',
    name: 'Right Upper Quadrant (RUQ) Ultrasound',
    shortName: 'RUQ / Abdomen',
    category: 'abdomen',
    duration: '30–45 min',
    difficulty: 'beginner',
    probe: 'Curvilinear 2–5 MHz (linear 9 MHz for superficial structures)',
    patient: 'NPO 4–6h (gallbladder distension). Supine initially; left lateral decubitus for GB and right lateral for left kidney.',
    indication: 'RUQ pain, abnormal LFTs, jaundice, elevated bilirubin, rule out gallstones',
    steps: [
      {
        step: 1,
        title: 'Liver — Survey',
        description: 'Subcostal and intercostal approaches. Survey in sagittal and transverse. Assess echogenicity, homogeneity, borders, surface.',
        tips: ['Normal: homogeneous, slightly hyperechoic to right kidney (mild steatosis if significantly brighter)', 'Coarse, nodular surface → cirrhosis concern', 'Capsular irregularity: ascites may outline the surface'],
      },
      {
        step: 2,
        title: 'Liver — Measurement & Vasculature',
        description: 'Measure craniocaudal length (MCL). Evaluate hepatic veins joining IVC, portal vein at hilum with color Doppler.',
        tips: ['Hepatic veins: no walls visible (thin walls)', 'Portal vein branches: echogenic walls', 'Portal flow: hepatopetal (toward liver) = normal'],
      },
      {
        step: 3,
        title: 'Gallbladder',
        description: 'Oblique subcostal approach. Survey GB in long-axis and short-axis. Murphy\'s sign with probe pressure. Measure wall thickness.',
        tips: ['Stones: echogenic with posterior shadowing and gravity-dependent movement', 'Polyps: fixed, no shadowing', 'Sludge: echogenic, no shadowing, moves slowly'],
      },
      {
        step: 4,
        title: 'Common Bile Duct',
        description: 'Measure CBD at porta hepatis (anterior to portal vein). Normal ≤6 mm (≤8 mm post-cholecystectomy).',
        tips: ['Follow CBD distally toward pancreatic head — site of common obstruction', 'Dilated CBD + dilated GB → distal obstruction (stone vs mass)'],
      },
      {
        step: 5,
        title: 'Pancreas',
        description: 'Transverse epigastric sweep. Identify head, neck, body, tail. Normal echogenicity = equal or brighter than liver.',
        tips: ['Gas often obscures — angle caudally, use fluid-filled stomach as window', 'Wirsung duct >3 mm = dilated', 'Pancreatic mass can present as CBD/pancreatic duct dilation ("double duct sign")'],
      },
      {
        step: 6,
        title: 'Right Kidney',
        description: 'Coronal from right flank. Measure length. Assess cortical thickness, echogenicity, collecting system.',
        tips: ['Normal kidney: isoechoic to liver or slightly hypoechoic', 'Increased echogenicity = medical renal disease', 'Hydronephrosis: anechoic fluid in collecting system'],
      },
      {
        step: 7,
        title: 'Spleen',
        description: 'Right lateral decubitus or left flank. Measure longest dimension. Assess echotexture.',
        tips: ['Spleen <12 cm in adults', 'Portal hypertension triad: splenomegaly + ascites + recanalized paraumbilical vein'],
      },
      {
        step: 8,
        title: 'Left Kidney & Aorta',
        description: 'Left flank coronal. Evaluate left kidney. Visualize aorta in epigastric region transversely.',
        tips: ['Left kidney sits more posterior and superior than right', 'Aorta: measure if any concern for dilation'],
      },
    ],
    keyImages: [
      'Liver — sagittal, transverse',
      'Liver length measurement',
      'Right kidney — adjacent liver comparison',
      'Gallbladder — long axis (stones/wall)',
      'Gallbladder — short axis (wall thickness)',
      'CBD measurement at porta hepatis',
      'Pancreas — transverse',
      'Right kidney — long axis measurement',
      'Left kidney — long axis measurement',
      'Spleen — long axis measurement',
      'Aorta — transverse (if visible)',
      'Any abnormal findings',
    ],
    commonFindings: [
      'Cholelithiasis (gallstones)',
      'Acute cholecystitis (stones + wall thickening + Murphy\'s sign)',
      'Hepatic steatosis (fatty liver)',
      'Cirrhosis (nodular surface, shrunken liver)',
      'Hydronephrosis',
      'Splenomegaly',
      'CBD dilatation',
    ],
    reportChecklist: [
      'Liver: size, echogenicity, borders',
      'Portal vein: diameter, direction of flow',
      'Gallbladder: size, wall thickness, stones/polyps/sludge, Murphy\'s sign',
      'CBD: diameter, any intrahepatic biliary dilation',
      'Pancreas: visualized portions, echogenicity, ductal diameter',
      'Right kidney: size, cortical echogenicity, collecting system',
      'Left kidney: size, cortical echogenicity, collecting system',
      'Spleen: size',
      'Ascites: present/absent',
      'Aorta: diameter if visualized',
    ],
    tags: ['ruq', 'abdomen', 'liver', 'gallbladder', 'bile duct', 'kidneys', 'spleen', 'pancreas'],
  },

  // ── OB ───────────────────────────────────────────────────────────────────────
  {
    id: 'ob-first-trimester',
    name: 'First Trimester Obstetric Ultrasound',
    shortName: 'OB 1st Trimester',
    category: 'ob',
    duration: '30–45 min',
    difficulty: 'intermediate',
    probe: 'Curvilinear 3–5 MHz (TVUS: endovaginal 5–9 MHz)',
    patient: 'Full bladder for transabdominal. Empty bladder for transvaginal. Lithotomy position for TVUS.',
    indication: 'Early pregnancy evaluation, dating, viability, ectopic rule-out, nuchal translucency screen',
    steps: [
      {
        step: 1,
        title: 'Uterus Survey',
        description: 'Sagittal and transverse. Confirm intrauterine pregnancy. Evaluate myometrium for fibroids. Locate gestational sac.',
        tips: ['Gestational sac: round anechoic structure with echogenic rim', 'Always document sac location — confirm IUP before assuming normal', 'Pseudogestational sac of ectopic: no decidual reaction, no double decidual sign'],
      },
      {
        step: 2,
        title: 'Gestational Sac & Yolk Sac',
        description: 'Measure mean sac diameter (MSD) — average of 3 perpendicular planes. Identify yolk sac (small echogenic ring within sac).',
        tips: ['MSD ≥25 mm without embryo = anembryonic pregnancy', 'Yolk sac confirms IUP even without embryo yet visible'],
      },
      {
        step: 3,
        title: 'Embryo / Fetus',
        description: 'Identify embryo. Confirm cardiac activity (M-mode preferred — do NOT use PW Doppler <10 weeks). Measure CRL.',
        tips: ['HR <100 bpm <6.2 wks may be normal — recheck in 1 week', 'HR <80 bpm at any gestation: poor prognosis', 'CRL: measure in strict neutral position (not flexed)'],
      },
      {
        step: 4,
        title: 'Nuchal Translucency (11–13+6 wks)',
        description: 'CRL 45–84 mm required. Sagittal neutral position, magnified. Measure NT from inner edge to inner edge at thickest point.',
        tips: ['Must distinguish NT from amnion — both appear as thin lines', 'Take ≥3 measurements, report smallest acceptable (technical quality)', 'NT ≥3.5 mm: offer genetic counseling/invasive testing'],
      },
      {
        step: 5,
        title: 'Adnexa',
        description: 'Bilateral adnexal evaluation. Rule out ectopic, corpus luteal cyst, ovarian mass.',
        tips: ['Empty fallopian tube "ring of fire" + no IUP = ectopic until proven otherwise', 'Corpus luteal cyst: common, crenulated walls, resolves by 14–16 wks'],
      },
      {
        step: 6,
        title: 'Uterus & Cervix',
        description: 'Measure cervical length (if symptomatic or high risk). Evaluate for fibroids affecting cavity. Subchorionic hematoma?',
        tips: ['Subchorionic hematoma: hypo/anechoic collection between chorion and uterine wall', 'Fibroids: may distort cavity or obstruct delivery'],
      },
    ],
    keyImages: [
      'Gestational sac — sagittal uterus',
      'GS with MSD measurement (3 planes)',
      'Yolk sac',
      'Embryo with CRL measurement',
      'Cardiac activity (M-mode)',
      'NT measurement (if 11–13+6)',
      'Adnexa — bilateral',
      'Cervix',
    ],
    commonFindings: [
      'Normal viable IUP',
      'Anembryonic pregnancy (blighted ovum)',
      'Subchorionic hematoma',
      'Ectopic pregnancy',
      'Missed abortion',
      'Threatened abortion',
    ],
    reportChecklist: [
      'Number of gestational sacs / fetuses',
      'CRL and corresponding GA',
      'Cardiac activity: present/absent (rate in bpm)',
      'NT measurement (if 11–13+6 wks)',
      'Yolk sac: present/abnormal',
      'Uterus: fibroids, shape',
      'Adnexa: free fluid, masses',
      'Cervix: length',
      'Subchorionic hematoma: if present, size and location',
    ],
    tags: ['ob', 'first trimester', 'crl', 'nt', 'early pregnancy', 'ectopic', 'viability'],
  },

  // ── THYROID ──────────────────────────────────────────────────────────────────
  {
    id: 'thyroid-ultrasound',
    name: 'Thyroid Ultrasound',
    shortName: 'Thyroid US',
    category: 'thyroid',
    duration: '20–30 min',
    difficulty: 'beginner',
    probe: 'High-frequency linear 7–15 MHz',
    patient: 'Supine, neck extended (pillow under shoulders). Arms at side.',
    indication: 'Palpable nodule, elevated TSH/T4, goiter evaluation, follow-up of known nodules',
    steps: [
      {
        step: 1,
        title: 'Survey — Both Lobes',
        description: 'Transverse sweep from superior to inferior for each lobe. Note echotexture, heterogeneity, vascularity. Compare lobes.',
        tips: ['Normal thyroid: homogeneous, "salt and pepper" echotexture, hyperechoic to strap muscles', 'Heterogeneous + enlarged = Hashimoto\'s thyroiditis', 'Diffuse increased vascularity = Graves\' disease'],
      },
      {
        step: 2,
        title: 'Lobe Measurements',
        description: 'Measure each lobe in 3 planes (length, width, height). Calculate volume (L×W×H×0.52). Measure isthmus AP.',
        tips: ['Report each lobe separately', 'Isthmus >5 mm = thickened (Hashimoto\'s, goiter)'],
      },
      {
        step: 3,
        title: 'Nodule Survey & Characterization',
        description: 'For each nodule: measure in 3 dimensions, characterize composition, echogenicity, shape, margins, echogenic foci. Calculate ACR TI-RADS score.',
        tips: [
          'TI-RADS points: Composition (cystic=0, spongiform=0, mixed=1, solid=2)',
          'Echogenicity (anechoic=0, hyperechoic/isoechoic=1, hypoechoic=2, markedly hypo=3)',
          'Shape (wider-than-tall=0, taller-than-wide=3)',
          'Margin (smooth=0, ill-defined=0, lobulated/irregular=2, extrathyroidal=3)',
          'Echogenic foci (none=0, large comet-tail=0, macro-calc=1, peripheral/rim=2, punctate=3)',
        ],
      },
      {
        step: 4,
        title: 'Vascularity',
        description: 'Color/power Doppler for overall gland and individual nodules. Note perinodular vs intranodular flow.',
        tips: ['Intranodular flow in hypoechoic solid nodule increases malignancy concern', 'Absent vascularity in a nodule does not exclude malignancy'],
      },
      {
        step: 5,
        title: 'Lymph Nodes',
        description: 'Survey central (tracheoesophageal groove) and lateral (levels II–IV) for adenopathy.',
        tips: ['Abnormal nodes: round, no fatty hilum, cystic areas, calcifications, >1 cm short axis', 'Calcifications in a node adjacent to thyroid = papillary thyroid cancer metastasis'],
      },
    ],
    keyImages: [
      'Right lobe — transverse (width × height)',
      'Right lobe — sagittal (length)',
      'Left lobe — transverse (width × height)',
      'Left lobe — sagittal (length)',
      'Isthmus — transverse with AP measurement',
      'Each nodule: transverse + sagittal + 3D measurement',
      'Color Doppler — gland vascularity',
      'Lymph nodes — if abnormal',
    ],
    commonFindings: [
      'Simple thyroid cyst',
      'Colloid cyst (comet-tail artifacts)',
      'Benign adenoma (TI-RADS 2–3)',
      'Suspicious nodule (TI-RADS 4–5)',
      'Hashimoto\'s thyroiditis',
      'Multinodular goiter',
    ],
    reportChecklist: [
      'Lobe dimensions and volume (bilateral)',
      'Isthmus thickness',
      'Overall echotexture (homogeneous/heterogeneous)',
      'Vascularity pattern',
      'Each nodule: size (3 planes), location, TI-RADS score, FNA threshold met?',
      'Lymph nodes',
      'Parathyroid enlargement (if incidental)',
    ],
    tags: ['thyroid', 'nodule', 'tirads', 'goiter', 'hashimoto', 'thyroid cancer', 'fna'],
  },
];

export function searchProtocols(query: string): Protocol[] {
  if (!query.trim()) return protocols;
  const q = query.toLowerCase();
  return protocols.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortName.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.indication.toLowerCase().includes(q)
  );
}

export function getProtocolsByCategory(category: ProtocolCategory): Protocol[] {
  return protocols.filter((p) => p.category === category);
}
