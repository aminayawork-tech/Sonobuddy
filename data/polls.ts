/**
 * Poll of the Day: one question per day, rotating through this list. The
 * server picks today's poll (see app/api/poll), so adding or editing polls
 * here reaches every app without a new build.
 *
 * Keep ids stable once a poll has run; votes are stored by id.
 * 2–5 options, short enough to fit on one line on a phone.
 */
export interface Poll {
  id: string;
  question: string;
  options: string[];
}

export const POLLS: Poll[] = [
  { id: 'scan-pain', question: 'Where does scanning hurt you most?', options: ['Right shoulder', 'Wrist', 'Neck', 'Lower back', 'All of the above 😩'] },
  { id: 'specialty', question: 'What do you scan most?', options: ['General / abdomen', 'OB/GYN', 'Cardiac / echo', 'Vascular', 'Still a student'] },
  { id: 'blank-measurement', question: 'Which normal value do you blank on most?', options: ['CBD', 'Endometrium', 'Thyroid', 'Carotid velocities', 'Kidney size'] },
  { id: 'years-scanning', question: 'How long have you been scanning?', options: ['Student', 'Under 2 years', '2–10 years', '10+ years'] },
  { id: 'full-bladder', question: 'How often do patients show up with an empty bladder?', options: ['Every day 😭', 'A few times a week', 'Rarely', 'I don’t do pelvic'] },
  { id: 'hardest-registry', question: 'Hardest registry exam?', options: ['SPI (physics)', 'Abdomen', 'OB/GYN', 'Vascular', 'Cardiac'] },
  { id: 'called-nurse', question: 'How often do patients call you a nurse?', options: ['Daily', 'Weekly', 'Sometimes', 'Never'] },
  { id: 'gender-question', question: '"Can you tell what it is?" Your honest reaction?', options: ['Love it 🥰', 'Depends on the day', 'Please let me finish 🙏', 'I don’t do OB'] },
  { id: 'shift-length', question: 'What’s your usual shift?', options: ['8 hours', '10 hours', '12 hours', 'PRN / it varies'] },
  { id: 'scan-position', question: 'Do you scan sitting or standing?', options: ['Sitting', 'Standing', 'Both', 'Whatever the room allows'] },
  { id: 'scanning-hand', question: 'Which hand do you scan with?', options: ['Right', 'Left', 'Both'] },
  { id: 'work-setting', question: 'Where do you work?', options: ['Hospital', 'Outpatient clinic', 'Physician office', 'Travel', 'Mobile'] },
  { id: 'on-call', question: 'Do you take call?', options: ['Yes, and I hate it', 'Yes, it’s fine', 'No', 'Used to'] },
  { id: 'favorite-exam', question: 'Favorite exam to do?', options: ['Anatomy scan', 'Echo', 'Carotid', 'RUQ', 'DVT'] },
  { id: 'least-favorite-exam', question: 'Least favorite exam?', options: ['Renal artery duplex', 'Portable in the ICU', 'Bariatric abdomen', 'Pediatric anything', 'Testicular'] },
  { id: 'ai-feelings', question: 'How do you feel about AI in ultrasound?', options: ['Excited', 'Curious', 'Nervous', 'Not worried'] },
  { id: 'travel-sono', question: 'Would you ever do travel sonography?', options: ['Already do', 'Someday', 'Maybe', 'Never'] },
  { id: 'next-credential', question: 'Next credential you want?', options: ['RVT', 'RDCS', 'OB/GYN', 'MSK', 'None, I’m done 😅'] },
  { id: 'gel-temp', question: 'Warm gel or cold gel?', options: ['Always warm 🔥', 'Whatever’s in the bottle', 'Cold builds character'] },
  { id: 'shoes', question: 'What’s on your feet at work?', options: ['Running shoes', 'Clogs', 'Sneakers', 'Whatever’s comfy'] },
  { id: 'burnout', question: 'How’s your energy this week?', options: ['Thriving ✨', 'Surviving', 'Running on coffee ☕', 'Need a vacation'] },
]
