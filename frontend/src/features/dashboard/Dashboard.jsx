import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { generateNodes, generateArcs } from '../../features/globe/globeData';
import { formatUptime, formatTraffic } from '../../core/utils';
import Panel from '../../components/primitives/Panel';
import Metric from '../../components/primitives/Metric';
import SectionHeader from '../../components/primitives/SectionHeader';
import StatusIndicator from '../../components/primitives/StatusIndicator';
import Badge from '../../components/primitives/Badge';
import Button from '../../components/primitives/Button';
import './Dashboard.css';

const GlobeVisualization = React.lazy(() => import('../../features/globe').then(m => ({ default: m.GlobeVisualization })));

const GLOBE_SEED = 42;

export default function Dashboard({ 
  labs, 
  catalogManifest = null,
  progress, 
  onSelectLab, 
  onNavigate,
  soundEnabled = true,
  onToggleSound = () => {},
  animationsEnabled = true,
  onToggleAnimations = () => {},
  invertColors = false,
  onToggleInvert = () => {},
  highContrast = false,
  onToggleHighContrast = () => {},
  largerText = false,
  onToggleLargerText = () => {},
  reducedTransparency = false,
  onToggleReducedTransparency = () => {},
  reducedGlow = false,
  onToggleReducedGlow = () => {},
  theme = 'cyber-blue',
  onThemeChange = () => {},
  bgSetting = 'particles',
  onBgChange = () => {},
  audioRef = null,
  backendStatus = 'unknown',
  catalogStatus = 'ready',
  onRetryCatalog = () => {}
}) {
  const [globePaused, setGlobePaused] = useState(false);
  const [globePerformance, setGlobePerformance] = useState(false);
  const [socMode, setSocMode] = useState(false);
  const [activeThreats, setActiveThreats] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [attackArcs, setAttackArcs] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [incidentTriage, setIncidentTriage] = useState({});
  const [incidentEvidence, setIncidentEvidence] = useState({});
  const [incidentNotes, setIncidentNotes] = useState({});
  const [incidentTimeline, setIncidentTimeline] = useState({});
  const [incidentFalsePositives, setIncidentFalsePositives] = useState({});
  const [incidentRootCause, setIncidentRootCause] = useState({});
  const [incidentRecovery, setIncidentRecovery] = useState({});
  const [incidentLessonsLearned, setIncidentLessonsLearned] = useState({});

  const SOC_INCIDENTS = [
    {
      id: 'soc-basic-1',
      difficulty: 'basic',
      title: 'Brute Force SSH Alert',
      description: 'Multiple failed SSH login attempts detected from an external IP address targeting the management interface.',
      severity: 'medium',
      assets: ['SSH-01', 'FW-01'],
      source: '203.0.113.45',
      destination: '10.0.0.10',
      eventType: 'brute_force',
      timestamp: Date.now() - 3600000,
      alerts: [
        { id: 'a1', type: 'IDS Alert', message: 'Multiple failed SSH attempts from 203.0.113.45', severity: 'medium', triaged: false },
        { id: 'a2', type: 'Firewall Block', message: 'Inbound connection blocked on port 22', severity: 'low', triaged: false },
      ],
      evidenceFields: [
        { id: 'srcIp', label: 'Source IP', value: '203.0.113.45' },
        { id: 'dstIp', label: 'Destination IP', value: '10.0.0.10' },
        { id: 'protocol', label: 'Protocol', value: 'SSH' },
        { id: 'port', label: 'Port', value: '22' },
        { id: 'attempts', label: 'Attempts', value: '15 in 5 minutes' },
      ],
      containment: [
        'Block source IP at perimeter firewall',
        'Enable account lockout after 3 failed attempts',
        'Enable SSH logging and monitoring',
        'Notify asset owner of suspicious activity'
      ],
      timeline: [
        { time: '10:00', event: 'First failed SSH attempt detected' },
        { time: '10:02', event: 'IDS alert triggered' },
        { time: '10:03', event: 'Firewall blocked inbound connection' },
        { time: '10:05', event: '15 total attempts recorded' },
      ]
    },
    {
      id: 'soc-basic-2',
      difficulty: 'basic',
      title: 'Port Scan Detection',
      description: 'A host on the internal network is scanning multiple ports on a critical server.',
      severity: 'low',
      assets: ['FW-01', 'SRV-01'],
      source: '10.0.1.12',
      destination: '10.0.0.20',
      eventType: 'port_scan',
      timestamp: Date.now() - 7200000,
      alerts: [
        { id: 'a3', type: 'IDS Alert', message: 'Port scan detected from 10.0.1.12 to 10.0.0.20', severity: 'low', triaged: false },
      ],
      evidenceFields: [
        { id: 'srcIp', label: 'Source IP', value: '10.0.1.12' },
        { id: 'dstIp', label: 'Destination IP', value: '10.0.0.20' },
        { id: 'protocol', label: 'Protocol', value: 'TCP' },
        { id: 'ports', label: 'Ports Scanned', value: '22, 80, 443, 3389' },
      ],
      containment: [
        'Block scanning host at access switch',
        'Review host for malware',
        'Check for compromised credentials'
      ],
      timeline: [
        { time: '08:00', event: 'Port scan initiated from internal host' },
        { time: '08:01', event: 'IDS detected scan pattern' },
        { time: '08:02', event: 'Scan completed - 4 ports probed' },
      ]
    },
    {
      id: 'soc-basic-3',
      difficulty: 'basic',
      title: 'Malware Beacon',
      description: 'An endpoint is generating suspicious outbound connections to a known malicious domain.',
      severity: 'high',
      assets: ['PC-03', 'FW-01'],
      source: '10.0.2.30',
      destination: '198.51.100.50',
      eventType: 'malware_beacon',
      timestamp: Date.now() - 1800000,
      alerts: [
        { id: 'a4', type: 'Endpoint Alert', message: 'Suspicious outbound connection to known malicious IP', severity: 'high', triaged: false },
        { id: 'a5', type: 'Firewall Block', message: 'Outbound connection blocked', severity: 'medium', triaged: false },
      ],
      evidenceFields: [
        { id: 'srcIp', label: 'Source IP', value: '10.0.2.30' },
        { id: 'dstIp', label: 'Destination IP', value: '198.51.100.50' },
        { id: 'domain', label: 'Domain', value: 'malware-c2.example.com' },
        { id: 'protocol', label: 'Protocol', value: 'HTTPS' },
      ],
      containment: [
        'Isolate endpoint from network',
        'Capture memory dump for forensics',
        'Block malicious domain at DNS and firewall',
        'Scan for lateral movement'
      ],
      timeline: [
        { time: '09:30', event: 'Endpoint initiated outbound connection' },
        { time: '09:31', event: 'Firewall blocked connection' },
        { time: '09:32', event: 'Endpoint alert generated' },
      ]
    },
    {
      id: 'soc-medium-1',
      difficulty: 'medium',
      title: 'Suspicious DNS Tunneling',
      description: 'Unusual DNS query patterns suggest potential DNS tunneling activity from a compromised host.',
      severity: 'high',
      assets: ['PC-05', 'DNS-01', 'FW-01'],
      source: '10.0.2.40',
      destination: '8.8.8.8',
      eventType: 'dns_tunneling',
      timestamp: Date.now() - 5400000,
      alerts: [
        { id: 'a6', type: 'IDS Alert', message: 'DNS tunneling pattern detected', severity: 'high', triaged: false },
        { id: 'a7', type: 'DNS Query', message: 'Unusually long TXT records from 10.0.2.40', severity: 'medium', triaged: false },
        { id: 'a8', type: 'Firewall Block', message: 'Outbound DNS rate limited', severity: 'low', triaged: false },
      ],
      evidenceFields: [
        { id: 'srcIp', label: 'Source IP', value: '10.0.2.40' },
        { id: 'dstIp', label: 'DNS Server', value: '8.8.8.8' },
        { id: 'queryType', label: 'Query Type', value: 'TXT' },
        { id: 'queryVolume', label: 'Query Volume', value: '500+ in 10 minutes' },
        { id: 'domain', label: 'Encoded Domain', value: 'base64-data.exfil.example.com' },
      ],
      containment: [
        'Block DNS queries to external resolvers from affected host',
        'Isolate host for forensic analysis',
        'Review DNS logs for data exfiltration',
        'Implement DNS monitoring and alerting'
      ],
      timeline: [
        { time: '06:00', event: 'Normal DNS activity' },
        { time: '06:15', event: 'Unusual DNS query volume detected' },
        { time: '06:20', event: 'Long TXT records observed' },
        { time: '06:25', event: 'DNS tunneling pattern confirmed' },
      ]
    },
    {
      id: 'soc-medium-2',
      difficulty: 'medium',
      title: 'Failed Login Sequence Investigation',
      description: 'A failed login sequence across multiple systems suggests a coordinated brute-force or credential stuffing attack.',
      severity: 'high',
      assets: ['SSH-01', 'SSH-02', 'FW-01'],
      source: '198.51.100.20',
      destination: 'Multiple internal systems',
      eventType: 'failed_login_sequence',
      timestamp: Date.now() - 9000000,
      alerts: [
        { id: 'a9', type: 'IDS Alert', message: 'Failed login sequence detected across multiple systems', severity: 'high', triaged: false },
        { id: 'a10', type: 'Auth Alert', message: 'Account lockout triggered on SSH-01', severity: 'medium', triaged: false },
      ],
      evidenceFields: [
        { id: 'srcIp', label: 'Source IP', value: '198.51.100.20' },
        { id: 'targets', label: 'Target Systems', value: 'SSH-01, SSH-02, WEB-01' },
        { id: 'totalAttempts', label: 'Total Attempts', value: '200+ in 30 minutes' },
        { id: 'accounts', label: 'Targeted Accounts', value: 'admin, root, administrator' },
      ],
      containment: [
        'Block source IP at perimeter',
        'Review and strengthen password policies',
        'Enable MFA on all administrative accounts',
        'Audit all accessed accounts for compromise'
      ],
      timeline: [
        { time: '03:00', event: 'First failed login on SSH-01' },
        { time: '03:05', event: 'Failed logins spread to SSH-02' },
        { time: '03:15', event: 'Account lockout triggered' },
        { time: '03:30', event: '200+ attempts recorded' },
      ]
    },
    {
      id: 'soc-medium-3',
      difficulty: 'medium',
      title: 'Endpoint Anomaly Correlation',
      description: 'Multiple endpoint alerts need correlation to identify a potential multi-vector attack.',
      severity: 'critical',
      assets: ['PC-01', 'PC-02', 'PC-03', 'FW-01', 'IDS-01'],
      source: 'Multiple',
      destination: 'Multiple',
      eventType: 'endpoint_anomaly',
      timestamp: Date.now() - 10800000,
      alerts: [
        { id: 'a11', type: 'Endpoint Alert', message: 'Unusual process execution on PC-01', severity: 'medium', triaged: false },
        { id: 'a12', type: 'Network Alert', message: 'Unusual outbound traffic from PC-02', severity: 'high', triaged: false },
        { id: 'a13', type: 'IDS Alert', message: 'Exploit attempt detected on PC-03', severity: 'critical', triaged: false },
      ],
      evidenceFields: [
        { id: 'affectedHosts', label: 'Affected Hosts', value: 'PC-01, PC-02, PC-03' },
        { id: 'attackVector', label: 'Attack Vector', value: 'Phishing + Lateral Movement' },
        { id: 'iocs', label: 'IOCs', value: 'IP: 198.51.100.50, Hash: abc123...' },
      ],
      containment: [
        'Isolate all affected endpoints',
        'Preserve forensic images',
        'Block identified IOCs at firewall and DNS',
        'Initiate incident response workflow'
      ],
      timeline: [
        { time: '01:00', event: 'Phishing email delivered to PC-01' },
        { time: '01:15', event: 'Malware executed on PC-01' },
        { time: '01:30', event: 'Lateral movement to PC-02' },
        { time: '02:00', event: 'Exploit attempt on PC-03' },
      ]
    },
    {
      id: 'soc-advanced-1',
      difficulty: 'advanced',
      title: 'Multi-Stage Incident: APT Campaign',
      description: 'A sophisticated multi-stage attack campaign spanning reconnaissance, exploitation, persistence, and data exfiltration.',
      severity: 'critical',
      assets: ['FW-01', 'SRV-01', 'SRV-02', 'PC-01', 'DNS-01'],
      source: 'External APT Group',
      destination: 'Critical internal infrastructure',
      eventType: 'apt_campaign',
      timestamp: Date.now() - 86400000,
      alerts: [
        { id: 'a14', type: 'Reconnaissance', message: 'External scanning detected', severity: 'medium', triaged: false },
        { id: 'a15', type: 'Exploit', message: 'Zero-day exploit attempt', severity: 'critical', triaged: false },
        { id: 'a16', type: 'Persistence', message: 'Scheduled task created on SRV-01', severity: 'high', triaged: false },
        { id: 'a17', type: 'Exfiltration', message: 'Large data transfer to external IP', severity: 'critical', triaged: false },
      ],
      evidenceFields: [
        { id: 'attackChain', label: 'Attack Chain', value: 'Recon → Exploit → Persist → Exfiltrate' },
        { id: 'aptGroup', label: 'APT Group', value: 'APT-29 (suspected)' },
        { id: 'iocs', label: 'IOCs', value: 'C2: 198.51.100.50, Hash: def456...' },
        { id: 'affectedSystems', label: 'Affected Systems', value: 'SRV-01, SRV-02, PC-01' },
      ],
      containment: [
        'Immediate isolation of all affected systems',
        'Block all identified IOCs at perimeter and DNS',
        'Revoke all active sessions and credentials',
        'Initiate full forensic investigation',
        'Engage incident response team',
        'Prepare breach notification if required'
      ],
      timeline: [
        { time: 'Day 1, 02:00', event: 'Reconnaissance phase - external scanning' },
        { time: 'Day 1, 14:00', event: 'Exploit delivery via spear phishing' },
        { time: 'Day 2, 03:00', event: 'Persistence established on SRV-01' },
        { time: 'Day 2, 10:00', event: 'Lateral movement to SRV-02' },
        { time: 'Day 3, 08:00', event: 'Data exfiltration detected' },
      ]
    },
    {
      id: 'soc-advanced-2',
      difficulty: 'advanced',
      title: 'Detection Rule Design: Insider Threat',
      description: 'Design and implement detection rules for a sophisticated insider threat scenario involving data exfiltration.',
      severity: 'high',
      assets: ['SRV-01', 'DB-01', 'FW-01', 'DLP-01'],
      source: 'Internal user (compromised account)',
      destination: 'External storage',
      eventType: 'insider_threat',
      timestamp: Date.now() - 172800000,
      alerts: [
        { id: 'a18', type: 'DLP Alert', message: 'Unusual data transfer to external storage', severity: 'high', triaged: false },
        { id: 'a19', type: 'Auth Alert', message: 'After-hours access to sensitive data', severity: 'medium', triaged: false },
        { id: 'a20', type: 'Network Alert', message: 'Large outbound transfer outside business hours', severity: 'high', triaged: false },
      ],
      evidenceFields: [
        { id: 'user', label: 'User Account', value: 'j.smith (compromised)' },
        { id: 'dataVolume', label: 'Data Volume', value: '2.5 GB exfiltrated' },
        { id: 'destination', label: 'Destination', value: 'External cloud storage' },
        { id: 'timeWindow', label: 'Time Window', value: '02:00 - 04:00 AM' },
      ],
      containment: [
        'Disable compromised user account',
        'Revoke all active sessions',
        'Preserve access logs and DLP events',
        'Review data access patterns for 90 days',
        'Implement stricter DLP policies'
      ],
      timeline: [
        { time: '02:00', event: 'After-hours login detected' },
        { time: '02:15', event: 'Large database queries executed' },
        { time: '03:30', event: 'Data transfer to external storage initiated' },
        { time: '04:00', event: 'Session ended - 2.5 GB transferred' },
      ]
    },
    {
      id: 'soc-advanced-3',
      difficulty: 'advanced',
      title: 'Investigation Report: Ransomware Incident',
      description: 'Complete a full investigation report for a ransomware incident including root cause, containment, recovery, and lessons learned.',
      severity: 'critical',
      assets: ['PC-01', 'SRV-01', 'FW-01', 'BACKUP-01'],
      source: 'External (phishing)',
      destination: 'Internal file servers',
      eventType: 'ransomware',
      timestamp: Date.now() - 259200000,
      alerts: [
        { id: 'a21', type: 'Endpoint Alert', message: 'Ransomware behavior detected on PC-01', severity: 'critical', triaged: false },
        { id: 'a22', type: 'Network Alert', message: 'SMB enumeration and lateral movement', severity: 'high', triaged: false },
        { id: 'a23', type: 'IDS Alert', message: 'Exploit kit activity detected', severity: 'critical', triaged: false },
      ],
      evidenceFields: [
        { id: 'initialAccess', label: 'Initial Access', value: 'Phishing email with malicious attachment' },
        { id: 'ransomwareFamily', label: 'Ransomware Family', value: 'LockBit 3.0' },
        { id: 'affectedSystems', label: 'Affected Systems', value: 'PC-01, SRV-01, BACKUP-01' },
        { id: 'dataEncrypted', label: 'Data Encrypted', value: '500 GB' },
      ],
      containment: [
        'Immediate network isolation of affected systems',
        'Identify and preserve patient zero',
        'Block C2 communications at firewall',
        'Initiate backup restoration from clean backup',
        'Conduct full forensic analysis'
      ],
      timeline: [
        { time: 'Day 1, 09:00', event: 'Phishing email opened on PC-01' },
        { time: 'Day 1, 09:05', event: 'Malware executed and began encryption' },
        { time: 'Day 1, 09:30', event: 'SMB enumeration and lateral movement' },
        { time: 'Day 1, 10:00', event: 'Backup server compromised' },
        { time: 'Day 1, 11:00', event: 'Ransom note displayed on affected systems' },
      ]
    }
  ];

  const selectedIncident = SOC_INCIDENTS.find(inc => inc.id === selectedIncidentId) || null;

  const updateIncidentTriage = (incidentId, alertId, triaged) => {
    setIncidentTriage(prev => ({
      ...prev,
      [incidentId]: {
        ...prev[incidentId],
        [alertId]: triaged
      }
    }));
  };

  const updateIncidentEvidence = (incidentId, fieldId, value) => {
    setIncidentEvidence(prev => ({
      ...prev,
      [incidentId]: {
        ...prev[incidentId],
        [fieldId]: value
      }
    }));
  };

  const updateIncidentNotes = (incidentId, field, value) => {
    setIncidentNotes(prev => ({
      ...prev,
      [incidentId]: {
        ...prev[incidentId],
        [field]: value
      }
    }));
  };

  const addTimelineEvent = (incidentId, event) => {
    setIncidentTimeline(prev => ({
      ...prev,
      [incidentId]: [...(prev[incidentId] || []), { time: new Date().toLocaleTimeString(), event }]
    }));
  };

  const updateFalsePositive = (incidentId, alertId, isFalsePositive) => {
    setIncidentFalsePositives(prev => ({
      ...prev,
      [incidentId]: {
        ...prev[incidentId],
        [alertId]: isFalsePositive
      }
    }));
    if (isFalsePositive) {
      setIncidentTriage(prev => ({
        ...prev,
        [incidentId]: {
          ...prev[incidentId],
          [alertId]: true
        }
      }));
    }
  };

  const updateIncidentField = (stateSetter, incidentId, value) => {
    stateSetter(prev => ({
      ...prev,
      [incidentId]: value
    }));
  };

  const getIncidentProgress = (incident) => {
    if (!incident) return 0;
    const triageCount = incident.alerts.filter(a => incidentTriage[incident.id]?.[a.id]).length;
    const falsePositiveCount = incident.alerts.filter(a => incidentFalsePositives[incident.id]?.[a.id]).length;
    const evidenceCount = incident.evidenceFields.filter(e => incidentEvidence[incident.id]?.[e.id]?.trim()).length;
    const notes = incidentNotes[incident.id] || {};
    const hasNotes = Object.values(notes).some(v => String(v).trim().length > 0);
    const hasRootCause = incidentRootCause[incident.id]?.trim()?.length > 0;
    const hasRecovery = incidentRecovery[incident.id]?.trim()?.length > 0;
    const hasLessonsLearned = incidentLessonsLearned[incident.id]?.trim()?.length > 0;
    const total = incident.alerts.length + incident.evidenceFields.length + 4;
    const completed = triageCount + evidenceCount + (hasNotes ? 1 : 0) + (hasRootCause ? 1 : 0) + (hasRecovery ? 1 : 0) + (hasLessonsLearned ? 1 : 0);
    return Math.round((completed / total) * 100);
  };

  useEffect(() => {
    if (!socMode) {
      setSelectedIncidentId(null);
      return;
    }
  }, [socMode]);

  // Keyboard navigation handler for quick action buttons
  const handleQuickActionKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const [globeNodes, globeArcs] = useMemo(() => {
    const nodes = generateNodes(GLOBE_SEED);
    const arcs = generateArcs(nodes, GLOBE_SEED);
    return [nodes, arcs];
  }, []);

  const nodeCount = globeNodes.length;
  const linkCount = globeArcs.length;
  const activeLinks = globeArcs.filter(a => a.intensity > 0.5).length;
  const nodeStatuses = globeNodes.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, {});
  const onlineCount = nodeStatuses.online || 0;
  const warningCount = nodeStatuses.warning || 0;
  const criticalCount = nodeStatuses.critical || 0;
  const offlineCount = nodeStatuses.offline || 0;

  const stats = useMemo(() => {
    const total = labs.length;
    const beginner = labs.filter(l => l.level === 'basic').length;
    const intermediate = labs.filter(l => l.level === 'intermediate').length;
    const advanced = labs.filter(l => l.level === 'advanced').length;
    const completedSteps = progress.completedSteps || [];
    const labsCompleted = labs.filter(lab => 
      lab.steps && lab.steps.length > 0 && 
      lab.steps.every(s => completedSteps.includes(s.stepId))
    ).length;
    const inProgressLabs = labs.filter(lab => 
      lab.steps && lab.steps.length > 0 && 
      lab.steps.some(s => completedSteps.includes(s.stepId)) && 
      !lab.steps.every(s => completedSteps.includes(s.stepId))
    );
    const xp = completedSteps.length * 10;
    const level = Math.floor(xp / 500) + 1;
    const levelProgress = xp % 500;
    const recentLabs = inProgressLabs.slice(-5).map(lab => ({
      ...lab,
      progress: Math.round((lab.steps.filter(s => completedSteps.includes(s.stepId)).length / lab.steps.length) * 100)
    }));
    return {
      total,
      beginner,
      intermediate,
      advanced,
      completedSteps: completedSteps.length,
      labsCompleted,
      inProgressLabs: inProgressLabs.length,
      xp,
      level,
      levelProgress,
      recentLabs
    };
  }, [labs, progress]);

  const levelNames = ['Network Newcomer', 'IP Explorer', 'Switching Technician', 'Routing Apprentice', 'Cisco Configurator', 'Troubleshooting Engineer', 'Network Security Engineer', 'Junior Network Engineer', 'Senior Engineer', 'Master Engineer'];
  const currentLevelName = levelNames[Math.min(stats.level - 1, levelNames.length - 1)];

  const recommendedNext = useMemo(() => {
    const completedSteps = progress.completedSteps || [];
    const inProgress = labs.find(lab => 
      lab.steps && lab.steps.length > 0 && 
      lab.steps.some(s => completedSteps.includes(s.stepId)) && 
      !lab.steps.every(s => completedSteps.includes(s.stepId))
    );
    if (inProgress) return inProgress;
    const notStarted = labs.find(lab => 
      lab.level === 'basic' && (!lab.steps || lab.steps.length === 0 || 
        !lab.steps.some(s => completedSteps.includes(s.stepId)))
    );
    if (notStarted) return notStarted;
    return labs.find(l => l.level === 'basic');
  }, [labs, progress]);

  const rootClassName = `dashboard-root${socMode ? ' soc-active' : ''} ${highContrast ? 'high-contrast' : ''} ${largerText ? 'larger-text' : ''} ${reducedTransparency ? 'reduced-transparency' : ''} ${reducedGlow ? 'reduced-glow' : ''}`;

  return (
    <div className={rootClassName} role="main" aria-label={socMode ? 'SOC Dashboard' : 'NOC Dashboard'}>
      <a href="#content" className="skip-nav-link" aria-label="Skip to main content" style={{ 
        position: 'fixed', 
        top: -100, 
        left: -100, 
        width: 1, 
        height: 1, 
        overflow: 'hidden', 
        clip: 'rect(0 0 0 0)', 
        zIndex: 9999 
      }}></a>
      <div className="noc-bg" />
      <div className="scanlines" style={{ opacity: animationsEnabled ? 0.4 : 0.15 }} />
      
      <div className="dashboard-shell">
        <header className="dashboard-header" role="banner">
          <div className="dashboard-header-left" role="navigation" aria-label="NOC Header Navigation">
            <div className="dashboard-logo" role="img" aria-label="CyberNet NOC Logo">◄ CYBERNET NOC ►</div>
            <div className="dashboard-divider" role="presentation" />
            <div className="dashboard-station">NETWORK OPERATIONS CENTER</div>
          </div>
          <div className="dashboard-header-right" role="navigation" aria-label="System Status">
            <div className="dashboard-led">
              <StatusIndicator status="success" size={8} />
              <span>LOCAL UI READY</span>
            </div>
            <span className="dashboard-station">Uptime: {formatUptime(127)}</span>
            <button
              onClick={() => setSocMode(!socMode)}
              style={{
                marginLeft: 12,
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid ' + (socMode ? 'var(--error)' : 'var(--panel-border-subtle)'),
                background: socMode ? 'rgba(255,51,85,0.15)' : 'transparent',
                color: socMode ? 'var(--error)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 700,
              }}
              aria-pressed={socMode}
              aria-label="Toggle SOC defensive operations mode"
            >
              {socMode ? 'SOC MODE ON' : 'SOC MODE'}
            </button>
          </div>
        </header>

        <main className="dashboard-grid" role="region" aria-labelledby="dashboard-title">
        <h2 id="dashboard-title" className="sr-only">NOC Dashboard</h2>
        <aside className="dashboard-nav" role="navigation" aria-label="Main Navigation">
          <Panel title="NAVIGATION">
            <div className="nav-section">
              <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('lab')} aria-label="Virtual Lab Section">
                Virtual Lab
              </Button>
              <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('roadmap')} aria-label="Learning Path Section">
                Learning Path
              </Button>
              <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('engineer')} aria-label="Engineer Mode Section">
                Engineer Mode
              </Button>
              <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('commands')} aria-label="Command Library Section">
                Command Library
              </Button>
              <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('progress')} aria-label="Progress Section">
                Progress
              </Button>
              <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('tickets')} aria-label="Ticket Manager Section" style={socMode ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}}>
                {socMode ? 'SOC TICKETS' : 'TICKETS'}
              </Button>
              {socMode && (
                <Button variant="ghost" className="nav-btn" onClick={() => setSelectedIncidentId(null)} aria-label="SOC Incidents" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                  SOC INCIDENTS
                </Button>
              )}
            </div>
          </Panel>

            <Panel title="SETTINGS">
              <div className="settings-section">
                <Button variant="ghost" className="nav-btn" onClick={() => onNavigate('settings')} aria-label="Backgrounds settings">
                  Backgrounds
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleSound} aria-label="Toggle ambient sound" aria-pressed={soundEnabled}>
                  {soundEnabled ? 'Ambient ON' : 'Ambient OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleAnimations} aria-label="Toggle animations" aria-pressed={animationsEnabled}>
                  Animations {animationsEnabled ? 'ON' : 'OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleInvert} aria-label="Toggle color inversion" aria-pressed={invertColors}>
                  Invert {invertColors ? 'ON' : 'OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleHighContrast} aria-label="Toggle high contrast mode" aria-pressed={highContrast}>
                  Contrast {highContrast ? 'ON' : 'OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleLargerText} aria-label="Toggle larger text" aria-pressed={largerText}>
                  Large Text {largerText ? 'ON' : 'OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleReducedTransparency} aria-label="Toggle reduced transparency" aria-pressed={reducedTransparency}>
                  No Transparency {reducedTransparency ? 'ON' : 'OFF'}
                </Button>
                <Button variant="ghost" className="nav-btn" onClick={onToggleReducedGlow} aria-label="Toggle reduced glow" aria-pressed={reducedGlow}>
                  No Glow {reducedGlow ? 'ON' : 'OFF'}
                </Button>
                <label htmlFor="theme-select" className="sr-only">Select color theme</label>
                <select
                  id="theme-select"
                  value={theme}
                  onChange={(e) => onThemeChange(e.target.value)}
                  className="dashboard-select"
                  aria-label="Select color theme"
                >
                  <option value="cyber-blue">Cyber Blue</option>
                  <option value="emerald">Emerald Matrix</option>
                  <option value="crimson">Crimson Command</option>
                  <option value="purple">Purple Galaxy</option>
                  <option value="deep-space">Deep Space</option>
                  <option value="neon-cyan">Neon Cyan</option>
                  <option value="stealth">Stealth Black</option>
                </select>
              </div>
            </Panel>
          </aside>

          <section className="dashboard-viewport" id="content" role="region" aria-label="Dashboard Main Viewport">
            <Panel title="CURRENT MISSION" className="viewport-panel">
              <div className="mission-content">
                {recommendedNext ? (
                  <>
                    <div className="mission-header">
                      <span className="mission-id" aria-label={`Lab ID ${String(recommendedNext.id).padStart(3, '0')}`}>#{String(recommendedNext.id).padStart(3, '0')}</span>
                      <span className="mission-level">{recommendedNext.level.toUpperCase()}</span>
                      <span className="mission-category">{recommendedNext.category}</span>
                    </div>
                    <h3 className="mission-title">{recommendedNext.title}</h3>
                    <div className="mission-progress">
                      <div className="mission-progress-label">
                        <span>STEP {stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}%</span>
                        <span>{stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}% COMPLETE</span>
                      </div>
                      <div className="progress-container">
                        <div className="progress-fill" style={{ width: `${stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}%` }} aria-label={`Progress: ${stats.recentLabs.find(l => l.id === recommendedNext.id)?.progress || 0}%`}>
                        </div>
                      </div>
                    </div>
                    <Button variant="primary" className="mission-action" onClick={() => onSelectLab(recommendedNext.id)} aria-label={`Continue lab: ${recommendedNext.title}`}>
                      ▶ CONTINUE LAB
                    </Button>
                  </>
                ) : (
                  <div className="mission-empty">
                    <div className="mission-empty-icon">◎</div>
                    <h3>No Active Lab</h3>
                    <p>Select a lab from the explorer to begin your training mission.</p>
                    <Button variant="primary" onClick={() => onNavigate('lab')} aria-label="Browse available labs">
                      BROWSE LABS
                    </Button>
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="SYSTEM STATUS" className="viewport-panel">
              <div className="system-status-grid" role="list" aria-label="System status indicators">
                <div className="status-item" role="listitem">
                  <div className="status-label">LAB</div>
                  <div className="status-value">{recommendedNext ? 'SELECTED' : 'NO LAB'}</div>
                </div>
                <div className="status-item" role="listitem">
                  <div className="status-label">SIMULATION</div>
                  <div className="status-value">{recommendedNext ? 'AVAILABLE' : 'IDLE'}</div>
                </div>
                <div className="status-item" role="listitem">
                  <div className="status-label">VERIFICATION</div>
                  <div className="status-value">{recommendedNext ? 'LAB-DEPENDENT' : 'WAITING'}</div>
                </div>
                <div className="status-item" role="listitem">
                  <div className="status-label">DEVICES</div>
                  <div className="status-value">{recommendedNext ? 'DEFINED IN LAB' : '0'}</div>
                </div>
                <div className="status-item" role="listitem">
                  <div className="status-label">BACKEND</div>
                  <div className="status-value">{backendStatus === 'connected' ? 'CONNECTED' : backendStatus === 'checking' ? 'CHECKING' : 'LOCAL ONLY'}</div>
                </div>
                <div className="status-item" role="listitem">
                  <div className="status-label">CATALOG</div>
                  <div className="status-value">{catalogStatus === 'ready' ? 'LOCAL READY' : 'RETRY REQUIRED'}</div>
                </div>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.5, marginTop: 12 }}>
                Browser simulation, verification, progress, and evidence work locally. Backend sessions and WebSocket features require a connected backend.
                {catalogStatus === 'error' && <Button variant="ghost" size="sm" onClick={onRetryCatalog} aria-label="Retry catalog loading">Retry catalog</Button>}
              </div>
            </Panel>

            <Panel title="LEARNING JOURNEY" className="viewport-panel">
              <div className="journey-stages" role="list" aria-label="Learning journey stages">
                {['Foundation', 'Networking', 'Switching', 'Routing', 'Services', 'WAN', 'Troubleshooting', 'Automation', 'Security', 'Advanced'].map((stage, idx) => {
                  const current = idx === Math.min(stats.level - 1, 9);
                  const completed = stats.completedSteps > 0 && idx < Math.min(stats.level - 1, 9);
                  return (
                    <div key={stage} className={`journey-stage ${current ? 'current' : ''} ${completed ? 'completed' : ''}`} role="listitem" aria-current={current ? 'step' : undefined}>
                      <div className="stage-number">{String(idx + 1).padStart(2, '0')}</div>
                      <div className="stage-name">{stage.toUpperCase()}</div>
                    </div>
                  );
                })}
              </div>
              <div className="journey-progress">
                <div className="journey-level">LEVEL {stats.level} — {currentLevelName}</div>
                <div className="progress-container">
                  <div className="progress-fill" style={{ width: `${stats.levelProgress / 5}%` }} aria-label={`Level progress: ${Math.round(stats.levelProgress / 5)}%`} />
                </div>
              </div>
            </Panel>

            <Panel title="RECENT ACTIVITY" className="viewport-panel">
              <div className="recent-activity" role="list" aria-label="Recent lab activity">
                {(stats.recentLabs || []).slice(0, 5).map((lab, i) => (
                  <div key={i} className="activity-item" role="listitem">
                    <div className="activity-info">
                      <div className="activity-title">{lab.title}</div>
                      <div className="activity-meta">{lab.progress}% complete</div>
                    </div>
                    <div className="activity-status">
                      <Badge status={lab.progress === 100 ? 'success' : 'info'} aria-label={lab.progress === 100 ? 'Complete' : 'In progress'}>
                        {lab.progress === 100 ? 'COMPLETE' : 'IN PROGRESS'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!stats.recentLabs || stats.recentLabs.length === 0) && (
                  <div className="activity-empty">No recent activity. Start a lab to begin.</div>
                )}
              </div>
            </Panel>

            <Panel title="QUICK ACTIONS" className="viewport-panel">
              <div className="quick-actions">
                <Button variant="primary" onClick={() => onNavigate('lab')}>NEW LAB</Button>
                <Button variant="ghost" onClick={() => recommendedNext ? onSelectLab(recommendedNext.id) : onNavigate('lab')}>
                  {recommendedNext ? 'CONTINUE' : 'START'}
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('roadmap')}>LEARNING PATH</Button>
                <Button variant="ghost" onClick={() => onNavigate('engineer')}>ENGINEER MODE</Button>
                {socMode && (
                  <Button variant="ghost" onClick={() => onNavigate('tickets')} style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>SOC TICKETS</Button>
                )}
              </div>
            </Panel>

            {socMode && (
              <>
                {!selectedIncident && (
                  <Panel title="SOC INCIDENTS" className="viewport-panel">
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {['basic', 'medium', 'advanced'].map(level => (
                        <button key={level} onClick={() => {}} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.3)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.8em', textTransform: 'uppercase' }}>{level}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                      {SOC_INCIDENTS.map(inc => (
                        <div key={inc.id} onClick={() => setSelectedIncidentId(inc.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedIncidentId(inc.id); } }} role="button" tabIndex={0} aria-label={`Incident ${inc.id}: ${inc.title}`} style={{ background: 'var(--panel)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, padding: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ color: inc.severity === 'critical' ? 'var(--error)' : inc.severity === 'high' ? 'var(--warning)' : 'var(--text)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>{inc.severity}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{inc.difficulty}</span>
                          </div>
                          <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>{inc.title}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>{inc.description.substring(0, 100)}...</div>
                          <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${getIncidentProgress(inc)}%`, background: getIncidentProgress(inc) === 100 ? 'var(--success)' : 'var(--cyan)', borderRadius: 3, transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 4 }}>{getIncidentProgress(inc)}% complete</div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}

                {selectedIncident && (
                  <>
                    <Panel title={`INCIDENT: ${selectedIncident.title.toUpperCase()}`} className="viewport-panel">
                      <div style={{ marginBottom: 12 }}>
                        <button onClick={() => setSelectedIncidentId(null)} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(0,240,255,0.4)', background: 'transparent', color: 'var(--cyan)', cursor: 'pointer', fontSize: '0.8em', marginBottom: 8 }}>← Back to Incidents</button>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{selectedIncident.description}</div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Source: <span style={{ color: 'var(--text)' }}>{selectedIncident.source}</span></span>
                          <span style={{ color: 'var(--text-muted)' }}>Destination: <span style={{ color: 'var(--text)' }}>{selectedIncident.destination}</span></span>
                          <span style={{ color: 'var(--text-muted)' }}>Event: <span style={{ color: 'var(--text)', textTransform: 'uppercase' }}>{selectedIncident.eventType.replace('_', ' ')}</span></span>
                          <span style={{ color: 'var(--text-muted)' }}>Assets: <span style={{ color: 'var(--text)' }}>{selectedIncident.assets.join(', ')}</span></span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Alert Triage</div>
                        {selectedIncident.alerts.map(alert => {
                          const triaged = incidentTriage[selectedIncident.id]?.[alert.id];
                          const isFalsePositive = incidentFalsePositives[selectedIncident.id]?.[alert.id];
                          return (
                            <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, border: '1px solid rgba(0,240,255,0.15)', marginBottom: 6 }}>
                              <div>
                                <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem' }}>{alert.type}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{alert.message}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ color: triaged ? 'var(--success)' : 'var(--warning)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{isFalsePositive ? 'FALSE POSITIVE' : triaged ? 'TRIAGED' : 'PENDING'}</span>
                                {!isFalsePositive ? (
                                  <button onClick={() => updateIncidentTriage(selectedIncident.id, alert.id, !triaged)} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid ' + (triaged ? 'var(--success)' : 'var(--warning)'), background: 'transparent', color: triaged ? 'var(--success)' : 'var(--warning)', cursor: 'pointer', fontSize: '0.75em' }}>{triaged ? 'Undo' : 'Triage'}</button>
                                ) : (
                                  <button onClick={() => updateFalsePositive(selectedIncident.id, alert.id, false)} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--text-muted)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75em' }}>Undo FP</button>
                                )}
                                <button onClick={() => updateFalsePositive(selectedIncident.id, alert.id, !isFalsePositive)} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--text-muted)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75em' }}>{isFalsePositive ? 'Undo FP' : 'False Positive'}</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Evidence Collection</div>
                        {selectedIncident.evidenceFields.map(field => {
                          const value = incidentEvidence[selectedIncident.id]?.[field.id] || field.value;
                          const filled = incidentEvidence[selectedIncident.id]?.[field.id]?.trim();
                          return (
                            <div key={field.id} style={{ marginBottom: 8 }}>
                              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>{field.label}</label>
                              <input
                                value={value}
                                onChange={(e) => updateIncidentEvidence(selectedIncident.id, field.id, e.target.value)}
                                style={{ width: '100%', padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, fontSize: '0.85rem', boxSizing: 'border-box' }}
                              />
                              {filled && <div style={{ color: 'var(--success)', fontSize: '0.7rem', marginTop: 2 }}>Recorded</div>}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Investigation Notes</div>
                        {['observations', 'hypotheses', 'nextSteps'].map(field => (
                          <div key={field} style={{ marginBottom: 8 }}>
                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 }}>{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                            <textarea
                              value={incidentNotes[selectedIncident.id]?.[field] || ''}
                              onChange={(e) => updateIncidentNotes(selectedIncident.id, field, e.target.value)}
                              rows={2}
                              style={{ width: '100%', padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                          </div>
                        ))}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Containment Recommendations</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {selectedIncident.containment.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, border: '1px solid rgba(0,240,255,0.1)' }}>
                              <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '0.8rem', minWidth: 24 }}>{String(idx + 1).padStart(2, '0')}</span>
                              <span style={{ color: 'var(--text)', fontSize: '0.85rem' }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Root Cause Analysis</div>
                        <textarea
                          value={incidentRootCause[selectedIncident.id] || ''}
                          onChange={(e) => updateIncidentField(setIncidentRootCause, selectedIncident.id, e.target.value)}
                          placeholder="Identify the root cause of this incident..."
                          rows={3}
                          style={{ width: '100%', padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Recovery Steps</div>
                        <textarea
                          value={incidentRecovery[selectedIncident.id] || ''}
                          onChange={(e) => updateIncidentField(setIncidentRecovery, selectedIncident.id, e.target.value)}
                          placeholder="Document the recovery steps to restore normal operations..."
                          rows={3}
                          style={{ width: '100%', padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Post-Incident Review / Lessons Learned</div>
                        <textarea
                          value={incidentLessonsLearned[selectedIncident.id] || ''}
                          onChange={(e) => updateIncidentField(setIncidentLessonsLearned, selectedIncident.id, e.target.value)}
                          placeholder="Document lessons learned, improvements, and preventive measures..."
                          rows={4}
                          style={{ width: '100%', padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12 }}>
                        <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontSize: '0.85rem' }}>Investigation Timeline</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {(incidentTimeline[selectedIncident.id] || selectedIncident.timeline).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', minWidth: 60, fontFamily: 'monospace' }}>{item.time}</span>
                              <span style={{ color: 'var(--text)', fontSize: '0.85rem' }}>{item.event}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <input
                            id={`timeline-${selectedIncident.id}`}
                            placeholder="Add timeline event..."
                            style={{ flex: 1, padding: 8, background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 4, fontSize: '0.85rem' }}
                          />
                          <button onClick={() => {
                            const input = document.getElementById(`timeline-${selectedIncident.id}`);
                            if (input?.value.trim()) {
                              addTimelineEvent(selectedIncident.id, input.value.trim());
                              input.value = '';
                            }
                          }} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid var(--cyan)', background: 'rgba(0,240,255,0.12)', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 700 }}>Add</button>
                        </div>
                      </div>
                    </Panel>
                  </>
                )}
              </>
            )}
          </section>

          <aside className="dashboard-inspector">
            <Panel title="EDUCATIONAL TOPOLOGY PREVIEW — NOT LIVE TELEMETRY" className="viewport-panel">
              <div className="globe-header">
                <div className="globe-stats-row">
                  <Metric label="SAMPLE NODES" value={nodeCount} status="info" />
                  <Metric label="SAMPLE LINKS" value={linkCount} status="info" />
                  <Metric label="SAMPLE ACTIVE" value={activeLinks} status="success" />
                  <div className="globe-status-indicators">
                    <span className="status-badge">
                      <StatusIndicator status="success" size={6} />
                      <span>{onlineCount}</span>
                    </span>
                    <span className="status-badge">
                      <StatusIndicator status="warning" size={6} />
                      <span>{warningCount}</span>
                    </span>
                    <span className="status-badge">
                      <StatusIndicator status="error" size={6} />
                      <span>{criticalCount}</span>
                    </span>
                    <span className="status-badge">
                      <StatusIndicator status="primary" size={6} style={{ background: 'var(--muted)', boxShadow: 'none' }} />
                      <span>{offlineCount}</span>
                    </span>
                  </div>
                </div>
                <SectionHeader title="LEGEND" style={{ marginTop: 12 }} />
                <div className="globe-legend">
                  <div className="legend-row">
                    <div className="legend-item">
                      <span className="legend-dot core"></span>
                      <span>Core</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot gateway"></span>
                      <span>Gateway</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot datacenter"></span>
                      <span>Datacenter</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot edge"></span>
                      <span>Edge</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot endpoint"></span>
                      <span>Endpoint</span>
                    </div>
                  </div>
                  <div className="legend-row">
                    <div className="legend-item">
                      <StatusIndicator status="success" size={8} />
                      <span>Online</span>
                    </div>
                    <div className="legend-item">
                      <StatusIndicator status="warning" size={8} />
                      <span>Warning</span>
                    </div>
                    <div className="legend-item">
                      <StatusIndicator status="error" size={8} />
                      <span>Critical</span>
                    </div>
                    <div className="legend-item">
                      <StatusIndicator status="primary" size={8} style={{ background: 'var(--muted)', boxShadow: 'none' }} />
                      <span>Offline</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="globe-container">
                <Suspense fallback={<div className="globe-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>Loading globe...</div>}>
                  <GlobeVisualization 
                    width="100%" 
                    height="100%"
                    nodes={globeNodes}
                    arcs={globeArcs}
                    paused={globePaused}
                    performanceMode={globePerformance}
                    attackArcs={socMode ? attackArcs : []}
                    compromisedNodeIds={socMode ? activeThreats.filter(t => t.severity === 'critical' || t.severity === 'high').map(t => t.source) : []}
                  />
                </Suspense>
                
                <div className="globe-controls">
<Button 
  variant={globePaused ? 'primary' : 'ghost'} 
  size="sm"
  onClick={() => setGlobePaused(!globePaused)}
>
  {globePaused ? 'Resume' : 'Pause'}
</Button>
                <Button 
                  variant={globePerformance ? 'primary' : 'ghost'} 
                  size="sm"
                  onClick={() => setGlobePerformance(!globePerformance)}
                >
                  Performance
                </Button>
                </div>
              </div>
            </Panel>

            <Panel title="LEARNING STATS">
              <div className="learning-stats">
                <Metric label="Labs Available" value={stats.total} status="info" />
                <Metric label="Completed" value={stats.labsCompleted} status="success" />
                <Metric label="In Progress" value={stats.inProgressLabs} status="warning" />
                <Metric label="XP Earned" value={stats.xp} status="info" />
              </div>
              {catalogManifest && (
                <div style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Normalized catalog: {catalogManifest.uniqueTotal} unique IDs.
                  {catalogManifest.duplicateIds.length > 0
                    ? ` ${catalogManifest.duplicateIds.length} duplicate IDs flagged for review.`
                    : ' No duplicate IDs detected.'}
                  {' '}Quality review queue: {catalogManifest.quality?.review || 0}.
                </div>
              )}
            </Panel>

            {socMode && ticketStats && (
              <Panel title="TICKET PIPELINE">
                <div className="learning-stats">
                  <Metric label="Open" value={ticketStats.open || 0} status="warning" />
                  <Metric label="In Progress" value={ticketStats.inProgress || 0} status="info" />
                  <Metric label="Resolved" value={ticketStats.resolved || 0} status="success" />
                  <Metric label="High Sev" value={ticketStats.bySeverity?.high || 0} status="error" />
                </div>
                <Button variant="primary" size="sm" onClick={() => onNavigate('tickets')} style={{ marginTop: 10 }}>OPEN TICKET MANAGER</Button>
              </Panel>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
}