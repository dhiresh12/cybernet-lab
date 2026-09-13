# CyberNet Lab — User Guide

**Version:** 4.0.0  
**Audience:** Learners, students, and networking engineers  
**Platform:** Web browser (Chrome, Firefox, Edge recommended)

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Using the Platform](#2-using-the-platform)
3. [Completing Labs](#3-completing-labs)
4. [Study Planner](#4-study-planner)
5. [Retrieval Center](#5-retrieval-center)
6. [Troubleshooting Coach](#6-troubleshooting-coach)
7. [Interview Room](#7-interview-room)
8. [Research Lab](#8-research-lab)
9. [Building a Portfolio](#9-building-a-portfolio)
10. [Engineer Mode & SOC Mode](#10-engineer-mode--soc-mode)
11. [Settings & Accessibility](#11-settings--accessibility)

---

## 1. Getting Started

### 1.1 System Requirements

- A modern web browser (Chrome 90+, Firefox 88+, Edge 90+)
- Internet connection (for initial load; core simulator runs locally)
- Screen resolution: 1280×720 minimum; 1920×1080 recommended

### 1.2 Launching the Application

1. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```
   (If you are running the application locally in development mode.)

2. Wait for the catalog to load. The loading screen will display:
   ```
   Loading CyberNet Lab...
   ```
3. Once loaded, you will see the **Lab Explorer** view with the full lab catalog.

### 1.3 Interface Overview

The CyberNet Lab interface is organized into three main regions:

```
+----------------------------------------------------------+
| Header (navigation, sound, language selector)            |
+----------+---------------------------------+--------------+
| Sidebar  | Main Workspace                  | Context Panel|
| (Nav)    | (Lab views, Dashboard, etc.)    | (Evidence,   |
|          |                                 |  Progress)   |
+----------+---------------------------------+--------------+
```

- **Header:** Navigation menu, sound toggle, language selector, settings access.
- **Sidebar (Nav):** Quick access to all major views.
- **Main Workspace:** The active view (Lab Explorer, Lab Detail, Dashboard, etc.).
- **Context Panel:** Shows evidence records, progress, hints, and notes for the current lab.

### 1.4 Creating a Learner Profile

Your progress is tracked automatically using a local learner ID stored in your browser. No account creation is required. To reset your identity:

1. Open browser DevTools (F12).
2. Go to **Application** → **Local Storage**.
3. Delete the key `cybernet_learner_id`.
4. Refresh the page. A new ID will be generated.

---

## 2. Using the Platform

### 2.1 Navigation

Use the sidebar or header to switch between views:

| View | Purpose |
|---|---|
| **Lab Explorer** | Browse, search, and filter all 247 labs |
| **Dashboard** | NOC/SOC command center with analytics and SOC mode |
| **Engineer Mode** | Ticket-based troubleshooting workflow |
| **Progress Matrix** | Skill mastery overview |
| **Security Center** | SOC defensive operations and incident response |
| **Learning Analytics** | Detailed learning metrics |
| **Settings** | Theme, background, accessibility, and interface options |
| **Study Planner** | Structured study sessions |
| **Retrieval Center** | Spaced repetition practice |
| **Troubleshooting Coach** | Structured reasoning guide |
| **Interview Room** | Progressive interview preparation |
| **Research Lab** | Scientific method cycle for experiments |
| **Portfolio** | Engineering artifact collection |
| **Daily Mission** | Adaptive daily lab assignment |
| **Roadmap** | 6-stage learning roadmap |

### 2.2 Searching and Filtering Labs

1. From the **Lab Explorer** view, use the search bar to find labs by title or keyword.
2. Use the **Category** and **Level** dropdowns to filter:
   - **Levels:** Basic, Intermediate, Advanced
   - **Categories:** Switching, Routing, Security, Services, etc.
3. Labs display status badges:
   - **AVAILABLE** — Prerequisites met, ready to start
   - **IN PROGRESS** — Currently active
   - **COMPLETE** — Finished with passing verification
   - **LOCKED** — Prerequisites not yet met

### 2.3 Viewing Lab Details

1. Click any lab card in the Lab Explorer.
2. The **Lab Detail** view displays:
   - **Objectives:** What you will learn
   - **Scenario:** Real-world context
   - **Prerequisites:** Required prior labs
   - **Knowledge Check:** Pre-lab quiz
   - **Steps:** Progressive task list
   - **Troubleshooting:** Common errors and hints
3. Click **Launch Workspace** to enter the interactive lab environment.

---

## 3. Completing Labs

### 3.1 Lab Workspace Layout

The Lab Workspace is the interactive environment where you configure devices and complete steps.

```
+----------------------------------------------------------+
| Workspace Header (lab title, timer, XP, tools)           |
+----------+---------------------------------+--------------+
| Step     | Topology / Terminal /           | Inspector    |
| Panel    | Verification Panel              | (Device      |
|          |                                 |  Details)    |
+----------+---------------------------------+--------------+
```

- **Step Panel (left):** Shows the current step objective and verification criteria.
- **Topology / Terminal (center):** Visual network diagram and command-line terminal.
- **Inspector (right):** Device configuration details and interface states.

### 3.2 Using the Terminal

1. Select a device from the topology or device list.
2. Type Cisco IOS-style commands in the terminal. Supported commands include:
   - `ipconfig <ip> <mask>` — Configure IP address
   - `ping <destination>` — Test connectivity
   - `traceroute <destination>` — Trace path to destination
   - `show arp` — Display ARP table
   - `show running-config` — Display current configuration
   - `enable` / `disable` — Privilege mode toggle
   - `configure terminal` / `exit` — Configuration mode
   - `interface <name>` — Select interface
   - `no shutdown` / `shutdown` — Interface state
   - `description <text>` — Interface description
   - `vlan <id>` — VLAN configuration (switch)
   - `write memory` / `copy running-config startup-config` — Save configuration
3. Press **Enter** to execute.

### 3.3 Step Verification

Each lab step has a verification type:
- **CLI:** Command output must match expected text.
- **Config:** Device configuration must contain required lines.
- **Topology:** Cables must be connected between specified devices.
- **Typing:** You must type a specific command or phrase.
- **Option:** Multiple-choice selection.

To verify a step:
1. Complete the required actions in the lab.
2. Click **Verify** (or the checkmark icon) in the Step Panel.
3. If the step passes, you earn XP and the next step unlocks.
4. If the step fails, review the feedback and hints, then try again.

### 3.4 Using Hints

If you are stuck:
1. Click **Hint** in the Step Panel.
2. Hints are tiered: Clarification → Narrowing → Diagnostic.
3. Using hints does not penalize your score, but tracks your hint usage.

### 3.5 Packet Tracer Hints

For labs involving packet flow:
1. Click the **Packet Tracer** icon in the toolbar.
2. Review device-specific commands and expected output.
3. Use these hints to predict and verify packet behavior.

### 3.6 Troubleshooting During Labs

If a step fails repeatedly:
1. Open the **Troubleshooting Coach** from the sidebar.
2. Follow the structured 5-phase reasoning guide:
   - Phase 1: Problem definition
   - Phase 2: Evidence gathering
   - Phase 3: Hypothesis formation
   - Phase 4: Testing and validation
   - Phase 5: Resolution and prevention
3. Return to the lab and apply your findings.

### 3.7 Evidence Collection

During lab work, verification events are automatically recorded:
1. Open the **Evidence Panel** from the Context Panel tabs.
2. View all passed/failed verification attempts with timestamps.
3. Evidence includes predictions, actual results, explanations, and hints used.
4. This record supports your debrief and portfolio.

### 3.8 Completing a Lab

To complete a lab, all of the following must be true:
1. All steps verified and passed.
2. Troubleshooting section reviewed.
3. Debrief completed (problem, prediction, configuration, evidence, explanation).

When you verify the final step:
1. The lab workspace calls `progressEngine.completeLab()`.
2. The backend validates the completion contract.
3. Prerequisites for dependent labs are updated.
4. XP is added to your total score.

### 3.9 Resetting a Lab

To restart a lab from scratch:
1. From the Lab Detail view, click **Reset Lab**.
2. This clears:
   - All completed steps for this lab
   - Local evidence records for this lab
   - Device states and configurations
3. Your overall progress and completed labs are preserved.

---

## 4. Study Planner

The Study Planner helps you structure focused learning sessions using evidence-based study blocks.

### 4.1 Selecting a Study Mode

1. Navigate to **Study Planner** from the sidebar.
2. Choose a study mode:
   - **Normal (90 min):** Balanced mix of all blocks
   - **Focused (45 min):** Condensed session for quick review
   - **Deep Work (120 min):** Extended session for complex topics

### 4.2 Starting a Study Block

1. Each mode contains a sequence of study blocks:
   - **A:** Warm-up & Recall (10 min)
   - **B:** Core Concept (15 min)
   - **C:** Guided Practice (10 min)
   - **D:** Independent Application (8 min)
   - **E:** Verification (5 min)
   - **F:** Reflection (2 min)
2. Click **Start Block** to begin a timer.
3. Follow the activity description for each block.
4. The timer counts down; when it reaches zero, the block is complete.

### 4.3 Saving Your Plan

- Your selected mode and active block are saved automatically.
- Click **Start Focused Lab** to jump directly into a lab from the planner.

---

## 5. Retrieval Center

The Retrieval Center implements spaced repetition to help you retain networking concepts.

### 5.1 Daily Retrieval Set

1. Navigate to **Retrieval Center** from the sidebar.
2. Each day, you receive a set of questions drawn from the retrieval bank.
3. Questions are shuffled and limited to 6 per session.

### 5.2 Answering Questions

1. Read the question carefully.
2. Click **Reveal Answer** to see the correct response.
3. Rate your mastery:
   - **Learning** — You recognize the concept but need more practice.
   - **Mastered** — You can recall and explain the concept confidently.
   - **Reset** — Mark as new for future review.

### 5.3 Spaced Repetition Logic

- Questions you mark as **Learning** reappear the next day.
- Questions you mark as **Mastered** reappear after 3 days.
- Questions you **Reset** reappear immediately.
- Your mastery statistics are tracked across sessions.

---

## 6. Troubleshooting Coach

The Troubleshooting Coach teaches structured, repeatable problem-solving.

### 6.1 When to Use

Use the Troubleshooting Coach when:
- A lab step fails multiple times.
- You do not know where to start diagnosing an issue.
- You want to practice formal troubleshooting methodology.

### 6.2 The 5-Phase Guide

Work through each phase in order. Do not skip ahead.

1. **Phase 1: Define the Problem**
   - What is the exact symptom?
   - What is the scope (which devices, which users)?

2. **Phase 2: Gather Evidence**
   - What commands or tools will you use?
   - What output do you expect vs. what do you see?

3. **Phase 3: Form a Hypothesis**
   - What is the most likely cause?
   - Rank possible causes by probability.

4. **Phase 4: Test and Validate**
   - What test will confirm or rule out your hypothesis?
   - What is the expected result?

5. **Phase 5: Resolve and Prevent**
   - What is the fix?
   - How do you prevent recurrence?

### 6.3 Using the Coach

1. Open **Troubleshooting Coach** from the sidebar.
2. Type your response for each phase.
3. Click **Next Phase** to advance.
4. Your responses are saved locally per lab.
5. Click **Open Related Lab** to apply your troubleshooting in the simulator.

---

## 7. Interview Room

The Interview Room prepares you for network engineering interviews.

### 7.1 Progressive Levels

The Interview Room contains 9 levels of increasing difficulty:

| Level | Topic | Difficulty |
|---|---|---|
| 1 | What is a network protocol? | Foundations |
| 2 | Describe the OSI model layers | Foundations |
| 3 | TCP vs UDP | Transport |
| 4 | How a switch learns MAC addresses | Switching |
| 5 | What is a VLAN and why use it? | Switching |
| 6 | OSPF neighbor states | Routing |
| 7 | BGP path manipulation | Routing |
| 8 | Zero-day network exploit mitigation | Security |
| 9 | Design a 5,000-user enterprise network | Design |

### 7.2 Answering Questions

1. Select a level using the L1–L9 buttons.
2. Read the question and write your answer in the text area.
3. Click **Submit Answer**.
4. Your answer is checked against expected keywords.
5. View your **keyword coverage** percentage.

### 7.3 Tips for Success

- Answer as if speaking to a hiring manager: concise but complete.
- Cover the key concepts listed in the expected keywords.
- Progress through levels sequentially; each builds on prior knowledge.
- Review your answer history to track improvement.

---

## 8. Research Lab

The Research Lab teaches scientific method and protocol analysis.

### 8.1 The Scientific Method Cycle

Work through these phases for each experiment:

1. **Problem Statement** — Define the research question.
2. **Known Facts** — List what is already established.
3. **Unknowns** — Identify gaps in knowledge.
4. **Hypothesis** — State a testable prediction.
5. **Observations** — Record experimental data and notes.
6. **Results** — Summarize quantitative outcomes.
7. **Conclusion** — Interpret results and state implications.

### 8.2 Using the Research Lab

1. Navigate to **Research Lab** from the sidebar.
2. Click **New Experiment** to create a research entry.
3. Fill in the problem statement, known facts, and unknowns.
4. Set your hypothesis.
5. Run experiments in the lab or collect data from observations.
6. Add observations with timestamps and notes.
7. Complete the experiment with results and conclusion.

### 8.3 Research Registry

The platform includes a 60-institution research registry (Japan + China) for reference:
- Institution names and specializations
- Relevant lab categories and skill mappings
- Use this to align your experiments with academic frameworks.

---

## 9. Building a Portfolio

The Portfolio feature helps you document your engineering work.

### 9.1 Portfolio Categories

Organize artifacts into categories:
- **Topology:** Network diagrams and designs
- **Configuration:** Device configurations and scripts
- **Report:** Lab reports and analysis documents
- **Automation:** Scripts, APIs, and tooling
- **Research:** Experiment notes and conclusions
- **Interview:** Practice answers and feedback

### 9.2 Adding Artifacts

1. Navigate to **Portfolio** from the sidebar.
2. Select a category tab.
3. Enter a **Title** and **Notes/Description**.
4. Click **Add to Portfolio**.
5. Artifacts are saved locally and synced to the backend.

### 9.3 Using Your Portfolio

- Reference portfolio items during interview preparation.
- Export configurations and reports for external review.
- Track your progression from basic labs to advanced projects.
- Combine with evidence records to build a complete engineering narrative.

---

## 10. Engineer Mode & SOC Mode

### 10.1 Engineer Mode

Engineer Mode simulates a network engineer ticket workflow.

1. Navigate to **Engineer Mode** from the sidebar.
2. View assigned tickets with:
   - Issue type (configuration_error, verification_failure, connectivity_issue)
   - Severity (low, medium, high)
   - Lab association
   - Description and affected devices
3. For each ticket:
   - **Investigate:** Gather evidence using lab tools.
   - **Hypothesize:** Form a theory about the root cause.
   - **Test:** Apply configuration changes in the lab.
   - **Document:** Record evidence, actions, and results.
   - **Resolve:** Close the ticket with verification steps.

### 10.2 SOC Mode

SOC Mode places you in a Security Operations Center scenario.

1. From the Dashboard, toggle **SOC Mode**.
2. View active security incidents:
   - **Basic:** Brute force SSH, port scan, malware beacon
   - **Medium:** DNS tunneling, data exfiltration
   - **Advanced:** Advanced persistent threat scenarios
3. For each incident:
   - **Triage:** Assess severity and impact.
   - **Evidence Collection:** Record indicators of compromise.
   - **Containment:** Define immediate mitigation steps.
   - **Investigation Timeline:** Track events chronologically.
   - **Root Cause Analysis:** Determine the underlying cause.
   - **Recovery:** Plan restoration and lessons learned.

### 10.3 Ticket Persistence

- Tickets are encrypted at rest using AES-256-CBC.
- Sensitive fields (description, reportedBy, remediation) are encrypted.
- All ticket operations are audit-logged with timestamps.
- Tickets persist across sessions in the backend state store.

---

## 11. Settings & Accessibility

### 11.1 Themes

Choose from 7 color themes:
- Cyber Blue (default)
- Emerald
- Crimson
- Purple
- Deep Space
- Neon Cyan
- Stealth

### 11.2 Backgrounds

Select from 20 background renderers:
- Particles
- Grid
- Matrix
- Waves
- Circuit
- Nebula
- And more...

### 11.3 Panel Design Modes

Switch the UI panel style:
- **Dark NOC Neon** — Dark background with cyan accents (default)
- **Operations Light** — Light background for daytime use
- **Server Room Console** — Amber-on-dark console aesthetic

### 11.4 Accessibility Options

CyberNet Lab meets WCAG AA standards (18.46:1 contrast ratio). Options include:

| Option | Purpose |
|---|---|
| **High Contrast** | Increases contrast for low-vision users |
| **Larger Text** | Increases base font size |
| **Reduced Transparency** | Removes glassmorphism effects |
| **Reduced Glow** | Reduces neon glow and shadows |
| **Invert Colors** | Inverts the color scheme |
| **Animations** | Toggle particle and transition animations |
| **Sound** | Toggle ambient sound effects |

### 11.5 Language Selection

Switch the interface language using the language selector in the header:
- English (en)
- Hindi (hi)
- Chinese (zh)
- Japanese (ja)

### 11.6 Music Player

- The music player is located in the bottom-right corner.
- Default is **OFF** (`DEFAULT_MUSIC = 'none'`).
- No autoplay; user must explicitly enable sound.
- Volume control is available in the player controls.
- Music files are loaded from the `song/` directory.

---

## 12. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Navigate between interactive elements |
| `Enter` / `Space` | Activate buttons and cards |
| `Escape` | Close modals and dialogs |
| `Ctrl + K` | Open global search (when available) |

---

## 13. Troubleshooting the Platform

### 13.1 Catalog Fails to Load

- Click **Retry catalog** on the loading screen.
- Check browser console for errors.
- Ensure the backend is running at `http://localhost:3000`.
- Verify `/api/health` returns `{ "status": "ok" }`.

### 13.2 Lab Does Not Start

- Check the browser console for error messages.
- Verify the lab is not quarantined (BROKEN status).
- Ensure prerequisites are completed.
- Refresh the page and try again.

### 13.3 Verification Fails Unexpectedly

- Review the step requirements carefully.
- Use the **Hint** button for guidance.
- Check the **Evidence Panel** for detailed error messages.
- Use the **Troubleshooting Coach** for structured debugging.

### 13.4 Progress Not Saving

- Ensure browser local storage is enabled.
- Check that the backend is reachable for progress sync.
- Verify you are not in private/incognito mode (which may clear storage on close).

---

## 14. Getting Help

- **Documentation:** Review this guide and `docs/QUICKSTART.md`.
- **API Reference:** See `API_DOCUMENTATION.md` for backend endpoints.
- **Developer Guide:** See `DEVELOPER_GUIDE.md` for extending the platform.
- **Architecture:** See `docs/ARCHITECTURE.md` for system design details.

---

*This guide is accurate for CyberNet Lab v4.0.0.*
