/** Daily sonography tips. HTML allowed (bold/emphasis). Index cycles by day. */
export const SONO_TIPS: string[] = [
  // Vascular
  `The "superficial" femoral vein is part of the <b>deep</b> venous system — DVT here still requires anticoagulation. Never let the name mislead you or your provider.`,
  `Always angle-correct to <b>60° or less</b> for spectral Doppler velocity measurements. Angles above 60° introduce significant error and can falsely elevate or lower your PSV.`,
  `A monophasic waveform in a lower extremity artery suggests proximal obstruction. Always scan proximally — the problem is upstream.`,
  `When you see reversed flow in the <b>vertebral artery</b>, think subclavian steal. Ask if the patient has arm claudication or dizziness with arm exercise.`,
  `Color Doppler aliasing isn't always bad — it can help you quickly locate the jet of a stenosis. Use it to your advantage before switching to spectral.`,
  `The <b>ICA has no branches</b> in the neck. If you see branches, you're looking at the ECA. Tap the superficial temporal artery to confirm — ECA waveform will bounce.`,
  `For DVT compression, if the vein doesn't fully collapse with gentle pressure, that's abnormal. You shouldn't need to press hard — excessive force compresses the artery too and gives a false sense of security.`,
  `Waveform morphology tells a story: <b>triphasic = normal</b>, biphasic = mild disease, monophasic = significant proximal obstruction or high-resistance state.`,
  `When mapping veins for fistula creation, always document diameter, depth, and compressibility. A vein <b>≥ 2.5 mm</b> at rest (≥ 3.5 mm with tourniquet) is the general threshold for maturation potential.`,
  `An ABI > <b>1.3</b> is non-compressible and unreliable — calcified vessels in diabetics and renal disease patients won't compress. Consider toe pressures instead.`,
  `For AVF surveillance, a PSV ratio > <b>3.0</b> across a stenosis or brachial artery flow < 500 mL/min suggests significant stenosis needing referral.`,
  `When evaluating carotid stenosis, PSV alone isn't enough. Always use the <b>ICA/CCA PSV ratio</b> — a ratio > 4 suggests ≥ 70% stenosis even if PSV seems borderline.`,
  // Abdominal / General
  `The <b>right renal artery</b> passes behind the IVC — use the IVC as a window. Angle slightly posterior and you'll find it without needing a flank approach.`,
  `A RI > <b>0.70</b> in the renal arteries suggests increased parenchymal resistance. Think hydronephrosis, rejection (transplant), or medical renal disease.`,
  `Bowel gas is your enemy. Have patients fast for abdominal aorta and mesenteric scans, and try gentle graded compression to displace gas. Patience and position changes work.`,
  `The <b>celiac axis</b> has a classic "seagull" appearance in transverse — two wings spreading left (splenic) and right (hepatic). Once you see it, you'll never forget it.`,
  `SMA waveform is normally <b>high resistance</b> fasting and low resistance postprandial. A fasting SMA that looks low resistance may indicate bowel ischemia or AVM.`,
  `Doppler of the <b>portal vein</b> should show hepatopetal (toward liver) flow. Hepatofugal (away) flow is a red flag for portal hypertension — document and alert the reading physician immediately.`,
  `A normal aorta tapers gradually. Any segment that looks <b>larger than the one above it</b> should raise suspicion. Measure outer wall to outer wall in the true AP diameter.`,
  `When measuring the AAA, always get both AP and transverse. AP is the hemodynamically important diameter — transverse alone can underestimate due to tortuous vessels.`,
  // OB / GYN
  `Crown-rump length (CRL) is the <b>most accurate</b> dating measurement — use it before 14 weeks whenever possible. After 22 weeks, biometry dating windows widen significantly.`,
  `When you can't find the fetal heartbeat, don't panic the patient. Try the <b>TV probe</b> or wait a few minutes and recheck. Document what you see, not what you assume.`,
  `A CRL of <b>7 mm or more</b> without a visible heartbeat on transvaginal ultrasound is suspicious for failed pregnancy. A second scan 7–10 days later confirms — never diagnose on one scan alone.`,
  `The <b>yolk sac</b> appears before the embryo and should be visible by 5.5 weeks TV. A yolk sac without an embryo may mean you're early — correlate with hCG and rescan.`,
  `Placenta previa diagnosis should always be confirmed with <b>transvaginal ultrasound</b>. Transabdominal images are unreliable for the lower uterine segment — bladder filling causes false positives.`,
  `The four-chamber view isn't enough for cardiac screening — add the <b>LVOT and RVOT views</b>. Most conotruncal defects (TOF, TGA) won't be caught on four-chamber alone.`,
  `Umbilical cord should have <b>2 arteries and 1 vein</b>. A single umbilical artery (SUA) is associated with structural and chromosomal anomalies — always document and flag it.`,
  `AFI and single deepest pocket both have roles. <b>SDP ≥ 2 cm</b> is the threshold for normal. If it's borderline, note it and correlate clinically — fluid levels fluctuate.`,
  // Thyroid
  `TI-RADS isn't just about size — it's about <b>composition, echogenicity, shape, margin, and echogenic foci</b>. A 5 mm nodule can be TR5 if it has all the right features.`,
  `Taller-than-wide orientation (anteroposterior > transverse on transverse image) is the single <b>most suspicious</b> TI-RADS feature. Don't skip measuring both axes.`,
  `Comet-tail artifacts in thyroid nodules suggest benign colloid — they're different from microcalcifications. <b>True microcalcs are punctate and non-shadowing.</b>`,
  `Document the parathyroid region whenever you're doing a thyroid scan. An enlarged hypoechoic oval structure posterior to the thyroid lobe on spectral may represent a parathyroid adenoma.`,
  // Cardiac / Echo
  `In echo, <b>subcostal views</b> are your friend when parasternal and apical windows are poor — common in COPD, obesity, and post-op patients. Always try it before giving up on windows.`,
  `A pericardial effusion can look dramatic but be hemodynamically insignificant. Look for <b>RA/RV diastolic collapse</b> and IVC plethora to suggest tamponade physiology.`,
  `Doppler of the <b>mitral inflow</b>: E/A ratio < 1 in a patient > 50 suggests diastolic dysfunction. But don't over-diagnose — always integrate with tissue Doppler and clinical context.`,
  `When measuring EF by eye (visual estimation), studies show experienced sonographers are within 5–10% of quantitative methods. Trust your eye but always document biplane if the clinical question matters.`,
  // Clinical pearls
  `Always compare <b>bilateral findings</b> on vascular exams — a unilaterally elevated PSV or RI is far more meaningful than bilateral elevation, which may reflect a normal variant or technique issue.`,
  `Document your probe position and patient position when findings are subtle. The next sonographer re-scanning the patient needs to reproduce your view, not guess how you got there.`,
  `If your image quality is poor, <b>change something</b> before giving up: patient position, probe position, frequency, harmonic imaging, gain. Never submit a non-diagnostic study without documentation of attempts.`,
  `Write what you <b>see</b>, not what you think it is. "Heterogeneous hypoechoic mass with irregular margins" is your job. "Malignancy" is the radiologist's call.`,
  `When a finding surprises you, <b>scan longer</b>. Artifacts disappear, real findings persist. Real structures have consistent anatomy — artifacts change with probe angle.`,
];

/** Returns today's tip (same for the full day, changes at midnight UTC) */
export function getDailyTip(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return SONO_TIPS[dayIndex % SONO_TIPS.length];
}
