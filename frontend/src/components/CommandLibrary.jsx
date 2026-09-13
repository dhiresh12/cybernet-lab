import React, { useState, useMemo } from 'react';
import { getCommandContract } from '../data/commandRegistry';

const COMMAND_LIBRARY = [
  {
    category: 'Basic',
    commands: [
      {
        command: 'enable',
        purpose: 'Enter privileged EXEC mode',
        syntax: 'enable [level]',
        example: 'Router> enable',
        expectedOutput: 'Router#',
        commonMistake: 'Forgetting to type enable first before config commands'
      },
      {
        command: 'configure terminal',
        purpose: 'Enter global configuration mode',
        syntax: 'configure terminal',
        example: 'Router# configure terminal',
        expectedOutput: 'Router(config)#',
        commonMistake: 'Trying to configure without being in config mode'
      },
      {
        command: 'hostname',
        purpose: 'Set device hostname',
        syntax: 'hostname <name>',
        example: 'Router(config)# hostname R1',
        expectedOutput: 'R1(config)#',
        commonMistake: 'Using spaces in hostname without underscores'
      },
      {
        command: 'show running-config',
        purpose: 'Display current running configuration',
        syntax: 'show running-config',
        example: 'Router# show running-config',
        expectedOutput: 'Configuration displayed',
        commonMistake: 'Confusing with startup-config'
      }
    ]
  },
  {
    category: 'Interface',
    commands: [
      {
        command: 'interface',
        purpose: 'Enter interface configuration mode',
        syntax: 'interface <type> <slot/port>',
        example: 'Router(config)# interface gigabitEthernet 0/0',
        expectedOutput: 'Router(config-if)#',
        commonMistake: 'Wrong interface name - check with show ip interface brief'
      },
      {
        command: 'ip address',
        purpose: 'Assign IP address to interface',
        syntax: 'ip address <ip> <mask>',
        example: 'Router(config-if)# ip address 192.168.1.1 255.255.255.0',
        expectedOutput: 'IP configured',
        commonMistake: 'Forgetting to use no shutdown after IP config'
      },
      {
        command: 'no shutdown',
        purpose: 'Enable an interface',
        syntax: 'no shutdown',
        example: 'Router(config-if)# no shutdown',
        expectedOutput: 'Interface enabled',
        commonMistake: 'Interfaces are shutdown by default - must enable'
      },
      {
        command: 'show ip interface brief',
        purpose: 'Show interface IP and status',
        syntax: 'show ip interface brief',
        example: 'Router# show ip interface brief',
        expectedOutput: 'List of interfaces with status',
        commonMistake: 'Not checking this before troubleshooting connectivity'
      },
      {
        command: 'description',
        purpose: 'Add description to interface',
        syntax: 'description <text>',
        example: 'Router(config-if)# description Link to R2',
        expectedOutput: 'Description set',
        commonMistake: 'Forgetting to document important interfaces'
      }
    ]
  },
  {
    category: 'VLAN',
    commands: [
      {
        command: 'vlan',
        purpose: 'Create or enter VLAN config mode',
        syntax: 'vlan <vlan-id>',
        example: 'Switch(config)# vlan 10',
        expectedOutput: 'Switch(config-vlan)#',
        commonMistake: 'VLAN 1 is default and cannot be deleted'
      },
      {
        command: 'name',
        purpose: 'Assign name to VLAN',
        syntax: 'name <name>',
        example: 'Switch(config-vlan)# name IT',
        expectedOutput: 'VLAN named',
        commonMistake: 'Optional but recommended for documentation'
      },
      {
        command: 'switchport mode access',
        purpose: 'Set port to access mode (single VLAN)',
        syntax: 'switchport mode access',
        example: 'Switch(config-if)# switchport mode access',
        expectedOutput: 'Port is access mode',
        commonMistake: 'Access ports are for end devices only'
      },
      {
        command: 'switchport access vlan',
        purpose: 'Assign port to a VLAN',
        syntax: 'switchport access vlan <vlan-id>',
        example: 'Switch(config-if)# switchport access vlan 10',
        expectedOutput: 'Port in VLAN 10',
        commonMistake: 'Port must be in access mode first'
      },
      {
        command: 'switchport mode trunk',
        purpose: 'Set port to trunk mode (multiple VLANs)',
        syntax: 'switchport mode trunk',
        example: 'Switch(config-if)# switchport mode trunk',
        expectedOutput: 'Port is trunk mode',
        commonMistake: 'Trunks connect switches, not end devices'
      },
      {
        command: 'show vlan brief',
        purpose: 'Show all VLANs and port assignments',
        syntax: 'show vlan brief',
        example: 'Switch# show vlan brief',
        expectedOutput: 'VLAN list with ports',
        commonMistake: 'Forgetting to check this when troubleshooting'
      }
    ]
  },
  {
    category: 'Routing',
    commands: [
      {
        command: 'ip route',
        purpose: 'Create static route',
        syntax: 'ip route <network> <mask> <next-hop|interface>',
        example: 'Router(config)# ip route 192.168.20.0 255.255.255.0 10.1.1.2',
        expectedOutput: 'Static route added',
        commonMistake: 'Forgetting subnet mask or using wrong next-hop'
      },
      {
        command: 'show ip route',
        purpose: 'Display routing table',
        syntax: 'show ip route [protocol]',
        example: 'Router# show ip route',
        expectedOutput: 'Routing table displayed',
        commonMistake: 'S = Static, C = Connected, O = OSPF, R = RIP, D = EIGRP'
      },
      {
        command: 'ip default-gateway',
        purpose: 'Set default gateway for switch',
        syntax: 'ip default-gateway <ip>',
        example: 'Switch(config)# ip default-gateway 192.168.1.1',
        expectedOutput: 'Default gateway set',
        commonMistake: 'This is for switches, not routers (routers use default route)'
      }
    ]
  },
  {
    category: 'OSPF',
    commands: [
      {
        command: 'router ospf',
        purpose: 'Enable OSPF process',
        syntax: 'router ospf <process-id>',
        example: 'Router(config)# router ospf 1',
        expectedOutput: 'Router(config-router)#',
        commonMistake: 'Process ID is local, does not need to match other routers'
      },
      {
        command: 'network',
        purpose: 'Advertise network in OSPF',
        syntax: 'network <network> <wildcard> area <area-id>',
        example: 'Router(config-router)# network 192.168.1.0 0.0.0.255 area 0',
        expectedOutput: 'Network advertised',
        commonMistake: 'Use wildcard mask (inverse of subnet mask) not subnet mask'
      },
      {
        command: 'show ip ospf neighbor',
        purpose: 'Show OSPF adjacencies',
        syntax: 'show ip ospf neighbor',
        example: 'Router# show ip ospf neighbor',
        expectedOutput: 'List of OSPF neighbors',
        commonMistake: 'Neighbors must be in FULL state'
      },
      {
        command: 'show ip protocols',
        purpose: 'Show routing protocols enabled',
        syntax: 'show ip protocols',
        example: 'Router# show ip protocols',
        expectedOutput: 'Protocol info displayed',
        commonMistake: 'Shows which networks are being advertised'
      }
    ]
  },
  {
    category: 'ACL',
    commands: [
      {
        command: 'access-list',
        purpose: 'Create access list entry',
        syntax: 'access-list <number> {permit|deny} <source> [wildcard]',
        example: 'Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255',
        expectedOutput: 'ACL entry created',
        commonMistake: 'Implicit deny all at end - must permit what you need'
      },
      {
        command: 'ip access-group',
        purpose: 'Apply ACL to interface',
        syntax: 'ip access-group <number> {in|out}',
        example: 'Router(config-if)# ip access-group 1 in',
        expectedOutput: 'ACL applied',
        commonMistake: 'Direction matters - in (inbound) or out (outbound)'
      },
      {
        command: 'show access-lists',
        purpose: 'Display all ACLs and hit counts',
        syntax: 'show access-lists',
        example: 'Router# show access-lists',
        expectedOutput: 'ACL list with counters',
        commonMistake: 'No hits means ACL is not matching traffic'
      }
    ]
  },
  {
    category: 'Security',
    commands: [
      {
        command: 'enable secret',
        purpose: 'Set encrypted privileged password',
        syntax: 'enable secret <password>',
        example: 'Router(config)# enable secret MyPass123',
        expectedOutput: 'Encrypted password set',
        commonMistake: 'Use secret not password - secret is encrypted'
      },
      {
        command: 'service password-encryption',
        purpose: 'Encrypt all plaintext passwords in config',
        syntax: 'service password-encryption',
        example: 'Router(config)# service password-encryption',
        expectedOutput: 'Passwords encrypted (type 7)',
        commonMistake: 'Not secure - easily reversible, use enable secret instead'
      },
      {
        command: 'username',
        purpose: 'Create local user account',
        syntax: 'username <name> privilege <level> secret <password>',
        example: 'Router(config)# username admin privilege 15 secret AdminPass',
        expectedOutput: 'User created',
        commonMistake: 'Privilege 15 = full admin access'
      },
      {
        command: 'crypto key generate rsa',
        purpose: 'Generate RSA keys for SSH',
        syntax: 'crypto key generate rsa [modulus-size]',
        example: 'Router(config)# crypto key generate rsa',
        expectedOutput: 'Keys generated',
        commonMistake: 'Must have ip domain-name configured first'
      },
      {
        command: 'transport input ssh',
        purpose: 'Allow only SSH on VTY lines',
        syntax: 'transport input ssh',
        example: 'Router(config-line)# transport input ssh',
        expectedOutput: 'SSH enabled on VTY',
        commonMistake: 'Disabling Telnet improves security'
      }
    ]
  },
  {
    category: 'Troubleshooting',
    commands: [
      {
        command: 'ping',
        purpose: 'Test connectivity using ICMP',
        syntax: 'ping <ip|hostname>',
        example: 'Router# ping 8.8.8.8',
        expectedOutput: 'Success rate percentage',
        commonMistake: 'Ping uses ICMP which can be blocked by firewalls'
      },
      {
        command: 'traceroute',
        purpose: 'Show path to destination',
        syntax: 'traceroute <ip|hostname>',
        example: 'Router# traceroute google.com',
        expectedOutput: 'List of hops to destination',
        commonMistake: 'Windows uses tracert, not traceroute'
      },
      {
        command: 'show ip interface brief',
        purpose: 'Quick view of all interfaces',
        syntax: 'show ip interface brief',
        example: 'Router# show ip interface brief',
        expectedOutput: 'All interfaces with status',
        commonMistake: 'up/up = working, down/down = physical, up/down = layer 2'
      },
      {
        command: 'show interfaces',
        purpose: 'Detailed interface information',
        syntax: 'show interfaces [<interface>]',
        example: 'Router# show interfaces gigabitEthernet 0/0',
        expectedOutput: 'Interface details and stats',
        commonMistake: 'Look for errors, drops, and input/output rates'
      },
      {
        command: 'show cdp neighbors',
        purpose: 'Show directly connected Cisco devices',
        syntax: 'show cdp neighbors [detail]',
        example: 'Router# show cdp neighbors',
        expectedOutput: 'Neighbor device list',
        commonMistake: 'CDP is Cisco-proprietary, use LLDP for multi-vendor'
      }
    ]
  },
  {
    category: 'Verification',
    commands: [
      {
        command: 'show running-config',
        purpose: 'Display current configuration',
        syntax: 'show running-config',
        example: 'Router# show running-config',
        expectedOutput: 'Full config in RAM',
        commonMistake: 'Lost on reboot unless saved'
      },
      {
        command: 'show startup-config',
        purpose: 'Display saved configuration',
        syntax: 'show startup-config',
        example: 'Router# show startup-config',
        expectedOutput: 'Saved config from NVRAM',
        commonMistake: 'Use copy running-config startup-config to save'
      },
      {
        command: 'show version',
        purpose: 'Show device info and IOS version',
        syntax: 'show version',
        example: 'Router# show version',
        expectedOutput: 'Device model, IOS version, uptime',
        commonMistake: 'Useful for inventory and compatibility checks'
      }
    ]
  }
];

export default function CommandLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCommands = useMemo(() => {
    let results = [];
    COMMAND_LIBRARY.forEach(cat => {
      const matching = cat.commands.filter(cmd => {
        const text = `${cmd.command} ${cmd.purpose} ${cmd.syntax} ${cmd.example}`.toLowerCase();
        return text.includes(search.toLowerCase());
      });
      if (matching.length > 0 && (selectedCategory === 'all' || selectedCategory === cat.category)) {
        results.push({ category: cat.category, commands: matching });
      }
    });
    return results;
  }, [search, selectedCategory]);

  return (
<div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--cyan)', marginBottom: 16 }}>Library Cisco Command Library</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Searchable reference for Cisco IOS commands</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <label htmlFor="command-search" className="sr-only">Search commands</label>
        <input
          id="command-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands (e.g., 'show ip route')..."
          aria-label="Search command library"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,240,255,0.4)',
            borderRadius: 8,
            color: 'var(--text)',
            padding: '10px 12px',
            minWidth: 280,
            flex: 1
          }}
        />
        <label htmlFor="command-category" className="sr-only">Filter commands by category</label>
        <select
          id="command-category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter commands by category"
          style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--panel-border)', borderRadius: 8, padding: '10px 12px' }}
        >
          <option value="all">All Categories</option>
          {COMMAND_LIBRARY.map(cat => (
            <option key={cat.category} value={cat.category}>{cat.category}</option>
          ))}
        </select>
      </div>

      <div aria-live="polite" style={{ color: 'var(--muted)', fontSize: '0.78em', marginBottom: 12 }}>
        {filteredCommands.reduce((count, category) => count + category.commands.length, 0)} command references shown.
      </div>

      {filteredCommands.length === 0 ? (
        <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>
          No commands found matching your search.
        </div>
      ) : (
        filteredCommands.map(cat => (
          <div key={cat.category} style={{ marginBottom: 20 }}>
            <h3 style={{ color: 'var(--magenta)', marginBottom: 10, fontSize: '1.1em' }}>
              {cat.category}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
              {cat.commands.map(cmd => (
                <article key={cmd.command} style={{
                  background: 'var(--panel)',
                  border: '1px solid rgba(0,240,255,0.3)',
                  borderRadius: 8,
                  padding: 12
                }}>
                  {(() => {
                    const contract = getCommandContract(cmd.command);
                    return (
                      <>
                    <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 6, fontSize: '0.95em' }}>
                      {cmd.command}
                    </div>
                    <div style={{ color: 'var(--text)', marginBottom: 6, fontSize: '0.85em' }}>
                      <b>Purpose:</b> {cmd.purpose}
                    </div>
                    <div style={{ color: 'var(--muted)', marginBottom: 6, fontSize: '0.8em' }}>
                      <b>Syntax:</b> <code style={{ background: 'rgba(0,0,0,0.4)', padding: '1px 4px', borderRadius: 3 }}>{cmd.syntax}</code>
                    </div>
                    <div style={{ color: 'var(--green)', marginBottom: 6, fontSize: '0.8em' }}>
                      <b>Example:</b> <code style={{ background: 'rgba(0,0,0,0.4)', padding: '1px 4px', borderRadius: 3 }}>{cmd.example}</code>
                    </div>
                    <div style={{ color: 'var(--yellow)', marginBottom: 6, fontSize: '0.8em' }}>
                      <b>Expected:</b> {cmd.expectedOutput}
                    </div>
                    <div style={{ color: 'var(--primary)', marginBottom: 6, fontSize: '0.78em' }}>
                      <b>Contract:</b> {contract.mode} mode · {contract.mutatesState ? 'may mutate simulation state' : 'read-only'} · devices: {contract.deviceTypes.join(', ') || 'none'}
                    </div>
                    <div style={{ color: contract.status === 'conceptual' ? 'var(--red)' : 'var(--green)', marginBottom: 6, fontSize: '0.78em' }}>
                      <b>Support:</b> {contract.status}
                    </div>
                    <div style={{ color: 'var(--muted)', marginBottom: 6, fontSize: '0.78em' }}>
                      <b>Verification:</b> {contract.verification}
                    </div>
                    <div style={{ color: 'var(--muted)', marginBottom: 6, fontSize: '0.78em' }}>
                      <b>Rollback:</b> {contract.rollback}
                    </div>
                    <div style={{ color: 'var(--red)', fontSize: '0.78em' }}>
                      <b>Common Mistake:</b> {cmd.commonMistake}
                    </div>
                      </>
                    );
                  })()}
                </article>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}