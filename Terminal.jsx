import React, { useRef, useEffect } from 'react';
import './Terminal.css';

export default function Terminal({ engine }) {
  const [lines, setLines] = useState([
    { type: 'system', text: 'CyberNet Terminal v4.0' },
    { type: 'info', text: 'Connect a device to begin CLI session.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleKey = async (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim();
    if (!cmd) return;
    setLines(prev => [...prev, { type: 'command', text: cmd }]);
    setInput('');
    // Send to engine/simulation
  };

  return (
    <div className="terminal">
      <div style={{ color: 'var(--muted)', fontSize: '0.8em', marginBottom: 8 }}>TERMINAL</div>
      {lines.map((l, i) => (
        <div key={i} className={`terminal-line ${l.type}`}>{l.text}</div>
      ))}
      <div ref={bottomRef} />
      <input
        className="terminal-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Router>"
        spellCheck={false}
      />
    </div>
  );
}
