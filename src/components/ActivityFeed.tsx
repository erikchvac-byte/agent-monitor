import React from 'react';
import { Box, Text } from 'ink';
import { Activity, getAgentColor } from '../types.js';

interface ActivityFeedProps {
  activities: Activity[];
  maxDisplay?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, maxDisplay = 15 }) => {
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatAction = (action: string): string => {
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

  if (activities.length === 0) {
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Text dimColor>Waiting for agent activity...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={activities.length + 2} marginBottom={1}>
      {activities.slice(-maxDisplay).map((activity, idx) => {
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
      })}
    </Box>
  );
};
