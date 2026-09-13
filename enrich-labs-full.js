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

function generateDetailedWalkthrough(lab) {
  const c = (lab.category || '').toLowerCase();
  const t = (lab.title || '').toLowerCase();
  const walkthrough = [];

  if (c === 'basics' || t.includes('ip config') || t.includes('ping test') || t.includes('router basics')) {
    // BASICS LABS - Very detailed for beginners
    walkthrough.push({
      kind: 'read',
      text: 'LAB OBJECTIVE: ' + lab.objectives
    });
    walkthrough.push({
      kind: 'read',
      text: 'SCENARIO: ' + lab.scenario
    });
    walkthrough.push({
      kind: 'note',
      text: 'Estimated time: ' + (lab.time || '15-20 minutes')
    });
    walkthrough.push({
      kind: 'note',
      text: 'Difficulty: ' + lab.level.toUpperCase()
    });
    walkthrough.push({
      kind: 'note',
      text: '──────────────────────────────────────────────'
    });

    // Step 1: Open Packet Tracer
    walkthrough.push({
      kind: 'read',
      text: 'STEP 1: OPEN CISCO PACKET TRACER\n\n1. Double-click the Cisco Packet Tracer icon on your desktop\n2. If prompted, log in with your Cisco NetAcad credentials\n3. You should see a blank workspace with device palette at bottom'
    });
    walkthrough.push({
      kind: 'note',
      text: 'TIP: If you don\'t have Packet Tracer, download it free from Cisco Networking Academy (netacad.com)'
    });

    // Step 2: Add devices
    walkthrough.push({
      kind: 'read',
      text: 'STEP 2: ADD END DEVICES (PCs)\n\n1. Look at the bottom-left device palette\n2. Click "End Devices" (icon: computer monitor)\n3. Drag TWO "PC" devices onto the workspace\n4. Position them with space between for the switch\n\n   PC0 (left)                    PC1 (right)'
    });

    // Step 3: Add switch
    walkthrough.push({
      kind: 'read',
      text: 'STEP 3: ADD A SWITCH\n\n1. In the device palette, click "Network Devices" → "Switches"\n2. Select "2960" switch (most common for labs)\n3. Drag it BETWEEN the two PCs\n\n   PC0 ── [will connect here] ── PC1\n              SWITCH'
    });

    // Step 4: Cable connections
    walkthrough.push({
      kind: 'read',
      text: 'STEP 4: CONNECT DEVICES WITH CABLES\n\n1. Click "Connections" (lightning bolt icon) in bottom palette\n2. Select "Copper Straight-Through" cable (solid line icon)\n3. Click PC0 → Select "FastEthernet0"\n4. Click Switch → Select "FastEthernet0/1"\n5. Repeat: PC1 → FastEthernet0, Switch → FastEthernet0/2\n\n   Green link lights should appear on both ends\n   NOTE: Use Copper Straight-Through for PC↔Switch\n   DO NOT use Crossover or Serial cables here'
    });
    walkthrough.push({
      kind: 'cmd',
      text: '# Verify link lights are GREEN (not amber/red)'
    });

    // Step 5: Configure PC0 IP
    walkthrough.push({
      kind: 'read',
      text: 'STEP 5: CONFIGURE PC0 IP ADDRESS\n\n1. Click PC0 → Go to "Desktop" tab\n2. Click "IP Configuration"\n3. Fill in:\n   • IP Address: 192.168.1.10\n   • Subnet Mask: 255.255.255.0\n   • Default Gateway: 192.168.1.1 (leave blank for now)\n4. Close the window'
    });
    walkthrough.push({
      kind: 'cmd',
      text: '192.168.1.10'
    });
    walkthrough.push({
      kind: 'cmd',
      text: '255.255.255.0'
    });

    // Step 6: Configure PC1 IP
    walkthrough.push({
      kind: 'read',
      text: 'STEP 6: CONFIGURE PC1 IP ADDRESS\n\n1. Click PC1 → Go to "Desktop" tab\n2. Click "IP Configuration"\n3. Fill in:\n   • IP Address: 192.168.1.20\n   • Subnet Mask: 255.255.255.0\n   • Default Gateway: 192.168.1.1\n4. Close the window'
    });
    walkthrough.push({
      kind: 'cmd',
      text: '192.168.1.20'
    });
    walkthrough.push({
      kind: 'cmd',
      text: '255.255.255.0'
    });

    // Step 7: Test connectivity
    walkthrough.push({
      kind: 'read',
      text: 'STEP 7: TEST WITH PING\n\n1. Click PC0 → Desktop → Command Prompt\n2. Type the following command and press ENTER:\n\n   ping 192.168.1.20\n\n3. You should see:\n\n   Reply from 192.168.1.20: bytes=32 time<1ms TTL=128\n   Reply from 192.168.1.20: bytes=32 time<1ms TTL=128\n   Reply from 192.168.1.20: bytes=32 time<1ms TTL=128\n   Reply from 192.168.1.20: bytes=32 time<1ms TTL=128\n\n   Ping statistics for 192.168.1.20:\n       Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
    });
    walkthrough.push({
      kind: 'expect',
      text: '4 successful replies from 192.168.1.20'
    });
    walkthrough.push({
      kind: 'note',
      text: 'SUCCESS! If you see "Reply from...", the PCs can communicate!\n\nWHY IT WORKS: Both PCs are in the SAME subnet (192.168.1.0/24). The switch learns MAC addresses and forwards frames directly.\n\nTROUBLESHOOTING:\n• "Request timed out" → Check cables (green lights?), IP config (same subnet?)\n• "Destination host unreachable" → Subnet mask mismatch\n• No link lights → Wrong cable type or port not connected'
    });
  } else if (t.includes('static routing') || t.includes('default route')) {
    // STATIC ROUTING LABS
    walkthrough.push({
      kind: 'read',
      text: 'LAB OBJECTIVE: ' + lab.objectives
    });
    walkthrough.push({
      kind: 'note',
      text: '[Note] This lab teaches STATIC ROUTING - manually telling routers where to send packets for remote networks.'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 1: BUILD THE TOPOLOGY\n\nUse the ASCII diagram in the Topology tab. You need:\n• 2 PCs (different subnets: 192.168.1.0/24 and 192.168.2.0/24)\n• 2 Switches (one per LAN)\n• 2 Routers (connected via Serial DCE/DTE cable)\n• Cables: Copper ST for LAN, Serial for WAN link'
    });
    walkthrough.push({
      kind: 'note',
      text: 'CABLE GUIDE: PC↔Switch = Copper Straight-Through | Router↔Router = Serial DCE/DTE'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 2: CONFIGURE PC IP ADDRESSES\n\nPC0 (Left LAN): 192.168.1.10 / 255.255.255.0 / GW 192.168.1.1\nPC1 (Right LAN): 192.168.2.10 / 255.255.255.0 / GW 192.168.2.1'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 3: CONFIGURE ROUTER A (Left)\n\nConnect via Console or click Router → CLI tab:\n\nRouter> enable\nRouter# configure terminal\nRouter(config)# interface FastEthernet0/0\nRouter(config-if)# ip address 192.168.1.1 255.255.255.0\nRouter(config-if)# no shutdown\nRouter(config-if)# exit\nRouter(config)# interface Serial0/0/0\nRouter(config-if)# ip address 10.0.0.1 255.255.255.252\nRouter(config-if)# clock rate 64000\nRouter(config-if)# no shutdown\nRouter(config-if)# exit\nRouter(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2\nRouter(config)# end\nRouter# write memory'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 4: CONFIGURE ROUTER B (Right)\n\nRouter> enable\nRouter# configure terminal\nRouter(config)# interface FastEthernet0/0\nRouter(config-if)# ip address 192.168.2.1 255.255.255.0\nRouter(config-if)# no shutdown\nRouter(config-if)# exit\nRouter(config)# interface Serial0/0/0\nRouter(config-if)# ip address 10.0.0.2 255.255.255.252\nRouter(config-if)# no shutdown\nRouter(config-if)# exit\nRouter(config)# ip route 192.168.1.0 255.255.255.0 10.0.0.1\nRouter(config)# end\nRouter# write memory'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 5: TEST END-TO-END CONNECTIVITY\n\nFrom PC0 Command Prompt:\n  ping 192.168.2.10\n\nExpected: 4 successful replies!\n\nAlso verify routing tables:\nRouterA# show ip route\nRouterB# show ip route'
    });
    walkthrough.push({
      kind: 'expect',
      text: 'PC0 can ping PC1 across the WAN link'
    });
  } else if (c.includes('ospf') || c.includes('eigrp') || c.includes('rip')) {
    // DYNAMIC ROUTING LABS
    walkthrough.push({
      kind: 'read',
      text: 'LAB OBJECTIVE: ' + lab.objectives
    });
    walkthrough.push({
      kind: 'note',
      text: '[Note] This lab configures DYNAMIC ROUTING (' + (c.includes('ospf') ? 'OSPF' : c.includes('eigrp') ? 'EIGRP' : 'RIP') + ') - routers automatically share routes.'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 1: BUILD MULTI-ROUTER TOPOLOGY\n\nRefer to Topology tab. Typical setup:\n• 3-4 Routers in a triangle/square\n• Each router has a LAN (PC + Switch)\n• Serial links between routers\n• All interfaces UP with IPs assigned'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 2: CONFIGURE BASIC INTERFACES\n\nOn EACH router:\nRouter> enable\nRouter# conf t\nRouter(config)# interface <LAN-interface>\nRouter(config-if)# ip address <LAN-IP> <mask>\nRouter(config-if)# no shut\nRouter(config-if)# exit\nRouter(config)# interface <WAN-interface>\nRouter(config-if)# ip address <WAN-IP> <mask>\nRouter(config-if)# clock rate 64000 (on DCE side only)\nRouter(config-if)# no shut'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 3: CONFIGURE ' + (c.includes('ospf') ? 'OSPF' : c.includes('eigrp') ? 'EIGRP' : 'RIP') + '\n\n' + (c.includes('ospf') ? `Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# network 10.0.0.0 0.0.0.3 area 0
... (add ALL connected networks)` : c.includes('eigrp') ? `Router(config)# router eigrp 100
Router(config-router)# network 192.168.1.0
Router(config-router)# network 10.0.0.0
... (add ALL connected networks)
Router(config-router)# no auto-summary` : `Router(config)# router rip
Router(config-router)# version 2
Router(config-router)# network 192.168.1.0
Router(config-router)# network 10.0.0.0
... (add ALL connected networks)`)
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 4: VERIFY NEIGHBOR ADJACENCIES\n\n' + (
        c.includes('ospf') ? 'Router# show ip ospf neighbor\nRouter# show ip route ospf'
        : c.includes('eigrp') ? 'Router# show ip eigrp neighbors\nRouter# show ip route eigrp'
        : 'Router# show ip rip database\nRouter# show ip route rip'
      )
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 5: TEST FULL CONNECTIVITY\n\nFrom any PC, ping PCs in other LANs:\nPC> ping <remote-PC-IP>\n\nAll should succeed! Check routing tables show ' + (c.includes('ospf') ? 'O' : c.includes('eigrp') ? 'D' : 'R') + ' routes.'
    });
  } else if (c.includes('switching') || t.includes('vlan') || t.includes('trunk')) {
    // SWITCHING/VLAN LABS
    walkthrough.push({
      kind: 'read',
      text: 'LAB OBJECTIVE: ' + lab.objectives
    });
    walkthrough.push({
      kind: 'note',
      text: '[Note] VLANs separate broadcast domains. Trunks carry multiple VLANs.'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 1: CREATE VLANS ON SWITCH\n\nSwitch> enable\nSwitch# conf t\nSwitch(config)# vlan 10\nSwitch(config-vlan)# name SALES\nSwitch(config-vlan)# exit\nSwitch(config)# vlan 20\nSwitch(config-vlan)# name ENGINEERING\nSwitch(config-vlan)# exit\nSwitch(config)# vlan 99\nSwitch(config-vlan)# name MANAGEMENT'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 2: ASSIGN ACCESS PORTS\n\nSwitch(config)# interface range fa0/1-2\nSwitch(config-if-range)# switchport mode access\nSwitch(config-if-range)# switchport access vlan 10\nSwitch(config-if-range)# exit\n\nSwitch(config)# interface range fa0/3-4\nSwitch(config-if-range)# switchport mode access\nSwitch(config-if-range)# switchport access vlan 20'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 3: CONFIGURE TRUNK PORT\n\nSwitch(config)# interface fa0/24\nSwitch(config-if)# switchport trunk encapsulation dot1q\nSwitch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk allowed vlan 10,20,99\nSwitch(config-if)# no shut'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 4: INTER-VLAN ROUTING (Router-on-a-Stick)\n\nRouter> enable\nRouter# conf t\nRouter(config)# interface fa0/0.10\nRouter(config-subif)# encapsulation dot1q 10\nRouter(config-subif)# ip address 192.168.10.1 255.255.255.0\nRouter(config-subif)# exit\nRouter(config)# interface fa0/0.20\nRouter(config-subif)# encapsulation dot1q 20\nRouter(config-subif)# ip address 192.168.20.1 255.255.255.0'
    });
    walkthrough.push({
      kind: 'read',
      text: 'STEP 5: TEST VLAN ISOLATION & ROUTING\n\n• PC in VLAN 10 CANNOT ping PC in VLAN 20 directly (broadcast domain separated)\n• PC in VLAN 10 CAN ping PC in VLAN 20 THROUGH router (inter-VLAN routing)\n• Verify: show vlan brief, show interfaces trunk'
    });
  } else {
    // GENERIC TEMPLATE for other labs
    walkthrough.push({
      kind: 'read',
      text: 'LAB OBJECTIVE: ' + lab.objectives
    });
    walkthrough.push({
      kind: 'read',
      text: 'SCENARIO: ' + lab.scenario
    });
    walkthrough.push({
      kind: 'note',
      text: 'Build the topology shown in the Topology tab before proceeding.'
    });
    walkthrough.push({
      kind: 'note',
      text: 'Configure devices step by step. Use the Commands tab for exact commands.'
    });
    walkthrough.push({
      kind: 'note',
      text: 'Verify each step before moving to the next. Use the Verify tab for expected outputs.'
    });
  }

  return walkthrough;
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
      wt.push({ kind: 'note',       text: `Common error: ${e.error} → ${e.fix || e.solution || 'See troubleshooting tab.'}` });
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
    prerequisites: generatePrerequisites(lab),
    detailedWalkthrough: generateDetailedWalkthrough(lab)
  };
  if (enrichedLab.steps && enrichedLab.steps.length) {
    enrichedLab.steps = enrichedLab.steps.map((s, i) => enrichStep(s, i, enrichedLab.steps.length));
  }
  return enrichedLab;
});

fs.writeFileSync(FILE, JSON.stringify(enriched, null, 2));
console.log(`Enriched ${count} labs with topology, prerequisites, per-step walkthrough, AND detailed lab walkthroughs.`);