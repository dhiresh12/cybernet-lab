# CyberNet Lab — API Documentation

**Base URL:** `http://localhost:3000/api`  
**Protocol:** REST (JSON) + WebSocket  
**Version:** 4.0.0  
**Authentication:** None (development mode); production requires auth middleware

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Labs](#2-labs)
3. [Progress](#3-progress)
4. [Tickets](#4-tickets)
5. [Roadmap](#5-roadmap)
6. [Daily Missions](#6-daily-missions)
7. [Retrieval Center](#7-retrieval-center)
8. [Evidence](#8-evidence)
9. [Failure Labs](#9-failure-labs)
10. [Troubleshooting Coach](#10-troubleshooting-coach)
11. [Interview Room](#11-interview-room)
12. [Research Lab](#12-research-lab)
13. [Portfolio](#13-portfolio)
14. [Study Planner](#14-study-planner)
15. [Skill Graph](#15-skill-graph)
16. [Debrief](#16-debrief)
17. [Courses](#17-courses)
18. [WebSocket API](#18-websocket-api)
19. [Error Handling](#19-error-handling)
20. [Rate Limiting](#20-rate-limiting)

---

## 1. Health Check

### `GET /api/health`

Returns the backend health status.

**Response:**
```json
{
  "status": "ok",
  "version": "4.0.0",
  "service": "cybernet-lab-backend",
  "websocket": "available",
  "timestamp": 1699123456789
}
```

---

## 2. Labs

### `GET /api/labs`

Returns a list of all non-quarantined labs.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter by category |
| `level` | string | Filter by level (basic, medium, advanced) |

**Response:**
```json
[
  {
    "id": "LAB-001",
    "title": "Configure a Small Office LAN",
    "category": "Switching",
    "level": "basic",
    "time": "30 minutes"
  }
]
```

### `GET /api/labs/:id`

Returns a single lab by ID. Returns 404 if quarantined.

**Response:**
```json
{
  "id": "LAB-001",
  "slug": "small-office-lan",
  "title": "Configure a Small Office LAN",
  "category": "Switching",
  "level": "basic",
  "time": "30 minutes",
  "version": 1,
  "objectives": ["Configure IP addresses", "Verify connectivity"],
  "scenario": "You are a network engineer...",
  "prerequisites": [],
  "required": true,
  "topology": { ... },
  "initialState": { ... },
  "steps": [ ... ],
  "troubleshooting": { ... },
  "knowledgeCheck": [ ... ]
}
```

### `POST /api/labs/:id/start`

Starts a new lab session. Rate limited: max 3 per minute per IP.

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "labState": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "labId": "LAB-001",
    "currentStep": 0,
    "completedSteps": [],
    "score": 0,
    "hintsUsed": 0,
    "startTime": 1699123456789,
    "deviceStates": [],
    "topology": { "nodes": [], "edges": [] },
    "stepOutputs": {}
  }
}
```

### `GET /api/labs/:id/sessions/:sessionId`

Returns the active lab session state.

**Response:**
```json
{
  "sessionId": "550e8400-...",
  "labId": "LAB-001",
  "labState": { ... }
}
```

### `DELETE /api/labs/:id/sessions/:sessionId`

Resets (deletes) an active lab session.

**Response:**
```json
{
  "reset": true,
  "sessionId": "550e8400-..."
}
```

### `GET /api/labs/:id/state`

Returns saved learner state for a lab.

**Response:**
```json
{
  "labId": "LAB-001",
  "completedSteps": ["step-1", "step-2"],
  "score": 20,
  "currentStep": 2,
  "savedAt": 1699123456789
}
```

### `PUT /api/labs/:id/state`

Saves learner state for a lab.

**Request Body:**
```json
{
  "completedSteps": ["step-1", "step-2"],
  "score": 20,
  "currentStep": 2
}
```

**Response:**
```json
{
  "saved": true,
  "state": { ... }
}
```

### `POST /api/labs/:id/debrief/:learnerId`

Creates or updates a debrief for a lab.

**Request Body:**
```json
{
  "problem": "What was the initial problem?",
  "prediction": "I predicted that...",
  "configuration": "The configuration I used was...",
  "evidence": "The evidence showed...",
  "failures": "I failed when...",
  "failureCause": "The cause was...",
  "helpfulCommands": ["show ip interface brief", "ping"],
  "realWorldApplication": "This applies to...",
  "conceptExplanation": "The key concept is..."
}
```

**Response:**
```json
{
  "id": "debrief-uuid",
  "learnerId": "learner-123",
  "labId": "LAB-001",
  "problem": "...",
  "completed": true,
  "createdAt": 1699123456789,
  "updatedAt": 1699123456789
}
```

### `GET /api/labs/:labId/debrief/:learnerId`

Returns a debrief for a lab.

**Response:**
```json
{
  "id": "debrief-uuid",
  "learnerId": "learner-123",
  "labId": "LAB-001",
  "problem": "...",
  "completed": true
}
```

### `GET /api/progress`

Returns all learner lab states.

**Response:**
```json
[
  {
    "labId": "LAB-001",
    "completedSteps": ["step-1"],
    "score": 10,
    "savedAt": 1699123456789
  }
]
```

---

## 3. Progress

### `GET /api/progress/:learnerId`

Returns learner progress.

**Response:**
```json
{
  "learnerId": "learner-123",
  "completedLabs": ["LAB-001", "LAB-002"],
  "currentLab": "LAB-003",
  "skillMastery": {},
  "retrieval": {},
  "startedAt": 1699123456789,
  "lastActivityAt": 1699123456789
}
```

### `GET /api/progress/:learnerId/lab/:labId`

Returns status for a specific lab.

**Response:**
```json
{
  "learnerId": "learner-123",
  "labId": "LAB-001",
  "status": "complete",
  "completed": true,
  "lockReason": null
}
```

**Status values:** `complete`, `in_progress`, `available`, `locked`

### `POST /api/progress/:learnerId/start/:labId`

Starts a lab for a learner.

**Response:**
```json
{
  "success": true,
  "progress": {
    "learnerId": "learner-123",
    "completedLabs": [],
    "currentLab": "LAB-001"
  }
}
```

### `POST /api/progress/:learnerId/complete/:labId`

Completes a lab for a learner. Requires completion contract.

**Request Body:**
```json
{
  "theoryComplete": true,
  "predictionComplete": true,
  "actionsComplete": true,
  "verificationPassed": true,
  "troubleshootingComplete": true,
  "debriefComplete": true
}
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "learnerId": "learner-123",
    "completedLabs": ["LAB-001"],
    "currentLab": null
  }
}
```

### `GET /api/progress/:learnerId/available`

Returns labs available to the learner.

**Response:**
```json
[
  {
    "id": "LAB-002",
    "title": "VLAN Configuration",
    "category": "Switching",
    "level": "intermediate",
    "status": "available"
  }
]
```

### `GET /api/progress/:learnerId/locked`

Returns locked labs with reasons.

**Response:**
```json
[
  {
    "id": "LAB-003",
    "title": "OSPF Configuration",
    "category": "Routing",
    "level": "advanced",
    "status": "locked",
    "lockReason": "Complete LAB-002 first"
  }
]
```

---

## 4. Tickets

### `POST /api/tickets`

Creates a new ticket. Sensitive fields are encrypted at rest.

**Request Body:**
```json
{
  "labId": "LAB-001",
  "issueType": "configuration_error",
  "description": "The router is not routing between VLANs.",
  "reportedBy": "learner-123",
  "severity": "medium",
  "impactedDevices": ["R1"],
  "evidence": [],
  "tags": ["vlan", "routing"]
}
```

**Valid issue types:** `configuration_error`, `verification_failure`, `connectivity_issue`, `other`

**Valid statuses:** `open`, `in_progress`, `resolved`

**Response (201 Created):**
```json
{
  "id": "ticket-uuid",
  "labId": "LAB-001",
  "issueType": "configuration_error",
  "description": "The router is not routing between VLANs.",
  "reportedBy": "learner-123",
  "status": "open",
  "severity": "medium",
  "impactedDevices": ["R1"],
  "evidence": [],
  "investigationSteps": [],
  "tags": ["vlan", "routing"],
  "createdAt": 1699123456789,
  "updatedAt": 1699123456789
}
```

### `GET /api/tickets`

Returns tickets with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `labId` | string | Filter by lab ID |
| `status` | string | Filter by status |
| `reportedBy` | string | Filter by reporter |
| `assignedTo` | string | Filter by assignee |
| `severity` | string | Filter by severity |
| `includeResolved` | boolean | Include resolved tickets |
| `page` | number | Page number (default 1) |
| `limit` | number | Items per page (max 100, default 50) |
| `sortBy` | string | Sort field (default: `createdAt`) |
| `sortOrder` | string | `asc` or `desc` (default: `desc`) |

**Response:**
```json
{
  "tickets": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10,
    "totalPages": 1
  }
}
```

### `GET /api/tickets/:id`

Returns a single ticket by ID.

**Response:**
```json
{
  "id": "ticket-uuid",
  "labId": "LAB-001",
  "issueType": "configuration_error",
  "description": "The router is not routing between VLANs.",
  "reportedBy": "learner-123",
  "status": "open",
  ...
}
```

### `GET /api/tickets/stats`

Returns ticket statistics.

**Response:**
```json
{
  "total": 10,
  "open": 5,
  "inProgress": 3,
  "resolved": 2,
  "bySeverity": {
    "low": 2,
    "medium": 5,
    "high": 3
  },
  "byLab": {
    "LAB-001": 3,
    "LAB-002": 2
  },
  "recentTickets": [ ... ]
}
```

### `GET /api/tickets/search`

Search tickets by query string.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `q` | string | Search query (max 200 chars) |

**Response:**
```json
{
  "tickets": [ ... ],
  "count": 3
}
```

### `PUT /api/tickets/:id/status`

Updates ticket status.

**Request Body:**
```json
{
  "status": "in_progress"
}
```

### `PUT /api/tickets/:id`

Updates ticket fields.

**Request Body:**
```json
{
  "issueType": "connectivity_issue",
  "description": "Updated description",
  "severity": "high",
  "assignedTo": "engineer-1",
  "notes": "Investigating...",
  "evidence": [],
  "impactedDevices": ["R1", "SW1"],
  "investigationSteps": [],
  "verificationSteps": [],
  "tags": ["vlan"]
}
```

### `POST /api/tickets/:id/evidence`

Adds evidence to a ticket.

**Request Body:**
```json
{
  "type": "screenshot",
  "data": "base64-encoded-image",
  "description": "Interface status output",
  "addedBy": "learner-123"
}
```

**Response:**
```json
{
  "id": "evidence-uuid",
  "type": "screenshot",
  "data": "base64-encoded-image",
  "description": "Interface status output",
  "timestamp": 1699123456789,
  "addedBy": "learner-123"
}
```

### `POST /api/tickets/:id/investigation-steps`

Adds an investigation step.

**Request Body:**
```json
{
  "title": "Checked interface status",
  "description": "Interface Gig0/1 is down",
  "actions": ["show ip interface brief"],
  "results": ["Gig0/1 status: down"],
  "completedBy": "learner-123"
}
```

**Response:**
```json
{
  "id": "step-uuid",
  "title": "Checked interface status",
  "description": "Interface Gig0/1 is down",
  "actions": ["show ip interface brief"],
  "results": ["Gig0/1 status: down"],
  "timestamp": 1699123456789,
  "completedBy": "learner-123"
}
```

### `PUT /api/tickets/:id/assign`

Assigns a ticket.

**Request Body:**
```json
{
  "assignedTo": "engineer-1",
  "assignedBy": "admin"
}
```

### `PUT /api/tickets/:id/resolve`

Resolves a ticket.

**Request Body:**
```json
{
  "resolvedBy": "engineer-1",
  "resolution": "Changed trunk configuration",
  "verificationSteps": ["show interfaces trunk"],
  "followUpActions": ["Monitor for 24 hours"]
}
```

### `DELETE /api/tickets/:id`

Deletes an open ticket.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `deletedBy` | string | User performing deletion |

**Response:**
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

---

## 5. Roadmap

### `GET /api/roadmap`

Returns the learning roadmap stages.

**Response:**
```json
[
  {
    "id": "zero",
    "title": "Zero / Foundations",
    "description": "Computer fundamentals, networking basics...",
    "estimatedWeeks": 2,
    "skills": ["computer-fundamentals", "osi-model", ...],
    "labs": [
      { "id": "LAB-001", "title": "...", "level": "basic", "category": "..." }
    ]
  },
  {
    "id": "ccna",
    "title": "CCNA Practical Mastery",
    ...
  }
]
```

### `GET /api/roadmap/:stage`

Returns a specific roadmap stage.

**Response:**
```json
{
  "id": "ccna",
  "title": "CCNA Practical Mastery",
  "description": "...",
  "estimatedWeeks": 6,
  "skills": [...],
  "labs": [ ... ]
}
```

---

## 6. Daily Missions

### `GET /api/missions/today`

Returns today's daily mission for a learner.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `learnerId` | string | Learner identifier |

**Response:**
```json
{
  "id": "mission-uuid",
  "learnerId": "learner-123",
  "date": "2026-09-13",
  "type": "lab",
  "title": "Complete lab: Configure a Small Office LAN",
  "description": "Work through the...",
  "labId": "LAB-001",
  "estimatedTime": "30 minutes",
  "requiredTools": ["Cisco CLI / Packet Tracer"],
  "status": "pending",
  "createdAt": 1699123456789
}
```

### `POST /api/missions/:learnerId/:missionId/complete`

Marks a daily mission as completed.

**Response:**
```json
{
  "mission": {
    "id": "mission-uuid",
    "status": "completed",
    "completedAt": 1699123456789
  }
}
```

---

## 7. Retrieval Center

### `GET /api/retrieval/due/:learnerId`

Returns due retrieval questions.

**Response:**
```json
{
  "questions": [
    {
      "id": "rq-uuid",
      "question": "What is the difference between a switch and a hub?",
      "options": [],
      "topic": "Switching",
      "difficulty": "beginner",
      "dueAt": 1699123456789,
      "answered": false,
      "correct": null
    }
  ],
  "count": 3
}
```

### `POST /api/retrieval/:learnerId/add`

Adds a retrieval question.

**Request Body:**
```json
{
  "question": "What is OSPF cost based on?",
  "options": ["Bandwidth", "Delay", "Reliability", "Load"],
  "correctAnswer": "Bandwidth",
  "topic": "Routing",
  "difficulty": "intermediate"
}
```

**Response (201 Created):**
```json
{
  "id": "rq-uuid",
  "question": "What is OSPF cost based on?",
  "options": ["Bandwidth", "Delay", "Reliability", "Load"],
  "correctAnswer": "Bandwidth",
  "topic": "Routing",
  "difficulty": "intermediate",
  "dueAt": 1699123456789,
  "answered": false,
  "correct": null
}
```

### `POST /api/retrieval/:learnerId/:questionId/answer`

Answers a retrieval question.

**Request Body:**
```json
{
  "answer": "Bandwidth"
}
```

**Response:**
```json
{
  "id": "rq-uuid",
  "correct": true,
  "correctAnswer": "Bandwidth",
  "explanation": "OSPF cost is based on reference bandwidth divided by interface bandwidth.",
  "nextDueAt": 1699523456789
}
```

---

## 8. Evidence

### `GET /api/evidence/:learnerId`

Returns all evidence records for a learner.

**Response:**
```json
{
  "evidence": [
    {
      "id": "evidence-uuid",
      "learnerId": "learner-123",
      "labId": "LAB-001",
      "type": "output",
      "title": "Ping verification",
      "data": {},
      "tags": ["ping", "connectivity"],
      "createdAt": 1699123456789
    }
  ],
  "count": 5
}
```

### `POST /api/evidence/:learnerId`

Adds a learning evidence record.

**Request Body:**
```json
{
  "labId": "LAB-001",
  "type": "output",
  "title": "Ping verification",
  "data": { "source": "PC1", "destination": "PC2", "result": "success" },
  "tags": ["ping", "connectivity"]
}
```

**Response (201 Created):**
```json
{
  "id": "evidence-uuid",
  "learnerId": "learner-123",
  "labId": "LAB-001",
  "type": "output",
  "title": "Ping verification",
  "data": { "source": "PC1", "destination": "PC2", "result": "success" },
  "tags": ["ping", "connectivity"],
  "createdAt": 1699123456789
}
```

---

## 9. Failure Labs

### `GET /api/failure-labs/:labId`

Returns the failure lab state.

**Response:**
```json
{
  "labId": "LAB-001",
  "faults": [],
  "injectedFault": null,
  "injectionHistory": []
}
```

### `POST /api/failure-labs/:labId/inject`

Injects a fault into a lab.

**Request Body:**
```json
{
  "type": "interface_down",
  "target": "R1",
  "description": "Shutdown interface Gig0/1"
}
```

**Response:**
```json
{
  "fault": {
    "id": "fault-uuid",
    "type": "interface_down",
    "target": "R1",
    "description": "Shutdown interface Gig0/1",
    "injectedAt": 1699123456789,
    "detected": false,
    "resolution": null
  },
  "state": { ... }
}
```

### `POST /api/failure-labs/:labId/clear/:faultId`

Clears a fault.

**Response:**
```json
{
  "state": { ... }
}
```

---

## 10. Troubleshooting Coach

### `GET /api/coach/:labId/:stepId`

Returns the troubleshooting guide for a step.

**Response:**
```json
{
  "stepId": "step-1",
  "stepTitle": "Configure IP Address",
  "hints": [
    { "tier": 0, "text": "Use the ipconfig command.", "type": "clarification" },
    { "tier": 1, "text": "Check the interface is up first.", "type": "narrowing" },
    { "tier": 2, "text": "Verify with show ip interface brief.", "type": "diagnostic" }
  ],
  "troubleshooting": {
    "decisionTree": [...],
    "commonMistakes": ["Forgot subnet mask", "Typed wrong interface"]
  }
}
```

---

## 11. Interview Room

### `GET /api/interview/:topicId`

Returns interview questions for a topic.

**Response:**
```json
{
  "questions": [
    {
      "id": "iq-uuid",
      "level": "basic",
      "question": "What is a network protocol?",
      "expectedAnswer": "A set of rules...",
      "tips": ["Think about standards", "Communication rules"],
      "followUp": ["Give an example", "Why are protocols needed?"]
    }
  ],
  "count": 3
}
```

### `POST /api/interview/:topicId/questions`

Adds an interview question.

**Request Body:**
```json
{
  "level": "medium",
  "question": "Explain OSPF neighbor states.",
  "expectedAnswer": "OSPF neighbors progress through...",
  "tips": ["List all 7 states", "Mention exchange process"],
  "followUp": ["What prevents loops in OSPF?"]
}
```

**Response (201 Created):**
```json
{
  "id": "iq-uuid",
  "topicId": "networking-basics",
  "level": "medium",
  "question": "Explain OSPF neighbor states.",
  "expectedAnswer": "OSPF neighbors progress through...",
  "tips": [...],
  "followUp": [...],
  "createdAt": 1699123456789
}
```

---

## 12. Research Lab

### `POST /api/research`

Creates a research experiment.

**Request Body:**
```json
{
  "learnerId": "learner-123",
  "title": "TCP vs UDP Latency Experiment",
  "problemStatement": "How does protocol choice affect latency?",
  "knownFacts": ["TCP is reliable", "UDP is faster"],
  "unknowns": ["Exact latency difference under load"]
}
```

**Response (201 Created):**
```json
{
  "id": "exp-uuid",
  "learnerId": "learner-123",
  "title": "TCP vs UDP Latency Experiment",
  "problemStatement": "How does protocol choice affect latency?",
  "knownFacts": ["TCP is reliable", "UDP is faster"],
  "unknowns": ["Exact latency difference under load"],
  "hypothesis": null,
  "observations": [],
  "results": null,
  "conclusion": null,
  "status": "draft",
  "createdAt": 1699123456789,
  "updatedAt": 1699123456789
}
```

### `GET /api/research/:id`

Returns a research experiment.

**Response:**
```json
{
  "id": "exp-uuid",
  "learnerId": "learner-123",
  "title": "TCP vs UDP Latency Experiment",
  "status": "draft",
  ...
}
```

### `GET /api/research/learner/:learnerId`

Lists all experiments for a learner.

**Response:**
```json
{
  "experiments": [ ... ],
  "count": 2
}
```

### `POST /api/research/:id/hypothesis`

Sets the hypothesis.

**Request Body:**
```json
{
  "hypothesis": "UDP will show 20-30% lower latency than TCP under light load."
}
```

**Response:**
```json
{
  "id": "exp-uuid",
  "hypothesis": "UDP will show 20-30% lower latency than TCP under light load.",
  "status": "hypothesis_set",
  "updatedAt": 1699123456789
}
```

### `POST /api/research/:id/observation`

Adds an observation.

**Request Body:**
```json
{
  "data": { "tcp_latency_ms": 45, "udp_latency_ms": 32 },
  "notes": "Measured under 10 Mbps load"
}
```

**Response:**
```json
{
  "id": "obs-uuid",
  "data": { "tcp_latency_ms": 45, "udp_latency_ms": 32 },
  "notes": "Measured under 10 Mbps load",
  "timestamp": 1699123456789
}
```

### `POST /api/research/:id/complete`

Completes a research experiment.

**Request Body:**
```json
{
  "results": { "tcp_avg_ms": 48, "udp_avg_ms": 34, "difference_pct": 29 },
  "conclusion": "UDP is 29% faster under light load, confirming the hypothesis."
}
```

**Response:**
```json
{
  "id": "exp-uuid",
  "results": { "tcp_avg_ms": 48, "udp_avg_ms": 34, "difference_pct": 29 },
  "conclusion": "UDP is 29% faster under light load, confirming the hypothesis.",
  "status": "completed",
  "updatedAt": 1699123456789
}
```

---

## 13. Portfolio

### `GET /api/portfolio/:learnerId`

Returns all portfolio artifacts.

**Response:**
```json
{
  "artifacts": [
    {
      "id": "artifact-uuid",
      "learnerId": "learner-123",
      "type": "lab_report",
      "title": "VLAN Configuration Lab Report",
      "content": {},
      "labId": "LAB-002",
      "tags": ["vlan", "switching"],
      "createdAt": 1699123456789
    }
  ],
  "count": 5
}
```

### `POST /api/portfolio/:learnerId/artifacts`

Adds a portfolio artifact.

**Request Body:**
```json
{
  "type": "lab_report",
  "title": "VLAN Configuration Lab Report",
  "content": {
    "summary": "Configured VLANs 10 and 20...",
    "configurations": ["vlan 10", "name SALES"]
  },
  "labId": "LAB-002",
  "tags": ["vlan", "switching"]
}
```

**Response (201 Created):**
```json
{
  "id": "artifact-uuid",
  "learnerId": "learner-123",
  "type": "lab_report",
  "title": "VLAN Configuration Lab Report",
  "content": { ... },
  "labId": "LAB-002",
  "tags": ["vlan", "switching"],
  "createdAt": 1699123456789
}
```

---

## 14. Study Planner

### `GET /api/study-planner/:learnerId`

Returns the study planner.

**Response:**
```json
{
  "learnerId": "learner-123",
  "mode": "normal",
  "availableMinutes": 90,
  "sessions": [
    {
      "id": "session-uuid",
      "mode": "normal",
      "plannedMinutes": 90,
      "startedAt": 1699123456789,
      "completedAt": null,
      "activities": [],
      "completed": false
    }
  ],
  "currentSessionId": "session-uuid",
  "createdAt": 1699123456789
}
```

### `PUT /api/study-planner/:learnerId`

Updates the study planner.

**Request Body:**
```json
{
  "mode": "focused",
  "availableMinutes": 45
}
```

**Response:**
```json
{
  "learnerId": "learner-123",
  "mode": "focused",
  "availableMinutes": 45,
  "updatedAt": 1699123456789
}
```

### `POST /api/study-planner/:learnerId/session`

Starts a study session.

**Request Body:**
```json
{
  "mode": "normal",
  "plannedMinutes": 90,
  "activities": ["warmup", "core-concept", "guided-practice"]
}
```

**Response (201 Created):**
```json
{
  "id": "session-uuid",
  "mode": "normal",
  "plannedMinutes": 90,
  "startedAt": 1699123456789,
  "completedAt": null,
  "activities": ["warmup", "core-concept", "guided-practice"],
  "completed": false
}
```

### `POST /api/study-planner/:learnerId/session/:sessionId/complete`

Completes a study session.

**Response:**
```json
{
  "id": "session-uuid",
  "completed": true,
  "completedAt": 1699123456789
}
```

---

## 15. Skill Graph

### `GET /api/skill-graph/:learnerId`

Returns the skill graph.

**Response:**
```json
{
  "learnerId": "learner-123",
  "skills": {
    "cli": { "mastery": 0.9, "lastPracticed": 1699123456789, "attempts": 5 },
    "ipv4": { "mastery": 0.8, "lastPracticed": 1699123456789, "attempts": 4 }
  },
  "mastery": {
    "cli": 0.9,
    "ipv4": 0.8
  },
  "lastUpdated": 1699123456789
}
```

### `PUT /api/skill-graph/:learnerId/:skillId`

Updates skill mastery.

**Request Body:**
```json
{
  "mastery": 0.85
}
```

**Response:**
```json
{
  "learnerId": "learner-123",
  "skills": {
    "cli": { "mastery": 0.85, "lastPracticed": 1699123456789, "attempts": 6 }
  },
  "mastery": {
    "cli": 0.85
  },
  "lastUpdated": 1699123456789
}
```

### `GET /api/skill-graph/:learnerId/prerequisites/:skillId`

Returns prerequisites for a skill.

**Response:**
```json
{
  "skillId": "ospf",
  "prerequisites": ["routing", "ipv4"]
}
```

---

## 16. Debrief

### `GET /api/labs/:labId/debrief/:learnerId`

Returns a debrief.

**Response:**
```json
{
  "id": "debrief-uuid",
  "learnerId": "learner-123",
  "labId": "LAB-001",
  "problem": "Hosts could not communicate across VLANs.",
  "prediction": "I thought the trunk was misconfigured.",
  "configuration": "I configured...",
  "evidence": "show interfaces trunk showed...",
  "failures": "I initially forgot to set native VLAN.",
  "failureCause": "Oversight in native VLAN configuration.",
  "helpfulCommands": ["show vlan", "show interfaces trunk"],
  "realWorldApplication": "Applies to multi-VLAN campus designs.",
  "conceptExplanation": "Trunking carries multiple VLANs over a single link.",
  "selfAssessment": "I understand trunking but need more practice with VTP.",
  "completed": true,
  "createdAt": 1699123456789,
  "updatedAt": 1699123456789
}
```

### `POST /api/labs/:labId/debrief/:learnerId`

Creates or updates a debrief.

**Request Body:**
```json
{
  "problem": "What was the initial problem?",
  "prediction": "I predicted that...",
  "configuration": "The configuration I used was...",
  "evidence": "The evidence showed...",
  "failures": "I failed when...",
  "failureCause": "The cause was...",
  "helpfulCommands": ["show ip interface brief"],
  "realWorldApplication": "This applies to...",
  "conceptExplanation": "The key concept is..."
}
```

**Response (201 Created):**
```json
{
  "id": "debrief-uuid",
  "learnerId": "learner-123",
  "labId": "LAB-001",
  "problem": "...",
  "completed": true,
  "createdAt": 1699123456789,
  "updatedAt": 1699123456789
}
```

---

## 17. Courses

### `GET /api/courses`

Returns all courses.

**Response:**
```json
{
  "courses": [
    {
      "id": "course-uuid",
      "title": "Networking Foundations",
      "description": "Zero to networking basics...",
      "estimatedWeeks": 2,
      "stageCount": 4
    }
  ],
  "count": 3
}
```

### `GET /api/courses/:courseId`

Returns a single course.

**Response:**
```json
{
  "id": "course-uuid",
  "title": "Networking Foundations",
  "description": "Zero to networking basics...",
  "stages": [
    { "id": "s1", "title": "Micro-learning: OSI Model", "type": "theory", "estimatedMinutes": 20 },
    { "id": "s2", "title": "Practical: IP Addressing Lab", "type": "practical", "estimatedMinutes": 30 },
    { "id": "s3", "title": "Assessment: Quiz + Verification", "type": "assessment", "estimatedMinutes": 20 },
    { "id": "s4", "title": "Project: Design a Small Network", "type": "project", "estimatedMinutes": 40 }
  ],
  "prerequisites": [],
  "estimatedWeeks": 2,
  "createdAt": 1699123456789
}
```

### `POST /api/courses/:courseId/enroll/:learnerId`

Enrolls a learner in a course.

**Response (201 Created):**
```json
{
  "id": "enrollment-uuid",
  "learnerId": "learner-123",
  "courseId": "course-uuid",
  "currentStage": 0,
  "completedStages": [],
  "progress": 0,
  "startedAt": 1699123456789,
  "completedAt": null
}
```

### `PUT /api/courses/:courseId/progress/:learnerId`

Updates course progress.

**Request Body:**
```json
{
  "stageIndex": 1,
  "completed": true
}
```

**Response:**
```json
{
  "id": "enrollment-uuid",
  "learnerId": "learner-123",
  "courseId": "course-uuid",
  "currentStage": 1,
  "completedStages": ["0"],
  "progress": 25,
  "updatedAt": 1699123456789
}
```

### `GET /api/courses/:courseId/enrollment/:learnerId`

Returns enrollment status.

**Response:**
```json
{
  "id": "enrollment-uuid",
  "learnerId": "learner-123",
  "courseId": "course-uuid",
  "currentStage": 1,
  "completedStages": ["0"],
  "progress": 25,
  "startedAt": 1699123456789
}
```

---

## 18. WebSocket API

Connect to the WebSocket at:
```
ws://localhost:3000
```

### Connection

On connection, the server sends:
```json
{
  "type": "session",
  "id": "session-uuid"
}
```

### Client → Server Messages

| Type | Payload | Description |
|---|---|---|
| `lab:start` | `{ "labId": "LAB-001" }` | Start a lab session |
| `lab:step:verify` | `{ "stepId": "step-1", "payload": { ... } }` | Verify a step |
| `lab:hint` | `{ "stepId": "step-1", "tier": 0 }` | Request hint |
| `device:config` | `{ "deviceId": "R1", "config": { ... } }` | Push config |
| `device:state` | `{ "deviceId": "R1", "state": { ... } }` | Sync device state |
| `topology:connect` | `{ "from": "PC1", "to": "SW1", "cableType": "ethernet" }` | Connect devices |
| `topology:disconnect` | `{ "cableId": "cable-uuid" }` | Disconnect cable |
| `error:inject` | `{ "errorType": "interface_down", "target": "R1" }` | Inject fault |
| `telemetry:subscribe` | `{ "deviceIds": ["R1", "SW1"] }` | Subscribe to telemetry |

### Server → Client Messages

| Type | Payload | Description |
|---|---|---|
| `lab:started` | `{ "state": { ... }, "firstStep": { ... } }` | Lab started |
| `step:passed` | `{ "stepId": "step-1", "xp": 10, "nextStep": { ... } }` | Step passed |
| `step:failed` | `{ "stepId": "step-1", "feedback": "...", "hint": "..." }` | Step failed |
| `hint` | `{ "stepId": "step-1", "tier": 0, "text": "..." }` | Hint response |
| `device:updated` | `{ "deviceId": "R1", "config": { ... } }` | Config updated |
| `device:state:synced` | `{ "deviceId": "R1" }` | State synced |
| `topology:update` | `{ "edges": [ ... ] }` | Topology changed |
| `error:injected` | `{ "fault": { ... } }` | Fault injected |
| `telemetry:subscribed` | `{ "deviceIds": [ ... ] }` | Telemetry subscribed |
| `error` | `{ "message": "Error description" }` | Error response |
| `session` | `{ "id": "session-uuid" }` | Session established |

---

## 19. Error Handling

All errors return JSON with an `error` field:

```json
{
  "error": "Lab not found"
}
```

**Common HTTP status codes:**
- `200` — Success
- `201` — Created
- `400` — Bad request (validation error)
- `404` — Not found
- `429` — Rate limited
- `500` — Internal server error

---

## 20. Rate Limiting

- **Global:** 60 requests/minute per IP address.
- **Lab start:** 3 requests/minute per IP address per lab.

Rate limit exceeded response:
```json
{
  "error": "Too many requests. Max 60 requests per minute."
}
```

---

## 21. Additional Endpoints

These endpoints exist in `backend/server.js` for advanced operations:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/telemetry` | Get latest telemetry data |
| `POST` | `/api/inject-error` | Inject error into a lab |
| `PUT` | `/api/lab-config/:id` | Push lab configuration |
| `POST` | `/api/reset-lab/:id` | Reset a lab |

---

*This documentation is accurate for CyberNet Lab v4.0.0.*
