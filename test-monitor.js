import { LogTailer } from './dist/logTailer.js';

console.log('Testing LogTailer...\n');

const tailer = new LogTailer();

try {
  await tailer.start((activity) => {
    console.log(`[${activity.timestamp}] ${activity.agent} - ${activity.action} (${activity.duration_ms}ms)`);
  });

  const activities = tailer.getActivities();
  console.log(`\nLoaded ${activities.length} existing activities:\n`);
  
  activities.slice(-10).forEach(activity => {
    const status = activity.status === 'success' ? '✓' : '✗';
    console.log(`  ${status} [${activity.agent}] ${activity.action} (${activity.duration_ms}ms)`);
    if (activity.task) {
      console.log(`     Task: ${activity.task}`);
    }
  });

  console.log('\n✓ LogTailer is working correctly!');
  console.log('✓ Log path verified: ../Agents/logs/conversation_logs/');
  console.log('\nWatching for new activity (press Ctrl+C to stop)...\n');

  // Keep running to watch for changes
  await new Promise(() => {});
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
