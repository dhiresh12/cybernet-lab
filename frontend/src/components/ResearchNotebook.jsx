import React, { useState, useEffect } from 'react';

const ResearchNotebook = () => {
  const [research, setResearch] = useState({
    problem: '',
    facts: '',
    unknowns: '',
    tools: '',
    constraints: '',
    hypothesis: '',
    notes: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('researchNotebook');
    if (saved) {
      setResearch(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever research changes
  useEffect(() => {
    localStorage.setItem('researchNotebook', JSON.stringify(research));
  }, [research]);

  const updateField = (key, value) => {
    setResearch(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="type-page-title">Research Lab</div>
    <div className="type-section-title">Research Project</div>
    <div className="type-body">
      <label>Problem Statement:</label>
      <textarea
        className="type-body"
        value={research.problem}
        onChange={(e) => handleFieldChange('problem', e.target.value)}
        placeholder="State the research problem..."
      />
      
      <label>Known Facts:</label>
      <textarea
        className="type-body"
        value={research.facts}
        onChange={(e) => handleFieldChange('facts', e.target.value)}
        placeholder="List known facts..."
      />
      
      <label>Unknowns:</label>
      <textarea
        className="type-body"
        value={research.unknowns}
        onChange={(e) => handleFieldChange('unknowns', e.target.value)}
        placeholder="List unknowns..."
      />
      
      <label>Tools:</label>
      <textarea
        className="type-body"
        value={research.tools}
        onChange={(e) => handleFieldChange('tools', e.target.value)}
        placeholder="List tools..."
      />
      
      <label>Constraints:</label>
      <textarea
        className="type-body"
        value={research.constraints}
        onChange={(e) => handleFieldChange('constraints', e.target.value)}
        placeholder="List constraints..."
      />
      
      <label>Hypothesis:</label>
      <textarea
        className="type-body"
        value={research.hypothesis}
        onChange={(e) => handleFieldChange('hypothesis', e.target.value)}
        placeholder="State your hypothesis..."
      />
      
      <label>Research Notes:</label>
      <textarea
        className="type-body"
        value={research.notes}
        onChange={(e) => handleFieldChange('notes', e.target.value)}
        placeholder="Take detailed notes..."
      />
    </div>
  );

  const handleFieldChange = (key, value) => {
    setResearch(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="type-section-title">Research Notebook</div>
      <div className="type-body">
        {/* Form fields */}
        <div className="type-section">
          <div className="type-body">
            <label>Problem Statement:</label>
            <textarea
              className="type-body"
              value={research.problem}
              onChange={(e) => handleFieldChange('problem', e.target.value)}
              placeholder="State the research problem..."
            />
          </div>
          
          <div className="type-body">
            <label>Known Facts:</label>
            <textarea
              className="type-body"
              value={research.facts}
              onChange={(e) => handleFieldChange('facts', e.target.value)}
              placeholder="List known facts..."
            />
          </div>
          
          <div className="type-body">
            <label>Unknowns:</label>
            <textarea
              className="type-body"
              value={research.unknowns}
              onChange={(e) => handleFieldChange('unknowns', e.target.value)}
              placeholder="List unknowns..."
            />
          </div>
          
          <div className="type-body">
            <label>Tools:</label>
            <textarea
              className="type-body"
              value={research.tools}
              onChange={(e) => handleFieldChange('tools', e.target.value)}
              placeholder="List tools..."
            />
          </div>
          
          <div className="type-body">
            <label>Constraints:</label>
            <textarea
              className="type-body"
              value={research.constraints}
              onChange={(e) => handleFieldChange('constraints', e.target.value)}
              placeholder="List constraints..."
            />
          </div>
          
          <div className="type-body">
            <label>Hypothesis:</label>
            <textarea
              className="type-body"
              value={research.hypothesis}
              onChange={(e) => handleFieldChange('hypothesis', e.target.value)}
              placeholder="State your hypothesis..."
            />
          </div>
          
          <div className="type-body">
            <label>Research Notes:</label>
            <textarea
              className="type-body"
              value={research.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Take detailed notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchNotebook;