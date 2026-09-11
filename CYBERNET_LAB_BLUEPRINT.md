# CYBERNET ACADEMY — HIGH-FIDELITY AUTONOMOUS LAB BLUEPRINT
## Technical Specification Document

**Document Version:** 1.0
**Target:** Unlimited Labs Dashboard v4.0
**Status:** Implementation-Ready
**Scope:** Full standalone simulation environment requiring no external tutorials or instructors

---

## EXECUTIVE SUMMARY

The current `unlimited_labs_dashboard.html` is a functional 150-lab web application with quiz, practice, and 8 game modes. However, it remains a **2D HUD overlay** with minimal procedural guidance, no diegetic interface, and no physical simulation fidelity.

This blueprint transforms it into a **professional-grade, self-contained virtual laboratory** that autonomously guides learners through complete networking workflows using diegetic design, physics-based visuals, spatial audio, and a fully simulated network topology with a configurable main router.

---

## PILLAR 1: PROCEDURAL INSTRUCTION DESIGN

### 1.1 Granular Step Architecture

Every lab must be decomposed into **atomic, verifiable micro-steps**. Each micro-step includes:

| Field | Type | Description |
|-------|------|-------------|
| `stepId` | string | Unique identifier: `LAB-042-S-03` |
| `instruction` | string | Natural-language directive shown in context |
| `diegeticTrigger` | string | UI element that prompts the action |
| `verification` | object | `{ type: "cli|drag|click|typing", expected: any, tolerance: number }` |
| `hintTiers` | array[3] | Tier-1 subtle → Tier-2 explicit → Tier-3 full answer |
| `onFail` | object | `{ maxAttempts: 3, penalty: number, alternatePath: boolean }` |
| `onSuccess` | object | `{ unlockNext: boolean, reward: { xp, badge }, celebration: string }` |
| `prerequisiteSteps` | array | Step IDs that must be completed first |
| `timeEstimate` | number | Expected seconds for average learner |

### 1.2 Autonomous Instructional Flow

```
┌─────────────────────────────────────────────┐
│           ONBOARDING SEQUENCE               │
│  1. Skill Assessment (10 adaptive questions) │
│  2. Learner Profile Generation              │
│  3. Path Recommendation:                    │
│     - Linear Track (beginner → expert)       │
│     - Topic-Specific Track (e.g., BGP only)  │
│     - Certification Track (CCNA/CCNP mapped) │
└─────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│           MAIN LOOP PER LAB                 │
│                                             │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │ 1. SCENARIO │───▶│ 2. OBJECTIVE    │  │
│  │ PRESENTATION│    │    BRIEF         │  │
│  └─────────────┘    └──────────────────┘  │
│           │                  │              │
│           ▼                  ▼              │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │ 3. PRE-     │───▶│ 4. GUIDED        │  │
│  │  ASSESSMENT │    │    EXECUTION     │  │
│  │ (knowledge  │    │    (step-by-step)│  │
│  │  check)     │    │                  │  │
│  └─────────────┘    └──────────────────┘  │
│           │                  │              │
│           ▼                  ▼              │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │ 5. ERROR    │◀───│ 6. VERIFICATION  │  │
│  │  INJECTION  │    │    ENGINE        │  │
│  │ (optional)  │    │                  │  │
│  └─────────────┘    └──────────────────┘  │
│           │                  │              │
│           ▼                  ▼              │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │ 7. REFLECT  │───▶│ 8. MASTERY       │  │
│  │    & DEBUG  │    │    CHECK         │  │
│  └─────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────┘
```

### 1.3 Step Verification Engine

**CLI Verification:**
- Tokenize expected command set
- Apply fuzzy matching with configurable tolerance
- Detect common misconceptions (e.g., `no shutdown` vs `shutdown`)
- Verify command ordering where relevant
- Check interface context correctness

**Topology Verification:**
- Canvas-based graph comparison
- Node type validation (PC, switch, router, server)
- Cable type verification between nodes
- Interface assignment cross-check

**Typing Verification:**
- Real-time keystroke analysis
- Auto-complete suggestions based on lab context
- Command palette with search
- Validation on submit with partial credit

### 1.4 Hint System

- **Tier 1 (Contextual nudge):** Highlight relevant lab concept or show command syntax hint
- **Tier 2 (Directional):** Point to specific interface, menu, or configuration mode
- **Tier 3 (Explicit):** Show exact command or configuration with explanation

Hints consume XP budget. Learners start with 100 hint points per lab. Each tier costs: T1=10, T2=25, T3=50.

### 1.5 Error Injection & Recovery

Dynamic error injection occurs at 3 checkpoints:
1. **Pre-configuration:** "A junior admin made a change. Find and fix it before proceeding."
2. **Mid-configuration:** "A link went down. Diagnose and recover without losing config."
3. **Post-configuration:** "A new requirement arrived. Adapt the design without rebuilding."

---

## PILLAR 2: IMMERSIVE UI/UX REDESIGN — DIEGETIC DESIGN

### 2.1 Design Philosophy

**Diegetic Principle:** Every UI element must exist within the simulation's reality. No floating HUD panels. No abstract buttons. The interface IS the laboratory.

### 2.2 Spatial Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     LAB VIEWPORT                            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │          │  │              │  │                      │  │
│  │  RACK    │  │  BENCH /     │  │  WALL PANEL          │  │
│  │  MOUNT   │  │  WORKBENCH   │  │  (schematics,        │  │
│  │          │  │              │  │   documentation)     │  │
│  │ [Router] │  │ [PC] [Switch]│  │                      │  │
│  │ [Switch] │  │ [Server]     │  │  ┌──────────────┐   │  │
│  │ [Cables] │  │              │  │  │              │   │  │
│  │          │  │              │  │  │  LOG TERMINAL │   │  │
│  └──────────┘  └──────────────┘  │  │  (simulated   │   │  │
│                                   │  │   console)    │   │  │
│  ┌──────────┐  ┌──────────────┐  │  │              │   │  │
│  │ TOOL     │  │ PROPERTY     │  │  └──────────────┘   │  │
│  │ CABINET  │  │ INSPECTOR    │  │                      │  │
│  │          │  │              │  │  [Status LEDs]       │  │
│  │ [Cables] │  │ [Selected    │  │  [Port indicators]   │  │
│  │ [Modules]│  │  element     │  │                      │  │
│  │ [Tools]  │  │  details]    │  │                      │  │
│  └──────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Diegetic UI Components

**A. Physical Workbench**
- 3D-perspective desk surface with realistic textures
- Devices placed with correct scale and proportions
- Cable management with bend radius physics
- Mouse-drag positioning with snap-to-grid and snap-to-port

**B. Rack Mount System**
- 19-inch rack visualization
- Device insertion/removal with slide rails
- Cable routing through cable management arms
- Power distribution unit with per-outlet indicators

**C. Console Terminal**
- Physical terminal bezel with CRT/LCD options
- Scanline and phosphor glow effects
- Keyboard sound feedback on typing
- Command history with up/down arrow navigation

**D. Schematic Wall Panel**
- Large-format schematic that updates in real-time
- Click any device on schematic → camera flies to device
- Click any interface on schematic → opens property inspector
- Layer toggles: Physical / Data Link / Network / Application

**E. Property Inspector**
- Appears as a physical clipboard or tablet device
- Context-sensitive to selected element
- Tabbed interface: Config | Stats | Logs | Topology
- Rotary knob controls for numeric values (bandwidth, delay)

**F. Status Indicators**
- LED arrays on physical devices
- Port status LEDs: green/amber/red with glow
- Activity LEDs: blink on traffic
- Hardware buttons: physical press animation with sound

### 2.4 Interaction Model

| Action | Input Method | Diegetic Feedback |
|--------|-------------|-------------------|
| Select device | Click on bench/rack | Power LED brightens, slight hum |
| Connect cable | Drag from port to port | Click sound, LED flash, cable physics |
| Configure interface | Double-click device → terminal | Screen turns on, keyboard appears |
| Verify connectivity | Click "Test" button on bench | Ping sound effect, LED animation |
| Save config | Physical toggle switch on device | Click sound, status LED changes |
| Error detection | Ambient alarm + red LED | Audible alert, device label flashes |

### 2.5 Accessibility & Progressive Disclosure

- **Tutorial Mode:** Camera auto-rotates to highlight relevant elements
- **Expert Mode:** All panels visible, keyboard shortcuts enabled
- **Colorblind Mode:** High-contrast patterns + distinct shapes
- **Motor Accessibility:** Large click targets, keyboard-only navigation
- **Cognitive Load Management:** Only show relevant ports/interfaces for current step

---

## PILLAR 3: HIGH-FIDELITY VISUALS AND MOTION

### 3.1 Rendering Specifications

**Target Platform:** WebGL 2.0 with fallback to Canvas 2D
**Performance Target:** 60fps on integrated graphics, 144fps on dedicated GPU

**Visual Fidelity Tiers:**

| Tier | Resolution | Effects | Target Hardware |
|------|-----------|---------|-----------------|
| Ultra | 4K | Ray-traced reflections, SSRT, particle physics | RTX 3060+ |
| High | 1440p | SSAO, bloom, real-time reflections | GTX 1660+ |
| Medium | 1080p | Basic lighting, static reflections | Integrated |
| Low | 720p | Flat shading, no post-processing | Mobile/old hardware |

### 3.2 Device Models

**Router (ISR 4321-class):**
- PBR: 8,192 triangles
- Textures: 4K albedo, 2K normal, 1K roughness
- Animated elements: Fans (variable speed), LEDs (24 individual), ejector levers
- LOD: 3 levels with 400/1200/8192 triangle budgets

**Switch (Catalyst 9300-class):**
- PBR: 6,500 triangles
- Port array with individual LED states
- Fan module animation
- Stacking cable visual connection

**PC Workstation:**
- PBR: 3,000 triangles
- Screen content: live rendered terminal or desktop
- Keyboard key press animation
- Mouse movement with realistic DPI

**Cable System:**
- Cat6 patch cable: Bezier curve with 12 control points
- Coaxial cable: Stiffer curve with larger bend radius
- Fiber optic: Thin core with visible light transmission
- Serial DCE: D-shaped connector with locking tab

### 3.3 Animation Specifications

**Idle Animations:**
- Device fans: Perlin noise-driven rotation speed variation
- LED breathing: Subtle intensity oscillation
- Cable sway: Minimal ambient movement from air currents
- Screen flicker: CRT monitors have subtle refresh flicker

**Interaction Animations:**
- Cable insertion: 0.3s ease-out with click haptics
- Device selection: 0.15s highlight bloom + 0.1s scale pulse
- Port connection: LED flash animation (0.5s fade)
- Typing: Key travel animation with tactile feedback sound

**Process Animations:**
- OSPF neighbor formation: Pulse wave along cable, LED sequence
- STP convergence: Port LED sweep from root outward
- BGP session: TCP handshake animation (SYN→SYN-ACK→ACK)
- MAC learning: Table entries fade in sequentially

**Failure Animations:**
- Link down: LED turns amber then red, cable dims
- Interface error: Interface icon shakes, error count increments
- Routing loop: Packet visualization shows loop path in red
- Broadcast storm: Traffic particles increase exponentially, device glows

### 3.4 Physics-Based Visual Effects

**Traffic Visualization:**
- Packets rendered as particles with protocol-specific colors:
  - ICMP: Cyan sphere
  - TCP: Green capsule
  - UDP: Yellow sphere
  - ARP: Orange flat disc
- Size proportional to packet size
- Speed proportional to bandwidth
- Trail effect on high-volume links

**Fluid Dynamics (Lab Cooling):**
- Server room has visible airflow particles
- Temperature gradient visualization
- Fan intake/exhaust particle streams
- Overheat effect: heat shimmer + particle acceleration

**Cable Physics:**
- Gravity sag on loose cables
- Tension visualization when pulled taut
- Bend radius enforcement (red highlight if too tight)
- Connector alignment detection (snap feedback)

**Electromagnetic Effects:**
- Cable crosstalk visualization on adjacent cables
- EMI field around high-voltage equipment
- LED flicker from EMI interference
- Static discharge on improper handling

### 3.5 Environmental Visuals

**Lighting:**
- Primary: Cool white overhead fluorescents (flicker at 100Hz)
- Secondary: Task lamp on workbench
- Accent: Device LED glow on surrounding surfaces
- Dynamic: Light intensity varies with time-of-day setting

**Materials:**
- Workbench: Dark walnut with subtle scratches and wear
- Rack: Brushed aluminum with fingerprint texture
- Cable jacket: TPE plastic with realistic sheen
- Screen: Anti-glare coating with subtle reflections

**Particle Systems:**
- Dust motes in air beam
- Heat haze from equipment vents
- Smoke from failed components (rare)
- Data center cold aisle airflow

### 3.6 Visual Prompt Reference

**OSPF Neighbor Formation:**
> "Visualize a cyan pulse traveling from Router A's interface, along a glowing fiber cable, to Router B. On arrival, Router B's port LED flashes green three times in succession. A bidirectional link indicator then establishes between the two devices, pulsing gently at 1Hz to indicate an active OSPF adjacency in Full state."

**BGP Session Establishment:**
> "A TCP connection handshake plays as three color-coded packets: blue (SYN) from local router, blue (SYN-ACK) from remote peer, blue (ACK) returning. This is followed by a BGP OPEN message in magenta, then KEEPALIVE every 60 seconds as a small, subtle pulse to maintain the connection."

**Routing Loop Visualization:**
> "Packets circulate in a visible red loop between three routers. Each packet is labeled with TTL decrementing. When TTL reaches 0, the packet vanishes with a small particle burst. The loop creates a visible congestion cloud with increasing density."

---

## PILLAR 4: ADVANCED SENSORY INTEGRATION

### 4.1 Multi-Layered Soundscape Architecture

**Audio Engine:** Web Audio API with AudioWorklet for low-latency synthesis
**Spatial Audio:** Stereo panning + HRTF for 3D positioning
**Mixer:** 12-channel mixer with individual volume + mute per category

### 4.2 Ambient Soundscape

| Layer | Source | Implementation | Volume |
|-------|--------|----------------|--------|
| Room tone | Generated brown noise | Filtered noise generator | 0.08 |
| Equipment hum | Per-device oscillator stack | FM synthesis, device-specific | 0.04 |
| Airflow | Filtered white noise | Bandpass 800-2000Hz | 0.03 |
| Distant traffic | Loop buffer | Procedural modulation | 0.02 |
| HVAC | LFO-modulated noise | Low-frequency modulation | 0.03 |

**Dynamic Adjustment:**
- Room tone increases in "data center" scenarios
- Equipment hum pitch shifts under load
- Airflow intensifies with temperature rise

### 4.3 Tactile Auditory Feedback

**Interface Sounds:**

| Action | Sound Design | Synthesis Method |
|--------|-------------|------------------|
| Button press | Mechanical keyboard click | FM synthesis: carrier 4kHz, modulator 2kHz |
| Port connection | Positive latch click | Noise burst + sine click |
| Cable insertion | Firm mechanical thunk | Low-pass noise + body resonance |
| CLI keystroke | Tactile keyboard | Layered: click + subtle clack |
| Command accepted | Confirmation chime | Dual-tone: 800Hz + 1200Hz |
| Command rejected | Error buzz | Sawtooth: 200Hz → 100Hz sweep |
| Interface up | Power-on tone | Ascending triad: C-E-G |
| Interface down | Power-off tone | Descending tone: G-E-C |
| Neighbor up | Handshake chime | Two-note ascending arpeggio |
| Neighbor down | Disconnect tone | Descending minor third |

**Routing Protocol Sounds:**
- **RIP update:** Periodic tick every 30s (configurable)
- **OSPF Hello:** Subtle pulse on hello exchange
- **OSPF LSA:** Flutter sound on new LSA
- **BGP OPEN:** Rising tone on session establishment
- **BGP NOTIFICATION:** Alert tone on session failure
- **EIGRP update:** Rapid staccato on topology change

**Error & Warning Sounds:**
- **Interface error:** Sharp click + red alert tone
- **Routing loop:** Increasingly urgent pulsing
- **CPU spike:** Rising pitch alarm
- **Security violation:** Siren tone
- **Authentication failure:** Descending error tone

**Spatial Audio Positioning:**
- Device sounds positioned in stereo field based on screen position
- Cable sounds panned from source to destination
- Alert sounds centered + LFE if available
- Distance attenuation for far-field elements

### 4.4 Adaptive Sound Design

**Context-Aware Mixing:**
- During troubleshooting: Ambient music fades, focus sounds rise
- During configuration: UI sounds prominent, ambient reduced
- During verification: Ambient music swells on success
- During failure: Alert tones prominent, music drops

**Emotional Arc Sound Design:**
- Tutorial phase: Calm, reassuring tones
- Challenge phase: Rhythmic, building tension
- Success moment: Triumphant chord (major key)
- Failure recovery: Supportive, non-punitive tone

### 4.5 Accessibility Audio

- **Visualizer option:** Audio events display as on-screen icons for hearing-impaired users
- **Subtitle system:** All sounds have text descriptions in subtitle bar
- **Mono option:** Stereo collapsed to mono for single-earbud users
- **Frequency adjustment:** High-frequency emphasis reduction option

---

## PILLAR 5: NETWORK ARCHITECTURE & CONFIGURATION

### 5.1 Main Router Role in Simulation Ecosystem

The main router serves as the **central hub** of the virtual lab environment. Its roles:

**A. Simulation Control Plane**
- Hosts the lab orchestration engine
- Manages device state synchronization
- Enforces lab constraints and permissions
- Logs all configuration changes for audit/replay

**B. Network Core**
- Interconnects all lab devices
- Provides default routing between lab segments
- Hosts DHCP server for lab device addressing
- Runs DNS for device name resolution

**C. Traffic Generation**
- Generates realistic traffic patterns
- Simulates Internet, WAN, and cloud endpoints
- Produces protocol-specific traffic for analysis
- Emulates latency, jitter, and packet loss

**D. Monitoring & Feedback**
- Runs NetFlow collector
- Hosts syslog server
- Provides SNMP polling
- Real-time statistics API to frontend

### 5.2 Router Configuration Specification

**Platform:** Cisco ISR 4321 emulation (IOS XE 17.06)
**Virtual Hardware:** 2 vCPU, 4GB RAM, 8GB flash
**Interfaces:**
- GigabitEthernet0/0/0: Management (172.16.0.1/24)
- GigabitEthernet0/0/1: Lab backbone (10.0.0.1/24)
- GigabitEthernet0/0/2: ISP simulation (203.0.113.1/24)
- Serial0/0/0: WAN emulation (10.255.255.1/30)

### 5.3 Initial Configuration Template

```cisco
! ============================================
! CYBERNET LAB CORE ROUTER v4.0
! ============================================

hostname CyberNet-Lab-Core
no ip domain-lookup
ip domain-name lab.cybernet.internal

! Management & Access
enable secret level 15 $1$abc123$hashed_secret
username admin privilege 15 secret $1$def456$hashed_admin
ip ssh version 2
crypto key generate rsa general-keys modulus 2048

! Management Interface
interface GigabitEthernet0/0/0
 description MGMT-TO-WEBAPP
 ip address 172.16.0.1 255.255.255.0
 no shutdown

! Lab Backbone
interface GigabitEthernet0/0/1
 description LAB-BACKBONE
 ip address 10.0.0.1 255.255.255.0
 no shutdown
 ip nat inside
 ip virtual-reassembly in

! ISP Simulation Interface
interface GigabitEthernet0/0/2
 description ISP-SIMULATION
 ip address 203.0.113.1 255.255.255.0
 no shutdown
 ip nat outside
 ip virtual-reassembly out

! Loopback for Router ID stability
interface Loopback0
 ip address 10.255.255.1 255.255.255.255

! ============================================
! SIMULATION SERVICES
! ============================================

! DHCP Pool for lab devices
ip dhcp pool LAB-DEVICES
 network 10.0.0.0 255.255.255.0
 default-router 10.0.0.1
 dns-server 8.8.8.8 8.8.4.4
 lease 8

! Excluded addresses
ip dhcp excluded-address 10.0.0.1 10.0.0.10
ip dhcp excluded-address 10.0.0.250 10.0.0.255

! NAT for Internet simulation
access-list 1 permit 10.0.0.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/0/2 overload

! Default route to ISP simulation
ip route 0.0.0.0 0.0.0.0 203.0.113.254

! ============================================
! SECURITY HARDENING
! ============================================

! Control Plane Policing
control-plane
 service-policy input CP-POLICY

! Banner
banner motd #
******************************************************************
*                                                                *
*  CYBERNET LABORATORY ENVIRONMENT                               *
*  Authorized use only. All activity is monitored and logged.    *
*                                                                *
******************************************************************
#

! Logging
logging buffered 16384
logging host 172.16.0.10
login local
transport input ssh
exec-timeout 30 0

! ============================================
! SIMULATION ENGINE INTERFACES
! ============================================

! RESTCONF/NETCONF API for frontend
restconf
netconf ssh

! gRPC for real-time telemetry
grpc
```

### 5.4 Control-Plane Policy

```cisco
class-map match-all CP-POLICY
 match access-group name CP-ACCESS-LIST
 match protocol ssh
 match protocol telnet
 match protocol http
 match protocol https

policy-map CP-POLICY
 class CP-POLICY
  police 1000000 1000 conform-action transmit exceed-action drop

ip access-list extended CP-ACCESS-LIST
 permit tcp any any eq 22
 permit tcp any any eq 443
 permit udp any any eq 161
 permit udp any any eq 162
 deny ip any any
```

### 5.5 Simulation Service APIs

**RESTCONF Endpoints:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /restconf/data/cybernet:lab-state | Current lab device states |
| POST | /restconf/data/cybernet:inject-error | Inject error scenario |
| PUT | /restconf/data/cybernet:lab-config/{id} | Push config to device |
| GET | /restconf/data/cybernet:telemetry | Real-time interface stats |
| POST | /restconf/data/cybernet:reset-lab/{id} | Reset lab to initial state |

**gRPC Telemetry Streams:**

| Stream | Data | Update Rate |
|--------|------|-------------|
| interface_stats | In/out packets, errors, drops | 1s |
| routing_table | Route additions/withdrawals | On change |
| neighbor_state | OSPF/EIGRP/BGP neighbor events | On change |
| cpu_memory | Utilization percentages | 5s |

### 5.6 Network Topology Within Simulation

```
                    ┌──────────────────┐
                    │  CyberNet-Lab-   │
                    │     Core         │
                    │  172.16.0.1      │
                    └────────┬─────────┘
                             │ Mgmt
                    ┌────────▼─────────┐
                    │  Web App Server  │
                    │  172.16.0.10     │
                    └──────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐         ┌─────────▼─────────┐
    │  GigE 0/0/1       │         │  GigE 0/0/2       │
    │  10.0.0.1/24      │         │  203.0.113.1/24   │
    │  Lab Backbone      │         │  ISP Simulation   │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                             │
    ┌─────────▼─────────┐                   │
    │  Virtual Cloud    │                   │
    │  Switch           │                   │
    │  10.0.0.2         │                   │
    └───┬───┬───┬───────┘                   │
        │   │   │                           │
    ┌───▼─┐ │   ┌───▼──────┐    ┌─────────▼─────────┐
    │ VM1 │ │   │  VM2     │    │  ISP Router Sim   │
    │R1   │ │   │  R2      │    │  203.0.113.254    │
    │10.0.0.11│ │10.0.0.12│    └───────────────────┘
    └──────┘ │   └──────────┘
            │
    ┌───────▼───────┐
    │  VM3          │
    │  SW1          │
    │  10.0.0.13    │
    └───────────────┘
```

### 5.7 Device Communication Protocol

**Frontend ↔ Backend:**
- WebSocket: Real-time device state, topology updates, console streams
- REST API: Lab configuration, device provisioning, error injection
- gRPC streaming: Telemetry, packet captures, event logs

**Backend ↔ Virtual Devices:**
- VIRL/CML API: Device lifecycle management
- NETCONF: Configuration push/pull
- SNMP: Status polling
- Custom agent: Embedded in each virtual device for simulation hooks

### 5.8 Scalability Considerations

| Dimension | Current | Target v4.0 | Scaling Strategy |
|-----------|---------|-------------|------------------|
| Concurrent users | 1 | 50 | Containerized backend instances |
| Devices per lab | Unlimited | 50 | Resource pooling |
| Packet rate | N/A | 100K pps | eBPF packet generation |
| Telemetry retention | Session | 7 days | Time-series DB |
| Log retention | Session | 90 days | Object storage |

---

## IMPLEMENTATION ROADMAP

### Phase 1: Core Architecture (Weeks 1-4)
1. Backend simulation engine
2. Main router configuration and service APIs
3. Device model library (router, switch, PC, server)
4. Basic cable and connection physics

### Phase 2: Procedural Engine (Weeks 5-8)
1. Step decomposition system for 50 pilot labs
2. Verification engine (CLI, topology, typing)
3. Hint and error injection systems
4. Progress tracking and analytics

### Phase 3: Diegetic UI (Weeks 9-12)
1. 3D workbench viewport (Three.js)
2. Physical rack and device placement
3. Diegetic console terminal
4. Schematic wall panel

### Phase 4: Sensory Systems (Weeks 13-16)
1. Web Audio engine with spatial positioning
2. Complete sound effect library
3. Visual effect pipeline (bloom, particles, physics)
4. Animation state machine

### Phase 5: Polish & Scale (Weeks 17-20)
1. Performance optimization
2. Accessibility features
3. Mobile/tablet support
4. Full 150-lab content migration

---

## APPENDIX A: TECHNICAL DEBT & CURRENT LIMITATIONS

1. **No device simulation:** Current version is a quiz/data viewer only
2. **Flat UI:** All elements are HUD overlays, not diegetic
3. **Static content:** Labs are text-only with no interactive simulation
4. **Limited verification:** Only multiple-choice, no CLI validation
5. **No progression:** No adaptive difficulty or learning path
6. **Single user:** No multi-user or collaboration features
7. **Client-only:** No backend for state management or telemetry

## APPENDIX B: TECHNOLOGY STACK

| Layer | Current | Target v4.0 |
|-------|---------|-------------|
| Frontend | Vanilla JS + HTML | React + Three.js + Zustand |
| 3D | None | Three.js / Babylon.js |
| Audio | Oscillator beeps | Web Audio + AudioWorklet |
| Backend | None | Node.js + WebSocket + gRPC |
| Simulation | None | Cisco VIRL / CML / EVE-NG wrapper |
| Database | localStorage | PostgreSQL + Redis |
| Deployment | Static file | Docker + Kubernetes |

---

*End of Technical Blueprint Document*
