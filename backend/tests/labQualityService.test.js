const { isQuarantined, getQuarantinedLabIds, getLabStatus, evaluateLabQuality, getRegistry } = require('../services/labQualityService');

describe('LabQualityService', () => {
  describe('isQuarantined', () => {
    it('returns true for known quarantined P0 labs', () => {
      expect(isQuarantined('122')).toBe(true);
      expect(isQuarantined('113')).toBe(true);
    });

    it('returns false for REF-001', () => {
      expect(isQuarantined('REF-001')).toBe(false);
    });

    it('returns false for REF-002', () => {
      expect(isQuarantined('REF-002')).toBe(false);
    });

    it('returns false for non-quarantined procedural labs', () => {
      expect(isQuarantined('1')).toBe(false);
      expect(isQuarantined('36')).toBe(false);
      expect(isQuarantined('156')).toBe(false);
    });

    it('handles string/number labId coercion', () => {
      // Lab 23 was remediated in Session 5.8 - no longer quarantined
      expect(isQuarantined(23)).toBe(false);
      expect(isQuarantined('23')).toBe(false);
      expect(isQuarantined('023')).toBe(false);
    });
  });

  describe('getQuarantinedLabIds', () => {
    it('returns all quarantined lab IDs (excluding remediated)', () => {
      const ids = getQuarantinedLabIds();
      // BROKEN labs: 113, 120, 121, 122, 125, 148, 208 = 7 total
      expect(ids.length).toBe(7);
      // Remediated labs should NOT be in the list
      expect(ids).not.toContain('23');
      expect(ids).not.toContain('81');
      expect(ids).not.toContain('83');
      expect(ids).not.toContain('103');
      expect(ids).not.toContain('112');
      expect(ids).not.toContain('124');
      expect(ids).not.toContain('126');
      expect(ids).not.toContain('176');
      expect(ids).not.toContain('229');
      expect(ids).not.toContain('241');
      expect(ids).not.toContain('242');
    });

    it('does not include REF-001 or REF-002', () => {
      const ids = getQuarantinedLabIds();
      expect(ids).not.toContain('REF-001');
      expect(ids).not.toContain('REF-002');
    });
  });

  describe('getLabStatus', () => {
    it('returns entry for Lab 23 with REMEDIATED status', () => {
      const status = getLabStatus('23');
      expect(status).not.toBeNull();
      // Lab 23 was remediated - status is now REMEDIATED
      expect(status.status).toBe('REMEDIATED');
      expect(status.severity).toBe('P0');
    });

    it('returns null for non-quarantined lab', () => {
      expect(getLabStatus('REF-001')).toBeNull();
      expect(getLabStatus('1')).toBeNull();
    });
  });

  describe('evaluateLabQuality', () => {
    it('marks remediated lab 23 as learner-safe', () => {
      // Lab 23 was remediated in Session 5.8 - no longer quarantined
      const result = evaluateLabQuality({ id: '23', title: 'SSH Hardening and Secure Access', category: 'SSH', level: 'basic', steps: [{ verification: { type: 'cli' } }] });
      expect(result.learnerSafe).toBe(true);
      expect(result.quarantined).toBe(false);
    });

    it('marks REF-001 as learner-safe (no critical reasons)', () => {
      const result = evaluateLabQuality({ id: 'REF-001', title: 'Test', category: 'Fundamentals', level: 'basic', steps: [{ verification: { type: 'ping' } }] });
      expect(result.learnerSafe).toBe(true);
      expect(result.quarantined).toBe(false);
    });

    it('warns about missing structured topology for legacy labs', () => {
      const result = evaluateLabQuality({ id: '1', title: 'Test', category: 'ICMP', level: 'basic', steps: [{ verification: { type: 'command' } }] });
      expect(result.learnerSafe).toBe(true);
      expect(result.warnings).toContain('Topology is not structured');
    });

    it('warns about missing initialState for legacy labs', () => {
      const result = evaluateLabQuality({ id: '1', title: 'Test', category: 'ICMP', level: 'basic', steps: [{ verification: { type: 'command' } }] });
      expect(result.warnings).toContain('Missing initialState');
    });

    it('does not auto-quarantine legacy-only deficiencies', () => {
      const result = evaluateLabQuality({ id: '1', title: 'Test', category: 'ICMP', level: 'basic', steps: [{ verification: { type: 'command' } }] });
      expect(result.quarantined).toBe(false);
      expect(result.learnerSafe).toBe(true);
    });
  });

  describe('getRegistry', () => {
    it('returns registry with version and quarantined array', () => {
      const reg = getRegistry();
      expect(reg.version).toBe(1);
      expect(Array.isArray(reg.quarantined)).toBe(true);
      expect(reg.quarantined.length).toBe(18);
    });
  });
});
