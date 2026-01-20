import { NoteWriter } from '../notes.js';
import * as fs from 'fs';
import { Activity } from '../types.js';
import * as path from 'path';

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');
  return {
    __esModule: true,
    ...originalModule,
    promises: {
      ...originalModule.promises,
      appendFile: jest.fn().mockResolvedValue(undefined),
    },
  };
});

describe('NoteWriter', () => {
  let noteWriter: NoteWriter;
  const testNotesFile = 'test-notes.txt';
  const resolvedTestNotesFile = path.resolve(testNotesFile);

  beforeEach(() => {
    noteWriter = new NoteWriter(testNotesFile);
    (fs.promises.appendFile as jest.Mock).mockClear();
  });

  describe('constructor', () => {
    it('should initialize with default notes file', () => {
      const defaultWriter = new NoteWriter();
      expect(defaultWriter).toBeInstanceOf(NoteWriter);
    });
  });

  describe('writeNote', () => {
    it('should write a note with timestamp and agent tags', async () => {
      const note = 'Test observation';
      const activeAgents = ['Router', 'Specialist'];

      await noteWriter.writeNote(note, activeAgents);

      expect(fs.promises.appendFile).toHaveBeenCalledWith(
        resolvedTestNotesFile,
        expect.stringContaining('[Agent: Router, Specialist]'),
        'utf-8'
      );
    });

    it('should write a note with no agent tag when no agents active', async () => {
      const note = 'Observation with no active agents';

      await noteWriter.writeNote(note, []);

      expect(fs.promises.appendFile).toHaveBeenCalledWith(
        resolvedTestNotesFile,
        expect.stringContaining('[Agent: none]'),
        'utf-8'
      );
    });

    it('should format timestamp correctly', async () => {
      const note = 'Test note';

      await noteWriter.writeNote(note, []);

      const call = (fs.promises.appendFile as jest.Mock).mock.calls[0][1] as string;
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('getActiveAgents', () => {
    const createActivity = (agent: string, secondsAgo: number): Activity => ({
      timestamp: new Date(Date.now() - secondsAgo * 1000).toISOString(),
      agent,
      action: 'test_action',
      status: 'success',
      duration_ms: 100,
    });

    it('should return agents active within default 10 seconds', () => {
      const activities: Activity[] = [
        createActivity('Router', 5),
        createActivity('Specialist', 8),
        createActivity('Coordinator', 15),
      ];

      const activeAgents = noteWriter.getActiveAgents(activities);

      expect(activeAgents).toContain('Router');
      expect(activeAgents).toContain('Specialist');
      expect(activeAgents).not.toContain('Coordinator');
    });

    it('should return unique agents only', () => {
      const activities: Activity[] = [
        createActivity('Router', 1),
        createActivity('Router', 2),
        createActivity('Router', 3),
      ];

      const activeAgents = noteWriter.getActiveAgents(activities);

      expect(activeAgents).toEqual(['Router']);
    });

    it('should respect custom time window', () => {
      const activities: Activity[] = [
        createActivity('Router', 5),
        createActivity('Specialist', 8),
        createActivity('Coordinator', 15),
      ];

      const activeAgents = noteWriter.getActiveAgents(activities, 10);

      expect(activeAgents).toContain('Router');
      expect(activeAgents).toContain('Specialist');
      expect(activeAgents).not.toContain('Coordinator');
    });

    it('should return empty array when no activities', () => {
      const activeAgents = noteWriter.getActiveAgents([]);
      expect(activeAgents).toEqual([]);
    });
  });
});
