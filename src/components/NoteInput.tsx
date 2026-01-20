import React from 'react';
import { Box, Text } from 'ink';

interface NoteInputProps {
  noteText: string;
}

export const NoteInput: React.FC<NoteInputProps> = ({ noteText }) => {
  return (
    <Box borderStyle="round" borderColor="yellow" padding={1} marginTop={1}>
      <Box flexDirection="column">
        <Text>
          <Text color="yellow">NOTE:</Text> {noteText}_
        </Text>
        <Text dimColor>[Enter] Save | [Esc] Cancel</Text>
      </Box>
    </Box>
  );
};
