import { ethers } from 'ethers';

/**
 * Time utility functions for ERC-7715 permission validation and DCA scheduling
 */

/**
 * Time period types for DCA scheduling
 */
export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

/**
 * Convert time period to seconds
 * 
 * @param period - Time period enum
 * @returns Number of seconds in the period
 */
export function timePeriodToSeconds(period: TimePeriod): number {
  switch (period) {
    case TimePeriod.DAILY:
      return 24 * 60 * 60; // 86400 seconds
    case TimePeriod.WEEKLY:
      return 7 * 24 * 60 * 60; // 604800 seconds
    case TimePeriod.MONTHLY:
      return 30 * 24 * 60 * 60; // 2592000 seconds (30 days)
    default:
      throw new Error(`Invalid time period: ${period}`);
  }
}

/**
 * Check if current time is within the allowed time window for a permission
 * 
 * @param lastResetTime - Timestamp of last allowance reset (in seconds)
 * @param timeWindow - Time window duration (in seconds)
 * @returns True if within time window
 */
export function checkTimeWindow(lastResetTime: bigint, timeWindow: bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  const nextResetTime = Number(lastResetTime) + Number(timeWindow);
  
  return now >= nextResetTime;
}

/**
 * Check if enough time has passed since last DCA execution
 * 
 * @param lastExecutionTime - Timestamp of last execution
 * @param period - DCA period
 * @returns True if ready for next execution
 */
export function isReadyForNextExecution(lastExecutionTime: number, period: TimePeriod): boolean {
  const now = Date.now() / 1000;
  const periodSeconds = timePeriodToSeconds(period);
  
  return (now - lastExecutionTime) >= periodSeconds;
}

/**
 * Calculate next execution time based on period
 * 
 * @param lastExecutionTime - Timestamp of last execution
 * @param period - DCA period
 * @returns Next execution timestamp
 */
export function calculateNextExecutionTime(lastExecutionTime: number, period: TimePeriod): number {
  const periodSeconds = timePeriodToSeconds(period);
  return lastExecutionTime + periodSeconds;
}

/**
 * Check if a DCA plan has expired
 * 
 * @param startTime - Plan start timestamp
 * @param duration - Plan duration in seconds
 * @returns True if plan has expired
 */
export function isPlanExpired(startTime: number, duration: number): boolean {
  const now = Date.now() / 1000;
  return (now - startTime) > duration;
}

/**
 * Get current timestamp in seconds
 * 
 * @returns Current Unix timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert days to seconds
 * 
 * @param days - Number of days
 * @returns Number of seconds
 */
export function daysToSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

/**
 * Convert seconds to human readable duration
 * 
 * @param seconds - Number of seconds
 * @returns Human readable string
 */
export function secondsToHumanReadable(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Check if allowance needs to be reset based on time window
 * 
 * @param lastResetTime - Last reset timestamp
 * @param timeWindow - Time window in seconds
 * @returns True if allowance should be reset
 */
export function shouldResetAllowance(lastResetTime: bigint, timeWindow: bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  const timeSinceReset = now - Number(lastResetTime);
  
  return timeSinceReset >= Number(timeWindow);
}

/**
 * Calculate time remaining until next reset
 * 
 * @param lastResetTime - Last reset timestamp
 * @param timeWindow - Time window in seconds
 * @returns Seconds until next reset
 */
export function timeUntilReset(lastResetTime: bigint, timeWindow: bigint): number {
  const now = Math.floor(Date.now() / 1000);
  const nextResetTime = Number(lastResetTime) + Number(timeWindow);
  
  return Math.max(0, nextResetTime - now);
}

/**
 * Parse duration string (e.g., "30d", "12h", "45m") to seconds
 * 
 * @param duration - Duration string
 * @returns Number of seconds
 */
export function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([dhm])$/);
  
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}. Use format like "30d", "12h", "45m"`);
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'd':
      return value * 24 * 60 * 60;
    case 'h':
      return value * 60 * 60;
    case 'm':
      return value * 60;
    default:
      throw new Error(`Invalid duration unit: ${unit}`);
  }
}

/**
 * Format timestamp to ISO string
 * 
 * @param timestamp - Unix timestamp in seconds
 * @returns ISO string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}