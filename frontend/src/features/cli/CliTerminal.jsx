// CLI Terminal Component
import React, { useRef, useEffect, useState } from 'react';
import './CliTerminal.css';

export default function CliTerminal({ engine, activeDeviceId, onOutput, onSend }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const outputEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (outputEndRef.current) outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [onOutput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        onSend(input.trim());
        setHistory([...history, input.trim()]);
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) { setInput(''); setHistoryIdx(-1); }
        else { setHistoryIdx(idx); setInput(history[idx]); }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  const device = activeDeviceId ? engine?.getDevice(activeDeviceId) : null;
  const prompt = device ? 
    (device.mode === 'enable' ? `${device.hostname}# ` :
      device.mode === 'config' ? `${device.hostname}(config)# ` :
      device.mode === 'interface' ? `${device.hostname}(config-if)# ` :
      device.mode === 'acl' ? `${device.hostname}(config-ext)# ` :
      device.mode === 'dhcp' ? `${device.hostname}(config-dhcp)# ` :
      `${device.hostname}> `)
    : 'Router>';

  return (
    <div className="terminal-block" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header-bar">
        <span>Network Operations Terminal</span>
        <div className="terminal-status">
          <span className={`terminal-status-indicator ${device ? 'active' : ''}`}></span>
          <span className="terminal-status-text">
            {device ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
      <div className="terminal-output">
        {(onOutput || []).map((line, i) => {
          const lineType = typeof line === 'string' 
            ? (line.startsWith('%') ? 'error' : line.startsWith('Success') ? 'success' : 'system')
            : (line.type === 'command' ? 'command' : 'system');
          return (
            <div key={i} className={`terminal-line ${lineType}`}>
              {typeof line === 'string' ? line : line.text}
            </div>
          );
        })}
        <div ref={outputEndRef} />
      </div>
      <div className="terminal-input-row">
        <span className="terminal-prompt">{prompt}</span>
        <input 
          ref={inputRef}
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={handleKeyDown} 
          autoFocus 
          className="terminal-input"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}