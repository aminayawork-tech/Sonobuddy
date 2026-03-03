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

  // ── VASCULAR PATHOLOGIES ─────────────────────────────────────────────────────
  {
    id: 'blue-toe-syndrome',
    name: 'Blue Toe Syndrome (Atheroembolism)',
    aliases: ['blue toe syndrome', 'atheroembolism', 'cholesterol embolism', 'trash foot', 'digital ischemia'],
    category: 'vascular',
    ultrasoundFindings: [
      'Normal or preserved ABI paradoxically (pedal pulses often intact)',
      'Proximal atherosclerotic plaque — aorta, iliac, or femoral artery (source vessel)',
      'Ragged, ulcerated, or complex plaque surface ("shaggy aorta" appearance)',
      'Normal distal vessel compressibility (distinguishes from venous pathology)',
      'Absent or diminished color flow in affected digital arteries on high-frequency probe',
      'No significant pressure gradient across peripheral arteries (macro-emboli uncommon)',
    ],
    redFlags: [
      'Multi-digit or bilateral toe involvement: proximal aortic source — CT aortography urgent',
      'Post-procedural timing (cardiac cath, aortic surgery): strongly suggests atheroembolism',
      'Livedo reticularis + blue toes + renal failure: systemic cholesterol embolization (Hollenhorst plaques in fundus)',
      'Progressive renal failure post-procedure: cholesterol embolism to renal arteries — nephrology consult',
    ],
    differentials: ['Acute arterial occlusion (ABI low, no pulses)', 'Raynaud\'s phenomenon (bilateral, reversible with cold)', 'Vasculitis', 'Cryoglobulinemia', 'In-situ thrombosis'],
    clinicalContext: 'Sudden blue/purple discoloration of 1–2 toes with intact pedal pulses. Often post-procedure (cardiac cath, aortography) or spontaneous in heavy atherosclerotic burden. Extremely painful. No cold or stress trigger.',
    reportingTips: 'Document source vessel plaque characteristics at aorta, iliac, and femoral levels. Note ABI (often normal or elevated). State: "Complex atherosclerotic plaque identified at [location] — potential embolic source consistent with atheroembolism."',
    tags: ['blue toe', 'atheroembolism', 'cholesterol embolism', 'vascular', 'plaque', 'digital ischemia', 'trash foot'],
  },
  {
    id: 'subclavian-steal',
    name: 'Subclavian Steal Syndrome',
    aliases: ['subclavian steal', 'vertebral reversal', 'subclavian stenosis', 'steal syndrome'],
    category: 'vascular',
    ultrasoundFindings: [
      'Retrograde (reversed) flow in ipsilateral vertebral artery — definitive finding',
      'Severe stenosis or occlusion of proximal subclavian artery (proximal to vertebral artery origin)',
      'Alternating flow in vertebral artery (partial steal): deceleration or brief reversal in systole only',
      'Elevated PSV at subclavian stenosis with post-stenotic turbulence',
      'Bilateral arm pressure asymmetry: >15 mmHg lower on affected side',
      'Arm exercise provocative test: worsens vertebral reversal (increased arm demand steals more flow)',
    ],
    redFlags: [
      'Complete retrograde vertebral flow + posterior circulation symptoms (diplopia, ataxia, syncope): urgent vascular referral',
      'Bilateral subclavian stenosis: bilateral retrograde vertebral flow — severe posterior circulation risk',
      'Subclavian steal in CABG patient using LIMA: coronary steal from LIMA if left subclavian stenosis proximal to LIMA origin',
    ],
    differentials: ['Vertebral artery occlusion (absent flow vs retrograde)', 'Normal contralateral vertebral dominance', 'Carotid disease (anterior circulation symptoms)'],
    clinicalContext: 'Arm fatigue or claudication, dizziness, diplopia, drop attacks, or syncope with ipsilateral arm exercise. Blood pressure differential >15 mmHg between arms. May be entirely asymptomatic (incidental finding).',
    reportingTips: 'State vertebral flow direction explicitly: "Antegrade," "Retrograde," or "Alternating (partial steal)." Document subclavian stenosis location and estimated severity. Note whether provocative arm exercise test was performed.',
    tags: ['subclavian steal', 'vertebral artery', 'retrograde flow', 'subclavian stenosis', 'vascular', 'arm claudication', 'dizziness'],
  },
  {
    id: 'pseudoaneurysm',
    name: 'Arterial Pseudoaneurysm',
    aliases: ['pseudoaneurysm', 'false aneurysm', 'post-cath pseudoaneurysm', 'PSA'],
    category: 'vascular',
    ultrasoundFindings: [
      'Pulsatile hypoechoic/anechoic sac adjacent to artery — no true arterial wall',
      '"Yin-yang" sign on color Doppler: bidirectional swirling flow within sac',
      'Narrow neck connecting sac to parent artery — to-and-fro spectral waveform at neck',
      'Spectral Doppler at neck: forward systolic flow into sac, reverse diastolic flow (pathognomonic "to-and-fro")',
      'Parent artery (femoral/brachial) typically patent with normal or displaced flow',
      'Overlying skin may be bruised, tender, or demonstrate pulsatile mass on exam',
    ],
    redFlags: [
      'Large pseudoaneurysm (>3 cm): higher rupture risk — urgent vascular surgery consultation',
      'Rapidly expanding sac on serial imaging: impending rupture',
      'Skin breakdown or threatened integrity over sac',
      'Concurrent AV fistula post-cath: also look for pulsatile venous flow adjacent to artery',
    ],
    differentials: ['True aneurysm (wall = all 3 arterial layers, intact without neck)', 'Hematoma (no internal flow on Doppler, no neck connection)', 'AV fistula (venous pulsatility, thrill on exam)', 'Abscess (no blood flow, clinical signs of infection)'],
    clinicalContext: 'Most commonly post-catheterization (femoral, brachial, radial access). Also after vascular surgery, graft anastomosis, or trauma. Presents as pulsatile mass, expanding hematoma, or pain at puncture site 1–7 days post-procedure.',
    reportingTips: 'Measure sac dimensions (3 planes). Measure neck length and width (critical for thrombin injection planning). Document parent artery. Note: ultrasound-guided thrombin injection or compression can be performed therapeutically.',
    tags: ['pseudoaneurysm', 'false aneurysm', 'post-cath', 'femoral', 'brachial', 'yin-yang', 'to-and-fro', 'vascular'],
  },
  {
    id: 'renal-artery-stenosis',
    name: 'Renal Artery Stenosis (RAS)',
    aliases: ['renal artery stenosis', 'renovascular hypertension', 'ras', 'fibromuscular dysplasia'],
    category: 'vascular',
    ultrasoundFindings: [
      'Main renal artery PSV >180 cm/s at stenosis (direct sign)',
      'Renal-Aortic Ratio (RAR) >3.5 — renal PSV ÷ aortic PSV',
      'Post-stenotic turbulence: spectral broadening and color aliasing distal to stenosis',
      'Tardus-parvus waveform in intrarenal arteries: delayed systolic upstroke (AT >70 ms), blunted peak',
      'Resistive index asymmetry: >0.05 difference between kidneys',
      'Affected kidney may be smaller than contralateral (chronic stenosis — parenchymal atrophy)',
    ],
    redFlags: [
      'Bilateral RAS or RAS to a solitary kidney: ACE inhibitor may cause acute renal failure — urgent assessment',
      'Flash pulmonary edema with hypertension: bilateral RAS until proven otherwise — emergency',
      'ACE inhibitor / ARB causing acute kidney injury: high suspicion for hemodynamically significant RAS',
      'Young woman with mid/distal renal artery stenosis: fibromuscular dysplasia (FMD) — "string of beads" pattern',
    ],
    differentials: ['Essential hypertension (no velocity elevation)', 'Medical renal disease (elevated RI bilaterally, small kidneys)', 'Renal vein thrombosis (absent venous flow)'],
    clinicalContext: 'Resistant hypertension, flash pulmonary edema, abrupt-onset hypertension in young patient, deteriorating renal function on ACE inhibitors, audible flank bruits. Most common cause: atherosclerosis (proximal ostial); FMD in young women (mid/distal).',
    reportingTips: 'Document PSV at renal artery origin and along full course. State RAR. Document intrarenal tardus-parvus (indirect indicator of proximal stenosis). Recommend CTA/MRA if >70% stenosis suspected — duplex is screening, not definitive.',
    tags: ['renal artery stenosis', 'renovascular hypertension', 'tardus-parvus', 'rar', 'fmd', 'vascular', 'hypertension'],
  },
  {
    id: 'popliteal-aneurysm',
    name: 'Popliteal Artery Aneurysm',
    aliases: ['popliteal aneurysm', 'popliteal artery aneurysm', 'ham aneurysm'],
    category: 'vascular',
    ultrasoundFindings: [
      'Focal dilation of popliteal artery >1.5 cm diameter (or >1.5× normal adjacent segment)',
      'Fusiform or saccular expansion in popliteal fossa',
      'Mural thrombus: crescent-shaped echogenic lining within aneurysm wall',
      'Color Doppler: swirling flow within aneurysm, absent color fill where thrombus is present',
      'Distal tibial vessel compromise: diminished flow if embolization has occurred',
      'Tibial vessels: inspect for embolic occlusion or diminished waveforms',
    ],
    redFlags: [
      'Absent distal pulses with known popliteal aneurysm: acute thrombosis or embolization — vascular surgery emergency',
      'Bilateral popliteal aneurysms in 50% of patients: ALWAYS screen contralateral leg',
      '25–50% association with AAA: ALWAYS assess abdominal aorta when popliteal aneurysm found',
      'Rapidly expanding or symptomatic aneurysm: surgical repair indicated regardless of size',
    ],
    differentials: ['Baker\'s cyst (no arterial flow, posteromedial, communicates with knee joint)', 'Lymph node (no internal arterial flow, not pulsatile)', 'Popliteal artery entrapment syndrome (young patient, positional compression)'],
    clinicalContext: 'Most common peripheral artery aneurysm. Often bilateral (screen both legs). Strong AAA association — assess aorta. May be asymptomatic or present with acute limb ischemia from thrombosis or distal embolization.',
    reportingTips: 'Measure maximum AP diameter outer-to-outer. Document extent (proximal to distal popliteal), thrombus burden, and distal vessel patency. Always state: "Recommend evaluation of contralateral popliteal artery and abdominal aorta."',
    tags: ['popliteal aneurysm', 'popliteal', 'peripheral aneurysm', 'thromboembolism', 'vascular', 'limb ischemia'],
  },
  {
    id: 'chronic-venous-insufficiency',
    name: 'Chronic Venous Insufficiency (CVI)',
    aliases: ['venous insufficiency', 'varicose veins', 'cvi', 'venous reflux', 'varicosities'],
    category: 'vascular',
    ultrasoundFindings: [
      'Venous reflux: retrograde flow duration >0.5 seconds after Valsalva release or calf compression release',
      'Incompetent valves at saphenofemoral junction (SFJ) and/or saphenopopliteal junction (SPJ)',
      'Dilated, tortuous, non-compressible superficial varicosities',
      'Perforator vein incompetence: outward (centrifugal) flow from deep to superficial system on compression',
      'Venous wall thickening, fibrosis, and chronic post-thrombotic changes',
      'Deep vein reflux (femoral/popliteal) in advanced CVI',
    ],
    redFlags: [
      'Deep system reflux (femoral or popliteal) + superficial reflux: worse outcomes, complex treatment',
      'Active venous ulcer with ABI <0.8: mixed arteriovenous disease — compression may be contraindicated',
      'Superficial thrombophlebitis rapidly extending toward SFJ: risk of propagation to deep system — anticoagulation consideration',
    ],
    differentials: ['Acute DVT (hypoechoic, non-compressible — no reflux pattern)', 'Lymphedema (no venous abnormality on duplex)', 'Lipodermatosclerosis (skin changes without venous source)'],
    clinicalContext: 'Leg heaviness, aching, swelling worse by end of day, relieved by elevation. Varicose veins, skin changes (hyperpigmentation, lipodermatosclerosis), venous ulcers at medial malleolus. CEAP classification C0–C6.',
    reportingTips: 'Document reflux at SFJ, SPJ, and any incompetent perforators. State reflux duration (>0.5 s is pathological). Note GSV and SSV diameter at multiple levels. CEAP classification guides treatment planning (sclerotherapy, thermal ablation, or surgery).',
    tags: ['venous insufficiency', 'reflux', 'varicose veins', 'sfj', 'saphenous', 'perforator', 'vascular', 'cvi', 'ceap'],
  },
  {
    id: 'mesenteric-ischemia',
    name: 'Mesenteric Ischemia',
    aliases: ['mesenteric ischemia', 'celiac stenosis', 'sma stenosis', 'bowel ischemia', 'intestinal angina'],
    category: 'vascular',
    ultrasoundFindings: [
      'Elevated PSV at celiac axis origin: >200 cm/s suggests significant stenosis',
      'Elevated PSV at SMA origin: >275 cm/s suggests significant stenosis',
      'Post-stenotic turbulence (spectral broadening, color aliasing) distal to stenosis',
      'Atherosclerotic plaque at mesenteric vessel origins',
      'Celiac axis median arcuate ligament (MAL) compression: elevated PSV only on expiration, normalized on inspiration',
      'Advanced bowel infarction: bowel wall thickening >3 mm, absent peristalsis, free fluid (late, critical finding)',
    ],
    redFlags: [
      'Severe post-prandial pain + weight loss + ≥2 vessel stenosis: chronic mesenteric ischemia — urgent vascular referral',
      'Acute severe abdominal pain out of proportion to exam: acute mesenteric ischemia (embolic or thrombotic) — CT angiography emergency',
      'Known AF + acute abdominal pain: SMA embolus until proven otherwise',
      'Bowel wall pneumatosis or portal venous gas: bowel infarction — surgical emergency',
    ],
    differentials: ['Irritable bowel syndrome (no vascular abnormality)', 'Pancreatitis (pancreatic findings)', 'Aortic dissection extending into mesenteric vessels'],
    clinicalContext: 'Post-prandial abdominal pain ("intestinal angina"), weight loss (fear of eating), diffuse atherosclerotic disease. Scan must be performed after 4–6h fast (post-prandial physiologic velocity elevation can confound results).',
    reportingTips: 'Always scan fasting. Angle correction mandatory at vessel origins (vessels run anterior, coronal approach). Report PSV at celiac and SMA origins with angle-corrected Doppler. CTA is gold standard — duplex is screening tool.',
    tags: ['mesenteric ischemia', 'celiac', 'sma', 'bowel ischemia', 'vascular', 'post-prandial pain', 'intestinal angina'],
  },
  {
    id: 'pad',
    name: 'Peripheral Arterial Disease (PAD)',
    aliases: ['pad', 'peripheral arterial disease', 'leg claudication', 'arterial insufficiency', 'clti'],
    category: 'vascular',
    ultrasoundFindings: [
      'ABI <0.9 (ankle systolic pressure lower than brachial — diagnostic threshold)',
      'Monophasic waveforms in tibial or pedal vessels (normal = triphasic)',
      'Atherosclerotic plaque (calcified or soft) in aortoiliac, femoral, popliteal, or tibial segments',
      'Focal PSV elevation at stenosis with post-stenotic turbulence and distal velocity drop',
      'Color Doppler: aliasing/mosaic at stenosis, absent fill in occlusion, collateral reconstitution',
      'Non-compressible vessels (calcified walls, ABI >1.4): use toe-brachial index instead',
    ],
    redFlags: [
      'ABI <0.4 or absent pedal signals: critical limb-threatening ischemia (CLTI) — urgent vascular referral, risk of amputation',
      'Rest pain + tissue loss (gangrene, non-healing ulcer): threatened limb — vascular surgery emergency',
      'Acute worsening in known PAD: suspect superimposed acute thrombosis',
      'Diabetic patient: may have non-compressible vessels and painless ischemia — lower threshold for evaluation',
    ],
    differentials: ['Venous claudication (heaviness, worse with prolonged standing, relieved by elevation)', 'Neurogenic claudication (spinal stenosis — worse with walking and extension, better sitting)', 'Musculoskeletal pain (not reliably reproduced with exercise)'],
    clinicalContext: 'Calf claudication with walking, relieved by rest (reproducible). Risk factors: smoking (most important), diabetes, hypertension, hyperlipidemia. PAD often coexists with coronary and cerebrovascular disease — assess all vascular beds.',
    reportingTips: 'Segmental approach: aortoiliac, femoropopliteal, and tibial-pedal segments. Document PSV ratios at stenoses (>2.0 = >50%). Classify waveforms at each level. ABI (or TBI if calcified). Compare to prior studies for change.',
    tags: ['pad', 'peripheral arterial disease', 'claudication', 'abi', 'critical limb ischemia', 'vascular', 'stenosis', 'ischemia'],
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
