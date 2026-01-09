import { EventDetails } from '@/data/collaboration';

// External Events API configuration
const EVENTS_API_URL = process.env.EVENTS_API_URL || '';
const EVENTS_API_KEY = process.env.EVENTS_API_KEY || '';

export interface ExternalEventPayload {
  imageBase64?: string;
  name: string;
  location: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  tags?: string[];
  eventType?: 'standard' | 'renaissance';
  metadata?: Record<string, unknown>;
  sponsors?: Array<{
    name: string;
    logo?: string;
    websiteUrl?: string;
  }>;
  subEvents?: Array<{
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    capacity?: number;
  }>;
}

export interface ExternalEventResponse {
  id: number;
  name: string;
  location: string;
  startTime: string;
  endTime: string;
  tags?: string[];
  eventType?: string;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsApiResult {
  success: boolean;
  data?: ExternalEventResponse;
  error?: string;
}

/**
 * Convert EventDetails to external API payload format
 */
export function eventDetailsToPayload(
  eventDetails: EventDetails,
  imageBase64?: string,
  timezone: string = DEFAULT_TIMEZONE
): ExternalEventPayload {
  // Parse date and time into ISO format with timezone
  const startDateTime = parseDateTime(eventDetails.date, eventDetails.time, timezone);
  const endDateTime = eventDetails.endTime 
    ? parseDateTime(eventDetails.date, eventDetails.endTime, timezone)
    : new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours duration

  // Build the payload - always submit as renaissance event type
  const payload: ExternalEventPayload = {
    imageBase64,
    name: eventDetails.eventTitle,
    location: eventDetails.location,
    startTime: formatDateTimeWithTimezone(startDateTime, timezone),
    endTime: formatDateTimeWithTimezone(endDateTime, timezone),
    timezone, // Include timezone in payload
    tags: eventDetails.tags || [],
    eventType: 'renaissance', // Always submit as renaissance
    metadata: eventDetails.metadata || {},
  };

  // Include sponsors if available
  if (eventDetails.sponsors && eventDetails.sponsors.length > 0) {
    payload.sponsors = eventDetails.sponsors.map(sponsor => ({
      name: sponsor.name,
      logo: sponsor.logo,
      websiteUrl: sponsor.websiteUrl,
    }));
  }

  // Include activities/subEvents if available
  if (eventDetails.activities && eventDetails.activities.length > 0) {
    payload.subEvents = eventDetails.activities.map(activity => ({
      name: activity.name,
      description: activity.description,
      startTime: activity.startTime 
        ? formatDateTimeWithTimezone(parseDateTime(eventDetails.date, activity.startTime, timezone), timezone)
        : formatDateTimeWithTimezone(startDateTime, timezone),
      endTime: activity.endTime
        ? formatDateTimeWithTimezone(parseDateTime(eventDetails.date, activity.endTime, timezone), timezone)
        : formatDateTimeWithTimezone(endDateTime, timezone),
      location: activity.location || eventDetails.location,
      capacity: activity.capacity,
    }));
  }

  return payload;
}

// Default timezone offset for EST (Eastern Standard Time is UTC-5, EDT is UTC-4)
// Using America/New_York which handles DST automatically
const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Parse date and time strings into an ISO string with timezone
 * Defaults to EST/EDT (America/New_York)
 */
function parseDateTime(dateStr: string, timeStr: string, timezone: string = DEFAULT_TIMEZONE): Date {
  // Parse hours and minutes from time string
  let hours = 0;
  let minutes = 0;
  
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const period = timeMatch[3]?.toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    }
  }

  // Parse date components
  let year: number, month: number, day: number;
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // ISO format YYYY-MM-DD
    const parts = dateStr.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    day = parseInt(parts[2], 10);
  } else {
    // Try to parse other formats
    const parsed = new Date(dateStr);
    year = parsed.getFullYear();
    month = parsed.getMonth();
    day = parsed.getDate();
  }

  // Create date string in the target timezone
  // Format: YYYY-MM-DDTHH:mm:ss in the specified timezone
  const dateTimeStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  // Use Intl to get the timezone offset for the specific date
  const tempDate = new Date(dateTimeStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  });
  
  // Get timezone offset string (e.g., "GMT-5" or "GMT-4")
  const parts = formatter.formatToParts(tempDate);
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  const tzOffset = tzPart?.value || 'GMT-5';
  
  // Parse offset to get hours
  const offsetMatch = tzOffset.match(/GMT([+-])(\d+)/);
  let offsetHours = -5; // Default EST
  if (offsetMatch) {
    offsetHours = parseInt(offsetMatch[2], 10);
    if (offsetMatch[1] === '-') offsetHours = -offsetHours;
  }
  
  // Create the final date adjusted for timezone
  // We want to create a UTC date that represents the local time in the target timezone
  const utcDate = new Date(Date.UTC(year, month, day, hours - offsetHours, minutes, 0, 0));
  
  return utcDate;
}

/**
 * Format a date to ISO string with timezone indicator
 */
function formatDateTimeWithTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  // Get the ISO string and append timezone info
  const isoString = date.toISOString();
  
  // Get timezone abbreviation for the date
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(date);
  const tzAbbrev = parts.find(p => p.type === 'timeZoneName')?.value || 'EST';
  
  // Return ISO string (which is always UTC) - the receiving API should handle timezone
  // But we log the local interpretation for debugging
  console.log(`DateTime: ${isoString} (${tzAbbrev})`);
  
  return isoString;
}

/**
 * Create a new event in the external events API
 */
export async function createExternalEvent(
  payload: ExternalEventPayload
): Promise<EventsApiResult> {
  if (!EVENTS_API_URL) {
    return {
      success: false,
      error: 'Events API URL is not configured. Set EVENTS_API_URL environment variable.',
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (EVENTS_API_KEY) {
      headers['Authorization'] = `Bearer ${EVENTS_API_KEY}`;
    }

    const response = await fetch(`${EVENTS_API_URL}/api/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Failed to create event: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error creating external event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    };
  }
}

/**
 * Update an existing event in the external events API
 */
export async function updateExternalEvent(
  eventId: number,
  payload: Partial<ExternalEventPayload>
): Promise<EventsApiResult> {
  if (!EVENTS_API_URL) {
    return {
      success: false,
      error: 'Events API URL is not configured. Set EVENTS_API_URL environment variable.',
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (EVENTS_API_KEY) {
      headers['Authorization'] = `Bearer ${EVENTS_API_KEY}`;
    }

    const response = await fetch(`${EVENTS_API_URL}/api/events/${eventId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Failed to update event: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error updating external event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    };
  }
}

/**
 * Fetch image as base64 from URL
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image as base64:', error);
    return null;
  }
}
