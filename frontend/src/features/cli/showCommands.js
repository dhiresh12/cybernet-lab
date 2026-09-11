// Show Commands - Display system information
import { CLI_MODES } from '../../core/constants';

function handleShow(device, args, engine) {
  const subCmd = args.join(' ').toLowerCase();
  
  const showHandlers = {
    'running-config': () => engine.showRunningConfig(device.id),
    'run': () => engine.showRunningConfig(device.id),
    'ip interface brief': () => engine.showIpInterfaceBrief(device.id),
    'ip int br': () => engine.showIpInterfaceBrief(device.id),
    'ip route': () => engine.showIpRoute(device.id),
    'interfaces': () => engine.showInterfaces(device.id),
    'arp': () => engine.showArp(device.id),
    'vlan brief': () => engine.showVlanBrief(device.id),
    'vlan': () => engine.showVlanBrief(device.id),
    'mac address-table': () => engine.showMacAddressTable(device.id),
    'access-lists': () => engine.showAccessLists(device.id),
    'access-list': () => engine.showAccessLists(device.id),
    'ip nat translations': () => engine.showIpNatTranslations(device.id),
    'ip dhcp binding': () => engine.showIpDhcpBinding(device.id),
    'ip ssh': () => engine.showIpSsh(device.id),
    'port-security address': () => engine.showPortSecurityAddress(device.id),
    'spanning-tree': () => engine.showSpanningTree(device.id),
    'spanning': () => engine.showSpanningTree(device.id),
    'etherchannel summary': () => engine.showEtherchannelSummary(device.id),
    'ip eigrp neighbors': () => engine.showIpEigrpNeighbors(device.id),
    'ip ospf neighbor': () => engine.showIpOspfNeighbor(device.id),
    'ip bgp summary': () => engine.showIpBgpSummary(device.id),
    'ip protocols': () => engine.showIpProtocols(device.id),
    'ntp status': () => engine.showNtpStatus(device.id),
    'version': () => [`${device.hostname} uptime is 0 days, 0 hours, 0 minutes`, 'Cisco IOS Software, Version 15.2(4)M5'],
    'cdp neighbors': () => engine.showCdpNeighbors(device.id),
    'ip interface': () => engine.showIpInterface(device.id),
  };

  const handler = showHandlers[subCmd];
  if (handler) {
    return { output: handler() };
  }
  return { output: [`% Invalid show command: ${args.join(' ')}`] };
}

export const commands = [
  { name: 'show', handler: handleShow, options: { requiredMode: CLI_MODES.USER, description: 'Show system information' } },
];