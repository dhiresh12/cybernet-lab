import React from 'react';

const ExperimentTemplates = [
  {
    id: 'tcp-udp',
    title: 'TCP vs UDP Packet Loss',
    description: 'Compare packet loss between TCP and UDP protocols under varying network conditions',
    components: ['packet-sim', 'loss-monitor']
  },
  {
    id: 'routing',
    title: 'Routing Path Comparison',
    description: 'Compare network routing paths between different protocols and configurations',
    components: ['route-mapper', 'path-analyzer']
  },
  {
    id: 'dns',
    title: 'DNS Latency Test',
    description: 'Measure DNS query latency across different server locations',
    components: ['dns-client', 'latency-timer']
  },
  {
    id: 'arp',
    title: 'ARP Behavior Investigation',
    description: 'Examine ARP cache behavior and timing under different network conditions',
    components: ['arp-sim', 'cache-viewer']
  },
  {
    id: 'congestion',
    title: 'Network Congestion Analysis',
    description: 'Measure packet loss and latency under simulated congestion scenarios',
    components: ['traffic-generator', 'congestion-monitor']
  },
  {
    id: 'acl',
    title: 'ACL Design Evaluation',
    description: 'Test different ACL (Access Control List) designs for security effectiveness',
    components: ['acl-simulator', 'rule-analyzer']
  },
  {
    id: 'segmentation',
    title: 'Network Segmentation Test',
    description: 'Evaluate performance and security implications of network segmentation',
    components: ['segmentation-sim', 'traffic-flow-analyzer']
  },
  {
    id: 'anomaly',
    title: 'Anomaly Pattern Investigation',
    description: 'Detect and analyze network anomaly patterns using statistical methods',
    components: ['anomaly-detector', 'pattern-analyzer']
  },
  {
    id: 'dns-tunneling',
    title: 'DNS Tunneling Detection',
    description: 'Test detection of DNS tunneling techniques and data exfiltration',
    components: ['dns-tunnel-sim', 'exfiltration-detector']
  }
];

export default ExperimentTemplates;