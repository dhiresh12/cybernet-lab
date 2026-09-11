const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'labs.procedural.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function getCategory(lab) {
  const t = (lab.title || '').toLowerCase();
  
  // OSI Model (most specific first)
  if (t.includes('network model') || t.includes('osi') || t.includes('tcp/ip model') || t.includes('understanding the')) return 'OSI Model';
  
  // Fundamentals & Basics (catch-all for beginner content)
  if (t.includes('banner') || t.includes('password encryption') || t.includes('device naming') || t.includes('console') || t.includes('basic switch') || t.includes('basic router') || t.includes('basic connectivity') || t.includes('first vlan') || t.includes('accessing device')) return 'Networking Fundamentals';
  
  // Subnetting
  if (t.includes('subnet') || t.includes('vlsm') || t.includes('binary ip') || t.includes('cidr')) return 'Subnetting';
  
  // IPv4 / TCP/IP
  if (t.includes('ip address') || t.includes('tcp/ip') || t.includes('ip configuration') || t.includes('tcp model')) return 'TCP/IP';
  
  // IPv6
  if (t.includes('ipv6')) return 'IPv6';
  
  // Switching & VLANs
  if (t.includes('vlan') && !t.includes('inter-vlan') && !t.includes('router-on-a')) return 'VLAN';
  if (t.includes('trunk') || t.includes('802.1q') || t.includes('dot1q')) return 'Trunking';
  if (t.includes('inter-vlan') || t.includes('router-on-a-stick')) return 'Inter-VLAN Routing';
  if (t.includes('spanning tree') || t.includes('stp') || t.includes('rapid pvst') || t.includes('pvst+')) return 'STP';
  if (t.includes('etherchannel') || t.includes('port-channel') || t.includes('lacp') || t.includes('pagp') || t.includes('link aggregation')) return 'EtherChannel';
  if (t.includes('switch') && !t.includes('switching') && !t.includes('cisco') && !t.includes('secure')) return 'Switching';
  if (t.includes('broadcast') || t.includes('collision') || t.includes('mac address table')) return 'Switching';
  if (t.includes('port security') && !t.includes('basics')) return 'Port Security';
  
  // Routing protocols
  if (t.includes('ospf')) return 'OSPF';
  if (t.includes('eigrp')) return 'EIGRP';
  if (t.includes('bgp')) return 'BGP';
  if (t.includes('rip')) return 'RIP';
  if (t.includes('static routing') || t.includes('static route') || (t.includes('static') && t.includes('rout'))) return 'Static Routing';
  if (t.includes('default route') || t.includes('floating static')) return 'Default Routing';
  if (t.includes('routing') && !t.includes('static') && !t.includes('ospf') && !t.includes('eigrp') && !t.includes('bgp') && !t.includes('rip')) return 'Routing';
  
  // Network Services
  if (t.includes('dhcp')) return 'DHCP';
  if (t.includes('dns')) return 'DNS';
  if (t.includes('ntp') || t.includes('time protocol')) return 'Network Services';
  
  // Security
  if (t.includes('acl') || t.includes('access-list') || t.includes('access list') || (t.includes('access') && t.includes('control'))) return 'ACL';
  if (t.includes('nat') || t.includes('pat') || t.includes('overload')) return 'NAT';
  if (t.includes('firewall') || t.includes('dmz') || t.includes('zone-based') || t.includes('security basics') || t.includes('security threats') || t.includes('security best practices')) return 'Network Security';
  if (t.includes('ssh') || t.includes('telnet') || t.includes('console')) return 'SSH';
  if (t.includes('aaa') || t.includes('radius') || t.includes('tacacs')) return 'Port Security';
  
  // VPN & WAN
  if (t.includes('vpn') || t.includes('dmvpn') || t.includes('ipsec') || t.includes('gre') || t.includes('vxlan') || t.includes('evpn') || t.includes('overlay')) return 'VPN';
  if (t.includes('frame relay') || t.includes('wan')) return 'WAN';
  
  // Monitoring & Troubleshooting
  if (t.includes('troubleshoot') || t.includes('debug') || t.includes('diagnose') || t.includes('missing') || t.includes('failure')) return 'Troubleshooting';
  if (t.includes('monitor') || t.includes('snmp') || t.includes('logging') || t.includes('netflow') || t.includes('sflow') || t.includes('cpu')) return 'Network Monitoring';
  if (t.includes('packet') || t.includes('wireshark') || t.includes('capture') || t.includes('analysis') || t.includes('pcap')) return 'Packet Analysis';
  
  // Performance
  if (t.includes('qos') || t.includes('quality of service') || t.includes('voice') || t.includes('video') || t.includes('traffic') || t.includes('cops')) return 'Network Performance';
  
  // Wireless
  if (t.includes('wireless') || t.includes('wifi') || t.includes('wlan') || t.includes('access point')) return 'Wireless Networking';
  
  // Cabling & Physical
  if (t.includes('cabling') || t.includes('cable') || t.includes('fiber') || t.includes('copper') || t.includes('connector')) return 'Cabling';
  if (t.includes('ethernet') && !t.includes('etherchannel')) return 'Ethernet';
  
  // ICMP
  if (t.includes('ping') || t.includes('icmp') || t.includes('traceroute') || t.includes('trace route')) return 'ICMP';
  
  // OS & Server
  if (t.includes('linux') || t.includes('ubuntu') || t.includes('centos') || t.includes('debian')) return 'Linux Networking';
  if (t.includes('windows') || t.includes('active directory')) return 'Windows Networking';
  if (t.includes('server') || t.includes('web server') || t.includes('file server') || t.includes('ftp') || t.includes('http')) return 'Server Networking';
  
  // Design & Planning
  if (t.includes('design') || t.includes('architecture') || t.includes('campus') || t.includes('high availability') || t.includes('redundancy') || t.includes('stacking')) return 'Network Design';
  if (t.includes('plan') || t.includes('capacity') || t.includes('documentation') || t.includes('diagram') || t.includes('topology')) return 'Network Planning';
  if (t.includes('document') && t.includes('network')) return 'Network Documentation';
  
  // Automation
  if (t.includes('automation') || t.includes('ansible') || t.includes('python') || t.includes('script') || t.includes('netconf') || t.includes('restconf') || t.includes('yaml') || t.includes('jinja')) return 'Automation';
  
  // Data Center
  if (t.includes('data center') || t.includes('spine') || t.includes('leaf') || t.includes('anycast gateway') || t.includes('fabric')) return 'Data Center';
  
  // Cisco specific
  if (t.includes('cisco') || t.includes('ios') || t.includes('memory') || t.includes('cdp') || t.includes('loopback') || t.includes('password encryption')) return 'Cisco';
  
  return 'Networking Fundamentals';
}

let fixed = 0;
data.forEach(lab => {
  const newCat = getCategory(lab);
  if (lab.category !== newCat) {
    console.log(`FIX: ${lab.id} "${lab.title}" ${lab.category} -> ${newCat}`);
    lab.category = newCat;
    fixed++;
  }
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

const cats = {};
data.forEach(l => cats[l.category] = (cats[l.category]||0)+1);
console.log(`\nFixed ${fixed} labs`);
console.log(`Categories (${Object.keys(cats).length}):`);
Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log(`  ${c}: ${n}`));