import { getAgentType, getAgentColor, AGENT_COLORS } from '../types.js';

describe('Agent Types', () => {
  describe('getAgentType', () => {
    it('should identify router agents', () => {
      expect(getAgentType('Router')).toBe('router');
      expect(getAgentType('my-router')).toBe('router');
    });

    it('should identify coordinator agents', () => {
      expect(getAgentType('Coordinator')).toBe('coordinator');
      expect(getAgentType('meta-coordinator')).toBe('coordinator');
    });

    it('should identify specialist agents', () => {
      expect(getAgentType('Specialist')).toBe('specialist');
      expect(getAgentType('ollama-specialist')).toBe('specialist');
    });

    it('should identify QA agents', () => {
      expect(getAgentType('Critic')).toBe('qa');
      expect(getAgentType('Repair')).toBe('qa');
      expect(getAgentType('DebugAgent')).toBe('qa');
    });

    it('should return unknown for unrecognized agents', () => {
      expect(getAgentType('UnknownAgent')).toBe('unknown');
      expect(getAgentType('RandomBot')).toBe('unknown');
    });
  });

  describe('getAgentColor', () => {
    it('should return blue for router and coordinator', () => {
      expect(getAgentColor('Router')).toBe(AGENT_COLORS.router);
      expect(getAgentColor('Coordinator')).toBe(AGENT_COLORS.coordinator);
    });

    it('should return green for specialists', () => {
      expect(getAgentColor('Specialist')).toBe(AGENT_COLORS.specialist);
    });

    it('should return yellow for QA agents', () => {
      expect(getAgentColor('Critic')).toBe(AGENT_COLORS.qa);
      expect(getAgentColor('Repair')).toBe(AGENT_COLORS.qa);
    });

    it('should return gray for unknown agents', () => {
      expect(getAgentColor('Unknown')).toBe(AGENT_COLORS.unknown);
    });
  });
});
