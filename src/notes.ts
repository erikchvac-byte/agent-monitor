import * as fs from 'fs';
import * as path from 'path';
import { Activity } from './types.js';

export class NoteWriter {
  private notesFile: string;

  constructor(notesFile: string = 'progress-notes.txt') {
    this.notesFile = path.resolve(notesFile);
  }

  /**
   * Write a note to the notes file with auto-tagging
   */
  async writeNote(note: string, activeAgents: string[]): Promise<void> {
    const timestamp = new Date().toISOString();
    const formattedTimestamp = this.formatTimestamp(timestamp);
    
    // Format: [YYYY-MM-DD HH:MM:SS] [Agent: agent1, agent2] Note text
    const agentTag = activeAgents.length > 0 
      ? `[Agent: ${activeAgents.join(', ')}]` 
      : '[Agent: none]';
    
    const line = `${formattedTimestamp} ${agentTag} ${note}\n`;
    
    await fs.promises.appendFile(this.notesFile, line, 'utf-8');
  }

  /**
   * Get active agents from recent activities
   */
  getActiveAgents(activities: Activity[], withinSeconds: number = 10): string[] {
    const now = Date.now();
    const cutoff = now - (withinSeconds * 1000);
    
    const recentActivities = activities.filter(a => {
      const activityTime = new Date(a.timestamp).getTime();
      return activityTime >= cutoff;
    });

    // Get unique agent names
    const agents = new Set(recentActivities.map(a => a.agent));
    return Array.from(agents);
  }

  /**
   * Format ISO timestamp to readable format
   */
  private formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
  }
}
