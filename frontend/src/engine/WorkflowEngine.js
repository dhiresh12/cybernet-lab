export const WORKFLOW_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  RESET: 'reset',
};

export const STEP_STATE = {
  LOCKED: 'locked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  VERIFICATION_PENDING: 'verification_pending',
  VERIFIED: 'verified',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export function createWorkflowSession(labId, steps = []) {
  const firstRequired = steps.find(s => s.required !== false) || steps[0];
  return {
    labId,
    status: WORKFLOW_STATUS.NOT_STARTED,
    currentStepId: firstRequired ? firstRequired.stepId : null,
    completedStepIds: [],
    verifiedStepIds: [],
    failedStepIds: [],
    attempts: {},
    hintsUsed: 0,
    startedAt: null,
    lastActivityAt: null,
    completedAt: null,
    progress: 0,
    finalVerificationStatus: null,
    stepStates: buildInitialStepStates(steps),
  };
}

export function buildInitialStepStates(steps = []) {
  const map = {};
  steps.forEach((step, index) => {
    if (index === 0) {
      map[step.stepId] = STEP_STATE.AVAILABLE;
    } else {
      map[step.stepId] = STEP_STATE.LOCKED;
    }
  });
  return map;
}

export function advanceWorkflow(session, stepId, result) {
  if (!session || session.status !== WORKFLOW_STATUS.ACTIVE) return session;
  let next = { ...session, lastActivityAt: Date.now() };
  const currentState = session.stepStates?.[stepId];
  if (currentState === STEP_STATE.AVAILABLE || currentState === STEP_STATE.IN_PROGRESS || currentState === STEP_STATE.FAILED) {
    if (result?.passed) {
      next.verifiedStepIds = Array.from(new Set([...(session.verifiedStepIds || []), stepId]));
      next.completedStepIds = Array.from(new Set([...(session.completedStepIds || []), stepId]));
      next.stepStates = { ...session.stepStates, [stepId]: STEP_STATE.COMPLETED };
      next = unlockNextStep(next, stepId, session.steps);
    } else {
      next.stepStates = { ...session.stepStates, [stepId]: STEP_STATE.FAILED };
      next.attempts = { ...(session.attempts || {}), [stepId]: ((session.attempts || {})[stepId] || 0) + 1 };
    }
  }
  next.progress = calculateProgress(next);
  return next;
}

export function startWorkflow(session, steps = []) {
  if (!session) return null;
  const firstRequired = steps.find(s => s.required !== false) || steps[0];
  return {
    ...session,
    status: WORKFLOW_STATUS.ACTIVE,
    currentStepId: firstRequired ? firstRequired.stepId : session.currentStepId,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    stepStates: buildInitialStepStates(steps),
  };
}

export function resetWorkflow(session) {
  if (!session) return null;
  return {
    ...createWorkflowSession(session.labId, []),
    status: WORKFLOW_STATUS.RESET,
  };
}

export function useHint(session) {
  if (!session) return session;
  return {
    ...session,
    hintsUsed: (session.hintsUsed || 0) + 1,
    lastActivityAt: Date.now(),
  };
}

function unlockNextStep(session, completedStepId, steps = []) {
  const idx = steps.findIndex(s => s.stepId === completedStepId);
  const nextIdx = idx + 1;
  const nextStep = steps[nextIdx];
  if (!nextStep) return session;
  const updated = { ...session.stepStates };
  if (updated[nextStep.stepId] === STEP_STATE.LOCKED) {
    updated[nextStep.stepId] = STEP_STATE.AVAILABLE;
  }
  return {
    ...session,
    currentStepId: nextStep.stepId,
    stepStates: updated,
  };
}

function calculateProgress(session) {
  const total = session.steps?.length || 0;
  if (total === 0) return 0;
  return Math.round(((session.completedStepIds?.length || 0) / total) * 100);
}

export function getCurrentStep(session, steps = []) {
  if (!session || !steps.length) return null;
  return steps.find(s => s.stepId === session.currentStepId) || steps[0] || null;
}

export function isStepLocked(session, stepId) {
  if (!session || !session.stepStates) return true;
  return session.stepStates[stepId] === STEP_STATE.LOCKED;
}

export function canVerify(session, stepId) {
  if (!session || !session.stepStates) return false;
  const state = session.stepStates[stepId];
  return state === STEP_STATE.AVAILABLE || state === STEP_STATE.FAILED;
}

export default {
  WORKFLOW_STATUS,
  STEP_STATE,
  createWorkflowSession,
  buildInitialStepStates,
  advanceWorkflow,
  startWorkflow,
  resetWorkflow,
  useHint,
  getCurrentStep,
  isStepLocked,
  canVerify,
};