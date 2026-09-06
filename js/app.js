// ============================================
// app.js — Shared Utilities & Constants
// ============================================

const App = (() => {

  const SUBJECTS = [
    { id: 'math',      label: 'Mathematics',    emoji: '📐', color: 'blue',   desc: 'Algebra, Calculus, Statistics, Geometry' },
    { id: 'physics',   label: 'Physics',        emoji: '⚛️',  color: 'teal',   desc: 'Mechanics, Thermodynamics, Electromagnetism' },
    { id: 'chemistry', label: 'Chemistry',      emoji: '🧪', color: 'green',  desc: 'Organic, Inorganic, Physical Chemistry' },
    { id: 'biology',   label: 'Biology',        emoji: '🧬', color: 'green',  desc: 'Cell Biology, Genetics, Ecology' },
    { id: 'cs',        label: 'Computer Science',emoji: '💻', color: 'blue',   desc: 'Algorithms, Data Structures, AI/ML' },
    { id: 'history',   label: 'History',        emoji: '🏛️', color: 'gold',   desc: 'World History, Ancient Civilizations' },
    { id: 'literature',label: 'Literature',     emoji: '📖', color: 'purple', desc: 'Analysis, Poetry, World Literature' },
    { id: 'economics', label: 'Economics',      emoji: '📈', color: 'gold',   desc: 'Micro, Macro, Behavioral Economics' },
    { id: 'geography', label: 'Geography',      emoji: '🌍', color: 'teal',   desc: 'Physical Geography, Human Geography' },
    { id: 'languages', label: 'Languages',      emoji: '🗣️', color: 'rose',   desc: 'Grammar, Vocabulary, Writing Skills' },
    { id: 'engineering',label: 'Engineering',   emoji: '⚙️', color: 'blue',   desc: 'Civil, Mechanical, Electrical, AI' },
    { id: 'philosophy',label: 'Philosophy',     emoji: '🤔', color: 'purple', desc: 'Logic, Ethics, Epistemology' },
  ];

  const MODES = {
    socratic: {
      id: 'socratic',
      label: 'Teach Me',
      icon: '🎓',
      description: 'The AI acts as your Socratic tutor — guiding you through questions, never giving direct answers. You learn by thinking.',
      systemPrompt: `You are a Socratic AI tutor. Your role is to teach through guided questioning — NEVER give direct answers. Instead:
1. Ask one probing question at a time to help the student discover the answer themselves.
2. When the student answers, acknowledge what's correct, then ask a deeper follow-up question.
3. If the student is stuck, give a small hint, then ask again.
4. Break complex topics into smaller digestible steps through questions.
5. Celebrate small wins. Be encouraging and patient.
6. NEVER say "The answer is..." — guide them to it.
Format: Keep responses concise (2-4 sentences + your question). Use plain text, no heavy markdown.`
    },
    direct: {
      id: 'direct',
      label: 'Answer Mode',
      icon: '💡',
      description: 'The AI gives you clear, direct answers with full explanations. Perfect for quick understanding or exam prep.',
      systemPrompt: `You are a knowledgeable AI tutor giving clear, direct answers. Your role is to:
1. Answer questions directly and accurately.
2. Explain concepts clearly with examples and analogies.
3. Break down complex topics step by step.
4. Highlight key points and important takeaways.
5. Suggest related topics the student might want to explore.
Be thorough but not overly long. Use simple formatting: bold key terms, use numbered steps when helpful. Be friendly and encouraging.`
    }
  };

  const STARTER_QUESTIONS = {
    math: ['Can you help me understand derivatives?', 'What is the Pythagorean theorem?', 'How do I solve quadratic equations?'],
    physics: ['What is Newton\'s second law?', 'How does gravity work?', 'What is the difference between speed and velocity?'],
    chemistry: ['What is covalent bonding?', 'How does the periodic table work?', 'What is pH and why does it matter?'],
    biology: ['How does DNA replication work?', 'What is natural selection?', 'How do cells produce energy?'],
    cs: ['What is recursion?', 'How do binary search trees work?', 'What is Big O notation?'],
    history: ['What caused World War I?', 'How did the Renaissance begin?', 'What was the significance of the French Revolution?'],
    literature: ['How do I analyze a poem?', 'What makes a story a tragedy?', 'What is symbolism in literature?'],
    economics: ['What is supply and demand?', 'What causes inflation?', 'How do interest rates affect the economy?'],
    geography: ['What causes earthquakes?', 'How are mountains formed?', 'What is climate vs weather?'],
    languages: ['How do I improve my grammar?', 'What are the rules for using articles?', 'How do I write a strong essay?'],
    engineering: ['What is a Fourier transform?', 'How do semiconductors work?', 'What is the difference between AC and DC?'],
    philosophy: ['What is the trolley problem?', 'What did Socrates believe?', 'What is the difference between ethics and morality?'],
  };

  function getSubjects() { return SUBJECTS; }
  function getModes() { return MODES; }
  function getStarters(subjectId) { return STARTER_QUESTIONS[subjectId] || []; }

  function formatDate(iso) {
    if (!iso) return 'Never';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function xpToLevel(xp) {
    const lvl = Math.floor(Math.sqrt(xp / 50)) + 1;
    return Math.min(lvl, 50);
  }

  function levelXpRange(level) {
    const prev = Math.pow(level - 1, 2) * 50;
    const next = Math.pow(level, 2) * 50;
    return { prev, next };
  }

  return { getSubjects, getModes, getStarters, formatDate, timeAgo, xpToLevel, levelXpRange };
})();