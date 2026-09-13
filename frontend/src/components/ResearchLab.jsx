import React, { useState } from 'react';

const ResearchLab = () => {
  const [problem, setProblem] = useState('');
  const [facts, setFacts] = useState('');
  const [unknowns, setUnknowns] = useState('');
  const [tools, setTools] = useState('');
  const [constraints, setConstraints] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [experimentTemplate, setExperimentTemplate] = useState('');
  const [notes, setNotes] = useState('');

  const experimentTemplates = [
    'TCP vs UDP packet loss',
    'Routing path comparison',
    'DNS latency test',
    'ARP behavior inspection',
    'Congestion measurement',
    'ACL design evaluation',
    'Segmentation test',
    'Anomaly pattern investigation'
  ];

  const handleSelectTemplate = (template) => {
    setExperimentTemplate(template);
  };

  return (
    <div>
      <div className="type-page-title">Research Lab</div>
      <div className="type-section-title">Problem Statement</div>
      <textarea
        className="type-body"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Describe the research problem..."
      />
    </div>
  );
};

export default ResearchLab;