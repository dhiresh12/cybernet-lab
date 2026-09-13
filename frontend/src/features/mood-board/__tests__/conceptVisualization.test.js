// Concept Visualization Board (Mood Board) tests
// Phase 4.2: Mood Board feature tests
// Tests pure helper functions that work in Node environment

// Replicate the helper functions for testing
function computeConnectionPath(from, to) {
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

function isPointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.width &&
         py >= rect.y && py <= rect.y + rect.height;
}

function findConceptAtPoint(concepts, x, y) {
  return [...concepts].reverse().find(c => isPointInRect(x, y, {
    x: c.position.x,
    y: c.position.y,
    width: c.size?.width || 120,
    height: c.size?.height || 80
  }));
}

function snapToGrid(value, gridSize = 20) {
  return Math.round(value / gridSize) * gridSize;
}

const fs = require('fs');
const path = require('path');
const boardPath = path.resolve(__dirname, '../../../components/ConceptVisualizationBoard.jsx');
const boardSource = fs.readFileSync(boardPath, 'utf8');

describe('Concept Visualization Board - Pure Helpers', () => {
  describe('computeConnectionPath', () => {
    test('calculates correct path between two concepts', () => {
      const from = { position: { x: 100, y: 100 }, size: { width: 120, height: 80 } };
      const to = { position: { x: 300, y: 200 }, size: { width: 120, height: 80 } };
      const result = computeConnectionPath(from, to);

      expect(result).toHaveProperty('fromCenter');
      expect(result).toHaveProperty('toCenter');
      expect(result).toHaveProperty('length');
      expect(result).toHaveProperty('angle');
      expect(result).toHaveProperty('dx');
      expect(result).toHaveProperty('dy');

      expect(result.fromCenter).toEqual({ x: 160, y: 140 });
      expect(result.toCenter).toEqual({ x: 360, y: 240 });
      expect(result.dx).toBe(200);
      expect(result.dy).toBe(100);
      expect(result.length).toBeCloseTo(Math.sqrt(200 * 200 + 100 * 100));
      expect(result.angle).toBeCloseTo(Math.atan2(100, 200) * 180 / Math.PI);
    });

    test('handles default size when not provided', () => {
      const from = { position: { x: 0, y: 0 } };
      const to = { position: { x: 100, y: 100 } };
      const result = computeConnectionPath(from, to);

      expect(result.fromCenter).toEqual({ x: 60, y: 40 });
      expect(result.toCenter).toEqual({ x: 160, y: 140 });
    });

    test('returns zero length for overlapping concepts', () => {
      const from = { position: { x: 100, y: 100 }, size: { width: 120, height: 80 } };
      const to = { position: { x: 100, y: 100 }, size: { width: 120, height: 80 } };
      const result = computeConnectionPath(from, to);

      expect(result.length).toBe(0);
      expect(result.angle).toBe(0);
    });
  });

  describe('isPointInRect', () => {
    test('returns true for point inside rectangle', () => {
      const rect = { x: 10, y: 20, width: 100, height: 50 };
      expect(isPointInRect(15, 25, rect)).toBe(true);
      expect(isPointInRect(50, 40, rect)).toBe(true);
      expect(isPointInRect(109, 69, rect)).toBe(true); // edge inclusive
    });

    test('returns false for point outside rectangle', () => {
      const rect = { x: 10, y: 20, width: 100, height: 50 };
      expect(isPointInRect(5, 25, rect)).toBe(false);
      expect(isPointInRect(15, 15, rect)).toBe(false);
      expect(isPointInRect(115, 25, rect)).toBe(false);
      expect(isPointInRect(15, 75, rect)).toBe(false);
    });

    test('handles edge cases', () => {
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(isPointInRect(0, 0, rect)).toBe(true);
      expect(isPointInRect(10, 10, rect)).toBe(true);
      expect(isPointInRect(-1, 0, rect)).toBe(false);
      expect(isPointInRect(0, -1, rect)).toBe(false);
    });
  });

  describe('findConceptAtPoint', () => {
    const concepts = [
      { id: 'a', position: { x: 10, y: 10 }, size: { width: 50, height: 50 } },
      { id: 'b', position: { x: 30, y: 30 }, size: { width: 50, height: 50 } }, // overlaps a
      { id: 'c', position: { x: 200, y: 200 }, size: { width: 50, height: 50 } },
    ];

    test('returns topmost concept at point (last in array wins)', () => {
      const result = findConceptAtPoint(concepts, 40, 40); // overlaps both a and b
      expect(result).toBeDefined();
      expect(result.id).toBe('b'); // b is last in array, should be topmost
    });

    test('returns concept when point is inside', () => {
      const result = findConceptAtPoint(concepts, 20, 20);
      expect(result).toBeDefined();
      expect(result.id).toBe('a');
    });

    test('returns undefined when no concept at point', () => {
      const result = findConceptAtPoint(concepts, 500, 500);
      expect(result).toBeUndefined();
    });

    test('handles concepts without size', () => {
      const conceptsNoSize = [
        { id: 'x', position: { x: 10, y: 10 } },
      ];
      const result = findConceptAtPoint(conceptsNoSize, 15, 15);
      expect(result).toBeDefined();
      expect(result.id).toBe('x');
    });

    test('handles empty array', () => {
      const result = findConceptAtPoint([], 10, 10);
      expect(result).toBeUndefined();
    });
  });

  describe('snapToGrid', () => {
    test('snaps to nearest grid point', () => {
      expect(snapToGrid(12, 20)).toBe(20);
      expect(snapToGrid(28, 20)).toBe(20);
      expect(snapToGrid(35, 20)).toBe(40);
      expect(snapToGrid(-5, 20) === 0).toBe(true);
    });

    test('handles default grid size of 20', () => {
      expect(snapToGrid(15)).toBe(20);
      expect(snapToGrid(25)).toBe(20);
    });

    test('handles custom grid size', () => {
      expect(snapToGrid(12, 10)).toBe(10);
      expect(snapToGrid(17, 10)).toBe(20);
      expect(snapToGrid(50, 50)).toBe(50);
    });

    test('handles zero and negative', () => {
      expect(snapToGrid(0, 20) === 0).toBe(true);
      expect(snapToGrid(-10, 20) === 0).toBe(true);
      expect(snapToGrid(-15, 20)).toBe(-20);
    });
  });

  describe('Component structure', () => {
    test('exports default component', () => {
      expect(boardSource).toMatch(/export default function ConceptVisualizationBoard/);
    });

    test('accepts required props', () => {
      expect(boardSource).toMatch(/concepts = \[\]/);
      expect(boardSource).toMatch(/connections = \[\]/);
      expect(boardSource).toMatch(/onConceptAdd/);
      expect(boardSource).toMatch(/onConceptUpdate/);
      expect(boardSource).toMatch(/onConceptDelete/);
      expect(boardSource).toMatch(/onConnectionAdd/);
      expect(boardSource).toMatch(/onConnectionDelete/);
    });

    test('has no react-dnd imports', () => {
      expect(boardSource).not.toMatch(/react-dnd/);
      expect(boardSource).not.toMatch(/react-dnd-html5-backend/);
      expect(boardSource).not.toMatch(/DndProvider/);
      expect(boardSource).not.toMatch(/useDrag/);
      expect(boardSource).not.toMatch(/useDrop/);
      expect(boardSource).not.toMatch(/HTML5Backend/);
      expect(boardSource).not.toMatch(/ItemTypes/);
    });

    test('uses native pointer events', () => {
      expect(boardSource).toMatch(/onPointerDown/);
      expect(boardSource).toMatch(/handlePointerMove/);
      expect(boardSource).toMatch(/handlePointerUp/);
      expect(boardSource).toMatch(/pointermove/);
      expect(boardSource).toMatch(/pointerup/);
    });

    test('has keyboard navigation', () => {
      expect(boardSource).toMatch(/handleKeyDown/);
      expect(boardSource).toMatch(/ArrowLeft|ArrowRight|ArrowUp|ArrowDown/);
      expect(boardSource).toMatch(/tabIndex/);
      expect(boardSource).toMatch(/aria-label/);
      expect(boardSource).toMatch(/role="button"|role="application"|role="dialog"/);
    });

    test('uses global CSS classes', () => {
      expect(boardSource).toMatch(/tech-card/);
      expect(boardSource).toMatch(/hud-bracket/);
      expect(boardSource).toMatch(/cmd-btn/);
      expect(boardSource).toMatch(/section-title/);
      expect(boardSource).toMatch(/status-strip/);
    });

    test('has accessibility attributes', () => {
      expect(boardSource).toMatch(/aria-label/);
      expect(boardSource).toMatch(/aria-selected/);
      expect(boardSource).toMatch(/aria-pressed/);
      expect(boardSource).toMatch(/aria-modal/);
      expect(boardSource).toMatch(/aria-roledescription/);
    });

    test('no document.querySelector styling', () => {
      expect(boardSource).not.toMatch(/document\.querySelector/);
      expect(boardSource).not.toMatch(/Object\.assign.*style/);
    });

    test('renders connection lines and concept nodes', () => {
      expect(boardSource).toMatch(/ConnectionLine/);
      expect(boardSource).toMatch(/ConceptNode/);
      expect(boardSource).toMatch(/AddConceptZone/);
      expect(boardSource).toMatch(/ConceptPropertiesPanel/);
    });
  });
});