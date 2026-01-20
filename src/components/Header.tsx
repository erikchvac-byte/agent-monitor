import React from 'react';
import { Box, Text } from 'ink';
import chalk from 'chalk';

interface HeaderProps {
  statusMessage: string;
}

export const Header: React.FC<HeaderProps> = ({ statusMessage }) => {
  return (
    <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
      <Text bold>
        {chalk.cyan('AGENT MONITOR')} - {statusMessage}
      </Text>
    </Box>
  );
};
