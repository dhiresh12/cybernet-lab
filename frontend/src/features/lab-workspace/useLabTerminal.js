// Terminal Hook
import { useState, useCallback } from 'react';

export function useLabTerminal({ simulation, activeTerminalDevice }) {
  const [output, setOutput] = useState([
    { type: 'system', text: 'CyberNet Terminal v4.0' },
    { type: 'info', text: 'Connect a device to begin CLI session.' }
  ]);
  const [input, setInput] = useState('');

  const handleSendCommand = useCallback((cmd) => {
    if (!cmd.trim()) return;
    if (!activeTerminalDevice || !simulation) return;

    const engine = simulation?.engine || simulation;
    const device = engine.getDevice(activeTerminalDevice);
    if (!device) return;

    const prompt = device.mode === 'enable' ? `${device.hostname}# ` :
                    device.mode === 'config' ? `${device.hostname}(config)# ` :
                    device.mode === 'interface' ? `${device.hostname}(config-if)# ` :
                    device.mode === 'acl' ? `${device.hostname}(config-ext)# ` :
                    device.mode === 'dhcp' ? `${device.hostname}(config-dhcp)# ` :
                    `${device.hostname}> `;

    const lower = cmd.toLowerCase().trim();
    let result;

    try {
      if (lower.startsWith('show ')) {
        if (lower === 'show running-config' || lower === 'show run') {
          result = { output: engine.showRunningConfig(activeTerminalDevice) };
        } else if (lower === 'show ip interface brief' || lower === 'show ip int br') {
          result = { output: engine.showIpInterfaceBrief(activeTerminalDevice) };
        } else if (lower === 'show ip route') {
          result = { output: engine.showIpRoute(activeTerminalDevice) };
        } else if (lower === 'show interfaces') {
          result = { output: engine.showInterfaces(activeTerminalDevice) };
        } else if (lower === 'show arp') {
          result = { output: engine.showArp(activeTerminalDevice) };
        } else if (lower === 'show vlan brief' || lower === 'show vlan') {
          result = { output: engine.showVlanBrief(activeTerminalDevice) };
        } else if (lower === 'show mac address-table') {
          result = { output: ['% Command not implemented'] };
        } else if (lower === 'show access-lists' || lower === 'show access-list') {
          result = { output: engine.showAccessLists(activeTerminalDevice) };
        } else if (lower === 'show ip nat translations') {
          result = { output: engine.showIpNatTranslations(activeTerminalDevice) };
        } else if (lower === 'show ip dhcp binding') {
          result = { output: engine.showIpDhcpBinding(activeTerminalDevice) };
        } else if (lower === 'show ip ssh') {
          result = { output: engine.showIpSsh(activeTerminalDevice) };
        } else if (lower === 'show port-security address') {
          result = { output: engine.showPortSecurityAddress(activeTerminalDevice) };
        } else if (lower === 'show spanning-tree' || lower === 'show spanning') {
          result = { output: engine.showSpanningTree(activeTerminalDevice) };
        } else if (lower === 'show etherchannel summary') {
          result = { output: engine.showEtherchannelSummary(activeTerminalDevice) };
        } else if (lower === 'show ip eigrp neighbors') {
          result = { output: engine.showIpEigrpNeighbors(activeTerminalDevice) };
        } else if (lower === 'show ip ospf neighbor') {
          result = { output: engine.showIpOspfNeighbor(activeTerminalDevice) };
        } else if (lower === 'show ip bgp summary') {
          result = { output: engine.showIpBgpSummary(activeTerminalDevice) };
        } else if (lower === 'show ip protocols') {
          result = { output: engine.showIpProtocols(activeTerminalDevice) };
        } else if (lower === 'show ntp status') {
          result = { output: engine.showNtpStatus(activeTerminalDevice) };
        } else {
          result = engine.processCommand(activeTerminalDevice, cmd);
        }
      } else {
        result = engine.processCommand(activeTerminalDevice, cmd);
      }
    } catch (e) {
      result = { output: [`% Error: ${e.message}`] };
    }

    setOutput(prev => {
      const newLines = [...prev, { type: 'command', text: `${prompt}${cmd}` }];
      if (result?.output) {
        newLines.push(...result.output.map(o => ({ text: o, type: 'output' })));
      }
      return newLines;
    });
    setInput('');
  }, [activeTerminalDevice, simulation]);

  const clear = useCallback(() => {
    setOutput([
      { type: 'system', text: 'CyberNet Terminal v4.0' },
      { type: 'info', text: 'Connect a device to begin CLI session.' }
    ]);
  }, []);

  return {
    output,
    input,
    setInput,
    handleSendCommand,
    clear,
  };
}
