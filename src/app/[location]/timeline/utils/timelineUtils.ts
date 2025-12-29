/**
 * Timeline utility functions for data transformation
 */

import { TimelineRow } from "../timelineListing.api";

/**
 * Get unique users from timeline data
 * Extracts unique user names and returns them sorted alphabetically
 */
export function getTimelineUsers(data: TimelineRow[]): string[] {
  const users = new Set(data.map(row => row.createdUser));
  return Array.from(users).sort();
}

