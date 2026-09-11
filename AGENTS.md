
## Objective
Transform the existing CyberNet Lab application into a professional NOC/SOC interface with hands-on network engineering laboratory capabilities, integrating 247+ labs with actual topology data, stateful CLI simulation, functional verification loops, and a professional futuristic aesthetic.

## Important Details
- The actual project lives at `C:\Users\dhiresh\OneDrive\Desktop\code\learning\cybernet-lab`
- The shell session may report `C:\Users\dhiresh\OneDrive\Desktop\bot_3\.kilo\worktrees\lab` but source code is in the absolute path above
- Use `workdir` parameter in bash calls to set the correct working directory
- 247 labs across 30+ categories, 103 basic / 62 intermediate / 82 advanced
- Reference image visual language: Nexus-style NOC/SOC with dark background, cyan/blue/purple accents, grid overlays, panel corners, technical labels
- Must not use emojis in production UI, avoid SaaS dashboard style, large rounded cards, or childish gaming appearance
- Music OFF by default, use actual files from song/ directory, low volume, no autoplay
- Build dist only after testing, do not treat frontend/dist as source of truth
- 3D only if improves learning: Three.js + React Three Fiber for topology/packet flow/device visualization
- Performance: single requestAnimationFrame loop per renderer, reduce motion mode, pause when tab hidden, lower particle counts
- Background Studio must have actual renderer for every listed background (now 20 total)
- Do not delete labs to reach 225 target; keep 247 but improve quality

## Work State
### Phase 1 - Completed
- Audited architecture
- Fixed verifiers.js forEach→every
- Enhanced LabEngine.js with reconnection, local mode, state sync
- Fixed Cisco CLI simulation - stateful show commands, ping, traceroute
- Enhanced LabWorkspace - topology from actual lab data, packet flow, verification loop
- Transformed Dashboard to NOC/SOC command center
- Transformed LabWorkspace to NOC-style control center
- Added troubleshooting mode
- Improved 150/247 lab steps with real scenarios
- Background Studio: 20 renderers
- Terminal.jsx useState fix, music auto-play removed
- Build verified

### Phase 2 - Completed (Lab Workspace Redesign)
- Reviewed all 16 required sections in LabWorkspace.jsx
- Improved edge status based on actual interface states (getEdgeStatus helper)
- Added path-based packet animation (findPath BFS algorithm)
- Ping/traceroute show arp - fixed targetIp undefined bug
- show arp - fixed interface name display
- saveProgress merge fix, checkBadges recursion fix, Reset Lab per-lab scope, step ID namespace
- Restart button reinitializes deviceStates
- Build verified after every fix
- Dev server running at http://localhost:5173

### Active
- Phase 3: Backend verification

### Blocked
- None

## Next Move
Phase 3: Backend verification
- Verify server.js WebSocket handlers work correctly
- Verify lab seeding from procedural JSON
- Test WebSocket message handling (lab:start, lab:step:verify, lab:hint)
- Verify session management
- Test backend restart behavior

## Relevant Files
- `frontend/src/App.jsx`: Main component — LabEngine integration, view switching, all imports; fixes applied: saveProgress merge, checkBadges useEffect, Reset Lab per-lab scope, step ID namespace
- `frontend/src/engine/LabEngine.js`: WebSocket backend with local mode; fixes applied: reconnection, state sync, topology, device config
- `frontend/src/components/LabWorkspace.jsx`: NOC-style control center; fixes applied: setTroubleshootLevel, Restart reinit deviceStates, ping/traceroute/ARP output, edge status based on interface states, path-based packet animation
- `simulation/verifiers.js`: Topology fix applied (forEach→every)
- `simulation/packetTracer.js`: Lab-specific Packet Tracer hints
- `frontend/src/components/Dashboard.jsx`: NOC/SOC command center
- `frontend/src/components/BackgroundStudio.jsx`: 20 renderers
- `frontend/src/styles/global.css`: NOC aesthetic
- `backend/server.js`: Express + WebSocket
