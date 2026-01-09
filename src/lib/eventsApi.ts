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
  imageBase64?: string
): ExternalEventPayload {
  // Parse date and time into ISO format
  const startDateTime = parseDateTime(eventDetails.date, eventDetails.time);
  const endDateTime = eventDetails.endTime 
    ? parseDateTime(eventDetails.date, eventDetails.endTime)
    : new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000); // Default 4 hours duration

  // Build the payload - always submit as renaissance event type
  const payload: ExternalEventPayload = {
    imageBase64,
    name: eventDetails.eventTitle,
    location: eventDetails.location,
    startTime: startDateTime.toISOString(),
    endTime: endDateTime.toISOString(),
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
        ? parseDateTime(eventDetails.date, activity.startTime).toISOString()
        : startDateTime.toISOString(),
      endTime: activity.endTime
        ? parseDateTime(eventDetails.date, activity.endTime).toISOString()
        : endDateTime.toISOString(),
      location: activity.location || eventDetails.location,
      capacity: activity.capacity,
    }));
  }

  return payload;
}

/**
 * Parse date and time strings into a Date object
 */
function parseDateTime(dateStr: string, timeStr: string): Date {
  // Handle various date formats
  let date: Date;
  
  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    date = new Date(dateStr);
  } else {
    // Try to parse other formats
    date = new Date(dateStr);
  }

  // Parse time
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const period = timeMatch[3]?.toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, minutes, 0, 0);
    }
  }

  return date;
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
