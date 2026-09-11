const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function generateTopology(lab) {
  const t = (lab.title || '').toLowerCase();
  const s = (lab.scenario || '').toLowerCase();
  const c = (lab.category || '').toLowerCase();
  const lines = [];
  lines.push('┌──────────────────────────────────────────────────────────┐');
  lines.push(`│ Lab ${String(lab.id).padStart(3, '0')} :: ${lab.title}`);
  lines.push(`│ Category: ${lab.category}  |  Level: ${lab.level}  |  Time: ${lab.time || '20 min'}`);
  lines.push('└──────────────────────────────────────────────────────────┘');
  lines.push('');

  if (s.includes('two router') || s.includes('2 router') || t.includes('static routing') || t.includes('default route')) {
    lines.push('   PC1 (192.168.1.10/24)              PC2 (192.168.2.10/24)');
    lines.push('       │                                      │');
    lines.push('   SW1 ◄──────► RouterA ◄── Serial ──► RouterB ◄──────► SW2');
    lines.push('              Fa0/0      10.0.0.0/30      Fa0/0');
    lines.push('           192.168.1.1                 192.168.2.1');
  } else if (c.includes('ospf') || c.includes('eigrp') || c.includes('rip')) {
    lines.push('                  ┌──────┐');
    lines.push('                  │ Area │');
    lines.push('                  │  0   │');
    lines.push('                  └──┬───┘');
    lines.push('        ┌────────┬────┴────┬────────┐');
    lines.push('        │        │         │        │');
    lines.push('       R1       R2        R3       R4');
    lines.push('        │        │         │        │');
    lines.push('     LAN-A    LAN-B      LAN-C    LAN-D');
  } else if (c.includes('bgp')) {
    lines.push('        AS 65001                    AS 65002');
    lines.push('   ┌─────────────┐             ┌─────────────┐');
    lines.push('   │  R1 ── R2   │ ◄─eBGP──►  │  R3 ── R4   │');
    lines.push('   └─────────────┘             └─────────────┘');
    lines.push('        │                          │');
    lines.push('    Internal                  Internal');
    lines.push('     iBGP                       iBGP');
  } else if (c.includes('switching') || t.includes('vlan') || t.includes('trunk')) {
    lines.push('   PC1──┐    PC2──┐    PC3──┐    PC4──┐');
    lines.push('   Fa0/1│   Fa0/2│   Fa0/3│   Fa0/4│');
    lines.push('        └────┬───┘────┬───┘────┬───┘');
    lines.push('             │   SW1   │        │');
    lines.push('             │  Trunk  │        │');
    lines.push('             └────┬────┘        │');
    lines.push('                  │             │');
    lines.push('                 Router (Inter-VLAN Routing)');
  } else if (c.includes('security') || t.includes('acl') || t.includes('ssh')) {
    lines.push('   PC-Admin                PC-User              PC-Guest');
    lines.push('      │                       │                     │');
    lines.push('      └──────┬──── SW-Core ───┴──────┬──────────────┘');
    lines.push('             │                       │');
    lines.push('          Router ── ACL ── Internet');
  } else if (c.includes('enterprise')) {
    lines.push('   ┌─── Edge Router ─── Internet');
    lines.push('   │');
    lines.push('   ├─── Core Switch (Layer 3)');
    lines.push('   │         │');
    lines.push('   │    ┌────┼────┐');
    lines.push('   │  SW1   SW2   SW3');
    lines.push('   │   │     │     │');
    lines.push('   │ Servers  APs  Users');
  } else if (c.includes('data center') || t.includes('spine') || t.includes('leaf')) {
    lines.push('              Internet');
    lines.push('                 │');
    lines.push('   ┌─Spine1─┐   ┌─Spine2─┐');
    lines.push('   │        │   │        │');
    lines.push('   Leaf1  Leaf2  Leaf3  Leaf4');
    lines.push('   │ │ │  │ │ │  │ │ │  │ │ │');
    lines.push('  Servers, Storage, etc.');
  } else if (c.includes('cloud') || t.includes('aws') || t.includes('vpc')) {
    lines.push('   On-Premises            AWS Cloud (VPC)');
    lines.push('   ┌────────┐             ┌────────────┐');
    lines.push('   │ Router │───VPN────►  │  IGW       │');
    lines.push('   └────────┘             │  ├─Subnet A│');
    lines.push('                          │  ├─Subnet B│');
    lines.push('                          │  └─Subnet C│');
    lines.push('                          └────────────┘');
  } else if (c.includes('automation') || t.includes('ansible') || t.includes('python')) {
    lines.push('   ┌─── Ansible/Python Controller');
    lines.push('   │   (automation server)');
    lines.push('   │');
    lines.push('   ├── SSH/REST ───► R1, R2, R3, SW1, SW2');
  } else if (c.includes('troubleshoot') || t.includes('fix') || t.includes('debug')) {
    lines.push('   Setup includes intentional misconfigurations.');
    lines.push('   Examine the running config to spot them.');
  } else if (c.includes('design') || t.includes('topology')) {
    lines.push('   Refer to design requirements in the scenario above.');
    lines.push('   Build your topology to match the design criteria.');
  } else if (s.includes('switch') && s.includes('pc')) {
    lines.push('   PC1 ── Copper ST ── Switch0 ── Copper ST ── PC2');
    lines.push('   192.168.1.10/24                192.168.1.20/24');
  } else if (s.includes('router') && s.includes('switch') && s.includes('pc')) {
    lines.push('   PC1 ── SW1 ── Router Fa0/0');
    lines.push('                  Router Fa0/1 ── SW2 ── PC2');
    lines.push('   192.168.1.0/24    192.168.2.0/24');
  } else {
    lines.push('   Refer to the scenario description for device list and connections.');
    lines.push('   Build the topology in Packet Tracer first, then proceed.');
  }
  return lines.join('\n');
}

function generatePrerequisites(lab) {
  const prereqs = [];
  const t = (lab.title || '').toLowerCase();
  if (t.includes('static routing') || t.includes('default route')) {
    prereqs.push('Basic IP configuration on PCs and routers');
    prereqs.push('Router interfaces up (no shutdown)');
    prereqs.push('Console cable or Telnet access to routers');
  } else if (t.includes('ospf')) {
    prereqs.push('OSPF basic concepts (areas, cost, hello/dead timers)');
    prereqs.push('Static routing fundamentals');
    prereqs.push('Interface IP configuration');
  } else if (t.includes('bgp')) {
    prereqs.push('OSPF or static routing knowledge');
    prereqs.push('IP addressing plan ready');
    prereqs.push('AS number scheme decided');
  } else if (t.includes('vlan') || t.includes('trunk')) {
    prereqs.push('Switching basics (MAC learning)');
    prereqs.push('VLAN concept (broadcast domain)');
    prereqs.push('Trunk vs access port difference');
  } else if (t.includes('acl')) {
    prereqs.push('IP subnetting fluency');
    prereqs.push('Basic router configuration');
  } else {
    prereqs.push('Basic IP and subnetting knowledge');
    prereqs.push('Cisco IOS CLI familiarity');
  }
  prereqs.push('Cisco Packet Tracer installed (free from Cisco Networking Academy)');
  return prereqs;
}

function enrichStep(step, idx, totalSteps) {
  if (step.walkthrough && step.walkthrough.length) return step;
  const wt = [];
  wt.push({ kind: 'read', text: step.instruction });
  if (step.title && step.title !== 'Review Lab Scenario' && !step.title.toLowerCase().includes('review')) {
    wt.push({ kind: 'note', text: `Goal of step: ${step.title}` });
  }
  if (step.commands && step.commands.length) {
    wt.push({ kind: 'note', text: 'Open the device CLI in Packet Tracer and run these commands in order:' });
    step.commands.forEach(cmd => wt.push({ kind: 'cmd', text: cmd }));
  } else {
    wt.push({ kind: 'note', text: 'This step is conceptual — read carefully and confirm your understanding before moving on.' });
  }
  if (step.expectedOutput) {
    wt.push({ kind: 'expect', text: `Expected: ${step.expectedOutput}` });
  }
  if (step.routing && step.routing !== 'No configuration change yet.' && step.routing !== 'No specific routing change.') {
    wt.push({ kind: 'note', text: `Why: ${step.routing}` });
  }
  if (step.keypoints && step.keypoints.length) {
    step.keypoints.forEach(k => wt.push({ kind: 'tip', text: k }));
  }
  if (step.errors && step.errors.length) {
    step.errors.forEach(e => {
      wt.push({ kind: 'note', text: `⚠ Common error: ${e.error} → ${e.fix || e.solution || 'See troubleshooting tab.'}` });
    });
  }
  return { ...step, walkthrough: wt };
}

let count = 0;
const enriched = data.map(lab => {
  count++;
  const enrichedLab = {
    ...lab,
    topology: generateTopology(lab),
    prerequisites: generatePrerequisites(lab)
  };
  if (enrichedLab.steps && enrichedLab.steps.length) {
    enrichedLab.steps = enrichedLab.steps.map((s, i) => enrichStep(s, i, enrichedLab.steps.length));
  }
  return enrichedLab;
});

fs.writeFileSync(FILE, JSON.stringify(enriched, null, 2));
console.log(`Enriched ${count} labs with topology, prerequisites, and walkthrough.`);
