/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * Time Conversion Tools
 *
 * Provides utility tools for converting between ISO8601 date strings
 * and Unix timestamps. These tools operate locally without requiring
 * ClickUp services and return human-friendly summaries.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../logger.js';
import { sponsorService } from '../utils/sponsor-service.js';

// Dedicated logger for time conversion tools
const logger = new Logger('TimeTools');

/**
 * Tool definition for converting ISO8601 strings to Unix timestamps.
 */
export const convertToTimestampTool: Tool = {
  name: 'convert_to_timestamp',
  description: 'Converts an ISO8601 date time string to a Unix timestamp (seconds since the Unix epoch).',
  inputSchema: {
    type: 'object',
    properties: {
      iso8601: {
        type: 'string',
        description: 'ISO8601 date time string (e.g., 2024-01-20T15:00:00Z).'
      }
    },
    required: ['iso8601']
  }
};

/**
 * Tool definition for converting Unix timestamps into ISO8601 strings.
 */
export const convertToDateTool: Tool = {
  name: 'convert_to_date',
  description: 'Converts a Unix timestamp (seconds or milliseconds) to an ISO8601 date time string.',
  inputSchema: {
    type: 'object',
    properties: {
      timestamp: {
        oneOf: [
          { type: 'number' },
          { type: 'string' }
        ],
        description: 'Unix timestamp in seconds (preferred) or milliseconds. Strings will be parsed as numbers.'
      }
    },
    required: ['timestamp']
  }
};

/**
 * Handler for convert_to_timestamp.
 */
export async function handleConvertToTimestamp(params: unknown) {
  const { iso8601 } = (params ?? {}) as { iso8601?: unknown };

  if (typeof iso8601 !== 'string' || iso8601.trim().length === 0) {
    const response = sponsorService.createErrorResponse('iso8601 parameter must be a non-empty string.');
    return { ...response, isError: true };
  }

  try {
    const date = new Date(iso8601);

    if (Number.isNaN(date.getTime())) {
      const response = sponsorService.createErrorResponse(`"${iso8601}" is not a valid ISO8601 date time string.`);
      return { ...response, isError: true };
    }

    const unixTimestamp = Math.floor(date.getTime() / 1000);
    const message = `Unix Timestamp: ${unixTimestamp}

Original ISO8601: ${iso8601}
Parsed as (UTC): ${date.toUTCString()}
Parsed as (local): ${date.toString()}`;

    logger.info('Converted ISO8601 to Unix timestamp', { iso8601, unixTimestamp });
    return sponsorService.createResponse(message);
  } catch (error: any) {
    logger.error('Failed to convert ISO8601 to Unix timestamp', { iso8601, error: error?.message });
    const response = sponsorService.createErrorResponse(`Error converting ISO8601 to Unix timestamp: ${error instanceof Error ? error.message : String(error)}`);
    return { ...response, isError: true };
  }
}

/**
 * Handler for convert_to_date.
 */
export async function handleConvertToDate(params: unknown) {
  const { timestamp } = (params ?? {}) as { timestamp?: unknown };

  let numericTimestamp: number | null = null;

  if (typeof timestamp === 'number') {
    numericTimestamp = timestamp;
  } else if (typeof timestamp === 'string' && timestamp.trim().length > 0) {
    const parsed = Number(timestamp);
    numericTimestamp = Number.isFinite(parsed) ? parsed : null;
  }

  if (numericTimestamp === null) {
    const response = sponsorService.createErrorResponse('timestamp parameter must be a number or numeric string.');
    return { ...response, isError: true };
  }

  try {
    const isMilliseconds = Math.abs(numericTimestamp) >= 1_000_000_000_000;
    const timestampMs = isMilliseconds ? numericTimestamp : numericTimestamp * 1000;
    const date = new Date(timestampMs);

    if (Number.isNaN(date.getTime())) {
      const response = sponsorService.createErrorResponse(`"${timestamp}" is not a valid Unix timestamp.`);
      return { ...response, isError: true };
    }

    const iso8601 = date.toISOString();
    const message = `ISO8601: ${iso8601}

Original timestamp: ${timestamp}
Interpreted as: ${isMilliseconds ? 'milliseconds' : 'seconds'}
Parsed as (UTC): ${date.toUTCString()}
Parsed as (local): ${date.toString()}`;

    logger.info('Converted Unix timestamp to ISO8601', { timestamp, iso8601, isMilliseconds });
    return sponsorService.createResponse(message);
  } catch (error: any) {
    logger.error('Failed to convert Unix timestamp to ISO8601', { timestamp, error: error?.message });
    const response = sponsorService.createErrorResponse(`Error converting Unix timestamp to ISO8601: ${error instanceof Error ? error.message : String(error)}`);
    return { ...response, isError: true };
  }
}
