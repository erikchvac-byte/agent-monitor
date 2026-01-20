import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { LogTailer } from './logTailer.js';
import { NoteWriter } from './notes.js';
import { Activity } from './types.js';
import { Header } from './components/Header.js';
import { ActivityFeed } from './components/ActivityFeed.js';
import { NoteInput } from './components/NoteInput.js';
import { Footer } from './components/Footer.js';
import { logger } from './logger.js';

export const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Starting monitor...');
  const [error, setError] = useState<string | null>(null);
  const { exit } = useApp();

  const logTailerRef = useRef<LogTailer | null>(null);
  const noteWriterRef = useRef<NoteWriter | null>(null);

  const MAX_ACTIVITIES = 50;

  useEffect(() => {
    // Initialize singletons
    if (!logTailerRef.current) {
      logTailerRef.current = new LogTailer();
    }
    if (!noteWriterRef.current) {
      noteWriterRef.current = new NoteWriter();
    }

    const logTailer = logTailerRef.current;

    const startTailer = async () => {
      try {
        logger.info('Starting Agent Monitor');

        await logTailer.start(activity => {
          setActivities(prev => [...prev, activity].slice(-MAX_ACTIVITIES));
        });

        // Load initial activities
        const initial = logTailer.getActivities();
        setActivities(initial);
        setStatusMessage('Monitoring active');
        logger.info('Monitor started successfully', { initialActivities: initial.length });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setStatusMessage(`Error: ${errorMsg}`);
        setError(errorMsg);
        logger.error('Failed to start monitor', { error: errorMsg });
      }
    };

    startTailer();

    return () => {
      logger.info('Shutting down monitor');
      logTailer.stop();
    };
  }, []);

  useInput(async (input, key) => {
    if (noteMode) {
      // In note mode
      if (key.return) {
        try {
          // Save note
          const noteWriter = noteWriterRef.current;
          if (noteWriter) {
            const activeAgents = noteWriter.getActiveAgents(activities);
            await noteWriter.writeNote(noteText, activeAgents);
            const preview = noteText.substring(0, 40);
            setStatusMessage(`Note saved: "${preview}${noteText.length > 40 ? '...' : ''}"`);
            logger.info('Note saved', { noteLength: noteText.length, agents: activeAgents });
          }
          setNoteText('');
          setNoteMode(false);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          setStatusMessage(`Failed to save note: ${errorMsg}`);
          logger.error('Failed to save note', { error: errorMsg });
        }
      } else if (key.escape) {
        // Cancel note
        setNoteText('');
        setNoteMode(false);
        setStatusMessage('Note cancelled');
        logger.debug('Note cancelled');
      } else if (key.backspace || key.delete) {
        // Delete character
        setNoteText(prev => prev.slice(0, -1));
      } else if (!key.ctrl && !key.meta && input) {
        // Add character
        setNoteText(prev => prev + input);
      }
    } else {
      // Normal mode
      if (input === 'n' || input === 'N') {
        setNoteMode(true);
        setNoteText('');
        setStatusMessage('Type your note (Enter to save, Esc to cancel)');
        logger.debug('Note mode activated');
      } else if (input === 'q' || input === 'Q') {
        logger.info('User requested exit');
        exit();
      } else if (input === '?') {
        setStatusMessage('[N] Note | [Q] Quit | [?] Help');
      }
    }
  });

  // Error state rendering
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box borderStyle="round" borderColor="red" padding={1} marginBottom={1}>
          <Text bold color="red">
            ERROR: {error}
          </Text>
        </Box>
        <Box padding={1}>
          <Text>
            Please check:
            {'\n'}• Log directory exists: ../Agents/logs/conversation_logs
            {'\n'}• You have read permissions
            {'\n'}• Agents are running and generating logs
            {'\n\n'}Press Q to quit
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Header statusMessage={statusMessage} />
      <ActivityFeed activities={activities} maxDisplay={15} />
      {noteMode && <NoteInput noteText={noteText} />}
      {!noteMode && <Footer activityCount={activities.length} maxActivities={MAX_ACTIVITIES} />}
    </Box>
  );
};
