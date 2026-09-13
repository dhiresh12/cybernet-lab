const NodeCache = require('node-cache');

const labs = new Map();
const devices = new Map();
const sessions = new Map();
const labCache = new Map();
const userLabState = new Map();
const tickets = new Map();
const learnerProgress = new Map();
const dailyMissions = new Map();
const retrievalQueue = new Map();
const evidence = new Map();
const failureLabs = new Map();
const troubleshootingSessions = new Map();
const interviewQuestions = new Map();
const researchExperiments = new Map();
const portfolioArtifacts = new Map();
const studyPlanner = new Map();
const skillGraph = new Map();
const debriefs = new Map();
const courses = new Map();
const courseEnrollments = new Map();
const researchProjects = new Map();
const researchNotebooks = new Map();
const innovationChallenges = new Map();
const interviewSessions = new Map();
const interviewHistory = new Map();
const interviewWeakAreas = new Map();

module.exports = {
  labs, devices, sessions, labCache, userLabState, tickets, learnerProgress,
  dailyMissions, retrievalQueue, evidence, failureLabs, troubleshootingSessions,
  interviewQuestions, researchExperiments, portfolioArtifacts, studyPlanner,
  skillGraph, debriefs, courses, courseEnrollments, researchProjects,
  researchNotebooks, innovationChallenges, interviewSessions, interviewHistory,
  interviewWeakAreas
};
