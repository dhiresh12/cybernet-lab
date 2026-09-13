import React, { useState } from 'react';

const PortfolioExport = ({ learnerId }) => {
  const [exporting, setExporting] = useState(false);

  const handleExportJSON = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/portfolio/${learnerId}/export/json`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_${learnerId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/portfolio/${learnerId}/export/pdf`);
      const data = await res.json();
      alert('PDF export initiated. Check console for details.');
    } catch (err) {
      alert('PDF export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="portfolio-export">
      <h3>Export Options</h3>
      <button onClick={handleExportJSON} disabled={exporting}>
        {exporting ? 'Exporting...' : 'Export JSON'}
      </button>
      <button onClick={handleExportPDF} disabled={exporting}>
        {exporting ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  );
};

export default PortfolioExport;