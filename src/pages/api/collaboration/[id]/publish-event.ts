import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { Collaboration } from '@/data/collaboration';
import {
  createExternalEvent,
  updateExternalEvent,
  eventDetailsToPayload,
  fetchImageAsBase64,
} from '@/lib/eventsApi';

type ResponseData = {
  success: boolean;
  data?: Collaboration;
  externalEventId?: number;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid collaboration ID',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get the existing collaboration
    const collaboration = await getCollaborationById(id);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found',
      });
    }

    // Verify this is an event collaboration
    if (collaboration.template.id !== 'event') {
      return res.status(400).json({
        success: false,
        error: 'Only event-type collaborations can be published',
      });
    }

    const eventDetails = collaboration.eventDetails;
    if (!eventDetails) {
      return res.status(400).json({
        success: false,
        error: 'Event details are required to publish',
      });
    }

    // Validate required fields
    if (!eventDetails.eventTitle || !eventDetails.date || !eventDetails.location) {
      return res.status(400).json({
        success: false,
        error: 'Event title, date, and location are required to publish',
      });
    }

    // Fetch flyer image as base64 if available
    let imageBase64: string | undefined;
    if (eventDetails.flyerUrl) {
      console.log('Fetching flyer image as base64:', eventDetails.flyerUrl);
      const base64 = await fetchImageAsBase64(eventDetails.flyerUrl);
      if (base64) {
        imageBase64 = base64;
        console.log('Flyer image fetched successfully, size:', base64.length);
      } else {
        console.log('Failed to fetch flyer image, continuing without it');
      }
    }

    // Convert to external API payload - use timezone from event details or default to EST
    const payload = eventDetailsToPayload(eventDetails, imageBase64, eventDetails.timezone || 'America/New_York');
    console.log('Event payload prepared:', { 
      name: payload.name, 
      location: payload.location,
      eventType: payload.eventType,
      hasImage: !!payload.imageBase64
    });

    let result;
    const existingEventId = eventDetails.externalEventId;
    const isUpdate = !!existingEventId;

    console.log(`Publishing event: ${isUpdate ? 'UPDATE' : 'CREATE'}`, { 
      existingEventId,
      collaborationId: id 
    });

    if (isUpdate) {
      // Update existing event
      result = await updateExternalEvent(existingEventId!, payload);
    } else {
      // Create new event
      result = await createExternalEvent(payload);
    }

    console.log('External API result:', { 
      success: result.success, 
      eventId: result.data?.id,
      error: result.error 
    });

    if (!result.success) {
      // Log the error but don't fail completely - save a note about the failure
      console.error('External API call failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to publish event',
      });
    }

    // Determine the event ID - use existing for updates, or new ID from create response
    const eventId = isUpdate ? existingEventId : result.data?.id;

    if (!eventId) {
      console.error('No event ID returned from API');
      return res.status(500).json({
        success: false,
        error: 'Failed to get event ID from API response',
      });
    }

    // Update collaboration with external event ID and publish timestamp
    const updatedEventDetails = {
      ...eventDetails,
      externalEventId: eventId,
      publishedAt: new Date().toISOString(),
    };

    console.log('Saving updated event details:', {
      externalEventId: updatedEventDetails.externalEventId,
      publishedAt: updatedEventDetails.publishedAt,
    });

    const updatedCollaboration = await updateCollaboration(id, {
      eventDetails: updatedEventDetails,
    });

    if (!updatedCollaboration) {
      console.error('Failed to update collaboration with event details');
      return res.status(500).json({
        success: false,
        error: 'Event published but failed to save to collaboration',
        externalEventId: eventId,
      });
    }

    console.log(`Event ${isUpdate ? 'updated' : 'created'} and saved successfully:`, { 
      eventId,
      savedExternalEventId: updatedCollaboration.eventDetails?.externalEventId,
      savedPublishedAt: updatedCollaboration.eventDetails?.publishedAt,
    });

    return res.status(200).json({
      success: true,
      data: updatedCollaboration,
      externalEventId: eventId,
    });
  } catch (error) {
    console.error('Error publishing event:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to publish event',
    });
  }
}
