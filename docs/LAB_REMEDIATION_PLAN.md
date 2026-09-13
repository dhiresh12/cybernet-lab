# CyberNet Lab — Lab Remediation Plan

**Project:** CyberNet Lab v4.0.0  
**Path:** `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`  
**Date:** 2026-09-13  
**Total Labs:** 247  
**Valid:** 229  
**Remediated:** 11  
**Broken:** 7  

---

## 1. Status Summary

| Status | Count | Description |
|---|---|---|
| VALID | 229 | Learner-safe labs, fully validated |
| REMEDIATED | 11 | Previously broken, now corrected and accessible |
| BROKEN | 7 | Quarantined, not served to learners, preserved for rebuild |
| **Total** | **247** | — |

---

## 2. Remediated Labs (Batch 6.4–6.9)

These labs were audited in Session 6, found to have title/content mismatches or incomplete structures, and remediated in Phases 6.4 through 6.9.

| Lab ID | Original Issue | Remediation Phase | Remediation Date | New Title / Focus |
|---|---|---|---|---|
| 23 | Title/content mismatch: claimed device naming/banner but configured SSH | 6.4 | 2026-09-06 | SSH Hardening and Secure Access |
| 81 | Title/content mismatch: claimed trunk port config but configured access ports/VLANs | 6.4 | 2026-09-06 | Trunk Port Configuration (retained original title) |
| 83 | Title/content mismatch: claimed inter-VLAN routing with router but steps incomplete | 6.7 | 2026-09-07 | VLAN Lab: Inter-VLAN Routing with Router |
| 103 | Title/content mismatch: claimed SSH hardening + ACLs but configured ACL only | 6.6 | 2026-09-07 | ACL Configuration and Traffic Filtering |
| 112 | Title/content mismatch: claimed PBR but configured static routes only | 6.8 | 2026-09-07 | Static and Default Route Configuration |
| 124 | Title/content mismatch: claimed NetFlow/SNMP but simulator does not support these | 6.9 | 2026-09-07 | Basic Router Configuration and Verification |
| 126 | Title/content mismatch: claimed BGP route filtering but configured basic BGP peering only | 6.9 | 2026-09-07 | BGP eBGP Peering and Network Advertisement |
| 176 | Title/content mismatch: claimed CDP/LLDP but configured device settings/passwords only | 6.8 | 2026-09-07 | Configure Cisco IOS Device Settings |
| 229 | Title/content mismatch: claimed router-on-a-stick but steps lacked verification/routing | 6.4 | 2026-09-06 | Inter-VLAN Routing with Router |
| 241 | Title/content mismatch: claimed banner message but configured SSH | 6.6 | 2026-09-07 | SSH Configuration for Secure Access |
| 242 | Title/content mismatch: claimed CDP neighbor discovery but configured device settings/passwords only | 6.7 | 2026-09-07 | Configure Cisco IOS Device Settings |

**Common remediation actions:**
- Corrected title and category to match actual content
- Added structured topology and initialState
- Added troubleshooting section and knowledge check
- Replaced duplicate/incomplete legacy steps with canonical progressive steps
- Verified against NetworkSimulationEngine supported commands

---

## 3. Broken Labs (Pending Remediation)

These 7 labs remain quarantined (BROKEN status) and are excluded from learner-facing lab listing. They are preserved in `labQualityRegistry.json` for future rebuild.

| Lab ID | Reason | Severity | Audit Source | Remediation Status |
|---|---|---|---|---|
| 113 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |
| 120 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |
| 121 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |
| 122 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |
| 125 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |
| 148 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |
| 208 | Lab content is incomplete or does not match simulator support | P0 | Session 6 Lab Quality Audit | PENDING |

---

## 4. Proposed Remediation Batches

### Batch R1 — Immediate (P0 Broken Labs)

**Scope:** Labs 113, 120, 121, 122, 125, 148, 208  
**Goal:** Rebuild each lab with complete canonical structure or remove from catalog.  
**Actions per lab:**
1. Inspect existing lab data in `labs.procedural.json`
2. Determine if lab concept is salvageable with simulator-supported commands
3. If salvageable:
   - Rewrite title, category, objectives, scenario
   - Add structured topology with devices and connections
   - Add initialState with device configurations
   - Create 5–8 progressive steps with verification metadata
   - Add troubleshooting section (3–5 common errors)
   - Add knowledge check (3–5 multiple-choice questions)
4. If not salvageable:
   - Mark as LEGACY or remove from active registry
   - Update `labQualityRegistry.json` status accordingly
5. Run `npm test` to verify no regressions
6. Update `labQualityRegistry.json` with remediation date, summary, and status = REMEDIATED

**Estimated effort:** 2–4 hours per lab (14–28 hours total)

---

### Batch R2 — Quality Audit (Valid Labs)

**Scope:** All 229 VALID labs  
**Goal:** Verify no latent title/content mismatches or structural gaps.  
**Actions:**
1. Run automated quality gate (`labQualityService.evaluateLabQuality`) on all 247 labs
2. Flag any labs missing: topology, initialState, steps, verification metadata, troubleshooting, knowledge check
3. Review flagged labs and remediate using same process as Batch R1
4. Update `labQualityRegistry.json` for any newly discovered issues

**Estimated effort:** 1–2 hours for automated pass, 1–3 hours for manual review of flagged labs

---

### Batch R3 — Content Enhancement (Valid Labs)

**Scope:** Labs with minimal practicalLabs or missing packetAnalysis content  
**Goal:** Add OBSERVE mode, packet capture tasks, and explanation prompts where applicable.  
**Actions:**
1. Identify networking and security labs suitable for packet analysis
2. Add OBSERVE mode steps: "What should I see in the packet?"
3. Add packet capture analysis tasks (Wireshark-based, simulated)
4. Add explanation prompts: "Explain why the packet behaves this way"
5. Add report writing tasks for advanced labs

**Estimated effort:** 30 minutes per lab, targeting ~50 labs (~25 hours)

---

### Batch R4 — Progressive Difficulty Verification (Valid Labs)

**Scope:** All 247 labs  
**Goal:** Verify each lab follows the China-style progressive model:  
LEVEL 1 — Skill Lab  
LEVEL 2 — Combination Lab  
LEVEL 3 — Engineering Lab  
LEVEL 4 — Failure Lab  
LEVEL 5 — Integrated Lab  
LEVEL 6 — Innovation Lab  

**Actions:**
1. Review each lab's steps and verify progressive difficulty
2. Ensure early labs are guided (copy with understanding)
3. Ensure mid labs require prediction and independent configuration
4. Ensure advanced labs require design, defense, and troubleshooting
5. Tag each lab with its progressive level in metadata

**Estimated effort:** 15 minutes per lab (~62 hours)

---

## 5. Remediation Checklist (Per Lab)

- [ ] Lab data exists in `labs.procedural.json` or `reference-labs/`
- [ ] Title matches actual content
- [ ] Category and difficulty are correct
- [ ] Objectives are clear and measurable
- [ ] Scenario describes real-world context
- [ ] Topology is structured with devices and connections
- [ ] Initial state is present with device configurations
- [ ] Steps are progressive (guided → independent → design)
- [ ] Each step has verification metadata (type, expected)
- [ ] Troubleshooting section exists with 3–5 common errors
- [ ] Knowledge check exists with 3–5 questions
- [ ] All commands are supported by NetworkSimulationEngine
- [ ] Lab passes `evaluateLabQuality()` with `learnerSafe: true`
- [ ] Lab is accessible via API (`GET /api/labs/:id` returns 200)
- [ ] `labQualityRegistry.json` is updated

---

## 6. Execution Order

1. **Batch R1** — Fix 7 BROKEN labs (highest priority, P0)
2. **Batch R2** — Automated quality audit of all 247 labs
3. **Batch R3** — Add OBSERVE mode and packet analysis to suitable labs
4. **Batch R4** — Verify and tag progressive difficulty levels

---

## 7. Quality Gates

| Gate | Criteria |
|---|---|
| Lab passes schema validation | Required fields present, types correct |
| Lab passes quality service | `learnerSafe: true`, no critical reasons |
| Lab is API-accessible | `GET /api/labs/:id` returns 200 |
| Lab runs in NetworkSimulationEngine | Device creation, commands, verification all work |
| Lab has progressive steps | Steps move from guided to independent to design |
| Lab has troubleshooting | At least 3 common errors documented |
| Lab has knowledge check | At least 3 multiple-choice questions |

---

## 8. Registry Maintenance

After each remediation batch:
1. Update `frontend/src/data/labQualityRegistry.json`
2. Run `npm test` to verify no regressions
3. Run `npm run build` to verify build integrity
4. Update `PROJECT_CHECKPOINT.md` with remediation batch results
5. Commit changes with message: `chore(labs): remediate batch R<number> — <summary>`

---

*This plan is the authoritative remediation roadmap for CyberNet Lab's 247 labs.*
