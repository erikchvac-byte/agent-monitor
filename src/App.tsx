import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import chalk from 'chalk';
import { LogTailer } from './logTailer.js';
import { NoteWriter } from './notes.js';
import { Activity, getAgentColor } from './types.js';

export const App: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Starting monitor...');
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
        await logTailer.start(activity => {
          setActivities(prev => [...prev, activity].slice(-MAX_ACTIVITIES));
        });

        // Load initial activities
        const initial = logTailer.getActivities();
        setActivities(initial);
        setStatusMessage('Monitoring active');
      } catch (error) {
        setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    startTailer();

    return () => {
      logTailer.stop();
    };
  }, []);

  useInput(async (input, key) => {
    if (noteMode) {
      // In note mode
      if (key.return) {
        // Save note
        const noteWriter = noteWriterRef.current;
        if (noteWriter) {
          const activeAgents = noteWriter.getActiveAgents(activities);
          await noteWriter.writeNote(noteText, activeAgents);
          setStatusMessage(`Note saved: "${noteText.substring(0, 40)}..."`);
        }
        setNoteText('');
        setNoteMode(false);
      } else if (key.escape) {
        // Cancel note
        setNoteText('');
        setNoteMode(false);
        setStatusMessage('Note cancelled');
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
      } else if (input === 'q' || input === 'Q') {
        exit();
      } else if (input === '?') {
        setStatusMessage('[N] Note | [Q] Quit | [?] Help');
      }
    }
  });

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatAction = (action: string): string => {
    // Convert action names to human-readable format
    const actionMap: Record<string, string> = {
      execute_task: 'Executing',
      route_task: 'Routing',
      analyze_task_complexity: 'Analyzing',
      review_code: 'Reviewing',
      repair_code: 'Repairing',
      analyze_error: 'Debugging',
      document_code: 'Documenting',
      generate_report: 'Reporting',
    };
    return actionMap[action] || action;
  };

  const getStatusIcon = (status: string): string => {
    return status === 'success' ? '✓' : '✗';
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
        <Text bold>
          {chalk.cyan('AGENT MONITOR')} - {statusMessage}
        </Text>
      </Box>

      {/* Activity Feed */}
      <Box flexDirection="column" height={activities.length + 2} marginBottom={1}>
        {activities.length === 0 ? (
          <Text dimColor>Waiting for agent activity...</Text>
        ) : (
          activities.slice(-15).map((activity, idx) => {
            // Displays last 15 activities with newest at the bottom (oldest → newest)
            // This matches typical log reading pattern where newest events appear last
            const color = getAgentColor(activity.agent);
            const icon = getStatusIcon(activity.status);
            const time = formatTimestamp(activity.timestamp);
            const actionText = formatAction(activity.action);
            const durationText = `(${activity.duration_ms}ms)`;
            const uniqueKey = `${activity.timestamp}-${activity.agent}-${idx}`;

            return (
              <Box key={uniqueKey} gap={1}>
                <Text dimColor>{time}</Text>
                <Text color={color}>[{activity.agent}]</Text>
                <Text color={activity.status === 'failure' ? 'red' : 'white'}>
                  {icon} {actionText}
                </Text>
                <Text dimColor>{durationText}</Text>
                {activity.error && (
                  <Text color="red" bold>
                    ERROR: {activity.error}
                  </Text>
                )}
              </Box>
            );
          })
        )}
      </Box>

      {/* Note Input Overlay */}
      {noteMode && (
        <Box borderStyle="round" borderColor="yellow" padding={1} marginTop={1}>
          <Box flexDirection="column">
            <Text>
              <Text color="yellow">NOTE:</Text> {noteText}_
            </Text>
            <Text dimColor>[Enter] Save | [Esc] Cancel</Text>
          </Box>
        </Box>
      )}

      {/* Footer */}
      {!noteMode && (
        <Box borderStyle="single" padding={1} marginTop={1}>
          <Text dimColor>
            [N] Take Note | [Q] Quit | [?] Help | Activities: {activities.length}/50
          </Text>
        </Box>
      )}
    </Box>
  );
};
