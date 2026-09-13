import React, { useState } from 'react';

const PortfolioUpload = ({ learnerId, onAdd }) => {
  const [formData, setFormData] = useState({ title: '', type: '', description: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type) return;
    
    const res = await fetch(`/api/portfolio/${learnerId}/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    onAdd(result);
    setFormData({ title: '', type: '', description: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="portfolio-upload">
      <h3>Add New Portfolio Item</h3>
      <input
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      <select name="type" value={formData.type} onChange={handleChange} required>
        <option value="">Select Type</option>
        <option value="design">Design</option>
        <option value="analysis">Analysis</option>
        <option value="report">Report</option>
        <option value="experiment">Experiment</option>
        <option value="interview">Interview</option>
        <option value="decision">Decision Record</option>
      </select>
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <button type="submit">Add Item</button>
    </form>
  );
};

export default PortfolioUpload;