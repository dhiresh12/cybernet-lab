import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 'soho-1',
    title: 'Scenario 1: Small Office Network Setup',
    company: 'TechStart Inc. - 15 employees',
    departments: ['HR', 'Finance', 'IT', 'Guest WiFi'],
    description: 'You are a junior network engineer. TechStart Inc. just moved to a new office. Design and configure their network.',
    tasks: [
      'Create VLANs for each department (HR: VLAN 10, Finance: VLAN 20, IT: VLAN 30, Guest: VLAN 40)',
      'Assign IP subnets to each VLAN (HR: 192.168.10.0/24, etc.)',
      'Configure router-on-a-stick for inter-VLAN routing',
      'Set up DHCP for each VLAN',
      'Configure basic security (SSH, passwords, disable Telnet)',
      'Test connectivity between departments',
      'Document the configuration'
    ],
    success_criteria: [
      'All 4 VLANs configured',
      'Inter-VLAN routing works',
      'DHCP assigns IPs to all departments',
      'SSH enabled, Telnet disabled',
      'Each department can communicate with IT but Guest is isolated',
      'All PCs can reach the Internet'
    ]
  },
  {
    id: 'enterprise-1',
    title: 'Scenario 2: Multi-Site Enterprise Network',
    company: 'GlobalCorp - 500 employees across 3 sites',
    departments: ['HQ', 'Branch Office 1', 'Branch Office 2', 'Data Center'],
    description: 'GlobalCorp needs to connect 3 sites and a data center using OSPF and BGP. Implement a secure, redundant enterprise network.',
    tasks: [
      'Design IP addressing scheme for all sites',
      'Configure OSPF area hierarchy (Area 0 backbone, areas for each site)',
      'Set up BGP between data center and ISP',
      'Configure inter-VLAN routing on core switches',
      'Implement redundancy with HSRP or VRRP',
      'Configure access control lists for security',
      'Test failover and redundancy'
    ],
    success_criteria: [
      'OSPF forms adjacencies between all routers',
      'BGP peering with ISP is Established',
      'HSRP failover works when primary router fails',
      'ACLs block unauthorized traffic',
      'All sites can communicate with each other',
      'Data center services are accessible from all sites'
    ]
  },
  {
    id: 'security-1',
    title: 'Scenario 3: Security Breach Response',
    company: 'SecureNet Solutions - Under Attack',
    description: 'SecureNet has detected unusual network activity. Investigate and secure the network.',
    tasks: [
      'Identify the source of suspicious traffic using show commands',
      'Find compromised devices using ARP inspection',
      'Implement port security to prevent MAC flooding',
      'Configure ACLs to block malicious traffic',
      'Set up logging to monitor future incidents',
      'Document the breach and response'
    ],
    success_criteria: [
      'Identified all compromised devices',
      'Blocked malicious traffic at the perimeter',
      'Implemented port security on all access ports',
      'Enabled logging on all network devices',
      'Documented the breach with timestamps and actions taken'
    ]
  },
  {
    id: 'datacenter-1',
    title: 'Scenario 4: Data Center Network Design',
    company: 'DataCenter Co. - Cloud Provider',
    description: 'Design a data center network for a cloud provider with 1000+ servers. Focus on scalability and redundancy.',
    tasks: [
      'Design spine-leaf topology',
      'Configure BGP as the routing protocol for the data center',
      'Implement VXLAN for network virtualization',
      'Set up load balancing for web services',
      'Configure redundancy at every layer',
      'Implement out-of-band management network'
    ],
    success_criteria: [
      'Spine-leaf topology with full redundancy',
      'BGP peering between all spines and leaves',
      'VXLAN overlay working for tenant isolation',
      'Load balancer distributes traffic evenly',
      'Management network is isolated from data traffic'
    ]
  }
];

export default function EngineerMode({ onSelectCategory }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  const toggleTask = (scenarioId, taskIdx) => {
    setCompletedTasks(prev => {
      const key = scenarioId;
      const current = prev[key] || [];
      const next = current.includes(taskIdx)
        ? current.filter(i => i !== taskIdx)
        : [...current, taskIdx];
      return { ...prev, [key]: next };
    });
  };

  if (selectedScenario) {
    const sc = SCENARIOS.find(s => s.id === selectedScenario);
    const completed = completedTasks[sc.id] || [];
    const percent = Math.round((completed.length / sc.tasks.length) * 100);

    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => setSelectedScenario(null)}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid rgba(0,240,255,0.4)',
            background: 'transparent',
            color: 'var(--cyan)',
            cursor: 'pointer',
            marginBottom: 16
          }}
        >← Back to Scenarios</button>

        <h2 style={{ color: 'var(--cyan)', marginBottom: 8 }}>👷 {sc.title}</h2>
        <div style={{ color: 'var(--magenta)', marginBottom: 12 }}>{sc.company}</div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(0,240,255,0.35)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{sc.description}</div>
        </div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(0,240,255,0.35)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--cyan)', marginBottom: 10, fontWeight: 700 }}>
            📋 Tasks ({completed.length} / {sc.tasks.length} complete)
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 999, height: 8, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{
              background: percent === 100 ? 'var(--green)' : 'var(--cyan)',
              height: '100%',
              width: `${percent}%`,
              transition: 'width 0.3s'
            }} />
          </div>
          {sc.tasks.map((task, idx) => {
            const isCompleted = completed.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleTask(sc.id, idx)}
                style={{
                  padding: '10px 12px',
                  marginBottom: 6,
                  borderRadius: 6,
                  background: isCompleted ? 'rgba(0,255,136,0.1)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${isCompleted ? 'var(--green)' : 'rgba(0,240,255,0.2)'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: `2px solid ${isCompleted ? 'var(--green)' : 'var(--muted)'}`,
                  background: isCompleted ? 'var(--green)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 700
                }}>{isCompleted ? '✓' : ''}</div>
                <div style={{
                  color: isCompleted ? 'var(--muted)' : 'var(--text)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  flex: 1
                }}>{task}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(0,255,136,0.4)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}>
          <div style={{ color: 'var(--green)', marginBottom: 10, fontWeight: 700 }}>✅ Success Criteria</div>
          {sc.success_criteria.map((c, i) => (
            <div key={i} style={{ color: 'var(--text)', marginBottom: 4, fontSize: '0.9em' }}>• {c}</div>
          ))}
        </div>

        {onSelectCategory && percent < 100 && (
          <button
            onClick={() => onSelectCategory(sc.tasks[0])}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--cyan)',
              color: '#000',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >📚 Find Related Labs</button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'var(--cyan)', marginBottom: 8 }}>👷 Engineer Mode</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
        Real-world network engineering scenarios. Complete tasks like a junior network engineer.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {SCENARIOS.map(sc => (
          <div
            key={sc.id}
            onClick={() => setSelectedScenario(sc.id)}
            style={{
              background: 'var(--panel)',
              border: '1px solid rgba(0,240,255,0.35)',
              borderRadius: 12,
              padding: 16,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0,240,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.35)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ color: 'var(--magenta)', fontSize: '0.85em', marginBottom: 6 }}>{sc.company}</div>
            <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 8 }}>{sc.title}</div>
            <div style={{ color: 'var(--text)', fontSize: '0.85em', marginBottom: 8, lineHeight: 1.4 }}>
              {sc.description.substring(0, 100)}...
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.75em' }}>
              {sc.tasks.length} tasks
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}