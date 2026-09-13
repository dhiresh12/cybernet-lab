# CYBERNET LAB — JAPAN + CHINA EDUCATION / HANDS-ON ENGINEERING MASTER BLUEPRINT v3.0

Date: 2026-09-12
Research expansion: 60-institution benchmark (30 Japan + 30 China)
Project: CyberNet Lab
Canonical local path:
`C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`

Local development:
- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:3000/`
- Example API: `GET /api/labs/REF-001` → 200

Status:
- This document is an educational/product blueprint and execution specification.
- It is NOT a claim that CyberNet Lab already implements all items below.
- Every item must move through: PLANNED → IMPLEMENTED → TESTED → RUNTIME-VERIFIED → CHECKPOINTED.

---

# 1. PURPOSE

CyberNet Lab must become a free, beginner-first virtual school + laboratory for:

1. Computer Network Engineer
2. Network Security Engineer
3. NOC Engineer
4. SOC / Cybersecurity Operations beginner
5. Network Administrator / System Administrator
6. CCNA → CCNP Enterprise → advanced enterprise-network engineering
7. Research, experimentation, engineering design and innovation

The learner may:
- start from zero;
- have weak English;
- have no mentor;
- have no Cisco hardware;
- have limited money;
- need a job quickly;
- need both exam preparation and real engineering ability.

The site must therefore teach:

THEORY → PREDICT → OBSERVE → CONFIGURE → VERIFY → BREAK → TROUBLESHOOT → EXPLAIN → RETRIEVE → APPLY → DESIGN → RESEARCH

The platform must NOT become only a quiz website or only a Packet Tracer clone.

---

# 2. IMPORTANT RESEARCH CONCLUSION

Do NOT claim that there is one single "Japanese method" or "Chinese method".

Instead, CyberNet Lab should adopt documented practices found in Japanese and Chinese higher-education/network-security teaching:

JAPAN-INSPIRED:
- experiential learning;
- spaced repeated retrieval;
- metacognitive awareness;
- flipped learning;
- just-in-time feedback;
- peer instruction;
- packet-capture analysis;
- experiment + reflection;
- reports and explanation;
- practical networking/security experiments.

CHINA-INSPIRED:
- progressive experimental levels;
- professional/basic → advanced → comprehensive/innovative;
- theory connected directly to engineering practice;
- self-regulated learning;
- clear goals and standards;
- deep learning;
- independent lab completion;
- engineering problem solving;
- multi-dimensional assessment;
- practical network experimentation at scale.

These are evidence-backed design inputs, not cultural stereotypes.

---

# 3. RESEARCHED EDUCATIONAL PATTERNS

## 3.1 Japanese evidence

### University of Tokyo
UTokyo educational-development material emphasizes:
- flipped classroom;
- just-in-time teaching;
- peer instruction;
- reflection + discussion + practice;
- using pre-class learning explicitly during activities;
- rapid feedback.

CyberNet Lab implementation:
PRE-LAB → SHORT THEORY → PREDICTION → LAB → FEEDBACK → EXPLANATION → RETRIEVAL.

### Japanese packet-analysis teaching
Chuo University 2026 syllabus:
"ICT Case Study (Packet Capture)" uses Wireshark to capture and analyze real traffic and learn TCP/IP analysis and troubleshooting.

Observed pattern:
- architecture/protocols;
- encapsulation;
- Wireshark;
- filters;
- packet extraction/statistics;
- ARP/IPv4/ICMP;
- TCP/UDP;
- TLS;
- troubleshooting.

CyberNet Lab:
Every suitable networking lab should include an OBSERVE mode:
"What should I see in the packet?"
Then capture/analyze/compare.

### Japanese network experiment
Yamaguchi University 2025 network experiment syllabus includes:
- LAN construction with Linux;
- unauthorized-access/security experiments;
- Wireshark packet analysis;
- practical experiments;
- pre-reading;
- assignments outside class.

CyberNet Lab:
Each security lab should have:
PREP → SAFE LAB → OBSERVATION → DEFENSE → REPORT → RETRIEVAL.

### Japanese experiential retrieval
A 2025 Japanese study reported that spaced repeated retrieval improved retention compared with repeated encoding/single retrieval and also improved metacognitive awareness.

CyberNet Lab:
Every important concept gets:
- Day 0 learning;
- Day 1 retrieval;
- Day 3 retrieval;
- Day 7 retrieval;
- Day 14 retrieval;
- Day 30 application.

The learner should answer before seeing the explanation.

---

# 4. CHINESE EVIDENCE

## 4.1 Progressive experimental system

A 2024 study of computer-network experimental teaching in China proposed a three-level system:

LEVEL 1 — PROFESSIONAL / BASIC EXPERIMENTS
LEVEL 2 — ADVANCED EXPERIMENTS
LEVEL 3 — COMPREHENSIVE + INNOVATIVE PRACTICE

The stated purpose is progressive development toward solving complex engineering problems.

CyberNet Lab must adopt this progression everywhere:

BASIC → MEDIUM → ADVANCED → INTEGRATED → INNOVATION

Do NOT merely change the difficulty label. The task itself must become more open-ended.

## 4.2 China Packet Tracer practical learning

China's National Smart Education / Chinese university MOOC ecosystem currently hosts a "Network Technology and Application Experiment" course using Cisco Packet Tracer because real networking laboratories are difficult for many learners to access.

CyberNet Lab should use the same principle:
virtual simulation is a bridge to engineering practice, not a replacement for understanding.

## 4.3 Chinese university networking course pattern

Shanghai Jiao Tong University's Computer Networks course combines:
- layered networking;
- Internet architecture;
- HTTP;
- DNS;
- P2P;
- sockets;
- TCP/IP;
- BGP;
- wireless;
- security;
- case studies;
- practical programming/lab assignments;
- Wireshark;
- Mininet;
- socket programming;
- NFS;
- gRPC.

Important product lesson:
Networking education should not stop at Cisco CLI.
It should gradually connect:
PROTOCOL → PACKET → OS → SERVICE → ROUTING → APPLICATION → SECURITY → AUTOMATION.

## 4.4 Chinese self-regulated learning research

Recent Chinese higher-education research links:
- clear goals/standards;
- self-regulation;
- deep learning;
- cognitive strategies;
- course resources;
- peer/teacher assistance.

CyberNet Lab implementation:
The student dashboard must show:
- today's goal;
- current skill;
- why this skill matters;
- estimated time;
- evidence of mastery;
- weak concepts;
- next retrieval;
- next lab;
- optional help;
- self-assessment.

---

# 5. UNIVERSITY / COURSE BENCHMARK SET

This is a benchmark set, not a claim that these institutions are the only or universally "best".

## JAPAN BENCHMARKS

### University of Tokyo
Study:
- flipped learning;
- peer instruction;
- just-in-time teaching;
- reflection/discussion/practice.

Use for:
learning UX and pedagogy.

### University of Aizu
Network performance course includes:
- network performance evaluation;
- HTTP/DNS packet analysis with Wireshark;
- TCP/UDP measurement with iperf3;
- TCP congestion control;
- OMNeT++ experiments.

Use for:
measurement + packet analysis + experimentation.

### Chuo University
ICT Case Study — Packet Capture:
- Wireshark;
- packet capture;
- filters;
- ARP/IPv4/ICMP;
- TCP/UDP;
- TLS;
- troubleshooting.

Use for:
network observability and troubleshooting labs.

### Yamaguchi University
Information Network Experiment:
- Linux LAN construction;
- security/unauthorized-access experiments;
- Wireshark;
- packet analysis;
- security countermeasures.

Use for:
network + defensive-security integration.

### Osaka University / Basic SecCap
Practical security education:
- real-world problem solving;
- lectures + exercises;
- university/industry/security-organization cooperation;
- practical security skills;
- risk management.

Use for:
SOC/security pathway and scenario-based training.

---

# 6. CHINA BENCHMARKS

### Shanghai Jiao Tong University
Computer Networks:
- Internet architecture;
- TCP/IP;
- HTTP;
- DNS;
- P2P;
- sockets;
- BGP;
- wireless;
- security;
- labs using Wireshark, Mininet, socket programming, NFS, gRPC.

Use for:
advanced protocol + systems networking.

### Chinese National Smart Education / University MOOC
Network Technology and Application Experiment:
- Packet Tracer;
- practical network design;
- analysis;
- problem solving;
- virtual experimentation.

Use for:
large-scale beginner/intermediate simulation labs.

### Chinese university network communications laboratory benchmark
A 2025 Chinese university network laboratory describes practical work involving:
- VLAN routing;
- wireless Layer-3 networking;
- SNMP;
- UTM intrusion prevention;
- firewalls;
- WLAN deployment;
- Huawei routing/switching;
- eNSP;
- Wireshark;
- VirtualBox.

Use for:
network operations + security + enterprise infrastructure.

### Chinese network-security course benchmark
SUSTech/related Chinese course material demonstrates:
- packet interception;
- Wireshark;
- network reconnaissance;
- vulnerabilities;
- network/system security experiments;
- practical defense.

Use for:
safe defensive security labs.

---

# 7. WHERE CYBERNET LAB SHOULD GET STUDY MATERIAL

The site should NOT scrape or copy copyrighted university material.

Use a SOURCE MAP.

## Tier A — Official open sources
- Cisco Networking Academy / Cisco official exam topics
- University syllabi and openly published course pages
- Chinese National Smart Education / China University MOOC
- J-STAGE research
- university laboratory pages
- official Wireshark documentation
- official Linux documentation
- official Mininet documentation
- official Python documentation
- official RFCs / IETF material

## Tier B — Open educational resources
Use only where license/permission permits:
- open textbooks;
- Creative Commons lecture material;
- open lab instructions;
- public university assignments;
- public datasets;
- public PCAP files.

## Tier C — Commercial material
Do NOT copy.
Instead:
- map the concept;
- write original explanations;
- create original lab scenarios;
- cite the source;
- link the learner to the official resource when appropriate.

## Site metadata for every external resource

resourceId
title
provider
country
university/company
topic
level
resourceType
language
license
officialUrl
whyUseful
recommendedFor
relatedLabs
relatedSkills
lastReviewed

---

# 8. CORE SITE EDUCATIONAL ENGINE

The site should eventually implement a learning engine around:

## LEARN
Simple explanation.

## PREDICT
Question before action:
"What do you think will happen?"

## OBSERVE
Show packet/state/topology evidence.

## DO
Hands-on command/configuration.

## VERIFY
Real verification.

## BREAK
Controlled fault injection.

## TROUBLESHOOT
Use engineering reasoning.

## EXPLAIN
Student explains what happened.

## RETRIEVE
Student recalls without notes.

## APPLY
New scenario.

## DESIGN
Student creates a topology/configuration.

## RESEARCH
Student proposes an experiment.

---

# 9. DAILY STUDY SYSTEM

Default beginner daily plan:

TOTAL: 90–120 minutes.

### Block A — 15 min
RETRIEVAL
- yesterday's concepts;
- 5–10 questions;
- no notes initially.

### Block B — 20 min
THEORY
- one small concept;
- simple English;
- visual explanation;
- real-world example.

### Block C — 35–45 min
HANDS-ON
- Packet Tracer / simulator / Wireshark / Linux;
- student must type or configure;
- guided first, independent second.

### Block D — 10–15 min
TROUBLESHOOT
Introduce one controlled failure.

### Block E — 10 min
EXPLAIN
Student answers:
- What did I configure?
- Why?
- What changed?
- How did I verify it?
- What would I check if it failed?

### Block F — 5 min
LEARNING LOG
- confidence 1–5;
- hardest point;
- mistake;
- next review date.

For learners with only 45–60 minutes:
10 retrieval + 10 theory + 25 lab + 5 explanation.

---

# 10. WEEKLY SYSTEM

MONDAY:
New concept + guided lab

TUESDAY:
Same concept + independent lab

WEDNESDAY:
Packet/CLI analysis + troubleshooting

THURSDAY:
New related concept + mixed lab

FRIDAY:
Failure lab + interview questions

SATURDAY:
Integrated mini-project

SUNDAY:
Retrieval + weak-area review + reflection

Every 4th week:
CAPSTONE / MINI-ASSESSMENT.

---

# 11. BEGINNER → ADVANCED ROADMAP

## STAGE 0 — DIGITAL / NETWORK FOUNDATIONS
Topics:
- computer components;
- NIC;
- MAC;
- IP;
- IPv4;
- IPv6;
- subnet;
- gateway;
- DNS;
- DHCP;
- ARP;
- Ethernet;
- switch;
- router;
- packets;
- ports.

Hands-on:
- inspect Windows network settings;
- ping;
- ipconfig/ifconfig;
- arp;
- nslookup/dig;
- Wireshark first capture.

## STAGE 1 — CCNA FOUNDATION
Align to current CCNA domains:
1. Network Fundamentals
2. Network Access
3. IP Connectivity
4. IP Services
5. Security Fundamentals
6. Automation and Programmability

Every topic:
THEORY + PACKET VIEW + CONFIG + VERIFY + FAILURE + INTERVIEW.

## STAGE 2 — CCNA PRACTICAL MASTERY
Labs:
- switch basics;
- VLAN;
- trunk;
- STP concepts;
- EtherChannel;
- router interfaces;
- static routes;
- IPv6;
- OSPF;
- DHCP;
- NAT/PAT;
- ACL;
- SSH;
- NTP;
- Syslog;
- SNMP;
- port security;
- WLAN concepts.

## STAGE 3 — NETWORK TROUBLESHOOTING
Train the process, not memorized commands:

1. Define expected behavior.
2. Identify symptom.
3. Check physical/link.
4. Check interface.
5. Check addressing.
6. Check VLAN.
7. Check ARP/MAC.
8. Check routing.
9. Check services.
10. Check security policy.
11. Test one hypothesis.
12. Verify.
13. Document.

## STAGE 4 — CCNP ENTERPRISE
Current Cisco CCNP Enterprise structure:
CORE:
350-401 ENCOR

Concentration options include:
- ENARSI;
- ENSDWI;
- ENSLD;
- ENAUTO;
- ENCC;
- ENNA.

CyberNet Lab should prioritize:
ENCOR foundation → ENARSI for advanced routing/troubleshooting → design/automation/security branches.

## STAGE 5 — EXPERT / CCIE-STYLE THINKING
Do not promise certification.
Train:
- plan;
- design;
- operate;
- optimize;
- troubleshoot;
- document;
- explain tradeoffs.

CCIE Enterprise Infrastructure includes an 8-hour hands-on lab exam focused on planning, designing, operating and optimizing complex dual-stack infrastructure.

CyberNet Lab can reproduce the THINKING PATTERN through long-form capstones without copying the exam.

---

# 12. SECURITY ENGINEER PATH

## SECURITY BASIC
- CIA triad;
- authentication;
- authorization;
- least privilege;
- logging;
- patching;
- passwords;
- MFA concepts;
- network segmentation;
- firewall basics;
- ACL;
- DNS security basics.

Labs:
- identify failed logins;
- inspect logs;
- detect unusual DNS;
- write simple ACL policy;
- harden management access;
- verify logs.

## SECURITY MEDIUM
- packet analysis;
- reconnaissance detection;
- brute-force pattern detection;
- suspicious DNS;
- HTTP anomalies;
- firewall rules;
- IDS/IPS concepts;
- syslog;
- SIEM concepts;
- incident triage.

## SECURITY ADVANCED
- multi-stage incident timeline;
- network segmentation;
- detection engineering;
- alert correlation;
- containment decisions;
- evidence collection;
- incident report;
- threat-hunting hypothesis;
- network-security architecture.

All security labs must be safe, authorized, isolated and defensive.

---

# 13. SOC MODE

SOC BASIC:
- read alert;
- identify asset;
- inspect source/destination;
- inspect timestamp;
- inspect event type;
- classify severity;
- close false positive.

SOC MEDIUM:
- correlate multiple events;
- investigate failed login sequence;
- suspicious DNS;
- port-scan pattern;
- endpoint/network evidence;
- create timeline;
- containment recommendation.

SOC ADVANCED:
- multi-stage incident;
- network + endpoint evidence;
- detection rule design;
- investigation report;
- root cause;
- containment;
- recovery;
- lessons learned.

SOC must be hands-on, not only animated dashboards.

---

# 14. ENGINEER MODE

## BASIC
- addressing;
- subnetting;
- ping;
- ARP;
- MAC table;
- switch port;
- VLAN;
- DHCP;
- gateway.

## MEDIUM
- trunk;
- inter-VLAN;
- static routing;
- RIP concepts;
- OSPF;
- NAT/PAT;
- ACL;
- SSH;
- NTP;
- Syslog.

## ADVANCED
- multi-router enterprise;
- OSPF troubleshooting;
- route filtering;
- redundancy;
- WAN;
- network assurance;
- monitoring;
- design decisions;
- security architecture;
- automation concepts.

Each level must have:
GUIDED → SEMI-GUIDED → INDEPENDENT → FAILURE → DESIGN.

---

# 15. EVERY LAB — REQUIRED LEARNER CONTENT

Do not use one generic paragraph across 200+ labs.

Every lab must have unique:

1. Title
2. Difficulty
3. Engineer role
4. Real-world company scenario
5. Business problem
6. Mission
7. Learning objectives
8. Prerequisites
9. Required devices/resources
10. Topology
11. IP plan
12. Expected starting state
13. Why this topology exists
14. 20 meaningful steps
15. Commands/configuration
16. Expected output
17. Verification
18. Common mistakes
19. Troubleshooting decision tree
20. Failure tutorial
21. Beginner tutorial
22. Concept learned
23. Real-world use
24. Interview questions
25. Challenge
26. Progressive hints
27. Knowledge check
28. Debrief
29. Retrieval schedule
30. Next recommended lab

The 20 steps are NOT filler.
Each step must answer:
ACTION + WHY + EXPECTED RESULT + VERIFY.

---

# 16. REQUIRED DEVICES MUST BE LAB-SPECIFIC

BAD:
"Router, switch, PC"

GOOD:
"2× Cisco 2911 routers because the exercise demonstrates inter-site routing; 2× 2960 switches because each branch needs a separate access layer; 4× PCs because two endpoints are used for positive/negative connectivity tests."

If the simulator does not need a physical device, do not list it.

---

# 17. TOPOLOGY MUST BE LAB-SPECIFIC

Every topology must explain:
- device role;
- link purpose;
- VLAN;
- subnet;
- gateway;
- routing relationship;
- traffic direction;
- security boundary.

Add:
"Why this topology?"

The student should learn to DESIGN topology, not merely copy it.

---

# 18. CONFIGURATION FORMAT

For every important configuration:

COMMAND
→ WHAT IT DOES
→ WHY WE NEED IT
→ EXPECTED STATE
→ VERIFY COMMAND
→ EXPECTED OUTPUT
→ COMMON MISTAKE

Example:

`ip address 192.168.10.1 255.255.255.0`

Meaning:
Assigns an IPv4 address and subnet mask to the interface.

Why:
The interface needs a Layer-3 identity for communication.

Verify:
`show ip interface brief`

Expected:
Interface has correct address and is up/up.

---

# 19. TROUBLESHOOTING SYSTEM

Every lab must contain at least one realistic failure.

Examples:
- wrong IP;
- wrong subnet mask;
- shutdown interface;
- wrong VLAN;
- wrong trunk;
- wrong gateway;
- missing route;
- ACL blocking traffic;
- DHCP wrong pool;
- DNS failure;
- duplicate IP;
- wrong NAT rule;
- incorrect OSPF network;
- wrong administrative access.

Troubleshooting UI:

SYMPTOM
↓
EXPECTED
↓
OBSERVE
↓
HYPOTHESIS
↓
TEST
↓
RESULT
↓
NEXT HYPOTHESIS
↓
FIX
↓
VERIFY
↓
DOCUMENT

Never give the answer immediately.

---

# 20. PROGRESSIVE HINT ENGINE

HINT 0 — THINK
"What layer or component should you inspect?"

HINT 1 — CONCEPT
"Remember: the default gateway is used to reach another network."

HINT 2 — ACTION
"Check the endpoint's IP address and subnet mask."

HINT 3 — COMMAND DIRECTION
"Use an interface/IP inspection command."

HINT 4 — GUIDED
"Compare the configured IP with the expected IP in the lab plan."

HINT 5 — EXPLANATION
"Your host is in the wrong subnet, so it cannot reach the intended network."

The student should spend effort before receiving the answer.

---

# 21. DEBRIEF ENGINE

After every meaningful lab:

1. What was the problem?
2. What did you predict?
3. What did you configure?
4. What evidence proved it worked?
5. What failed?
6. What caused the failure?
7. What command helped?
8. What would you do in a real company?
9. Explain the concept in your own words.
10. What should you remember one week from now?

---

# 22. INTERVIEW ENGINE

Every topic should progress:

LEVEL 1:
"What is VLAN?"

LEVEL 2:
"Why do we use VLAN?"

LEVEL 3:
"How does VLAN work?"

LEVEL 4:
"How do you configure VLAN?"

LEVEL 5:
"How do you verify VLAN?"

LEVEL 6:
"Users in VLAN 10 cannot communicate. What do you check?"

LEVEL 7:
"How would you troubleshoot this in a production network?"

LEVEL 8:
"Which design would you choose and why?"

LEVEL 9:
"Explain the trade-off to a senior engineer."

---

# 23. RESEARCH + INNOVATION MODE

The site should eventually include a RESEARCH LAB.

Learner receives:
- problem statement;
- known facts;
- unknowns;
- tools;
- constraints.

Learner creates:
HYPOTHESIS → EXPERIMENT → MEASUREMENT → RESULT → INTERPRETATION → LIMITATION → NEXT EXPERIMENT.

Examples:
- compare TCP vs UDP behavior;
- measure packet loss;
- compare routing paths;
- test DNS latency;
- inspect ARP behavior;
- measure congestion;
- compare ACL designs;
- evaluate segmentation;
- investigate anomaly patterns.

Research mode should reward:
- good question;
- reproducibility;
- measurement;
- reasoning;
- documentation;
not only the "correct" final answer.

---

# 24. PROJECT MODE

Students should eventually build:
- small office network;
- branch-office network;
- campus network;
- secure enterprise network;
- NOC monitoring design;
- SOC incident-response lab;
- segmented network;
- routed multi-site network;
- network-security architecture.

Final project requirements:
- requirements;
- topology;
- addressing plan;
- device selection;
- configuration;
- verification;
- failure testing;
- security;
- monitoring;
- documentation;
- presentation;
- interview defense.

---

# 25. FUN + SERIOUS ENGINEERING UI

The UI must feel like a real engineering environment.

Do NOT make it look like a generic school LMS.

Visual direction:
- NOC/SOC command center;
- dark engineering workspace;
- restrained cyber aesthetic;
- topology canvas;
- live packet/event stream;
- device state;
- terminal;
- evidence panel;
- mission panel;
- investigation timeline;
- lab notebook;
- progress graph;
- skill map;
- retrieval calendar.

Avoid:
- excessive neon;
- meaningless 3D decoration;
- dashboard-only visuals;
- game points without learning value.

Fun should come from:
- missions;
- incident scenarios;
- unlockable skills;
- experiments;
- troubleshooting;
- realistic feedback;
- progression;
- personal mastery.

---

# 26. NEW LEARNER HOME DASHBOARD

Display:

TODAY'S MISSION
- topic;
- estimated time;
- required tools.

RETRIEVAL
- 5 questions due today.

HANDS-ON
- today's lab.

WEAK SKILLS
- top 3.

ENGINEER SCORE
- not a single fake score;
- show separate:
  Knowledge
  Configuration
  Verification
  Troubleshooting
  Explanation
  Design

NEXT REVIEW:
- Day 1 / 3 / 7 / 14 / 30.

PORTFOLIO:
- completed labs;
- projects;
- reports;
- troubleshooting cases.

---

# 27. PERSONALIZED LEARNING

Do not simply say "AI recommends a lab."

Use evidence:

IF:
- quiz weak → micro-theory;
- configuration weak → guided lab;
- verification weak → observation exercise;
- troubleshooting weak → failure lab;
- explanation weak → teach-back;
- repeated failure → prerequisite review;
- strong performance → open-ended challenge.

The recommendation engine should record WHY a lab was recommended.

---

# 28. DAILY WORKLOAD CONTROL

Default:
90–120 minutes/day.

Do not force 6–8 hours.

Intensity modes:

LIGHT:
45–60 min

NORMAL:
90–120 min

DEEP:
150–180 min

The system should detect fatigue signals:
- repeated resets;
- repeated hint requests;
- very slow completion;
- low confidence;
- repeated wrong answers.

Then recommend:
"Take a short break / switch to review / finish tomorrow."

---

# 29. ENGLISH-FRIENDLY LEARNING

For beginner learners with weak English:

Every important concept:
TERM
→ SIMPLE ENGLISH
→ SIMPLE EXAMPLE
→ WHY
→ HOW
→ COMMAND
→ OUTPUT
→ HINDI-FRIENDLY CONCEPT CLARITY where appropriate.

Do not translate every technical command.

Teach the learner the English vocabulary used by engineers:
interface, gateway, subnet, route, reachable, denied, timeout, source, destination, protocol, authentication, incident, evidence, configure, verify, troubleshoot.

---

# 30. RESOURCE TYPES TO BUILD

The platform should contain original material in these forms:

1. Micro-theory
2. Visual concept
3. Command card
4. Packet-view lesson
5. Configuration lab
6. Troubleshooting lab
7. Failure lab
8. Wireshark investigation
9. Linux networking lab
10. Packet Tracer lab
11. Network-design challenge
12. SOC alert investigation
13. Incident report
14. Interview drill
15. Research experiment
16. Capstone
17. Retrieval quiz
18. Reflection
19. Lab notebook
20. Portfolio artifact

---

# 31. TOOLCHAIN

Beginner:
- Packet Tracer
- Wireshark
- Windows network tools
- Linux networking commands

Intermediate:
- VirtualBox / VMware
- Ubuntu
- Kali in authorized lab only
- Mininet
- iperf3
- tcpdump
- SSH
- Git

Advanced:
- GNS3 / EVE-NG where available
- network emulation
- Python for automation
- APIs
- telemetry
- monitoring
- SIEM concepts
- packet analysis
- network security tooling

CyberNet Lab itself must not falsely claim to emulate unsupported behavior.

---

# 32. LAB REALISM POLICY

If the simulator supports it:
VERIFY IT.

If the simulator partially supports it:
LABEL THE LIMITATION.

If it does not support it:
DO NOT FAKE IT.

Provide:
- closest valid simulation;
- conceptual explanation;
- external tool lab if appropriate;
- future simulator-expansion task.

This preserves learner trust.

---

# 33. CCNA → CCNP → EXPERT STUDY STRATEGY

## CCNA
Goal:
foundation + configuration + verification + basic troubleshooting.

Suggested cycle per topic:
1 day theory/observation
2–3 days labs
1 day troubleshooting
1 day mixed retrieval/interview

Before exam:
- mixed timed questions;
- configuration from blank;
- troubleshoot without hints;
- explain concepts aloud;
- random lab selection.

## CCNP
Goal:
complexity + design + troubleshooting + protocol reasoning.

Increase:
- multi-device labs;
- ambiguous faults;
- multiple possible solutions;
- documentation;
- design decisions;
- protocol analysis.

## Expert
Goal:
independent engineering judgment.

Use:
- long scenarios;
- minimal instructions;
- time limits;
- change requests;
- failures;
- optimization;
- design defense.

Certification preparation must not become exam-dump memorization.

---

# 34. HOW CYBERNET LAB MAKES THE LEARNER UNIQUE

The learner should graduate with evidence, not only badges.

Portfolio:
- topology designs;
- configuration files;
- PCAP analyses;
- troubleshooting reports;
- incident reports;
- network diagrams;
- research experiments;
- capstone projects;
- interview explanations;
- engineering decision records.

The student should be able to say:
"I did it, I measured it, I broke it, I fixed it, and I can explain why."

---

# 35. 200+ LAB REMEDIATION STRATEGY

Do NOT regenerate all labs from one prompt.

Process in controlled batches:

BATCH A:
network fundamentals

BATCH B:
switching/VLAN

BATCH C:
routing

BATCH D:
services

BATCH E:
security

BATCH F:
Wireshark/analysis

BATCH G:
Linux/network systems

BATCH H:
SOC

BATCH I:
advanced enterprise

BATCH J:
capstones/research

For each batch:
1. inventory;
2. classify;
3. inspect actual lab;
4. identify missing fields;
5. rewrite only missing/weak content;
6. preserve valid configuration;
7. verify simulator support;
8. test;
9. runtime verify;
10. quality gate;
11. checkpoint.

---

# 36. QUALITY GATE FOR EVERY LAB

PASS only if:
- mission is meaningful;
- objectives are clear;
- resources are specific;
- topology is specific;
- IP plan is specific;
- steps are meaningful;
- configuration matches;
- verification is real;
- troubleshooting exists;
- failure tutorial exists;
- concept learned exists;
- interview questions exist;
- hints are progressive;
- debrief exists;
- retrieval is scheduled;
- no fake simulator behavior;
- no duplicate lab content.

---

# 37. REQUIRED NEW SITE FUNCTIONS

## A. Learning Roadmap
Zero → CCNA → CCNP → Security → Advanced → Research.

## B. Daily Mission
One concrete task.

## C. Retrieval Center
Spaced questions due today.

## D. Lab Workspace
Hands-on simulation.

## E. Evidence Panel
Shows actual state/outputs/packets.

## F. Failure Lab
Controlled fault injection.

## G. Troubleshooting Coach
Guides reasoning instead of giving answers.

## H. Interview Room
Progressive interview questions.

## I. Research Lab
Hypothesis and experiment workflow.

## J. Portfolio
Stores learner evidence.

## K. Resource Library
Curated official/open resources.

## L. Study Planner
45/90/150-minute modes.

## M. Skill Graph
Shows prerequisite relationships.

## N. Debrief
Post-lab reflection.

## O. Course Mode
Micro-learning → practical → assessment → project.

## P. SOC
Basic/Medium/Advanced defensive operations.

## Q. Engineer Mode
Basic/Medium/Advanced network-engineering tasks.

---

# 38. UI INFORMATION ARCHITECTURE

HOME
├── Today's Mission
├── Continue Learning
├── Retrieval Due
├── Skill Map
├── Weak Areas
└── Portfolio

LEARN
├── Foundations
├── Network Engineering
├── Security Engineering
├── SOC
├── Linux
├── Automation
└── Research

LABS
├── Basic
├── Medium
├── Advanced
├── Failure Labs
├── Packet Analysis
└── Capstones

ENGINEER MODE
├── Basic
├── Medium
└── Advanced

SOC
├── Basic
├── Medium
└── Advanced

COURSES
├── CCNA Foundation
├── CCNA Practical
├── CCNP Core
├── Routing
├── Network Security
├── SOC
└── Research

TOOLS
├── Packet Tracer
├── Wireshark
├── Linux
├── Subnet Calculator
├── Packet Decoder
└── Command Reference

INTERVIEW
├── NOC
├── Network Engineer
├── Network Security
├── SOC
├── CCNA
└── CCNP

RESEARCH
├── Experiments
├── Projects
├── Papers/Resources
└── Innovation Challenges

PORTFOLIO
├── Labs
├── Reports
├── PCAP Analysis
├── Projects
└── Certificates

---

# 39. ARCHITECTURE SAFETY

Existing CyberNet Lab architecture remains authoritative.

Before changing code:
- read MENU.md;
- read LAB_REMEDIATION_PLAN.md;
- read CYBERNET_LAB_BLUEPRINT.md;
- read PROJECT_CHECKPOINT.md;
- read PROJECT_CONTEXT.md;
- inspect exact implementation.

Never:
- rebuild;
- create duplicate LabEngine;
- create duplicate hint engine;
- create duplicate state store;
- create duplicate simulator;
- create fake verifier;
- put simulation rules in UI;
- blindly regenerate 249 labs;
- copy university copyrighted material;
- treat research papers as implementation truth.

Current project documentation explicitly requires avoiding duplicate functionality and preserving the existing architecture.

---

# 40. LAUNCH LAB WORKSPACE

The reported "Something went wrong" must be treated as a runtime defect.

Reproduce:
1. frontend 5173;
2. backend 3000;
3. open known lab;
4. click Launch Lab Workspace;
5. inspect browser console;
6. inspect network;
7. inspect WebSocket;
8. inspect API;
9. inspect React error boundary;
10. inspect server logs.

Fix the actual root cause.
Do not guess.

---

# 41. PACKET TRACER HINTS

Hints must be:
- progressive;
- contextual;
- lab-specific;
- tied to the current step;
- based on the learner's actual state where possible.

Never:
"Configure the router."

Instead:
"Your PC needs a path to another network. Which device normally provides that path?"

---

# 42. JAPAN + CHINA + CISCO COMBINED PEDAGOGY

FINAL LEARNING LOOP:

1. PREVIEW
2. PREDICT
3. LEARN
4. OBSERVE
5. CONFIGURE
6. VERIFY
7. BREAK
8. TROUBLESHOOT
9. EXPLAIN
10. RETRIEVE
11. APPLY
12. DESIGN
13. RESEARCH
14. REFLECT

This combines:
- Japanese experiential/retrieval/reflection;
- Chinese progressive engineering practice/self-regulation;
- Cisco certification domain alignment;
- real network/security engineering.

---

# 43. IMPLEMENTATION PHASES

PHASE 0 — SOURCE / ARCHITECTURE BASELINE
Read all authoritative files and record actual state.

PHASE 1 — LAUNCH WORKSPACE
Fix runtime error.

PHASE 2 — HINT ENGINE
Fix Packet Tracer/simulator hints.

PHASE 3 — LAB CONTENT MODEL
Implement/verify complete learner-facing fields.

PHASE 4 — 5 PILOT LABS
Select:
- one basic networking;
- one VLAN/switching;
- one routing;
- one Wireshark;
- one security/SOC.

PHASE 5 — 200+ LAB REMEDIATION
Controlled category batches.

PHASE 6 — SOC
Basic → Medium → Advanced.

PHASE 7 — ENGINEER MODE
Basic → Medium → Advanced.

PHASE 8 — COURSES
Course pathways + practical work.

PHASE 9 — LEARNING SCIENCE
Retrieval + reflection + prediction + debrief + adaptive recommendations.

PHASE 10 — INTERVIEW
NOC → Network Engineer → Security → SOC → CCNA → CCNP.

PHASE 11 — RESEARCH / INNOVATION
Experiments + project + research notebook.

PHASE 12 — PORTFOLIO
Evidence of engineering ability.

PHASE 13 — FULL QA
Content + simulator + UI + accessibility + runtime.

PHASE 14 — PRODUCTION
Localhost → production environment → Render → smoke tests.

---

# 44. IMPLEMENTATION STATUS RULE

For every feature maintain:

PLANNED
IMPLEMENTED
TESTED
RUNTIME-VERIFIED
CHECKPOINTED

Never call a planned educational idea "done".

---

# 45. RESEARCH SOURCES / STARTING POINTS

Japanese:
- University of Tokyo educational development / flipped classroom / peer instruction:
  https://edulab.t.u-tokyo.ac.jp/al-technique-flipped-classroom/
- University of Tokyo FD Open:
  https://www.u-tokyo.ac.jp/focus/en/events/z0308_00006.html
- Chuo University 2026 packet-capture syllabus:
  https://syllabus.chuo-u.ac.jp/syllabus/detail/?free_word=%E8%AA%9E&id=1697
- University of Aizu 2026 syllabus:
  https://web-ext.u-aizu.ac.jp/official/curriculum/syllabus/2026_1_E_015.html
- Yamaguchi University network experiment:
  https://www.kyoumu.jimu.yamaguchi-u.ac.jp/Portal/Public/SyllabusV2/DetailMain.aspx?je_cd=1&lct_cd=3261420320&lct_year=2025
- J-STAGE spaced repeated retrieval research:
  https://www.jstage.jst.go.jp/article/shes/23/2/23_155/_article/-char/ja/

China:
- Shanghai Jiao Tong University CS3611 Computer Networks:
  https://www.cs.sjtu.edu.cn/~jinhaiming/cs3611sp25/
- Chinese National Smart Education / Network Technology and Application Experiment:
  https://www.chinaooc.com.cn/course/688d2ba6f57d20271c3f39ca
- Chinese computer-network three-level experimental teaching research:
  https://www.sy.uestc.edu.cn/en/article/doi/10.12179/1672-4550.20230482
- Chinese online-learning/self-regulated learning research:
  https://journals.sagepub.com/doi/10.1177/21582440251365390
- Chinese network-security practical-course benchmark:
  https://mirrors.sustech.edu.cn/courses/syllabus/html/CS315.html

Cisco:
- CCNA exam topics:
  https://learningnetwork.cisco.com/s/ccna-exam-topics
- Cisco CCNA:
  https://www.cisco.com/site/us/en/learn/training-certifications/exams/ccna.html
- Cisco CCNA official course/labs:
  https://www.cisco.com/site/us/en/learn/training-certifications/training/courses/ccna.html
- Cisco CCNP Enterprise:
  https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccnp-enterprise/index.html
- Cisco CCIE Enterprise Infrastructure:
  https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccie-enterprise-infrastructure/exams-and-training.html

---

# 46. SOURCE USE POLICY

For each external resource:
1. read;
2. classify;
3. record license/usage rights;
4. extract concepts, not copyrighted text;
5. create original CyberNet Lab lesson;
6. link to source;
7. connect to labs;
8. periodically review.

Never bulk-copy:
- university PDFs;
- paid books;
- paid course videos;
- exam dumps;
- proprietary lab manuals.

---

# 47. FINAL PRODUCT STANDARD

CyberNet Lab should feel like:

A free engineering school where a student can say:

"I learned the concept."
"I predicted what would happen."
"I configured it."
"I saw the packet."
"I verified it."
"I broke it."
"I found the fault."
"I fixed it."
"I explained it."
"I remembered it later."
"I solved a new scenario."
"I designed a network."
"I wrote a report."
"I can discuss it in an interview."

That is the target.

---

# 48. FINAL ACCEPTANCE CHECKLIST

EDUCATION:
- [ ] Japanese evidence-based learning patterns implemented
- [ ] Chinese progressive learning patterns implemented
- [ ] spaced retrieval implemented
- [ ] prediction/metacognition implemented
- [ ] debrief implemented
- [ ] self-regulated learning implemented
- [ ] daily hands-on practice implemented

ENGINEERING:
- [ ] Basic/Medium/Advanced progression is real
- [ ] labs are practical
- [ ] troubleshooting is practical
- [ ] failure labs exist
- [ ] packet analysis exists
- [ ] network design exists
- [ ] security operations exist
- [ ] research/innovation exists

CERTIFICATION:
- [ ] CCNA domains mapped
- [ ] CCNP Enterprise path mapped
- [ ] advanced routing path mapped
- [ ] expert engineering-thinking path mapped
- [ ] no exam-dump behavior

CONTENT:
- [ ] 200+ labs remediated in controlled batches
- [ ] every lab has unique mission
- [ ] unique resources
- [ ] unique topology
- [ ] meaningful 20-step workflow
- [ ] troubleshooting
- [ ] failure tutorial
- [ ] concept learned
- [ ] interview questions
- [ ] debrief
- [ ] retrieval schedule

PRODUCT:
- [ ] Launch Lab Workspace works
- [ ] Packet Tracer hints are clear
- [ ] SOC Basic/Medium/Advanced works
- [ ] Engineer Basic/Medium/Advanced works
- [ ] Courses contain practical work
- [ ] Resource Library works
- [ ] Research Lab works
- [ ] Portfolio works
- [ ] localhost works
- [ ] Render works
- [ ] production smoke tests pass

---

# 49. IMPORTANT: WHAT THIS DOCUMENT DOES NOT CLAIM

This blueprint does NOT claim:
- every Japanese student studies exactly this way;
- every Chinese student studies exactly this way;
- a university syllabus equals a national learning method;
- CyberNet Lab can reproduce physical Cisco hardware;
- passing labs guarantees CCNA/CCNP/CCIE;
- external university content may be copied.

The goal is to use documented educational patterns as design inspiration and evidence, then create original, practical CyberNet Lab content.


# 50. EXPANDED JAPAN + CHINA 60-INSTITUTION BENCHMARK PROGRAM

## 50.1 Why the benchmark was expanded

The previous blueprint used a smaller set of universities as direct examples. That is useful for design, but it is not sufficient for a claim about recurring patterns across Japan and China.

This version therefore expands the benchmark pool to **60 institutions: 30 Japan + 30 China**.

IMPORTANT EVIDENCE RULE:

A university appearing in the 60-institution benchmark is NOT automatically evidence that its students all use one teaching method. The benchmark is a structured comparison pool. Only practices supported by public syllabi, laboratory pages, course documents, research papers, or official curriculum pages should be converted into product requirements.

Where a public lab/syllabus was not accessible during the research pass, mark:
`BENCHMARK-ONLY — NEED OFFICIAL COURSE/LAB SOURCE`
rather than inventing details.

The benchmark selection is informed by current 2026 research/CS rankings and university curriculum visibility. Ranking sources themselves are not treated as pedagogical evidence. EduRank reports 100+ CS institutions for both Japan and China, while THE publishes a 2026 national university comparison; these are discovery/indexing tools, not proof of teaching quality. citeturn3search0turn3search1turn3search4turn3search2

---

## 50.2 Japan — 30-institution benchmark pool

### Group J1 — National research universities

1. The University of Tokyo
2. Kyoto University
3. The University of Osaka
4. Tohoku University
5. Institute of Science Tokyo
6. Nagoya University
7. Kyushu University
8. Hokkaido University
9. University of Tsukuba
10. Kobe University
11. Hiroshima University
12. Yokohama National University
13. Chiba University
14. University of Electro-Communications
15. Tokyo University of Agriculture and Technology

### Group J2 — Strong practical / private / specialist benchmarks

16. Keio University
17. Waseda University
18. Ritsumeikan University
19. Rikkyo University
20. Chuo University
21. Meiji University
22. Hosei University
23. Tokyo University of Science
24. Tokyo Denki University
25. University of Aizu
26. Kyushu Institute of Technology
27. Nara Institute of Science and Technology
28. Japan Advanced Institute of Science and Technology
29. Kanazawa University
30. Shizuoka University

The national-research-university portion is consistent with current Japanese university/CS ranking discovery sources; for example, THE's 2026 Japan list places Tokyo, Kyoto, Tohoku, Osaka, Science Tokyo, Nagoya and Kyushu among the leading institutions, while EduRank's 2026 CS list also places Tokyo, Kyoto, Osaka, Tohoku and Science Tokyo highly. citeturn3search2turn3search0

---

## 50.3 China — 30-institution benchmark pool

1. Tsinghua University
2. Peking University
3. Zhejiang University
4. Shanghai Jiao Tong University
5. Fudan University
6. Nanjing University
7. University of Science and Technology of China
8. Wuhan University
9. Huazhong University of Science and Technology
10. Xi'an Jiaotong University
11. Beihang University
12. Harbin Institute of Technology
13. Beijing Institute of Technology
14. Beijing University of Posts and Telecommunications
15. University of Electronic Science and Technology of China
16. Xidian University
17. Southeast University
18. Tongji University
19. Tianjin University
20. Shandong University
21. Sichuan University
22. Chongqing University
23. Dalian University of Technology
24. Northwestern Polytechnical University
25. Sun Yat-sen University
26. South China University of Technology
27. Central South University
28. Hunan University
29. Beijing Jiaotong University
30. University of Science and Technology Beijing

The China pool is anchored to current 2026 university/CS ranking sources and then broadened toward institutions with visible engineering/network/security teaching infrastructure. ShanghaiRanking's 2026 national list places Tsinghua, Peking, Zhejiang, Shanghai Jiao Tong, Fudan, Nanjing, USTC, Wuhan, HUST and Xi'an Jiaotong in the top ten overall. citeturn3search6turn3search7

---

# 51. WHAT THE 60-INSTITUTION COMPARISON REVEALED

Do NOT copy a country's education system.

Instead, identify repeated engineering-learning mechanisms.

The strongest recurring mechanisms relevant to CyberNet Lab are:

### PATTERN A — FOUNDATION FIRST

Students are not thrown directly into advanced networking.

They build:
computer fundamentals
→ mathematics/logic
→ programming/system basics
→ networks
→ security
→ advanced systems/research.

Example:
Tsinghua's undergraduate curriculum explicitly combines general education, science, major study, summer practice and thesis; it also includes a freshman seminar and advanced laboratory work. citeturn0search8

CyberNet Lab implementation:
`FOUNDATION → NETWORK CORE → SECURITY → ADVANCED → RESEARCH`

---

# 52. THE "EASY" METHOD IS ACTUALLY CONTROLLED COMPLEXITY

A major lesson from the comparison is NOT:

"Make everything easy."

Instead:

**Make the first action easy, then increase the reasoning.**

For example:

LEVEL 1:
Click/open/observe.

LEVEL 2:
Follow a short configuration.

LEVEL 3:
Predict output.

LEVEL 4:
Configure from a blank topology.

LEVEL 5:
Repair one failure.

LEVEL 6:
Repair multiple possible failures.

LEVEL 7:
Design the solution.

LEVEL 8:
Defend the design decision.

This should become the core CyberNet Lab difficulty engine.

---

# 53. CHINA-STYLE PROGRESSIVE EXPERIMENT MODEL

A published Chinese computer-network experimental teaching study explicitly describes:

1. professional/basic experiments;
2. advanced experiments;
3. comprehensive innovative practice.

It reports that progressive experiments plus multidimensional evaluation improved students' ability to solve complex engineering problems. citeturn0search0

CyberNet Lab MUST implement this as:

### LEVEL 1 — SKILL LAB
One skill.

### LEVEL 2 — COMBINATION LAB
Two or three related skills.

### LEVEL 3 — ENGINEERING LAB
Complete network problem.

### LEVEL 4 — FAILURE LAB
Unexpected fault.

### LEVEL 5 — INTEGRATED LAB
Network + service + security.

### LEVEL 6 — INNOVATION LAB
Student chooses the method.

---

# 54. CHINESE "VIRTUAL + REAL + PROJECT" MODEL

A 2025 Chinese engineering-education study from University of Science and Technology Beijing describes a "virtual-real training" model combining:

- real experiments + virtual experiments;
- real equipment + open-source software;
- experiment teaching + project training.

It also emphasizes modular content, standardized teaching process and explicit assessment standards. citeturn0search11

CyberNet Lab implementation:

`VIRTUAL`
Packet Tracer / simulator

+

`OPEN SOURCE`
Linux / Wireshark / Mininet / iperf3 / tcpdump

+

`REAL`
Learner's own PC/VM/home network where safe

+

`PROJECT`
End-to-end engineering scenario

This is much better than pretending a browser simulator is a complete physical lab.

---

# 55. CHINESE PREVIEW → OPERATION → SUMMARY MODEL

Tongji University's network experiment syllabus explicitly describes:

1. experiment preparation;
2. experiment operation;
3. experiment summary.

It also requires students to analyze topology, design topology, configure devices and complete testing. citeturn1search6

CyberNet Lab implementation:

### PRE-LAB
- objective;
- prerequisites;
- prediction;
- topology reading;
- 3 preparation questions.

### OPERATION
- configure;
- observe;
- verify.

### POST-LAB
- result;
- mistake;
- explanation;
- troubleshooting;
- report.

This becomes mandatory for substantial labs.

---

# 56. CHINESE NETWORK LABS SHOULD TEST OUTPUT, NOT ONLY ATTENDANCE

The 2025 USTC computer-network course publicly describes:
- theory;
- weekly assignments;
- laboratory work;
- lab reports;
- offline verification;
- ability to complete experiments in the lab or in a self-built environment;
- experimental output may need to be demonstrated;
- exam content can include experimental content. citeturn1search8turn1search15

CyberNet Lab implementation:

A lab cannot become "complete" merely because the learner clicked Finish.

Require evidence:
- command output;
- topology state;
- packet capture;
- connectivity test;
- configuration state;
- explanation.

---

# 57. JAPAN — SECURITY IS CONNECTED TO NETWORK ENGINEERING

Ritsumeikan's Security and Networks course combines:
- computer hardware;
- systems;
- network design/build;
- cryptography;
- authentication;
- network security;
- OS;
- virtualization;
- practical defensive skills.

It explicitly describes practical work around vulnerability resistance, protecting systems and handling detected cyberattacks. citeturn2search0turn2search5

CyberNet Lab therefore MUST NOT separate:
NETWORKING
and
SECURITY

too early.

Instead:

Network Fundamentals
→ Network Security
→ Secure Configuration
→ Monitoring
→ Incident Detection
→ Incident Response
→ Security Architecture.

---

# 58. JAPAN — NETWORK SECURITY LABS SHOULD PRODUCE SKILLS

University of Aizu's 2026 Network Security course includes:
- cryptography;
- secure email;
- SSH;
- TLS;
- IPsec;
- WLAN security;
- firewalls;
- cryptography labs;
- secure client-server implementation.

Its assessment also gives substantial weight to lab assignments. citeturn1search0

CyberNet Lab implementation:

For security concepts:
`THEORY → SMALL LAB → SECURE CONFIG → VERIFY → FAILURE → EXPLAIN`

---

# 59. JAPAN — CYBERSECURITY THROUGH IMMERSIVE PRACTICE

Rikkyo University's 2026 special computer-science course uses:
- real-world cyber incidents;
- threat analysis;
- security countermeasures;
- hacking-tool introduction;
- an intensive CTF practicum;
- team investigation;
- reflection.

The CTF environment is simulated and includes web, network and server security. citeturn1search10

CyberNet Lab implementation:

SOC/Security Mode should include:
- incident story;
- threat model;
- evidence;
- investigation;
- safe simulated attack;
- defensive response;
- post-incident review.

---

# 60. JAPAN — SECURITY PRACTICE IS MULTI-DISCIPLINARY

Information Security Graduate School of Japan's SecCap practical curriculum includes modules for:
- web security testing;
- digital forensics;
- CTF;
- incident response.

Assessment includes discussion participation, reports, presentations and CTF-related reporting. citeturn1search4turn1search5

CyberNet Lab implementation:

Security mastery must be measured across:

`DETECT + ANALYZE + RESPOND + DOCUMENT + EXPLAIN`

not simply:
`QUIZ SCORE`.

---

# 61. JAPAN — CISCO SIMULATION CAN BE USED AS PRACTICAL LEARNING

Tokyo University of Science's advanced computer-network course explicitly uses Cisco Networking Academy material and a Cisco network simulator to teach switching and IP routing through exercises, with the stated goal of giving practical understanding that classroom-only study cannot provide. citeturn0search10

CyberNet Lab implementation:

Packet Tracer is not merely:
"follow these commands."

It must teach:
- topology interpretation;
- configuration;
- observation;
- verification;
- troubleshooting;
- real-world reasoning.

---

# 62. JAPAN — THEORY STILL MATTERS

Not every strong university course is hands-on every week.

The University of Tokyo's 2026 Computer Networks course is strongly theory-focused:
- Layer 1–7;
- Ethernet;
- IP routing algorithms;
- TCP congestion control;
- application mechanisms.

Assessment is examination-based. citeturn2search8

This creates an important rule:

**CyberNet Lab must NOT become 100% clicking/configuration.**

Use:
`THEORY → PRACTICE → THEORY AGAIN`

A student should understand WHY the packet behaves the way it does.

---

# 63. DIFFERENT UNIVERSITY PATTERNS MUST COEXIST

The 60-institution benchmark shows that excellent institutions do not all teach identically.

Therefore CyberNet Lab should have multiple modes:

### MODE 1 — THEORY
For conceptual depth.

### MODE 2 — GUIDED PRACTICE
For beginners.

### MODE 3 — EXPERIMENT
For measurement.

### MODE 4 — TROUBLESHOOTING
For engineering.

### MODE 5 — PROJECT
For integration.

### MODE 6 — RESEARCH
For innovation.

### MODE 7 — INTERVIEW
For communication.

This prevents the false assumption that one teaching technique fits everyone.

---

# 64. THE NEW CYBERNET "PROGRESSIVE SIMPLICITY" MODEL

The system must make complex engineering approachable without making it shallow.

## Stage 1 — SEE

Show:
- simple diagram;
- one concept;
- one packet;
- one command.

## Stage 2 — COPY WITH UNDERSTANDING

Learner follows:
ACTION
WHY
EXPECTED RESULT.

## Stage 3 — PREDICT

Before command:
"What do you expect?"

## Stage 4 — DO

Learner performs independently.

## Stage 5 — VERIFY

Learner proves result.

## Stage 6 — BREAK

One controlled fault.

## Stage 7 — THINK

No immediate answer.

## Stage 8 — TROUBLESHOOT

Use evidence.

## Stage 9 — EXPLAIN

Teach the concept back.

## Stage 10 — TRANSFER

New topology/new problem.

## Stage 11 — DESIGN

Student chooses the architecture.

## Stage 12 — RESEARCH

Student tests a question.

---

# 65. WHAT "THEY ARE AHEAD" SHOULD MEAN

Do NOT encode a myth such as:
"Japanese/Chinese students are naturally smarter."

The defensible lesson is:

Strong institutions often provide:
- strong foundations;
- structured progression;
- intensive practice;
- research exposure;
- engineering projects;
- feedback;
- high expectations;
- independent problem solving;
- evidence-based assessment.

The product should reproduce those **learning conditions**, not stereotypes.

---

# 66. CYBERNET LAB MASTER LEARNING ARCHITECTURE v3

The new architecture is:

## LAYER 1 — FOUNDATION
Vocabulary, computer basics, networking basics.

## LAYER 2 — CONCEPT
OSI/TCP-IP, protocols, addressing, switching, routing.

## LAYER 3 — OBSERVATION
Wireshark, CLI outputs, topology state.

## LAYER 4 — CONFIGURATION
Packet Tracer / simulator / Linux.

## LAYER 5 — VERIFICATION
Proof-based completion.

## LAYER 6 — FAILURE
Controlled fault injection.

## LAYER 7 — TROUBLESHOOTING
Engineering reasoning.

## LAYER 8 — INTEGRATION
Multiple technologies.

## LAYER 9 — SECURITY
Secure operation and defense.

## LAYER 10 — PROJECT
Real-world architecture.

## LAYER 11 — RESEARCH
Hypothesis and measurement.

## LAYER 12 — INTERVIEW
Explain decisions.

## LAYER 13 — PORTFOLIO
Evidence.

---

# 67. NEW LAB DIFFICULTY ALGORITHM

Difficulty must be calculated from multiple dimensions:

`D = topology complexity
   + protocol complexity
   + number of devices
   + ambiguity
   + fault count
   + independence
   + time pressure
   + explanation requirement`

Therefore:
A "Basic" lab can have a difficult concept but easy execution.

An "Advanced" lab should not simply have more commands.

Advanced means:
- less guidance;
- more ambiguity;
- more interconnected systems;
- multiple valid approaches;
- failure;
- design tradeoffs.

---

# 68. NEW COURSE STRUCTURE

Each course:

### WEEK 0
Prerequisite check.

### WEEK 1–2
Foundation.

### WEEK 3–4
Guided labs.

### WEEK 5–6
Independent labs.

### WEEK 7
Troubleshooting.

### WEEK 8
Integrated project.

### WEEK 9
Security.

### WEEK 10
Failure investigation.

### WEEK 11
Interview.

### WEEK 12
Capstone.

### WEEK 13+
Research/extension.

The site should adapt the duration based on the learner's available study time.

---

# 69. RESEARCH-TO-PRODUCT PIPELINE

For each university/course source:

`SOURCE`
→ `OBSERVED PRACTICE`
→ `PEDAGOGICAL PRINCIPLE`
→ `CYBERNET FEATURE`
→ `LAB TEMPLATE`
→ `ASSESSMENT`
→ `TEST`
→ `MEASURE`

Example:

Chuo packet capture:
Wireshark + protocol analysis + troubleshooting

→ principle:
learn network behavior through evidence

→ CyberNet:
Packet Evidence Mode

→ lab:
DNS/HTTP/TCP investigation

→ assessment:
identify packet behavior + explain

---

# 70. 60-INSTITUTION REVIEW TABLE FORMAT

Maintain a machine-readable internal research registry:

| Institution | Country | Source Type | Network | Security | Labs | Projects | Research | Assessment | Pattern | Evidence Status |
|---|---|---|---|---|---|---|---|---|---|---|
| University of Tokyo | Japan | Official syllabus | Strong | Partial | Limited in sampled course | Strong | Strong | Exam | Theory depth | VERIFIED |
| University of Aizu | Japan | Official syllabus | Strong | Strong | Strong | Strong | Strong | Lab+exam | Theory+lab | VERIFIED |
| Ritsumeikan | Japan | Official curriculum | Strong | Strong | Strong | Strong | Strong | Coursework/research | Engineering pathway | VERIFIED |
| Chuo | Japan | Official syllabus | Strong | Medium | Wireshark | Medium | Medium | Coursework | Packet analysis | VERIFIED |
| Tsinghua | China | Official curriculum/lab | Strong | Strong | Advanced lab | Strong | Very strong | Lab+thesis | Research engineering | VERIFIED |
| USTC | China | Official course | Strong | Medium | Strong | Medium | Strong | Exam+lab | Theory+lab | VERIFIED |
| Tongji | China | Official experiment syllabus | Strong | Medium | Strong | Medium | Medium | Experiment report | Prep→operate→summary | VERIFIED |
| HUST | China | Official experiment syllabus | Strong | Medium | Wireshark | Medium | Medium | Practical | Fundamentals+analysis | VERIFIED |

For the remaining benchmark institutions, populate this table only after official evidence is found.

---

# 71. SOURCE CONFIDENCE LEVELS

`A = official current syllabus/lab/curriculum`

`B = official university program/course page`

`C = peer-reviewed educational research describing institution/practice`

`D = reputable ranking/discovery source`

`E = secondary description`

CyberNet implementation decisions should preferably use A/B/C.

D is for discovering institutions.
E is never enough to claim a teaching practice.

---

# 72. NEW RESEARCH TASK INSIDE THE PROJECT

Create:

`docs/research/JP_CN_60_INSTITUTION_EDUCATION_MATRIX.md`

and:

`docs/research/JP_CN_60_INSTITUTION_EDUCATION_MATRIX.json`

Fields:

- institution
- country
- city
- universityType
- sourceUrl
- sourceDate
- sourceConfidence
- csCurriculum
- networking
- networkSecurity
- practicalLabs
- packetAnalysis
- simulation
- Linux
- securityExercises
- CTF
- projectLearning
- researchLearning
- internship/industry
- assessmentStyle
- progressionModel
- preparationPattern
- independentLearning
- reflection
- reportWriting
- presentation
- engineeringDesign
- observedTimeStructure
- CyberNetFeatureMapping
- notes
- evidenceQuoteOrSummary
- lastVerified

---

# 73. RESEARCH REGISTRY RULE

Do not fill missing cells with assumptions.

Use:

`UNKNOWN — SOURCE NOT FOUND`

instead of inventing.

This is critical because the purpose is to make CyberNet Lab evidence-driven.

---

# 74. FINAL "JAPAN + CHINA" DESIGN RULE

CyberNet Lab should NOT say:

"Study like Japanese students."

or:

"Study like Chinese students."

Instead it should say:

**"Use evidence-backed practices observed in high-quality Japanese and Chinese university education."**

Then expose the learner to:

- preparation;
- focused theory;
- practical experimentation;
- progressive difficulty;
- repeated retrieval;
- reflection;
- independent work;
- engineering projects;
- research;
- reports;
- presentation;
- troubleshooting.

---

# 75. NEW TARGET FOR CYBERNET LAB

The learner journey becomes:

ZERO KNOWLEDGE

→ Understand one simple idea

→ Observe one real behavior

→ Perform one action

→ Verify one result

→ Break one system

→ Fix one problem

→ Explain one concept

→ Repeat after spacing

→ Combine concepts

→ Solve an unfamiliar incident

→ Design a network

→ Defend the design

→ Conduct an experiment

→ Write a technical report

→ Build a portfolio

→ Prepare for CCNA

→ Prepare for CCNP

→ Develop professional engineering judgment

This is the new educational north star.

---

END OF BLUEPRINT


---

# 76. CYBERNET LAB v4 — COMPLETE UI / UX / STUDY DECK EXTENSION

> This section is the mandatory v4 product specification added to the existing educational and engineering blueprint.
>
> Goal: preserve the existing CyberNet architecture while adding a complete visual system, theme engine, background engine, panel system, ambient sound controls, animation controls, color inversion/accessibility, Global Study Deck, progress tracking, and strict sequential unlocking.

## 76.1 NON-NEGOTIABLE PRODUCT RULE

CyberNet Lab is an engineering-learning platform, not a decorative cyber dashboard.

The UI must always support:

`FOCUS → LEARN → OBSERVE → DO → VERIFY → TROUBLESHOOT → EXPLAIN → RETRIEVE → PROGRESS`

Visual effects, audio, animation and 3D elements are subordinate to learning.

Never sacrifice:
- readability;
- accessibility;
- performance;
- simulator accuracy;
- lab verification;
- learning progression;
- user control.

---

# 77. V4 VISUAL SYSTEM

## 77.1 Appearance themes

The Settings → Appearance screen MUST provide these exact theme presets:

1. `Cyber Blue`
2. `Emerald Matrix`
3. `Crimson Command`
4. `Purple Galaxy`
5. `Deep Space`
6. `Neon Cyan`
7. `Stealth Black`

Each theme controls:
- primary accent;
- secondary accent;
- background surface;
- panel surface;
- border;
- glow strength;
- text hierarchy;
- success/warning/error colors;
- chart colors;
- topology colors;
- terminal colors;
- focus-ring color.

Theme selection is persisted per learner.

### Theme design rule

Themes must be restrained.

Do NOT turn every component into neon.

Use accent color primarily for:
- active navigation;
- selected state;
- progress;
- important controls;
- topology highlights;
- verification success;
- focus indicators.

---

# 78. BACKGROUND SYSTEM

Settings → Appearance → Background MUST provide:

1. `NOC Iceblue`
2. `Global Network`
3. `3D Globe`
4. `Digital Grid`
5. `Cyber Grid`
6. `Holographic Network`
7. `Data Tunnel`
8. `Wireframe World`
9. `Practical Network`
10. `SOC Command`
11. `Server Room`
12. `Digital Sphere`
13. `Matrix Network`
14. `Radar Network`
15. `Neural Network`
16. `Quantum Network`
17. `Cyber City`
18. `Data Center`
19. `Deep Space Network`

## Background behavior

Every background has:
- static fallback;
- low-motion mode;
- normal-motion mode;
- reduced-motion compatibility;
- performance budget.

Backgrounds must NEVER:
- obscure text;
- reduce contrast;
- interfere with topology interaction;
- cover terminal output;
- block buttons;
- create excessive flashing;
- consume unnecessary CPU/GPU.

### Background layers

Recommended rendering hierarchy:

`BASE COLOR → BACKGROUND VISUAL → LOW-OPACITY EFFECT → CONTENT SURFACE`

The content surface must remain visually dominant.

---

# 79. PANEL DESIGN SYSTEM

Settings → Appearance → Panel Design MUST provide at least:

1. `Dark NOC Neon`
2. `Operations Light`
3. `Server Room Console`

Optional future presets:
- `Glass Command`
- `Industrial Terminal`
- `Minimal Engineer`

## 79.1 Dark NOC Neon

Characteristics:
- dark surfaces;
- thin borders;
- restrained glow;
- command-center feel;
- high information density.

Best for:
- SOC;
- NOC;
- troubleshooting;
- advanced labs.

## 79.2 Operations Light

Characteristics:
- light work surface;
- dark readable text;
- subtle borders;
- low visual noise.

Best for:
- theory;
- reports;
- reading;
- long study sessions.

## 79.3 Server Room Console

Characteristics:
- console-like panels;
- compact status indicators;
- terminal-inspired labels;
- engineering workstation feel.

Best for:
- Linux;
- CLI;
- infrastructure labs;
- automation.

---

# 80. TYPOGRAPHY AND INFORMATION HIERARCHY

Use a readable UI font with a monospace font only where appropriate.

### Proportional font
Use for:
- theory;
- explanations;
- mission text;
- navigation;
- reports.

### Monospace font
Use for:
- commands;
- terminal;
- IP addresses;
- logs;
- packet fields;
- device output;
- code.

Never use a futuristic display font for large bodies of educational text.

## Hierarchy

`PAGE TITLE`
→ `MISSION TITLE`
→ `SECTION`
→ `BODY`
→ `HELP`
→ `METADATA`

Technical values must be visually distinguishable from explanatory prose.

---

# 81. INTERFACE LAYOUT

## 81.1 Desktop

Primary shell:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Logo | Search | Study Deck | Progress | Sound | Settings   │
├──────────────┬───────────────────────────────────────────┬───────────┤
│              │                                           │           │
│ SIDEBAR      │             MAIN WORKSPACE                │ CONTEXT   │
│              │                                           │ PANEL     │
│ Home         │ Mission / Course / Lab / Research        │ Evidence  │
│ Learn        │                                           │ Progress  │
│ Labs         │                                           │ Hints     │
│ Engineer     │                                           │ Notes     │
│ SOC          │                                           │           │
│ Courses      │                                           │           │
│ Tools        │                                           │           │
│ Interview    │                                           │           │
│ Research     │                                           │           │
│ Portfolio    │                                           │           │
└──────────────┴───────────────────────────────────────────┴───────────┘
```

## 81.2 Lab workspace

```text
┌──────────────────────────────────────────────────────────────────────┐
│ LAB HEADER: Mission | Difficulty | Progress | Timer | Exit           │
├──────────────────────┬───────────────────────────┬───────────────────┤
│ MISSION / STEPS      │ TOPOLOGY / SIMULATOR      │ EVIDENCE          │
│                      │                           │                   │
│ Step 1               │       network canvas     │ CLI output        │
│ Step 2               │       packet state       │ packet details    │
│ Step 3               │       device state       │ verification      │
│ ...                  │                           │ logs              │
├──────────────────────┴───────────────────────────┴───────────────────┤
│ TERMINAL / COMMAND AREA | HINTS | NOTEBOOK | DEBRIEF                 │
└──────────────────────────────────────────────────────────────────────┘
```

The layout must remain usable at smaller widths by collapsing:
- context panel;
- secondary navigation;
- nonessential decoration.

---

# 82. HOME DASHBOARD V4

Home must show:

## A. Today's Mission
- mission title;
- skill;
- estimated time;
- required tools;
- current step;
- resume button.

## B. Continue Learning
Shows exactly where the learner stopped.

## C. Retrieval Due
Shows:
- due today;
- overdue;
- upcoming.

## D. Current Course
Shows:
- course progress;
- completed labs;
- next locked item;
- reason for lock.

## E. Engineer Skill Profile

Do NOT use one fake global score.

Display separate mastery values:

- Knowledge
- Configuration
- Observation
- Verification
- Troubleshooting
- Explanation
- Design
- Security
- Automation
- Research

## F. Weak Areas
Top three evidence-based weak skills.

## G. Portfolio
- labs;
- reports;
- PCAP analysis;
- projects;
- design documents.

## H. Study Deck shortcut
One-click access to the Global Study Deck.

---

# 83. GLOBAL STUDY DECK

## 83.1 Purpose

The Global Study Deck is a dedicated focus environment for study and lab practice.

It is NOT a music streaming service.

Its purpose is:
- focus;
- consistent study routine;
- lab concentration;
- session timing;
- distraction reduction.

## 83.2 Deck categories

### JAPAN FOCUS

Subcategories:
- Japanese instrumental focus;
- Japanese motivational instrumental;
- calm study;
- deep work;
- lab concentration.

### CHINA FOCUS

Subcategories:
- Chinese instrumental focus;
- Chinese motivational instrumental;
- calm study;
- deep work;
- lab concentration.

### GLOBAL FOCUS

Subcategories:
- ambient;
- classical;
- electronic focus;
- cyber ambient;
- nature;
- deep work.

## 83.3 Content licensing

Do NOT embed copyrighted commercial music without permission.

The audio catalog must use:
- original tracks;
- properly licensed tracks;
- public-domain material;
- Creative Commons material where license permits;
- provider-approved APIs/content where legally permitted.

Every track stores:
- trackId;
- title;
- region/style;
- language;
- category;
- duration;
- license;
- attribution;
- source;
- active status.

---

# 84. STUDY DECK PLAYER

Player controls:

- Play/Pause
- Previous
- Next
- Volume
- Mute
- Loop
- Shuffle
- Focus timer
- Session duration
- Background sound
- Sound mixer
- Minimize player

Optional mixer:

```text
Music             0 ───────────── 100
Ambient NOC       0 ───────────── 100
Keyboard/Console  0 ───────────── 100
Rain              0 ───────────── 100
White Noise       0 ───────────── 100
```

All sounds must have independent volume controls.

---

# 85. FOCUS SESSION MODES

Presets:

### QUICK
25 minutes focus + 5 minutes break

### STANDARD
45 minutes focus + 10 minutes break

### LAB
60 minutes focus

### DEEP
90 minutes focus + planned break

### CUSTOM
User selects duration.

The system should recommend a break when fatigue indicators appear, consistent with the existing workload-control rules.

---

# 86. STUDY DECK + LAB INTEGRATION

When a learner launches a lab:

```text
START LAB
↓
Optional Focus Session
↓
Select Study Deck
↓
Enter Lab Workspace
↓
Focus player becomes compact
↓
Lab remains primary UI
```

Audio must never cover:
- commands;
- topology;
- verification;
- hints;
- error messages.

If the browser/device cannot autoplay audio, show a normal play control. Do not fake playback state.

---

# 87. AMBIENT SOUND SYSTEM

Global setting:

`Ambient Sound: ON/OFF`

Sound profiles:
- NOC Room
- Server Room
- Data Center
- Rain
- Deep Space
- Low Electronic
- Quiet Room

Settings:
- master volume;
- music volume;
- ambient volume;
- mute on lab failure;
- mute on voice playback;
- fade on navigation.

Default:
- ambient OFF;
- user explicitly enables sound.

---

# 88. ANIMATION SYSTEM

Settings → Appearance → Motion:

1. `Full`
2. `Reduced`
3. `Off`

Animation categories:

### Navigation
- page transition;
- sidebar transition.

### Learning
- progress update;
- step completion;
- unlock animation.

### Engineering
- packet movement;
- link state;
- device state;
- event stream.

### Background
- globe rotation;
- grid movement;
- radar sweep;
- neural connections;
- data particles.

## Rules

Animations must communicate state.

Do NOT animate everything.

Critical actions must remain understandable with animations OFF.

---

# 89. COLOR INVERSION / ACCESSIBILITY

Settings MUST provide:

`Invert Colors: OFF / ON`

Also provide:
- high contrast;
- reduced transparency;
- reduced glow;
- reduced motion;
- larger text;
- focus outlines;
- keyboard navigation.

Color inversion must be implemented at the design-token layer where possible rather than by blindly applying a visual filter to the entire page.

Important status states must also use:
- icon;
- label;
- shape;
- text;
not color alone.

---

# 90. DESIGN TOKENS

All UI colors and dimensions must come from centralized tokens.

Example:

```text
--bg-app
--bg-surface
--bg-surface-elevated
--panel-border
--text-primary
--text-secondary
--accent-primary
--accent-secondary
--success
--warning
--danger
--info
--focus-ring
--topology-link
--topology-device
--terminal-bg
--terminal-text
--shadow
--glow-strength
```

Themes modify tokens.

Components do NOT hard-code theme-specific colors.

---

# 91. STRICT PROGRESS ENGINE

This is a mandatory product feature.

## 91.1 Sequential unlock rule

A learner MUST NOT open the next required learning item until the current item is complete.

Example:

```text
Lab 01  ✓ COMPLETE
   ↓
Lab 02  🔓 UNLOCKED
   ↓
Lab 03  🔒 LOCKED
   ↓
Lab 04  🔒 LOCKED
```

If Lab 02 is not complete:
- Lab 03 cannot launch;
- Lab 04 cannot launch;
- later required labs remain locked.

## 91.2 What counts as complete

A lab is NOT complete when the learner clicks Finish.

Completion requires the configured lab completion contract.

Possible requirements:

```text
THEORY COMPLETE
+
PREDICTION COMPLETE
+
REQUIRED ACTIONS COMPLETE
+
VERIFICATION PASSED
+
REQUIRED TROUBLESHOOTING COMPLETE
+
EXPLANATION/DEBRIEF COMPLETE
```

Not every lab needs every component, but the lab definition must explicitly declare its completion requirements.

## 91.3 Completion state machine

```text
LOCKED
→ AVAILABLE
→ STARTED
→ IN_PROGRESS
→ VERIFICATION_PENDING
→ VERIFIED
→ DEBRIEF_PENDING
→ COMPLETE
```

Optional failure state:

```text
IN_PROGRESS
→ FAILED_ATTEMPT
→ HINT_AVAILABLE
→ RETRY
→ VERIFIED
```

---

# 92. PROGRESS DATA MODEL

Minimum learner progress:

```json
{
  "learnerId": "USER-ID",
  "courseId": "CCNA-FOUNDATION",
  "currentItemId": "LAB-001",
  "completedItems": [],
  "lockedItems": [],
  "skillMastery": {
    "knowledge": 0,
    "configuration": 0,
    "observation": 0,
    "verification": 0,
    "troubleshooting": 0,
    "explanation": 0,
    "design": 0
  },
  "retrieval": {
    "day1": [],
    "day3": [],
    "day7": [],
    "day14": [],
    "day30": []
  }
}
```

The actual implementation must use the existing state store. Do NOT create a duplicate state-management system.

---

# 93. PREREQUISITE GRAPH

Every learning item must declare:

```json
{
  "itemId": "LAB-002",
  "prerequisites": [
    "LAB-001"
  ]
}
```

For multiple prerequisites:

```json
{
  "itemId": "LAB-020",
  "prerequisites": [
    "LAB-012",
    "LAB-014",
    "LAB-018"
  ]
}
```

Unlock condition:

```text
ALL required prerequisites = COMPLETE
```

Never use:

```text
prerequisites = viewed
```

Viewing is not mastery.

---

# 94. PROGRESS UI

Every course and lab list item must show one of:

- `LOCKED`
- `AVAILABLE`
- `IN PROGRESS`
- `VERIFICATION`
- `COMPLETE`

Locked cards must explain WHY:

Examples:
- `Complete Lab 04 first`
- `Pass the VLAN verification`
- `Finish the required debrief`
- `Complete prerequisite skill: IPv4 addressing`

Do NOT simply disable the button with no explanation.

---

# 95. COURSE PROGRESS VIEW

Example:

```text
CCNA FOUNDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 32%

FOUNDATIONS
████████████████████ 100%

NETWORK ACCESS
██████████░░░░░░░░░░ 50%

IP CONNECTIVITY
██░░░░░░░░░░░░░░░░░░ 10%

IP SERVICES
🔒 Locked

SECURITY FUNDAMENTALS
🔒 Locked

AUTOMATION
🔒 Locked
```

The progress screen must show:
- completed;
- current;
- next;
- locked;
- reason;
- estimated remaining work.

---

# 96. MASTERY IS NOT THE SAME AS COMPLETION

A completed lab proves task completion.

Mastery is calculated separately.

Example:

```text
Lab completed: YES
Verification: YES
Troubleshooting: 40%
Explanation: 70%
Retrieval: DUE
```

A later retrieval session can strengthen mastery without reopening already completed prerequisites.

---

# 97. RETRIEVAL ENGINE INTEGRATION

For important concepts:

```text
DAY 0
↓
DAY 1
↓
DAY 3
↓
DAY 7
↓
DAY 14
↓
DAY 30
```

The learner should answer before seeing the explanation.

The dashboard must display:
- due today;
- overdue;
- next review.

This preserves the existing spaced-retrieval design.

---

# 98. "ONE COMPLETE BEFORE NEXT" POLICY

The learner experience must enforce:

```text
Current Required Item
       ↓
Complete
       ↓
Verify
       ↓
Debrief
       ↓
Unlock Next
```

### Exceptions

Only explicitly marked optional content may be opened early.

Examples:
- reference library;
- command reference;
- glossary;
- accessibility settings;
- study deck;
- general tools.

Required course progression remains locked.

---

# 99. OPTIONAL VS REQUIRED CONTENT

Every content item must contain:

```text
required: true | false
```

### Required
Participates in prerequisite graph.

### Optional
May be explored freely.

Examples of optional:
- additional reading;
- optional challenge;
- extra interview questions;
- enrichment research paper.

Optional content must never accidentally unlock a required later course.

---

# 100. LAB COMPLETION CONTRACT

Every lab JSON/schema must declare:

```json
{
  "completionContract": {
    "requiredTheory": true,
    "requiredPrediction": true,
    "requiredActions": true,
    "requiredVerification": true,
    "requiredTroubleshooting": true,
    "requiredExplanation": true,
    "requiredDebrief": true
  }
}
```

The backend/domain engine is authoritative.

The UI only displays state.

Never place simulator rules or completion truth solely in React/UI.

---

# 101. VERIFICATION AUTHORITY

Completion must be based on real evidence wherever the simulator supports it.

Examples:
- correct interface state;
- correct VLAN;
- correct route;
- successful ping;
- expected packet;
- correct log event;
- correct topology state.

If verification is unsupported:
- label the limitation;
- provide the closest valid verification;
- never fabricate success.

This preserves the original lab realism policy.

---

# 102. PROGRESS EVENTS

The system should record events such as:

```text
COURSE_STARTED
LESSON_STARTED
LESSON_COMPLETED
LAB_STARTED
STEP_COMPLETED
COMMAND_EXECUTED
VERIFICATION_PASSED
VERIFICATION_FAILED
HINT_USED
TROUBLESHOOTING_STARTED
TROUBLESHOOTING_COMPLETED
DEBRIEF_COMPLETED
LAB_COMPLETED
ITEM_UNLOCKED
RETRIEVAL_DUE
RETRIEVAL_COMPLETED
STUDY_SESSION_STARTED
STUDY_SESSION_COMPLETED
```

Events should support analytics and learner progress without collecting unnecessary personal information.

---

# 103. GLOBAL STUDY DECK PROGRESS

Track:

- total focus minutes;
- sessions completed;
- labs studied with focus mode;
- preferred deck;
- preferred sound profile;
- streak;
- weekly study minutes.

Do NOT turn study time into a fake engineering mastery score.

Example:

```text
FOCUS THIS WEEK
4h 35m

LAB SESSIONS
7

RETRIEVAL SESSIONS
5

ENGINEERING LABS
4 completed
```

---

# 104. FOCUS SESSION SAFETY

The system should not encourage endless study.

When a long session is detected:
- recommend a break;
- preserve current progress;
- allow resume later.

The learner must never lose lab progress simply because they take a break.

---

# 105. UI NAVIGATION V4

## HOME
- Today's Mission
- Continue Learning
- Retrieval Due
- Current Course
- Skill Map
- Weak Areas
- Portfolio
- Study Deck

## LEARN
- Foundations
- Network Engineering
- Security Engineering
- SOC
- Linux
- Automation
- Research

## LABS
- Basic
- Medium
- Advanced
- Failure Labs
- Packet Analysis
- Capstones

## ENGINEER MODE
- Basic
- Medium
- Advanced

## SOC
- Basic
- Medium
- Advanced

## COURSES
- CCNA Foundation
- CCNA Practical
- CCNP Core
- Routing
- Network Security
- SOC
- Research

## TOOLS
- Packet Tracer
- Wireshark
- Linux
- Subnet Calculator
- Packet Decoder
- Command Reference

## INTERVIEW
- NOC
- Network Engineer
- Network Security
- SOC
- CCNA
- CCNP

## RESEARCH
- Experiments
- Projects
- Papers / Resources
- Innovation Challenges

## PORTFOLIO
- Labs
- Reports
- PCAP Analysis
- Projects
- Certificates

## GLOBAL STUDY DECK
- Japan Focus
- China Focus
- Global Focus
- Ambient
- Sessions
- History

---

# 106. SETTINGS V4

## Appearance
- Theme
- Background
- Panel Design
- Density
- Font Size
- Glow
- Transparency

## Motion
- Full
- Reduced
- Off

## Accessibility
- High Contrast
- Invert Colors
- Larger Text
- Focus Outlines
- Reduced Transparency

## Audio
- Ambient Sound
- Study Deck
- Master Volume
- Music Volume
- Ambient Volume
- Sound Effects

## Learning
- Study Duration
- Daily Goal
- Difficulty
- Hint Behavior
- Language
- Retrieval Reminders

## Progress
- Current Course
- Reset current attempt
- Review completed labs
- Portfolio settings

Dangerous/destructive actions must require explicit confirmation.

---

# 107. LANGUAGE SYSTEM

Primary interface:
- English

Optional learner-support:
- Hindi-friendly explanation;
- future Japanese;
- future Chinese.

Technical commands remain in their original syntax.

Example:

```text
Gateway
Simple English: The device that helps your computer reach another network.
Hindi clarity: दूसरे network तक जाने के लिए computer जिस रास्ते/device का उपयोग करता है।
```

Do not translate commands.

---

# 108. MICROCOPY STANDARD

Avoid:
- `Congratulations!!! 🔥🔥🔥`
- `You are a Cyber Master!!!`
- meaningless XP spam.

Prefer:
- `Verification passed`
- `Evidence matches expected state`
- `Lab complete`
- `Next lab unlocked`
- `Retrieval due tomorrow`
- `One prerequisite remains`
- `Try the next hint`

The product should feel professional.

---

# 109. PROGRESS ANIMATION STANDARD

When a lab becomes complete:

```text
VERIFY
↓
Evidence confirmed
↓
Debrief complete
↓
Completion recorded
↓
Next item unlocks
```

Animation:
- short;
- subtle;
- skippable;
- disabled when motion is off.

Never delay the learner with a long animation.

---

# 110. LOCKED LAB VISUAL

Locked lab card:

```text
┌───────────────────────────────────────┐
│ 🔒 LAB 08 — OSPF TROUBLESHOOTING      │
│ Advanced                              │
│                                       │
│ Prerequisite: Lab 07                  │
│ Status: LOCKED                        │
│                                       │
│ Complete Lab 07 to unlock this lab.  │
└───────────────────────────────────────┘
```

No misleading `Launch` button.

Use:
- `View prerequisites`
- `Go to current lab`

---

# 111. CURRENT LAB CARD

```text
┌───────────────────────────────────────┐
│ ▶ CURRENT LAB                         │
│ VLAN SEGMENTATION                     │
│                                       │
│ Progress 68%                          │
│ ██████████████░░░░                   │
│                                       │
│ Verification: Pending                 │
│ Troubleshooting: Not started         │
│                                       │
│ [Resume Lab]                          │
└───────────────────────────────────────┘
```

---

# 112. COMPLETED LAB CARD

```text
┌───────────────────────────────────────┐
│ ✓ COMPLETE                            │
│ IPv4 ADDRESSING                       │
│                                       │
│ Verification ✓                        │
│ Debrief ✓                             │
│ Retrieval: Day 3                      │
│                                       │
│ [Review] [View Evidence]              │
└───────────────────────────────────────┘
```

Review does not reset completion.

---

# 113. STUDY DECK UI

```text
┌───────────────────────────────────────────────────────┐
│ GLOBAL STUDY DECK                                     │
├─────────────────────┬─────────────────────────────────┤
│ JAPAN FOCUS         │                                 │
│ ○ Calm Study        │      NOW PLAYING                │
│ ○ Motivation        │                                 │
│ ○ Deep Work         │      Japanese Focus            │
│                     │                                 │
│ CHINA FOCUS         │      ━━━━━━━○────────           │
│ ○ Calm Study        │                                 │
│ ○ Motivation        │      ◀  ▶  ▶│                  │
│ ○ Deep Work         │                                 │
│                     │      45:00 Focus Session        │
│ GLOBAL               │                                 │
│ ○ Ambient            │      [Start Focus Session]     │
│ ○ Deep Work         │                                 │
└─────────────────────┴─────────────────────────────────┘
```

---

# 114. STUDY DECK LICENSE UI

For each track:

```text
Track
Category
Source
License
Attribution
```

If a track's license is missing or uncertain:

`UNAVAILABLE — LICENSE NOT VERIFIED`

Never silently use questionable copyrighted music.

---

# 115. PERFORMANCE BUDGET

The visual system must have performance tiers:

### LOW
- static background;
- no particles;
- minimal animation.

### MEDIUM
- lightweight grid/globe;
- limited particles;
- normal transitions.

### HIGH
- richer network visualization;
- 3D where supported;
- enhanced event animation.

The system should detect poor performance and recommend Low mode.

---

# 116. MOBILE / SMALL SCREEN

On mobile:
- sidebar becomes drawer;
- context panel becomes bottom sheet;
- topology gets dedicated full-screen mode;
- terminal gets full-screen mode;
- Study Deck becomes compact bottom player.

Do not simply shrink the desktop UI.

---

# 117. KEYBOARD SHORTCUTS

Optional shortcuts:

```text
Ctrl/Cmd + K   Search
Ctrl/Cmd + J   Study Deck
Ctrl/Cmd + Enter  Run/submit where safe
Esc            Close panel
?              Shortcut help
```

Shortcuts must never interfere with terminal typing.

---

# 118. SEARCH

Global search should cover:
- concepts;
- labs;
- courses;
- commands;
- interview questions;
- resources;
- portfolio artifacts.

Search results must indicate:
- content type;
- level;
- status;
- locked/unlocked.

Locked content may appear in search but must clearly show its prerequisite.

---

# 119. NOTIFICATION SYSTEM

Useful notifications:
- retrieval due;
- lab unlocked;
- lab verification failed;
- saved progress;
- study session complete;
- portfolio artifact ready.

Avoid:
- spam;
- meaningless badges;
- manipulative streak pressure.

---

# 120. PORTFOLIO UI V4

Portfolio should visually show evidence:

```text
NETWORK ENGINEERING
├── 12 Labs
├── 4 Troubleshooting Reports
├── 2 Topology Designs
├── 3 PCAP Analyses
└── 1 Capstone

SECURITY
├── 5 Investigations
├── 2 Incident Reports
└── 1 Security Architecture
```

Each artifact should contain:
- date;
- skill;
- scenario;
- evidence;
- learner explanation;
- verification;
- relevant tools.

---

# 121. ENGINEER SCORE DISPLAY

Use a radar/skill graph only as a visualization of evidence-backed dimensions.

Never display:
`Engineer Score: 99%`

Instead:

```text
Knowledge          72
Configuration      64
Verification       81
Troubleshooting    51
Explanation        69
Design             38
```

Scores must be explainable.

Example:
`Troubleshooting 51 → 4 recent failures, 2 successful independent fixes, 3 hints used.`

---

# 122. RECOMMENDATION ENGINE V4

Recommendation rules:

```text
IF knowledge weak
→ micro-theory

IF configuration weak
→ guided lab

IF observation weak
→ packet/state exercise

IF verification weak
→ evidence exercise

IF troubleshooting weak
→ failure lab

IF explanation weak
→ teach-back

IF prerequisite weak
→ prerequisite review

IF strong across dimensions
→ independent design challenge
```

Every recommendation stores:

```text
recommendedBecause
```

Example:

`Recommended because troubleshooting success rate fell below configured threshold in the last five labs.`

---

# 123. ADMIN / CONTENT AUTHORING MODEL

Admin/content tools must allow authors to define:

- course;
- module;
- lesson;
- lab;
- prerequisite;
- completion contract;
- difficulty;
- topology;
- simulator;
- verification;
- hints;
- debrief;
- retrieval;
- interview;
- resources.

Authors must NOT edit simulator behavior from a rich-text UI.

---

# 124. LAB JSON MASTER SHAPE

```json
{
  "labId": "LAB-001",
  "title": "IPv4 Addressing Fundamentals",
  "level": "basic",
  "required": true,
  "prerequisites": [],
  "role": "Network Engineer",
  "scenario": {},
  "mission": {},
  "objectives": [],
  "resources": [],
  "topology": {},
  "ipPlan": {},
  "startingState": {},
  "steps": [],
  "verification": [],
  "failures": [],
  "hints": [],
  "troubleshooting": {},
  "explanation": {},
  "interview": [],
  "challenge": {},
  "debrief": [],
  "retrieval": {},
  "completionContract": {},
  "nextLab": "LAB-002"
}
```

---

# 125. V4 API CONTRACT

Frontend must consume domain APIs.

Example:

```text
GET  /api/courses
GET  /api/courses/:courseId
GET  /api/labs/:labId
GET  /api/labs/:labId/progress
POST /api/labs/:labId/start
POST /api/labs/:labId/step
POST /api/labs/:labId/verify
POST /api/labs/:labId/debrief
GET  /api/progress
GET  /api/retrieval/due
GET  /api/study-deck/catalog
POST /api/study-deck/session
GET  /api/portfolio
```

Use the project's existing backend architecture where these capabilities already exist.

Do not create duplicate endpoints merely under new names.

---

# 126. ERROR STATES

Every screen needs explicit states:

- loading;
- empty;
- offline;
- unauthorized;
- locked;
- failed;
- retry;
- unavailable;
- unsupported simulator;
- verification unavailable.

Example:

```text
Verification unavailable

This simulator does not currently expose the required state.

We have not marked the lab complete.

[View limitation] [Continue with conceptual check]
```

Never display fake success.

---

# 127. LAUNCH LAB WORKSPACE V4 FIX CONTRACT

The existing blueprint identifies Launch Lab Workspace failure as a runtime defect.

Required investigation:

```text
Frontend 5173
↓
API 3000
↓
Lab data
↓
Workspace initialization
↓
WebSocket if used
↓
Simulator state
↓
Verification
```

Debug:
- browser console;
- network requests;
- WebSocket;
- API response;
- React error boundary;
- server logs.

Fix root cause.

Do NOT solve by replacing the entire architecture.

---

# 128. ARCHITECTURE PRESERVATION

The existing blueprint explicitly requires preserving the current architecture and avoiding duplicate:
- LabEngine;
- hint engine;
- state store;
- simulator;
- fake verifier.

The v4 UI system therefore introduces:

```text
UI THEME TOKENS
UI BACKGROUND REGISTRY
UI PANEL REGISTRY
UI MOTION SETTINGS
UI AUDIO PREFERENCES
STUDY DECK DOMAIN
PROGRESS UI
```

but these must connect to the existing domain/state architecture rather than duplicate it.

---

# 129. IMPLEMENTATION ORDER V4

## PHASE A — BASELINE

1. inspect current repository;
2. read existing authoritative docs;
3. inspect current frontend;
4. inspect current backend;
5. inspect current state store;
6. inspect current LabEngine;
7. inspect current verifier;
8. run application.

## PHASE B — UI FOUNDATION

1. design tokens;
2. theme registry;
3. background registry;
4. panel registry;
5. typography;
6. responsive shell;
7. accessibility.

## PHASE C — PROGRESS

1. inspect existing progress state;
2. implement prerequisite graph if missing;
3. implement completion contract;
4. implement locked/unlocked states;
5. connect verification;
6. connect debrief;
7. test sequential unlocking.

## PHASE D — STUDY DECK

1. audio catalog model;
2. license metadata;
3. player;
4. Japan Focus;
5. China Focus;
6. Global Focus;
7. ambient mixer;
8. focus timer;
9. persistence;
10. accessibility.

## PHASE E — LAB UX

1. mission panel;
2. step panel;
3. topology;
4. terminal;
5. evidence;
6. hints;
7. troubleshooting;
8. debrief;
9. progress.

## PHASE F — QA

1. theme QA;
2. contrast QA;
3. keyboard QA;
4. reduced-motion QA;
5. audio QA;
6. mobile QA;
7. performance QA;
8. lab verification QA;
9. progression QA;
10. runtime QA.

---

# 130. REQUIRED PROGRESS TEST MATRIX

Test at minimum:

| Scenario | Expected |
|---|---|
| New learner | First required item available |
| Current lab incomplete | Next required lab locked |
| Verification failed | Lab remains incomplete |
| Debrief missing | Next lab remains locked if required |
| Lab complete | Next prerequisite unlocks |
| Browser refresh | Progress preserved |
| Logout/login | Progress preserved |
| Direct URL to locked lab | Access denied/locked state |
| Optional content | Can open without unlocking required path |
| Multiple prerequisites | All must be complete |
| Reset attempt | Current attempt resets only after confirmation |
| Existing completed lab | Remains complete |
| Simulator unavailable | No fake completion |
| Network failure | No false progress |
| Motion OFF | No required animation |
| Invert ON | UI remains usable |
| Audio OFF | Lab remains fully usable |
| Mobile | Core lab remains accessible |

---

# 131. SECURITY RULES FOR PROGRESS

The backend must be authoritative for:
- completion;
- prerequisites;
- verification;
- unlock state.

Never trust:

```text
localStorage.completed = true
```

as proof of mastery.

Client state may cache display state, but server/domain verification must determine official completion.

---

# 132. OFFLINE / RECOVERY

If supported:
- queue non-sensitive progress events;
- synchronize safely;
- resolve conflicts using domain rules.

If offline verification cannot be trusted:
- mark `PENDING SYNC`;
- do not mark official completion until verification is confirmed.

---

# 133. THE FINAL LEARNER EXPERIENCE

The learner opens CyberNet Lab.

They see:

```text
TODAY'S MISSION
↓
RETRIEVAL
↓
SHORT THEORY
↓
PREDICT
↓
LAB
↓
OBSERVE
↓
CONFIGURE
↓
VERIFY
↓
BREAK
↓
TROUBLESHOOT
↓
EXPLAIN
↓
DEBRIEF
↓
COMPLETE
↓
NEXT LAB UNLOCKS
↓
RETRIEVAL SCHEDULED
↓
PORTFOLIO UPDATED
```

During the session they may activate:

```text
GLOBAL STUDY DECK
├── Japan Focus
├── China Focus
├── Global Focus
└── Ambient
```

The learner can personalize:

```text
THEME
BACKGROUND
PANEL
MOTION
AUDIO
INVERT COLORS
```

without changing the underlying learning truth.

---

# 134. FINAL V4 PRODUCT PRINCIPLE

CyberNet Lab should feel like:

> a serious university engineering laboratory,
> a NOC/SOC command center,
> a guided beginner school,
> and a personal study workstation

at the same time.

The visual identity may be cyber-themed.

The learning behavior must remain evidence-driven.

The learner must not be able to skip required progression merely by navigating to a later page.

The platform must reward:

`UNDERSTANDING + PRACTICE + EVIDENCE + TROUBLESHOOTING + EXPLANATION + RETRIEVAL + DESIGN`

not clicks.

---

# 135. V4 MASTER ACCEPTANCE CHECKLIST

## UI
- [ ] Seven appearance themes
- [ ] Nineteen background presets
- [ ] Three required panel designs
- [ ] Responsive shell
- [ ] Centralized design tokens
- [ ] Accessible typography
- [ ] High contrast
- [ ] Invert colors
- [ ] Reduced motion
- [ ] Animation OFF mode

## AUDIO
- [ ] Global Study Deck
- [ ] Japan Focus
- [ ] China Focus
- [ ] Global Focus
- [ ] Ambient sounds
- [ ] Focus timer
- [ ] Independent volume controls
- [ ] License metadata
- [ ] No unlicensed commercial music
- [ ] Audio never blocks lab UI

## PROGRESS
- [ ] Course progress
- [ ] Lab progress
- [ ] Skill mastery
- [ ] Sequential unlocking
- [ ] Prerequisite graph
- [ ] Completion contract
- [ ] Backend-authoritative completion
- [ ] Locked-state explanations
- [ ] Progress persistence
- [ ] Direct-link lock enforcement

## EDUCATION
- [ ] Preview
- [ ] Prediction
- [ ] Theory
- [ ] Observation
- [ ] Configuration
- [ ] Verification
- [ ] Failure
- [ ] Troubleshooting
- [ ] Explanation
- [ ] Retrieval
- [ ] Application
- [ ] Design
- [ ] Research
- [ ] Reflection

## ENGINEERING
- [ ] Real verification
- [ ] Lab-specific topology
- [ ] Lab-specific resources
- [ ] Progressive hints
- [ ] Failure labs
- [ ] Packet evidence
- [ ] Troubleshooting
- [ ] Portfolio evidence
- [ ] No fake simulator behavior

## QUALITY
- [ ] PLANNED
- [ ] IMPLEMENTED
- [ ] TESTED
- [ ] RUNTIME-VERIFIED
- [ ] CHECKPOINTED

---

# 136. FINAL BLUEPRINT STATUS

This v4 document is the **master product/engineering blueprint**.

It defines what must be built.

It does NOT claim that every feature is already implemented.

Implementation status must continue to use:

`PLANNED → IMPLEMENTED → TESTED → RUNTIME-VERIFIED → CHECKPOINTED`

The original v3 research and engineering rules remain authoritative unless this v4 section explicitly adds or refines the UI, progress, accessibility, audio, or study-deck behavior.

## V4 NORTH STAR

```text
FREE
BEGINNER-FIRST
PRACTICAL
EVIDENCE-DRIVEN
SEQUENTIAL
ACCESSIBLE
ENGINEERING-FOCUSED
JAPAN + CHINA EVIDENCE-INSPIRED
CCNA → CCNP → ADVANCED
NETWORK + SECURITY + SOC
THEORY + LAB + RESEARCH
PERSONALIZED STUDY
GLOBAL STUDY DECK
REAL PROGRESS
REAL VERIFICATION
```

The learner should finish each stage able to say:

`I understood it.`
`I predicted it.`
`I did it.`
`I observed it.`
`I verified it.`
`I broke it.`
`I fixed it.`
`I explained it.`
`I remembered it.`
`I applied it.`
`I designed it.`
`I documented it.`

That is the final CyberNet Lab product standard.
