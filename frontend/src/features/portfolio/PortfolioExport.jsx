import React from 'react';

export default function PortfolioExport({ artifact, onClose }) {
  if (!artifact) return null;

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'artifact'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    const lines = [
      `# ${artifact.title}`,
      ``,
      `**Type:** ${artifact.type}`,
      `**Status:** ${artifact.status}`,
      `**Created:** ${new Date(artifact.createdAt).toLocaleString()}`,
      artifact.updatedAt ? `**Updated:** ${new Date(artifact.updatedAt).toLocaleString()}` : '',
      artifact.labId ? `**Lab ID:** ${artifact.labId}` : '',
      artifact.tags?.length ? `**Tags:** ${artifact.tags.join(', ')}` : '',
      ``,
      `## Content`,
      ``,
      JSON.stringify(artifact.content, null, 2),
    ];
    const blob = new Blob([lines.filter(Boolean).join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'artifact'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    const content = JSON.stringify(artifact.content, null, 2);
    win.document.write(`<!DOCTYPE html><html><head><title>${artifact.title}</title><style>body{font-family:monospace;padding:40px;background:#0a0f1a;color:#c8d6e5}pre{background:#0d1117;padding:16px;border:1px solid #1b2838;border-radius:4px;overflow:auto}h1{color:#00e5ff}meta{color:#8b949e}</style></head><body><h1>${artifact.title}</h1><p><meta>Type: ${artifact.type} | Status: ${artifact.status} | ${new Date(artifact.createdAt).toLocaleDateString()}</meta></p><h2>Content</h2><pre>${content.replace(/</g, '&lt;')}</pre></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Export artifact">
      <div className="tech-card" style={{ maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-semibold)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 'var(--text-sm)' }}>Export Artifact</div>
          <button className="cmd-btn" onClick={onClose} aria-label="Close export dialog">Close</button>
        </div>
        <div style={{ color: 'var(--text)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
          Exporting: <strong>{artifact.title}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button className="cmd-btn primary" onClick={exportJSON}>Export as JSON</button>
          <button className="cmd-btn primary" onClick={exportMarkdown}>Export as Markdown</button>
          <button className="cmd-btn primary" onClick={exportPDF}>Print / Save as PDF</button>
        </div>
      </div>
    </div>
  );
}
