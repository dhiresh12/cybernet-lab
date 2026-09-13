const { v4: uuidv4 } = require('uuid');
const { learnerProgress, retrievalQueue, studyPlanner, skillGraph, dailyMissions, evidence } = require('../state/state');

const SPACED_INTERVALS = [0, 1, 3, 7, 14, 30];
const STUDY_MODES = {
  light: { id: 'light', name: 'Light', minMinutes: 45, maxMinutes: 60, blocks: ['A', 'B', 'C', 'D'] },
  normal: { id: 'normal', name: 'Normal', minMinutes: 90, maxMinutes: 120, blocks: ['A', 'B', 'C', 'D', 'E', 'F'] },
  deep: { id: 'deep', name: 'Deep', minMinutes: 150, maxMinutes: 180, blocks: ['A', 'B', 'C', 'D', 'E', 'F', 'A', 'B', 'C', 'D', 'E', 'F'] }
};

const BLOCK_DEFINITIONS = {
  A: { name: 'Warm-up & Recall', activity: 'Answer 3-5 retrieval questions from due set.' },
  B: { name: 'Theory', activity: 'Read theory, watch demonstration, or attend micro-lesson (20 min).' },
  C: { name: 'Hands-on', activity: 'Complete lab or guided practice (35-45 min).' },
  D: { name: 'Troubleshoot', activity: 'Identify and resolve injected failure or analyze unexpected output (10-15 min).' },
  E: { name: 'Explain', activity: 'Explain the concept in your own words to a peer or record voice note (10 min).' },
  F: { name: 'Learning Log', activity: 'Write learning log entry: confirmed, open question, next step (5 min).' }
};

const WEEKLY_SCHEDULE = {
  monday: { theme: 'new_concept', activities: ['retrieval', 'theory', 'guided_lab', 'learning_log'] },
  tuesday: { theme: 'independent_lab', activities: ['retrieval', 'independent_lab', 'verification', 'learning_log'] },
  wednesday: { theme: 'analysis', activities: ['retrieval', 'analysis', 'troubleshoot', 'learning_log'] },
  thursday: { theme: 'mixed_lab', activities: ['retrieval', 'mixed_lab', 'verification', 'learning_log'] },
  friday: { theme: 'failure_lab', activities: ['retrieval', 'failure_lab', 'interview', 'learning_log'] },
  saturday: { theme: 'mini_project', activities: ['retrieval', 'mini_project', 'debrief', 'learning_log'] },
  sunday: { theme: 'retrieval_review', activities: ['retrieval', 'review', 'plan_week', 'learning_log'] }
};

function getLearnerIdStr(learnerId) {
  return String(learnerId);
}

function getRetrievalQueue(learnerId) {
  const key = getLearnerIdStr(learnerId);
  return retrievalQueue.get(key) || [];
}

function saveRetrievalQueue(learnerId, queue) {
  retrievalQueue.set(getLearnerIdStr(learnerId), queue);
}

function getSkillGraphForLearner(learnerId) {
  const key = getLearnerIdStr(learnerId);
  const existing = skillGraph.get(key);
  if (!existing) {
    const graph = { learnerId: key, skills: {}, mastery: {}, lastUpdated: Date.now() };
    skillGraph.set(key, graph);
    return graph;
  }
  return existing;
}

function getProgressForLearner(learnerId) {
  const key = getLearnerIdStr(learnerId);
  const progress = learnerProgress.get(key);
  if (!progress) {
    return { learnerId: key, completedLabs: [], currentLab: null, skillMastery: {}, retrieval: {}, startedAt: Date.now() };
  }
  return progress;
}

function calculateNextDue(currentLevel, correct) {
  if (!correct) return { intervalIndex: 0, nextDueAt: Date.now() };
  const level = Math.min(currentLevel + 1, SPACED_INTERVALS.length - 1);
  const intervalDays = SPACED_INTERVALS[level];
  return { intervalIndex: level, nextDueAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000 };
}

function addRetrievalQuestion(learnerId, question) {
  const queue = getRetrievalQueue(learnerId);
  const entry = {
    id: uuidv4(),
    question: question.question,
    options: question.options || [],
    correctAnswer: question.correctAnswer,
    topic: question.topic,
    difficulty: question.difficulty || 'medium',
    intervalIndex: 0,
    dueAt: Date.now(),
    answered: false,
    correct: null,
    answeredAt: null,
    createdAt: Date.now()
  };
  queue.push(entry);
  saveRetrievalQueue(learnerId, queue);
  return entry;
}

function getRetrievalDue(learnerId) {
  const queue = getRetrievalQueue(learnerId);
  const now = Date.now();
  return queue.filter(q => q.dueAt <= now && !q.answered).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    topic: q.topic,
    difficulty: q.difficulty,
    dueAt: q.dueAt,
    answered: q.answered,
    correct: q.correct
  }));
}

function getRetrievalCalendar(learnerId, days = 30) {
  const queue = getRetrievalQueue(learnerId);
  const now = Date.now();
  const calendar = [];
  for (let d = 0; d < days; d++) {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() + d);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const due = queue.filter(q => q.dueAt >= dayStart.getTime() && q.dueAt <= dayEnd.getTime() && !q.answered);
    calendar.push({
      date: dayStart.toISOString().slice(0, 10),
      dayOfWeek: dayStart.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      count: due.length,
      questions: due.map(q => ({ id: q.id, question: q.question, topic: q.topic }))
    });
  }
  return calendar;
}

function answerRetrievalQuestion(learnerId, questionId, selectedAnswer) {
  const queue = getRetrievalQueue(learnerId);
  const entry = queue.find(q => q.id === questionId);
  if (!entry) {
    return { error: 'Question not found' };
  }
  entry.answered = true;
  entry.selectedAnswer = selectedAnswer;
  entry.correct = selectedAnswer === entry.correctAnswer;
  entry.answeredAt = Date.now();
  const next = calculateNextDue(entry.intervalIndex, entry.correct);
  entry.intervalIndex = next.intervalIndex;
  entry.nextDueAt = next.nextDueAt;
  saveRetrievalQueue(learnerId, queue);
  return {
    id: entry.id,
    correct: entry.correct,
    correctAnswer: entry.correctAnswer,
    explanation: entry.explanation,
    nextDueAt: entry.nextDueAt
  };
}

function generateDailyStudyPlan(learnerId) {
  const progress = getProgressForLearner(learnerId);
  const today = new Date().toISOString().slice(0, 10);
  const dayOfWeek = new Date().getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayTheme = WEEKLY_SCHEDULE[dayNames[dayOfWeek]] || WEEKLY_SCHEDULE.monday;

  const mode = (progress.studyMode || 'normal');
  const modeConfig = STUDY_MODES[mode] || STUDY_MODES.normal;
  const totalMinutes = modeConfig.minMinutes + Math.floor(Math.random() * (modeConfig.maxMinutes - modeConfig.minMinutes));

  const blocks = modeConfig.blocks.map((blockId, index) => {
    const def = BLOCK_DEFINITIONS[blockId];
    const activity = def.activity.replace(/\([^)]+\)/, `(${mode === 'light' ? '10' : mode === 'deep' ? '40' : '20'} min)`);
    return {
      id: blockId,
      name: def.name,
      activity,
      duration: mode === 'light' ? Math.max(5, Math.floor((def.activity.match(/\((\d+)[-]?\d*\s*min\)/)?.[1] || 10) * 0.6)) :
                mode === 'deep' ? Math.floor((def.activity.match(/\((\d+)[-]?\d*\s*min\)/)?.[1] || 20) * 1.5) :
                parseInt(def.activity.match(/\((\d+)[-]?(\d+)\s*min\)/)?.[1] || 15),
      completed: false
    };
  });

  const retrievalCount = Math.max(3, Math.floor(blocks.filter(b => b.id === 'A').length > 0 ? 5 : 3));
  const dueQuestions = getRetrievalDue(learnerId);
  const retrievalQuestions = dueQuestions.slice(0, retrievalCount);

  return {
    learnerId: getLearnerIdStr(learnerId),
    date: today,
    dayOfWeek: dayNames[dayOfWeek],
    theme: todayTheme.theme,
    mode,
    totalMinutes,
    blocks,
    retrievalQuestions,
    fatigueAlerts: [],
    status: 'pending'
  };
}

function updateStudyPlanBlock(learnerId, planDate, blockId, completed) {
  const key = getLearnerIdStr(learnerId);
  const existing = studyPlanner.get(key);
  if (!existing || !Array.isArray(existing.plans)) {
    const plan = { date: planDate, blocks: {} };
    plan.blocks[blockId] = { completed, completedAt: completed ? Date.now() : null };
    if (!existing) {
      studyPlanner.set(key, { learnerId: key, plans: [plan], sessions: [], updatedAt: Date.now() });
    } else {
      existing.plans = [plan];
      existing.updatedAt = Date.now();
      studyPlanner.set(key, existing);
    }
    return plan;
  }
  const plan = existing.plans.find(p => p.date === planDate);
  if (plan) {
    plan.blocks[blockId] = { completed, completedAt: completed ? Date.now() : null };
  } else {
    const newPlan = { date: planDate, blocks: { [blockId]: { completed, completedAt: completed ? Date.now() : null } } };
    existing.plans.push(newPlan);
  }
  existing.updatedAt = Date.now();
  studyPlanner.set(key, existing);
  return plan || existing.plans[existing.plans.length - 1];
}

function getStudyPlan(learnerId, date) {
  const key = getLearnerIdStr(learnerId);
  const existing = studyPlanner.get(key);
  if (!existing || !Array.isArray(existing.plans)) return null;
  return existing.plans.find(p => p.date === date) || null;
}

function getWeeklySchedule(learnerId) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return dayNames.map((dayName, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    const plan = getStudyPlan(learnerId, date.toISOString().slice(0, 10));
    const theme = WEEKLY_SCHEDULE[dayName];
    return {
      day: dayName,
      date: date.toISOString().slice(0, 10),
      theme: theme.theme,
      activities: theme.activities,
      plan: plan || null,
      isToday: date.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)
    };
  });
}

function detectFatigue(learnerId, sessionData) {
  const alerts = [];
  const progress = getProgressForLearner(learnerId);
  const ev = Array.from(evidence.values()).filter(e => e.learnerId === String(learnerId));
  const recentEvidence = ev.filter(e => Date.now() - (e.createdAt || 0) < 30 * 60 * 1000);

  const resetCount = recentEvidence.filter(e => e.eventType === 'reset').length;
  if (resetCount >= 3) {
    alerts.push({ type: 'repeated_resets', severity: 'high', message: `3+ resets in last 30 min. Consider a 10-minute break.` });
  }

  const hintCount = recentEvidence.filter(e => e.hint && e.hint.length > 0).length;
  if (hintCount >= 5) {
    alerts.push({ type: 'frequent_hints', severity: 'medium', message: '5+ hint requests in last 30 min. Review fundamentals before continuing.' });
  }

  const failedSteps = recentEvidence.filter(e => e.eventType === 'verification' && !e.passed);
  if (failedSteps.length >= 4) {
    alerts.push({ type: 'slow_completion', severity: 'medium', message: 'Multiple verification failures. Try a simpler lab or review theory.' });
  }

  const lowConfidence = recentEvidence.filter(e => e.eventType === 'confidence' && e.score !== null && e.score < 3);
  if (lowConfidence.length >= 2) {
    alerts.push({ type: 'low_confidence', severity: 'medium', message: 'Low confidence ratings recorded. Take a break and revisit with fresh eyes.' });
  }

  const wrongAnswers = recentEvidence.filter(e => e.eventType === 'retrieval' && e.passed === false);
  if (wrongAnswers.length >= 3) {
    alerts.push({ type: 'wrong_answers', severity: 'low', message: 'Several retrieval questions missed. Review these topics tomorrow.' });
  }

  if (sessionData?.durationMinutes >= 120) {
    alerts.push({ type: 'long_session', severity: 'medium', message: 'Session exceeded 2 hours. Take a 15-minute break to maintain retention.' });
  }

  return {
    learnerId: getLearnerIdStr(learnerId),
    fatigueScore: Math.min(alerts.length, 5),
    alerts,
    recommendation: alerts.length >= 3 ? 'Take a 15-minute break or end session.' :
                    alerts.length >= 1 ? 'Consider a short 5-minute break.' : 'No fatigue detected. Continue studying.',
    timestamp: Date.now()
  };
}

function identifyWeakSkills(learnerId) {
  const graph = getSkillGraphForLearner(learnerId);
  const progress = getProgressForLearner(learnerId);
  const ev = Array.from(evidence.values()).filter(e => e.learnerId === String(learnerId));

  const skillPerformance = {};
  for (const [skillId, skillData] of Object.entries(graph.skills || {})) {
    const skillEv = ev.filter(e => e.tags?.includes(skillId) || e.labId === skillId);
    const failures = skillEv.filter(e => e.eventType === 'verification' && !e.passed).length;
    const attempts = skillEv.filter(e => e.eventType === 'verification').length;
    skillPerformance[skillId] = {
      mastery: skillData.mastery || 0,
      attempts,
      failures,
      failureRate: attempts > 0 ? failures / attempts : 0
    };
  }

  const weakSkills = Object.entries(skillPerformance)
    .filter(([, data]) => data.mastery < 0.6 || data.failureRate > 0.4)
    .sort((a, b) => a[1].failureRate - b[1].failureRate || a[1].mastery - b[1].mastery)
    .slice(0, 5)
    .map(([skillId, data]) => ({
      skillId,
      mastery: data.mastery,
      failureRate: data.failureRate,
      recommendation: data.failureRate > 0.4 ?
        `Practice ${skillId} with guided labs. Review common mistakes before retrying.` :
        `Review ${skillId} theory and attempt a simpler lab.`
    }));

  return {
    learnerId: getLearnerIdStr(learnerId),
    weakSkills,
    totalSkillsAssessed: Object.keys(skillPerformance).length,
    timestamp: Date.now()
  };
}

function getRetrievalCalendarForLearner(learnerId, days = 30) {
  return getRetrievalCalendar(learnerId, days);
}

function seedStaticData() {
  const allQuestions = [
    { question: 'What is the difference between a switch and a hub?', options: ['Switch operates L2, Hub operates L1', 'Switch operates L1, Hub operates L2', 'Both are L1', 'Switch is wireless'], correctAnswer: 'Switch operates L2, Hub operates L1', topic: 'Switching', difficulty: 'beginner' },
    { question: 'What is a VLAN?', options: ['Virtual LAN', 'Very Large Area Network', 'Virtual Link', 'None'], correctAnswer: 'Virtual LAN', topic: 'Switching', difficulty: 'beginner' },
    { question: 'What is the subnet mask for /24?', options: ['255.255.255.0', '255.255.0.0', '255.0.0.0', '255.255.255.128'], correctAnswer: '255.255.255.0', topic: 'IPv4', difficulty: 'beginner' },
    { question: 'What does OSPF use to calculate best path?', options: ['Cost based on bandwidth', 'Hop count', 'Delay', 'Load'], correctAnswer: 'Cost based on bandwidth', topic: 'Routing', difficulty: 'intermediate' },
    { question: 'What is a BGP AS number?', options: ['Identifies an autonomous system', 'Identifies a VLAN', 'Identifies a subnet', 'Identifies a host'], correctAnswer: 'Identifies an autonomous system', topic: 'Routing', difficulty: 'intermediate' },
    { question: 'Explain NAT types: static, dynamic, PAT.', options: ['Static: 1:1, Dynamic: pool, PAT: many:1', 'Static: many:1, Dynamic: 1:1, PAT: pool', 'All are 1:1', 'PAT is dynamic only'], correctAnswer: 'Static: 1:1, Dynamic: pool, PAT: many:1', topic: 'Services', difficulty: 'intermediate' },
    { question: 'What is an ACL and where is it applied?', options: ['Filters traffic; applied on interfaces', 'Assigns IP addresses', 'Routes packets', 'Encrypts traffic'], correctAnswer: 'Filters traffic; applied on interfaces', topic: 'Security', difficulty: 'intermediate' },
    { question: 'What is the EIGRP Feasibility Condition?', options: ['RD < FD of successor', 'AD < FD', 'Metric < bandwidth', 'Hop count < 255'], correctAnswer: 'RD < FD of successor', topic: 'Routing', difficulty: 'advanced' },
    { question: 'Explain BGP route reflection.', options: ['Reflects routes from clients to non-clients', 'Stores all routes in a reflector', 'Sends routes to all peers', 'Replaces full mesh'], correctAnswer: 'Reflects routes from clients to non-clients', topic: 'Routing', difficulty: 'advanced' },
    { question: 'What is a TCP SYN flood?', options: ['DoS attack exhausting connection resources', 'Normal TCP behavior', 'UDP attack', 'ICMP flood'], correctAnswer: 'DoS attack exhausting connection resources', topic: 'Security', difficulty: 'intermediate' }
  ];

  const learners = ['learner-study-1', 'learner-study-2', 'learner-study-3'];
  learners.forEach(learnerId => {
    const queue = retrievalQueue.get(learnerId) || [];
    if (queue.length === 0) {
      allQuestions.forEach(q => {
        queue.push({
          id: uuidv4(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topic: q.topic,
          difficulty: q.difficulty,
          intervalIndex: 0,
          dueAt: Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
          answered: false,
          correct: null,
          answeredAt: null,
          createdAt: Date.now()
        });
      });
      retrievalQueue.set(learnerId, queue);
    }
  });
}

module.exports = {
  STUDY_MODES,
  BLOCK_DEFINITIONS,
  WEEKLY_SCHEDULE,
  SPACED_INTERVALS,
  addRetrievalQuestion,
  getRetrievalDue,
  answerRetrievalQuestion,
  getRetrievalCalendar: getRetrievalCalendarForLearner,
  generateDailyStudyPlan,
  updateStudyPlanBlock,
  getStudyPlan,
  getWeeklySchedule,
  detectFatigue,
  identifyWeakSkills,
  seedStaticData
};
