/**
 * Core types for Agent Monitor
 */

export interface Activity {
  timestamp: string;
  agent: string;
  action: string;
  status: 'success' | 'failure';
  duration_ms: number;
  task?: string;
  error?: string;
}

export interface LogEntry {
  timestamp: string;
  agent: string;
  action: string;
  input?: any;
  output?: any;
  duration_ms: number;
  error?: string;
}

export type AgentType = 'router' | 'coordinator' | 'specialist' | 'qa' | 'unknown';

export interface AgentConfig {
  name: string;
  type: AgentType;
  color: string;
}

export const AGENT_COLORS: Record<AgentType, string> = {
  router: 'blue',
  coordinator: 'blue',
  specialist: 'green',
  qa: 'yellow',
  unknown: 'gray',
};

export const getAgentType = (agentName: string): AgentType => {
  const lower = agentName.toLowerCase();
  if (lower.includes('router')) return 'router';
  if (lower.includes('coordinator')) return 'coordinator';
  if (lower.includes('specialist')) return 'specialist';
  if (lower.includes('critic') || lower.includes('repair') || lower.includes('debug')) return 'qa';
  return 'unknown';
};

export const getAgentColor = (agentName: string): string => {
  const type = getAgentType(agentName);
  return AGENT_COLORS[type];
};
