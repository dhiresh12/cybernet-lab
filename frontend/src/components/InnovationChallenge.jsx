import React, { useState } from 'react';

const InnovationChallenge = () => {
  const [challenge, setChallenge] = useState('');
  const [status, setStatus] = useState('idle');

  const challenges = [
    'Design a new network protocol for low-latency communication',
    'Create a machine learning model to predict network congestion',
    'Develop a tool for automated network topology discovery',
    'Build a simulation for DDoS attack mitigation',
    'Create a tool for automated network security policy generation',
    'Build a model to predict network device failure rates',
    'Create a tool for automated network performance benchmarking',
    'Build a system for real-time network traffic classification',
    'Create a tool for automated network topology visualization',
    'Build a system for network protocol reverse engineering'
  ];

  const handleSelect = (template) => {
    setChallenge(template);
  };

  return (
    <div className="type-page-title">Research Lab</div>
    <div className="type-section-title">Innovation Challenge</div>
    <div className="type-body">
      <p>Select a research challenge to explore:</p>
      <select
        className="type-mono"
        value={challenge}
        onChange={(e) => setChallenge(e.target.value)}
      >
        <option value="">-- Select Challenge --</option>
        {challenges.map(challengeItem => (
          <option key={challengeItem} value={challengeItem}>
            {challengeItem}
          </option>
        ))}
      </select>
      <button 
        className="type-btn" 
        onClick={() => setStatus('processing')}
        disabled={status === 'processing'}
      >
        {status === 'processing' ? 'Processing...' : 'Start Experiment'}
      </button>
    </div>
  );
};

export default InnovationChallenge;