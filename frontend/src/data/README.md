# Lab Data Documentation

## Overview

This folder contains the canonical lab data architecture for CyberNet Lab.

```
frontend/src/data/
├── labs.procedural.json      # 247 legacy labs (DO NOT EDIT)
├── labs/                     # Category-specific lab files (legacy)
├── index.json                # Category index
├── reference-labs/           # NEW: Reference-quality labs
│   ├── lab-small-office-lan.json
│   └── lab-vlans-sales-accounts.json
├── LabModel.js               # Canonical lab schema definition
├── labNormalizer.js          # Legacy → Canonical normalization
└── labRegistry.js            # Centralized lab access
```

---

## Canonical Lab Model

Every lab in CyberNet Lab follows the canonical model defined in `LabModel.js`.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Human-readable title |
| `slug` | string | URL-friendly title |
| `category` | string | Lab category |
| `difficulty` | enum | basic \| intermediate \| advanced \| expert |
| `estimatedTime` | string | e.g., "20 minutes" |
| `topology` | object | Network topology (devices, interfaces, connections) |
| `steps` | array | Lab execution steps |

### Key Sections

1. **Lab Identity** - Basic identification
2. **Real-World Context** - Scenario, role, problem, business impact
3. **Learning** - Objectives, prerequisites, concepts, skills, commands
4. **Topology** - Devices, interfaces, connections
5. **IP Addressing** - Address table
6. **Initial State** - Starting network state
7. **Steps** - Actionable instructions with verification
8. **Troubleshooting** - Common errors, diagnostics, fixes
9. **Fault Injection** - Future: intentional faults for troubleshooting
10. **Final Verification** - Completion checks
11. **Knowledge Check** - Post-lab questions

---

## Quality Standards (MANDATORY)

### RULE 1: Real-World Task
Every lab must represent a meaningful network-engineering task.

**Bad:** "Configure the router"
**Good:** "Configure a branch router for a small office connecting to HQ"

### RULE 2: Actionable Steps
Every step must tell the student:
- **WHAT** to do
- **WHERE** to do it (target device)
- **WHY** to do it
- **WHAT command/action** to perform
- **WHAT output** to expect
- **HOW** to verify it

### RULE 3: Realistic Commands
Commands must be actual commands a network engineer would use.

### RULE 4: Expected Output Matches State
Expected output must correspond to the simulated state.

### RULE 5: State-Based Verification
Verification must verify the resulting network state, not just command strings.

### RULE 6: Helpful Hints
Hints should guide without revealing the answer immediately.

### RULE 7: Realistic Troubleshooting
Troubleshooting based on realistic failure modes.

### RULE 8: No Duplicate Labs
Similar labs must have meaningful differences.

### RULE 9: Transferable Skills
Every lab must teach a transferable networking skill.

---

## Difficulty Model

| Level | Devices | Steps | Focus |
|-------|---------|-------|-------|
| basic | 2-3 | 5-8 | Fundamentals, simple config |
| intermediate | 3-5 | 8-12 | Multiple devices, routing, VLAN |
| advanced | 5-8 | 12-18 | Complex routing, security, troubleshooting |
| expert | 8+ | 18+ | Multi-site, automation, design |

---

## Category System

Categories are organized by technology domain:

- **Fundamentals** - Basic networking concepts
- **IPv4 / Subnetting** - Addressing
- **Cisco CLI** - Command-line skills
- **Switching / VLAN / Trunking / STP / EtherChannel** - Layer 2
- **Routing / Static / RIP / OSPF / BGP** - Layer 3
- **DHCP / DNS / NAT / ACL** - Network Services
- **Security / Wireless / Monitoring** - Specialized
- **Troubleshooting / Automation** - Advanced skills

---

## Creating New Labs

1. Copy a reference lab as template
2. Fill in all required fields
3. Use only currently supported features
4. Mark future capabilities clearly
5. Validate with `npm run build`

---

## Legacy Labs

The 247 labs in `labs.procedural.json` are preserved as-is. They are automatically normalized at runtime by `labNormalizer.js`.

- Marked with `"legacy": true`
- Missing fields get safe defaults
- No fake content is invented

---

## Reference Labs

Two reference-quality labs demonstrate the standard:

1. **REF-001**: Configure a Small Office LAN (Fundamentals, basic)
2. **REF-002**: Configure VLANs for Sales and Accounts (VLAN, intermediate)

These serve as templates for future lab creation.