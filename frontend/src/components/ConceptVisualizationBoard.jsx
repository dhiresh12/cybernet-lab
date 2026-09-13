// Concept Visualization Board (Mood Board)
// Phase 4.2: Mood Board equivalent
// Creates a collaborative visual workspace for mapping concepts, relationships, and learning paths
// Native pointer drag/drop and keyboard movement - no external dependencies

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export function computeConnectionPath(from, to) {
  const fromCenter = {
    x: from.position.x + (from.size?.width || 120) / 2,
    y: from.position.y + (from.size?.height || 80) / 2
  };
  const toCenter = {
    x: to.position.x + (to.size?.width || 120) / 2,
    y: to.position.y + (to.size?.height || 80) / 2
  };
  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return { fromCenter, toCenter, length, angle, dx, dy };
}

export function isPointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.width &&
         py >= rect.y && py <= rect.y + rect.height;
}

export function findConceptAtPoint(concepts, x, y) {
  return [...concepts].reverse().find(c => isPointInRect(x, y, {
    x: c.position.x,
    y: c.position.y,
    width: c.size?.width || 120,
    height: c.size?.height || 80
  }));
}

export function snapToGrid(value, gridSize = 20) {
  return Math.round(value / gridSize) * gridSize;
}

export default function ConceptVisualizationBoard({
  concepts = [],
  connections = [],
  onConceptAdd,
  onConceptUpdate,
  onConceptDelete,
  onConnectionAdd,
  onConnectionDelete
}) {
  const [selectedConceptId, setSelectedConceptId] = useState(null);
  const [boardPosition, setBoardPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectionPreview, setConnectionPreview] = useState(null);
  const boardRef = useRef(null);
  const conceptsRef = useRef(concepts);
  const connectionsRef = useRef(connections);

  conceptsRef.current = concepts;
  connectionsRef.current = connections;

  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.25), 3));
  }, []);

  useEffect(() => {
    const board = boardRef.current;
    if (board) {
      board.addEventListener('wheel', handleWheel, { passive: false });
      return () => board.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const moveBoard = useCallback((dx, dy) => {
    setBoardPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handlePointerDown = useCallback((e, concept) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggingId(concept.id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSelectedConceptId(concept.id);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!draggingId || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX - boardRect.left - boardPosition.x - dragOffset.x) / scale;
    const y = (e.clientY - boardRect.top - boardPosition.y - dragOffset.y) / scale;
    onConceptUpdate?.(draggingId, {
      position: { x: snapToGrid(x), y: snapToGrid(y) }
    });
    if (connectingFrom) {
      setConnectionPreview({ x: e.clientX - boardRect.left, y: e.clientY - boardRect.top });
    }
  }, [draggingId, boardPosition, scale, dragOffset, connectingFrom, onConceptUpdate]);

  const handlePointerUp = useCallback((e) => {
    if (!draggingId) return;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    setDraggingId(null);
    if (connectingFrom && connectionPreview) {
      const targetConcept = findConceptAtPoint(conceptsRef.current, connectionPreview.x, connectionPreview.y);
      if (targetConcept && targetConcept.id !== connectingFrom.id) {
        onConnectionAdd?.({ from: connectingFrom.id, to: targetConcept.id });
      }
      setConnectingFrom(null);
      setConnectionPreview(null);
    }
  }, [draggingId, connectingFrom, connectionPreview, onConnectionAdd, handlePointerMove]);

  const handleKeyDown = useCallback((e, concept) => {
    const step = e.shiftKey ? 50 : 10;
    let dx = 0, dy = 0;
    switch (e.key) {
      case 'ArrowLeft': dx = -step; break;
      case 'ArrowRight': dx = step; break;
      case 'ArrowUp': dy = -step; break;
      case 'ArrowDown': dy = step; break;
      case 'Enter':
      case ' ': e.preventDefault(); setSelectedConceptId(concept.id); break;
      case 'Delete': e.preventDefault(); onConceptDelete?.(concept.id); break;
      case 'c': case 'C': if (e.ctrlKey || e.metaKey) { e.preventDefault(); setConnectingFrom(concept); } break;
      default: return;
    }
    if (dx !== 0 || dy !== 0) {
      e.preventDefault();
      onConceptUpdate?.(concept.id, {
        position: {
          x: snapToGrid(concept.position.x + dx),
          y: snapToGrid(concept.position.y + dy)
        }
      });
    }
  }, [onConceptUpdate, onConceptDelete]);

  const handleCanvasKeyDown = useCallback((e) => {
    if (e.target !== boardRef.current) return;
    const step = e.shiftKey ? 100 : 20;
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); moveBoard(step, 0); break;
      case 'ArrowRight': e.preventDefault(); moveBoard(-step, 0); break;
      case 'ArrowUp': e.preventDefault(); moveBoard(0, step); break;
      case 'ArrowDown': e.preventDefault(); moveBoard(0, -step); break;
      case '+': case '=': e.preventDefault(); setScale(prev => Math.min(3, prev * 1.1)); break;
      case '-': case '_': e.preventDefault(); setScale(prev => Math.max(0.25, prev * 0.9)); break;
      case '0': e.preventDefault(); setScale(1); setBoardPosition({ x: 0, y: 0 }); break;
      case 'Escape': setSelectedConceptId(null); setConnectingFrom(null); break;
    }
  }, [moveBoard]);

  useEffect(() => {
    const board = boardRef.current;
    if (board) {
      board.addEventListener('keydown', handleCanvasKeyDown);
      return () => board.removeEventListener('keydown', handleCanvasKeyDown);
    }
  }, [handleCanvasKeyDown]);

  const selectedConcept = useMemo(() =>
    concepts.find(c => c.id === selectedConceptId) || null,
    [concepts, selectedConceptId]
  );

  return (
    <div className="concept-visualization-board tech-card hud-bracket" role="application" aria-label="Concept Visualization Board" tabIndex={0} onKeyDown={handleCanvasKeyDown} ref={boardRef}>
      <header className="board-header status-strip">
        <div>
          <h2 className="section-title">Concept Visualization Board</h2>
          <p className="tech-label">Map concepts and relationships. Click to select, arrow keys to move, Ctrl+Click to connect, Delete to remove.</p>
        </div>
        <div className="board-controls" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="cmd-btn" onClick={() => moveBoard(50, 0)} aria-label="Pan left">←</button>
          <button className="cmd-btn" onClick={() => moveBoard(-50, 0)} aria-label="Pan right">→</button>
          <button className="cmd-btn" onClick={() => moveBoard(0, 50)} aria-label="Pan up">↑</button>
          <button className="cmd-btn" onClick={() => moveBoard(0, -50)} aria-label="Pan down">↓</button>
          <button className="cmd-btn" onClick={() => setScale(prev => Math.max(0.25, prev * 0.9))} aria-label="Zoom out">−</button>
          <button className="cmd-btn" onClick={() => setScale(prev => Math.min(3, prev * 1.1))} aria-label="Zoom in">+</button>
          <button className="cmd-btn" onClick={() => { setScale(1); setBoardPosition({ x: 0, y: 0 }); }} aria-label="Reset view">⌂</button>
        </div>
      </header>

      <div
        className="board-canvas"
        style={{
          transform: `translate(${boardPosition.x}px, ${boardPosition.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          position: 'relative',
          minHeight: '600px'
        }}
        role="graphics-document"
        aria-roledescription="concept map"
        aria-label="Concept map canvas"
      >
        {connections.map(conn => {
          const fromConcept = concepts.find(c => c.id === conn.from);
          const toConcept = concepts.find(c => c.id === conn.to);
          if (!fromConcept || !toConcept) return null;
          const { length, angle, fromCenter } = computeConnectionPath(fromConcept, toConcept);
          return (
            <ConnectionLine
              key={conn.id}
              id={conn.id}
              fromCenter={fromCenter}
              length={length}
              angle={angle}
              onDelete={() => onConnectionDelete?.(conn.id)}
            />
          );
        })}

        {concepts.map(concept => (
          <ConceptNode
            key={concept.id}
            concept={concept}
            isSelected={selectedConceptId === concept.id}
            isDragging={draggingId === concept.id}
            isConnecting={connectingFrom?.id === concept.id}
            onSelect={() => setSelectedConceptId(concept.id)}
            onUpdate={(updates) => onConceptUpdate?.(concept.id, updates)}
            onDelete={() => onConceptDelete?.(concept.id)}
            onConnect={() => setConnectingFrom(concept)}
            onKeyDown={(e) => handleKeyDown(e, concept)}
          />
        ))}

        <AddConceptZone
          onAdd={onConceptAdd}
          boardPosition={boardPosition}
          scale={scale}
        />

        {connectingFrom && connectionPreview && (
          <ConnectionPreview
            fromConcept={connectingFrom}
            toPoint={connectionPreview}
            boardPosition={boardPosition}
            scale={scale}
          />
        )}
      </div>

      {selectedConcept && (
        <ConceptPropertiesPanel
          concept={selectedConcept}
          onUpdate={(updates) => onConceptUpdate?.(selectedConcept.id, updates)}
          onClose={() => setSelectedConceptId(null)}
        />
      )}
    </div>
  );
}

function ConceptNode({ concept, isSelected, isDragging, isConnecting, onSelect, onUpdate, onDelete, onConnect, onKeyDown }) {
  const nodeRef = useRef(null);
  const width = concept.size?.width || 120;
  const height = concept.size?.height || 80;

  return (
    <div
      ref={nodeRef}
      className={`concept-node tech-card ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''}`}
      style={{
        position: 'absolute',
        left: concept.position.x,
        top: concept.position.y,
        width,
        height,
        backgroundColor: concept.color || 'var(--panel)',
        borderColor: isSelected ? 'var(--primary)' : isConnecting ? 'var(--warning)' : concept.color || 'var(--panel-border)',
        borderWidth: isSelected || isConnecting ? 3 : 1,
        boxShadow: isSelected ? 'var(--glow-primary)' : isConnecting ? 'var(--glow-warning)' : 'none',
        zIndex: isDragging ? 100 : isSelected ? 10 : 1
      }}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-pressed={isConnecting}
      aria-label={`Concept: ${concept.title}. ${isSelected ? 'Selected. ' : ''}Press Enter to select, arrow keys to move, Ctrl+C to connect, Delete to remove.`}
      onClick={onSelect}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={onKeyDown}
    >
      <div className="concept-content" style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="concept-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h4 style={{ margin: 0, fontSize: '0.85em', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{concept.title}</h4>
          <button
            className="cmd-btn danger"
            style={{ padding: '2px 6px', fontSize: '0.7em', lineHeight: 1 }}
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            aria-label={`Delete concept: ${concept.title}`}
          >×</button>
        </div>
        <p className="concept-description" style={{ margin: 0, fontSize: '0.7em', color: 'var(--text-dim)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{concept.description}</p>
        <div className="concept-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {concept.tags?.slice(0, 4).map(tag => (
            <span key={tag} className="tag" style={{ fontSize: '0.6em', padding: '1px 6px', background: 'rgba(0,229,255,0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', textTransform: 'uppercase' }}>{tag}</span>
          ))}
        </div>
      </div>

      {isSelected && (
        <div className="concept-selection-indicator" style={{ position: 'absolute', inset: '-3px', border: '2px solid var(--primary)', borderRadius: '4px', pointerEvents: 'none' }} aria-hidden="true" />
      )}

      {!isDragging && !isConnecting && (
        <button
          className="connect-handle"
          style={{
            position: 'absolute',
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--warning)',
            border: '2px solid var(--panel)',
            cursor: 'crosshair',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'var(--bg)',
            opacity: 0.7
          }}
          onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onConnect?.(); }}}
          aria-label={`Start connection from ${concept.title}`}
          tabIndex={0}
        >+</button>
      )}
    </div>
  );
}

function ConnectionLine({ id, fromCenter, length, angle, onDelete }) {
  if (length < 1) return null;
  const midX = fromCenter.x + Math.cos(angle * Math.PI / 180) * length / 2;
  const midY = fromCenter.y + Math.sin(angle * Math.PI / 180) * length / 2;

  return (
    <div
      className="connection-line"
      style={{
        position: 'absolute',
        left: fromCenter.x,
        top: fromCenter.y,
        width: length,
        height: 2,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <svg width={length} height="4" style={{ display: 'block' }}>
        <line
          x1="0" y1="2" x2={length} y2="2"
          stroke="rgba(0,229,255,0.5)"
          strokeWidth="2"
          strokeDasharray="6,4"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points={`${length - 8},0 ${length},2 ${length - 8},4`}
          fill="rgba(0,229,255,0.5)"
        />
      </svg>
      <button
        className="connection-delete-btn cmd-btn danger"
        style={{
          position: 'absolute',
          left: `${length / 2 - 12}px`,
          top: '-12px',
          padding: '2px 8px',
          fontSize: '0.7em',
          pointerEvents: 'auto'
        }}
        onClick={onDelete}
        aria-label="Remove connection"
      >×</button>
    </div>
  );
}

function ConnectionPreview({ fromConcept, toPoint, boardPosition, scale }) {
  const fromCenter = {
    x: fromConcept.position.x + (fromConcept.size?.width || 120) / 2,
    y: fromConcept.position.y + (fromConcept.size?.height || 80) / 2
  };
  const toX = (toPoint.x - boardPosition.x) / scale;
  const toY = (toPoint.y - boardPosition.y) / scale;
  const dx = toX - fromCenter.x;
  const dy = toY - fromCenter.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  if (length < 1) return null;

  return (
    <div
      className="connection-preview"
      style={{
        position: 'absolute',
        left: fromCenter.x,
        top: fromCenter.y,
        width: length,
        height: 2,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0',
        pointerEvents: 'none',
        opacity: 0.6
      }}
      aria-hidden="true"
    >
      <svg width={length} height="4" style={{ display: 'block' }}>
        <line
          x1="0" y1="2" x2={length} y2="2"
          stroke="rgba(255,230,0,0.6)"
          strokeWidth="2"
          strokeDasharray="4,4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function AddConceptZone({ onAdd, boardPosition, scale }) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={`add-concept-zone ${isOver ? 'over' : ''}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        border: '2px dashed var(--panel-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: isOver ? 'rgba(0,229,255,0.1)' : 'transparent',
        transition: 'all 0.2s ease',
        pointerEvents: 'auto'
      }}
      role="button"
      tabIndex={0}
      aria-label="Add new concept to the board"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAdd(); }}}
      onClick={handleAdd}
      onPointerEnter={() => setIsOver(true)}
      onPointerLeave={() => setIsOver(false)}
    >
      <div className="add-zone-content" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '8px' }}>+</div>
        <p style={{ margin: 0, fontSize: '0.9em', fontWeight: 500 }}>Add Concept</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.7em' }}>Click or press Enter</p>
      </div>
    </div>
  );

  function handleAdd() {
    const newId = `concept-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newConcept = {
      id: newId,
      title: 'New Concept',
      description: 'Click to edit concept details',
      tags: ['new'],
      color: `hsl(${Math.random() * 360}, 70%, 45%)`,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      size: { width: 140, height: 100 }
    };
    onAdd?.(newConcept);
  }
}

function ConceptPropertiesPanel({ concept, onUpdate, onClose }) {
  const [title, setTitle] = useState(concept.title);
  const [description, setDescription] = useState(concept.description);
  const [color, setColor] = useState(concept.color || '#00e5ff');
  const [tags, setTags] = useState(concept.tags?.join(', ') || '');

  const handleSave = useCallback(() => {
    onUpdate?.({
      ...concept,
      title,
      description,
      color,
      tags: tags.split(',').map(t => t.trim()).filter(t => t)
    });
    onClose?.();
  }, [concept, title, description, color, tags, onUpdate, onClose]);

  return (
    <div className="concept-properties-panel tech-card hud-bracket" style={{ position: 'fixed', right: 20, top: 100, width: 320, maxHeight: '80vh', overflow: 'auto', zIndex: 200 }} role="dialog" aria-labelledby="panel-title" aria-modal="true">
      <div className="panel-header status-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 id="panel-title" className="section-title" style={{ margin: 0 }}>Edit Concept</h3>
        <button className="cmd-btn" onClick={onClose} aria-label="Close panel">×</button>
      </div>

      <div className="panel-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Concept title"
            style={{ width: '100%', padding: '8px', background: 'var(--bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.85em' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Concept description"
            rows={3}
            style={{ width: '100%', padding: '8px', background: 'var(--bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.85em', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '60px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.7em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            style={{ width: '100%', padding: '8px', background: 'var(--bg)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '0.85em' }}
          />
        </div>

        <div className="panel-actions" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button onClick={handleSave} className="cmd-btn primary" style={{ flex: 1 }}>Save</button>
          <button onClick={onClose} className="cmd-btn" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}