import React from 'react';
import { Box, Text } from 'ink';

interface FooterProps {
  activityCount: number;
  maxActivities: number;
}

export const Footer: React.FC<FooterProps> = ({ activityCount, maxActivities }) => {
  return (
    <Box borderStyle="single" padding={1} marginTop={1}>
      <Text dimColor>
        [N] Take Note | [Q] Quit | [?] Help | Activities: {activityCount}/{maxActivities}
      </Text>
    </Box>
  );
};
