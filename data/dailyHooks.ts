export interface DailyHook {
  /** Hook question — becomes the notification title (≤ 60 chars ideal) */
  title: string;
  /** 1–2 sentence stat teaser — becomes the notification body */
  preview: string;
  /** Compact takeaway shown in the home card (HTML bold ok) */
  tip: string;
  /** If present, renders a "Read full article →" button on the home card */
  articleSlug?: string;
}

export const DAILY_HOOKS: DailyHook[] = [
  // ── Article-based hooks ──────────────────────────────────────────────────────
  {
    title: 'How much do travel sonographers make?',
    preview: 'Travel packages run $114k–$182k/year — but the real math involves taxable rate + tax-free stipends most people undercount.',
    tip: 'A typical travel contract: $28–$40/hr taxable + $1,500–$3,500/month housing stipend + $250–$500/week meals. That annualized number isn\'t salary — it\'s total package.',
    articleSlug: 'sonographer-travel-assignment-pay',
  },
  {
    title: 'Is AI actually taking sonographer jobs?',
    preview: 'AI now handles biometry and EF calculation on most platforms — but probe manipulation, patient positioning, and clinical judgment can\'t be automated.',
    tip: 'AI automates caliper placement and flagging. What it can\'t do: adjust probe pressure for pain, talk a nervous patient through a TVU, or recognize when a window is technically impossible.',
    articleSlug: 'sonographer-ai-impact-on-career',
  },
  {
    title: 'What does a sonographer actually do all day?',
    preview: 'Scanning is only about 60% of the shift. The rest is patient prep, report coordination, equipment QC, and the cases no one told you about in school.',
    tip: 'New grads are often surprised: a busy day means back-to-back exams with almost no downtime. You\'re on your feet, repositioning patients, and troubleshooting equipment — all before noon.',
    articleSlug: 'what-does-a-sonographer-do-daily',
  },
  {
    title: 'Sonographer vs. radiologist — what\'s the real difference?',
    preview: 'Sonographers acquire images. Radiologists interpret them. But the clinical line between those roles is blurring in point-of-care settings.',
    tip: '<b>Sonographers acquire. Radiologists interpret.</b> In POCUS and emergency settings, sonographers are increasingly expected to recognize findings and escalate immediately — not just save images.',
    articleSlug: 'sonographer-vs-radiologist-difference',
  },
  {
    title: 'What does sonographer burnout actually look like?',
    preview: 'Repetitive shoulder injury, compassion fatigue, and moral distress are the three drivers most sonographers don\'t recognize until they\'re already burned out.',
    tip: 'Burnout in sonography has a physical component most professions don\'t: MSI (musculoskeletal injury) affects 80–90% of practicing sonographers. The job is physically demanding in ways school doesn\'t prepare you for.',
    articleSlug: 'sonographer-burnout-prevention-strategies',
  },
  {
    title: 'How much does a new sonographer make in 2026?',
    preview: 'Median starting salary is $68k–$75k. But specialty, geography, and setting create a $40k spread from lowest to highest first-year pay.',
    tip: 'Vascular and cardiac specialties consistently pay more than general/OB. A new RVT in a hospital outpatient setting in a shortage market can earn $80k+ starting — the median hides the range.',
    articleSlug: 'sonographer-salary-2026',
  },
  {
    title: 'Can sonographers work from home?',
    preview: 'Six categories of remote work exist for sonographers — from fully remote tele-reporting to hybrid POCUS coaching. Most pay less than staff rates.',
    tip: 'Remote sonography isn\'t one thing. Tele-ultrasound coaching, quality assurance review, PACS workflow, education, and sales/clinical support all allow varying degrees of remote work.',
    articleSlug: 'sonographer-work-from-home-opportunities',
  },
  {
    title: 'What is point-of-care ultrasound certification?',
    preview: 'POCUS credentialing is fragmented — RMSK, RDMS, and hospital-granted privileges all exist, and employers are setting their own standards.',
    tip: '<b>POCUS ≠ diagnostic sonography.</b> POCUS is performed by the treating clinician at the bedside for immediate decisions. Sonographers trained in diagnostic US are entering POCUS programs as educators and QA reviewers.',
    articleSlug: 'point-of-care-sonographer-certification',
  },
  {
    title: 'Is the sonographer shortage real in 2026?',
    preview: 'SDMS projects a 12–14% workforce gap through 2028. Rural and critical-access hospitals are the most affected — some running without a dedicated sonographer for months.',
    tip: 'The shortage is real and geographically uneven. Major metro areas have competitive markets; rural and inner-city hospitals are offering $5k–$15k sign-on bonuses and relocation packages to fill single positions.',
    articleSlug: 'sonographer-shortage-2026',
  },
  {
    title: 'How to become a sonographer in 2026',
    preview: 'Most programs take 2 years and require a healthcare background. The ARDMS RDMS credential is the gold standard — but the path has more options than most people know.',
    tip: 'Three entry paths: 2-year AAS, post-baccalaureate certificate (12–18 months for healthcare grads), or BS completion program. CAAHEP accreditation is non-negotiable for ARDMS eligibility.',
    articleSlug: 'how-to-become-a-sonographer-2026',
  },
  {
    title: 'What AI tools are sonographers using right now?',
    preview: 'Auto-measurement tools from GE, Philips, and Samsung are FDA-cleared and deployed in clinical settings today. Here\'s what they actually do well — and where they fail.',
    tip: 'AI auto-biometry (fetal measurements, EF, aorta diameter) is the furthest along. Image quality scoring and anatomy plane recognition are in early clinical deployment. Report drafting tools exist but are specialty-limited.',
    articleSlug: 'sonographer-ai-tool-2026',
  },
  {
    title: 'Staff sonographer vs. travel — which pays more?',
    preview: 'Travel pays more on paper, but after housing costs and gap weeks, the net advantage narrows. The real question is whether the flexibility is worth the instability.',
    tip: 'Travel gross: ~$3,500/week. Staff gross: ~$1,600/week. But gap weeks between contracts can cost $3,500+ each. The math only favors travel if you maintain consistent placement.',
    articleSlug: 'sonographer-contract-vs-permanent-employment',
  },
  {
    title: 'How much does a portable ultrasound machine cost?',
    preview: 'Handheld devices start under $5,000. Cart-based premium systems run $80,000–$250,000. What you need depends on the clinical setting — not just the budget.',
    tip: 'Four tiers: handheld ($2,500–$8,000), compact portable ($15,000–$40,000), mid-range ($40,000–$80,000), premium ($80,000–$250,000+). Leasing and refurbished options change the math significantly.',
    articleSlug: 'portable-ultrasound-machine-cost-2026',
  },
  {
    title: 'Is the sonographer board certification worth it?',
    preview: 'ARDMS credentials correlate with a $4–8/hr pay differential at most institutions — but the bigger benefit is employment access. Many hospital systems won\'t hire without it.',
    tip: 'ARDMS credentialed sonographers earn $4–8/hr more on average. More importantly, major health systems and travel agencies increasingly require RDMS/RVT/RDCS as a hiring filter — not just a preference.',
    articleSlug: 'sonographer-board-certification-worth-it',
  },
  {
    title: 'What does the sonographer job market look like in 2026?',
    preview: 'BLS projects 10% growth through 2032 — faster than average. But the real story is the geographic and specialty distribution of that growth.',
    tip: 'Fastest-growing segments: POCUS support roles, cardiac echo (aging population), and vascular (peripheral artery disease prevalence). Growth is concentrated in outpatient imaging, not hospital-based positions.',
    articleSlug: 'sonographer-job-market-2026-outlook',
  },
  {
    title: 'Can sonographers work in emergency medicine?',
    preview: 'Emergency POCUS is one of the fastest-growing subspecialties in ultrasound. Sonographers who cross-train for FAST and resus protocols are in high demand.',
    tip: 'EM-trained sonographers earn a premium. Certifications to know: RDMS (Abdomen), plus institutional FAST training. Some trauma centers run dedicated EM sonographer positions for 24/7 POCUS support.',
    articleSlug: 'emergency-medicine-sonographer-training',
  },
  {
    title: 'Should you become an independent contractor sonographer?',
    preview: 'Going 1099 can net 20–35% more hourly — but only after you\'ve accounted for self-employment tax, benefits replacement, and unpaid admin time.',
    tip: 'The 1099 math: add 15.3% SE tax + health insurance ($400–$900/month) + retirement + unpaid admin. Your break-even rate is typically $8–$15/hr above your W-2 equivalent.',
    articleSlug: 'sonographer-independent-contractor-rates',
  },
  {
    title: 'What do sonographers actually earn with a vascular credential?',
    preview: 'RVT-credentialed sonographers consistently earn $5–10/hr more than general RDMS in vascular-heavy markets. The exam is hard — but the ROI is real.',
    tip: 'Vascular credentialing path: RDMS (Vascular) or RVT from ARDMS, or RVS from CCI. The SRU consensus criteria (PSV, EDV, ICA/CCA ratio) are core exam content — know them cold.',
    articleSlug: 'vascular-sonographer-certification-guide',
  },
  {
    title: 'What are sonographers doing to prevent MSI?',
    preview: 'Musculoskeletal injuries affect 80–90% of practicing sonographers. Grip, wrist deviation, and probe pressure are the three biggest modifiable risk factors.',
    tip: 'Ergonomic interventions with the highest evidence: adjustable-height table, light grip technique, neutral wrist posture, and scanning from the dominant-side position. Probe weight matters more than most realize.',
    articleSlug: 'sonographer-physical-demands-ergonomics',
  },
  {
    title: 'Hospital sonographer vs. outpatient clinic — which is better?',
    preview: 'Hospital pays more and offers better benefits. Clinic offers more predictable hours and lower physical demand. The right choice depends on where you are in your career.',
    tip: 'Hospitals: higher base pay, on-call, trauma/STAT cases, better PTO. Outpatient clinics: regular hours, narrower exam types, lower acuity. New grads often grow faster in hospital settings despite the stress.',
    articleSlug: 'hospital-vs-clinic-sonographer',
  },
  {
    title: 'Can sonographers practice internationally?',
    preview: 'Canada, UK, Australia, and the Gulf states all have active demand for trained sonographers. But credential reciprocity is limited — expect 3–12 months of re-licensure process.',
    tip: 'Canada and Australia are the fastest paths for US-trained sonographers. The UK requires CASE accreditation review. Gulf states (UAE, Saudi) often waive credential requirements for US-trained applicants with employer sponsorship.',
    articleSlug: 'sonographer-international-job-opportunities',
  },
  {
    title: 'What does transitioning into sonography look like?',
    preview: 'Former nurses, rad techs, and medical assistants make up the largest share of sonography career-changers. Post-baccalaureate certificate programs are designed for them.',
    tip: 'Healthcare background matters for program admission and ARDMS eligibility. A nurse or RT transitioning to sonography can often complete a post-bac certificate in 12–18 months and skip the prerequisite chase.',
    articleSlug: 'transitioning-to-sonographer-career',
  },
  {
    title: 'Is cardiac sonography the right specialty for you?',
    preview: 'Cardiac sonographers (echocardiographers) have some of the highest salaries in the field — and some of the most demanding credentialing paths.',
    tip: 'Cardiac echo requires RDCS or CCI\'s RCCS credential. The physics and anatomy load is heavy. Pay premium: $5–15/hr above general sonography. ASE membership and echo-specific CME are worth it from day one.',
    articleSlug: 'cardiac-sonographer-training',
  },
  {
    title: 'What skills do sonography employers actually want in 2026?',
    preview: 'Hiring managers rank image optimization, protocol adherence, and communication above all. AI tool familiarity is now a differentiator, not a bonus.',
    tip: 'Top 5 skills employers flag: (1) image quality consistency, (2) protocol knowledge without prompting, (3) professional communication with referring MDs, (4) familiarity with AI measurement tools, (5) documentation accuracy.',
    articleSlug: 'sonographer-skills-employers-want',
  },
  {
    title: 'Can sonographers manage student loan debt effectively?',
    preview: 'PSLF eligibility covers most hospital-employed sonographers. After 10 years of public service payments, remaining federal loan balances are forgiven — tax-free.',
    tip: 'Hospital sonographers with federal loans should enroll in IDR plans and file PSLF employment certification forms annually. After 10 years, remaining balances are forgiven. Even partial PSLF is worth the paperwork.',
    articleSlug: 'sonographer-student-loan-debt',
  },
  {
    title: 'What is the obstetric sonography specialty path?',
    preview: 'OB/GYN sonography covers the full spectrum from first-trimester viability to complex fetal anatomy surveys. The ARDMS OB/GYN credential is the primary pathway.',
    tip: 'OB specialty path: RDMS (OB/GYN) credential + optional Fetal Echocardiography (FE) for high-acuity positions. MFM (maternal-fetal medicine) sonographers work with perinatologists — one of the highest-acuity and highest-paid OB roles.',
    articleSlug: 'obstetric-ultrasound-specialization',
  },
  {
    title: 'What are the best sonographer certification programs?',
    preview: 'ARDMS, CCI, and ARRT all offer sonography credentials — but they have different eligibility requirements, exam formats, and employer recognition levels.',
    tip: '<b>ARDMS RDMS</b> is the most widely recognized credential for diagnostic sonography. CCI RVT/RVS is preferred in vascular. ARRT(S) is accepted at many institutions but less common. Know which credential your target employer requires before you sit.',
    articleSlug: 'best-sonographer-certification-programs',
  },
  {
    title: 'How do sonographers advance to management?',
    preview: 'Most chief sonographer roles require 5+ years experience, a credential, and often a healthcare management certificate. The pay tradeoff is real — many managers earn less hourly than experienced staff.',
    tip: 'Management tracks: lead sonographer → chief sonographer → imaging manager → director. CRA (Certified Radiology Administrator) credential from AHRA is the management equivalent of ARDMS — worth getting if you go this route.',
    articleSlug: 'sonographer-advancement-to-management',
  },
  {
    title: 'What does a sonographer\'s benefits package look like?',
    preview: 'Health insurance, 401k matching, CME allowance, and PTO are the big four. Sign-on bonuses of $5k–$20k are now common in shortage markets.',
    tip: 'When evaluating offers: (1) health insurance premium share, (2) 401k match %, (3) CME allowance ($500–$2,000/yr is standard), (4) PTO accrual rate, (5) call pay structure. Benefits can represent $15k–$25k in additional compensation.',
    articleSlug: 'sonographer-employee-benefits-guide',
  },
  {
    title: 'Can sonographers work part-time or flex schedule?',
    preview: 'PRN and part-time positions exist at most hospitals, but they come with trade-offs: no benefits, less schedule control, and sometimes lower hourly rate than staff.',
    tip: 'PRN (per diem) pays a premium ($5–$15/hr) to compensate for no benefits. Part-time benefits eligibility varies by employer. Flex scheduling is more common in outpatient and imaging center settings than hospital-based roles.',
    articleSlug: 'sonographer-part-time-jobs-flexibility',
  },
  {
    title: 'What are the best online sonographer training courses?',
    preview: 'Most \'online sonographer training\' ads are scams. Legitimate sonography education requires clinical hours at accredited sites — but post-grad CME and exam prep are available fully online.',
    tip: 'For continuing ed: SDMS, AIUM, and Pegasus Lectures offer legitimate online CME. For exam prep: SonoSkills, Soundbytes, and Pegasus are widely used by new grads. ARDMS requires specific CME categories — check the current requirements before purchasing.',
    articleSlug: 'online-sonographer-training-courses',
  },
  {
    title: 'What\'s the real scope of telemedicine in sonography?',
    preview: 'Three teleultrasound models now exist: store-and-forward, real-time guidance, and robotic. Each has different reimbursement, liability, and credentialing implications.',
    tip: 'Remote guidance (synchronous teleultrasound) is deployed in rural EDs and international settings. Systems like Intouch Health and Proximie allow an experienced sonographer to guide a POCUS probe in real time via video. Credentialing standards are still being set.',
    articleSlug: 'sonographer-telemedicine-remote-ultrasound',
  },
  {
    title: 'Why choose sonography as a career?',
    preview: 'Strong job security, above-average pay without a 4-year degree requirement, and work that\'s genuinely diagnostic — not just task execution.',
    tip: 'The honest answer: sonography has real downsides (MSI risk, emotional weight of bad findings, on-call demand). But the combination of clinical impact, pay, and career flexibility is hard to match in allied health without a graduate degree.',
    articleSlug: 'why-choose-sonographer-career',
  },
  {
    title: 'How do sonographers find jobs when relocating?',
    preview: 'High-paying sonographer markets include San Jose, Seattle, New York, and Houston. Rural markets offer sign-on bonuses but slower career growth.',
    tip: 'Relocation strategy: target markets with shortage + high cost-of-living adjustment. Negotiate relocation reimbursement ($2,000–$7,500) and sign-on bonus separately — they\'re different line items and both are common in 2026.',
    articleSlug: 'sonographer-relocation-job-search',
  },
  {
    title: 'What do pediatric sonographers need to know?',
    preview: 'Pediatric sonography requires different probe selection, developmental anatomy knowledge, and patient communication skills. It\'s a subspecialty many underestimate.',
    tip: 'Key peds differences: high-frequency probes (12–18 MHz for neonates), DDH screening using Graf method, cranial ultrasound through the anterior fontanelle, and the ability to scan quickly on a moving, uncooperative patient.',
    articleSlug: 'pediatric-sonographer-requirements',
  },
  {
    title: 'What are the ethical dilemmas sonographers face?',
    preview: 'Incidental findings, patient disclosure, and scope-of-practice boundaries are the three most common ethical challenges — and most programs don\'t prepare you for them.',
    tip: 'The most common ethical bind: you see something significant that the ordering physician hasn\'t asked about. Protocol says don\'t interpret — but staying silent feels wrong. Know your lab\'s incidental findings policy before you need it.',
    articleSlug: 'sonographer-ethical-dilemmas',
  },
  {
    title: 'What professional organizations should sonographers join?',
    preview: 'SDMS is the largest, but AIUM, SVU, and ASE offer more specialty-specific CME, networking, and journal access. Dues are usually tax-deductible.',
    tip: 'SDMS: broadest coverage, good for general sonographers. SVU: vascular-focused, excellent CME library. AIUM: research-heavy, good for academic/POCUS roles. ASE: cardiac/echo. Student membership rates are a fraction of full dues.',
    articleSlug: 'sonographer-professional-organizations',
  },
  {
    title: 'How do sonographers maintain their CME requirements?',
    preview: 'ARDMS requires 30 credits per 3-year cycle. Free sources — AIUM, SVU webinars, SDMS modules — can cover most of your requirement at no cost.',
    tip: 'CME strategy: (1) bank free webinar credits from SDMS/AIUM/SVU, (2) attend one annual conference for bulk credits + networking, (3) track everything in ARDMS MyProfile. Don\'t let credits lapse — reinstatement is costly.',
    articleSlug: 'sonographer-continuing-education-credits',
  },
  {
    title: 'Should sonographers join a union?',
    preview: 'Unionized sonographers earn 8–15% more on average and have stronger job protections. But union flexibility is lower and advancement can be slower.',
    tip: 'Union contracts typically lock in pay scales, on-call limits, and floating restrictions. In shortage markets, non-union sonographers can negotiate comparable terms individually. Union advantage is strongest for entry-level and mid-career staff.',
    articleSlug: 'sonographer-union-jobs-2026',
  },
  {
    title: 'What are all the sonographer specializations?',
    preview: 'Beyond general RDMS, there are 9+ recognized sonography specializations — each with distinct credentials, salary, and demand profiles.',
    tip: 'Core specializations: Abdominal, OB/GYN, Vascular (RVT), Cardiac (RDCS), Breast, Pediatric, Musculoskeletal, Fetal Echo, and Neurosonology. Most sonographers hold 2–3 credentials. Cardiac and vascular command the highest pay.',
    articleSlug: 'sonographer-specializations-complete-guide',
  },
  {
    title: 'Can sonographers work in the military or VA?',
    preview: 'VA positions qualify for PSLF, federal benefits, and pension. OCONUS civilian contracts can add $30k–$50k in housing and COLA on top of base pay.',
    tip: 'Two tracks: active duty (Army 68W/Navy HM with US specialty) or civilian federal GS positions. VA GS-11 sonographer positions in HPSA areas often carry PSLF eligibility. Check USAJOBS with alert keywords: "diagnostic medical sonographer."',
    articleSlug: 'sonographer-military-career',
  },
  {
    title: 'How does sonographer license renewal work?',
    preview: 'ARDMS, CCI, and ARRT each have different renewal cycles, CME requirements, and audit procedures. Missing a deadline triggers costly reinstatement.',
    tip: 'ARDMS 3-year cycle: 30 CME credits + $110 renewal fee. Set a calendar reminder 6 months before expiration. Audit risk increases if you auto-submit — keep documentation for every credit. Lapsed credentials require reinstatement exams at some organizations.',
    articleSlug: 'sonographer-license-renewal',
  },
  {
    title: 'What are CE requirements by state for sonographers?',
    preview: 'Most states don\'t independently license sonographers — but 11 states do, and their CE requirements vary widely from ARDMS requirements.',
    tip: 'States with independent sonographer licensure: OR, NM, ND, TN, NH, NJ, TX, and a few others. If your state licenses separately, you may owe CE to both your credential body AND your state board. Check your state medical board for current requirements.',
    articleSlug: 'sonographer-ce-requirements-by-state',
  },
  {
    title: 'What is telemedicine doing to ultrasound jobs?',
    preview: 'Teleultrasound is creating new roles — not eliminating existing ones. Remote quality review, training, and guidance positions are emerging alongside traditional staff roles.',
    tip: 'Remote quality assurance (reviewing images for protocol compliance), teleultrasound coaching (guiding POCUS in real time), and PACS workflow optimization are the three emerging telesonography roles most accessible to experienced practitioners.',
    articleSlug: 'sonographer-technology-innovation-2026',
  },

  // ── Clinical tip hooks (no article) ─────────────────────────────────────────
  {
    title: 'The "superficial" femoral vein is actually deep',
    preview: 'DVT in the superficial femoral vein still requires anticoagulation — the name is misleading and has confused physicians and sonographers for decades.',
    tip: 'The <b>superficial femoral vein</b> is part of the deep venous system. DVT here carries the same PE risk as common femoral DVT. Never let the name mislead you or your ordering provider.',
  },
  {
    title: 'Angle correction matters more than you think',
    preview: 'Scanning at 70° introduces velocity errors of 30% or more. Most Doppler errors in practice come from uncorrected or over-corrected angles.',
    tip: 'Always angle-correct to <b>≤ 60°</b> for spectral Doppler velocity measurements. Angles above 60° introduce significant error and can falsely elevate or lower your PSV — making mild stenosis look severe.',
  },
  {
    title: 'ICA vs. ECA: the branch trick',
    preview: 'The ICA has no branches in the neck — if you see branches, you\'re in the ECA. Tapping the temporal artery confirms it instantly.',
    tip: '<b>ICA = no branches</b> in the neck. If you see branches, you\'re in the ECA. Tap the superficial temporal artery — the ECA waveform will bounce with each tap. The ICA won\'t respond.',
  },
  {
    title: 'Waveform morphology tells the whole story',
    preview: 'Triphasic, biphasic, or monophasic — the shape of the arterial waveform summarizes the vascular status proximal to your probe.',
    tip: '<b>Triphasic = normal</b> arterial resistance. Biphasic = mild disease or proximal dampening. Monophasic = significant proximal obstruction or high outflow resistance. Read the waveform before the velocity.',
  },
  {
    title: 'IVC diameter predicts volume status',
    preview: 'A collapsible IVC under 2.1 cm suggests low right atrial pressure. This is one of the most clinically impactful measurements you can provide.',
    tip: 'IVC diameter <b>< 2.1 cm</b> that collapses > 50% with inspiration suggests low right atrial pressure (< 5 mmHg). This is a critical finding for fluid management decisions — document the collapse response, not just the diameter.',
  },
  {
    title: 'Tardus-parvus: the indirect stenosis sign',
    preview: 'A slow-rising, rounded waveform downstream from a stenosis tells you there\'s a significant obstruction proximal — even if you can\'t visualize it directly.',
    tip: 'The <b>tardus-parvus</b> waveform — slow rise, rounded peak, low velocity — is a reliable indirect sign of significant proximal arterial obstruction. If you see it in the renal artery, look upstream for stenosis.',
  },
  {
    title: 'Chronic DVT looks completely different',
    preview: 'Acute DVT is anechoic and fresh. Chronic DVT is thick-walled, echogenic, and often has collaterals. Calling them the same can change anticoagulation decisions.',
    tip: 'Chronic DVT: thick echogenic walls, may not fully compress, often has collateral vessels. <b>Don\'t call it acute</b> without fresh, anechoic thrombus and a clinical history that fits. Chronic DVT often doesn\'t require new anticoagulation.',
  },
  {
    title: 'EDV is underappreciated in carotid stenosis',
    preview: 'End-diastolic velocity over 100 cm/s almost always means ≥70% ICA stenosis — independent of PSV. Most sonographers underuse this number.',
    tip: 'An <b>EDV > 100 cm/s</b> in the ICA almost always indicates ≥ 70% stenosis regardless of PSV. Pair EDV with the ICA/CCA ratio for the most reliable stenosis grading. PSV alone misses borderline cases.',
  },
  {
    title: 'Normal portal vein velocity: 15–25 cm/s',
    preview: 'Below 10 cm/s raises concern for portal hypertension. Above 30 cm/s may indicate an AV fistula. The number matters — not just the direction.',
    tip: 'Normal portal vein velocity: <b>15–25 cm/s</b>. < 10 cm/s → portal hypertension. > 30 cm/s → consider arteriovenous shunting. Always document velocity with respiratory variation — portal pulsatility suggests right heart failure.',
  },
  {
    title: 'Venous reflux: know the threshold',
    preview: 'Reflux lasting 0.5 seconds in superficial veins, 1.0 second in deep — these are the thresholds that define pathological reflux. The number matters for reports.',
    tip: '<b>Reflux > 0.5 sec</b> in superficial veins (GSV, SSV) is pathological. <b>> 1.0 sec</b> in the deep system. Always augment distally and release — don\'t rely on Valsalva alone for lower extremity reflux assessment.',
  },
  {
    title: 'Resistive Index > 0.70 in renal arteries',
    preview: 'Elevated RI in both kidneys points to parenchymal disease or obstruction. Elevated RI in a transplant is one of the first signs of rejection.',
    tip: 'Renal artery RI > <b>0.70</b> suggests increased parenchymal resistance — think hydronephrosis, transplant rejection, or medical renal disease. Always document RI in both kidneys and compare. Asymmetric RI elevation points to unilateral pathology.',
  },
  {
    title: 'Renal artery stenosis: the RAR threshold',
    preview: 'PSV > 180–200 cm/s at the renal artery origin is significant — but the renal-to-aortic ratio > 3.5 is the more specific criterion.',
    tip: 'Renal artery stenosis criteria: PSV > <b>180–200 cm/s</b> at origin OR <b>RAR > 3.5</b>. The RAR (renal-to-aortic ratio) adjusts for cardiac output variation. Both criteria together improve specificity for hemodynamically significant stenosis.',
  },
  {
    title: 'ABI > 1.3 is non-compressible — not normal',
    preview: 'Calcified vessels in diabetics won\'t compress at the ankle. An ABI over 1.3 is unreliable, not reassuring. Consider toe pressures instead.',
    tip: 'ABI > <b>1.3</b> = non-compressible arteries (calcification). This is NOT a normal result — it invalidates the ABI. Report it as non-compressible and recommend toe-brachial index, which is not affected by arterial calcification.',
  },
  {
    title: 'Popliteal vein is superficial to the artery',
    preview: 'The vein-artery relationship flips between the thigh and popliteal fossa. Forgetting this leads to compression errors and missed DVT.',
    tip: 'In the popliteal fossa: <b>vein is superficial</b> (anterior) to the artery. This is the opposite of the thigh arrangement. Remember "VAIN" — Vein is Anterior In the popliteal fossa. Compression should collapse the vein without compressing the artery.',
  },
];
