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
      const base64 = await fetchImageAsBase64(eventDetails.flyerUrl);
      if (base64) {
        imageBase64 = base64;
      }
    }

    // Convert to external API payload
    const payload = eventDetailsToPayload(eventDetails, imageBase64);

    let result;
    const isUpdate = !!eventDetails.externalEventId;

    if (isUpdate) {
      // Update existing event
      result = await updateExternalEvent(eventDetails.externalEventId!, payload);
    } else {
      // Create new event
      result = await createExternalEvent(payload);
    }

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to publish event',
      });
    }

    // Update collaboration with external event ID and publish timestamp
    const updatedEventDetails = {
      ...eventDetails,
      externalEventId: result.data?.id,
      publishedAt: new Date().toISOString(),
    };

    const updatedCollaboration = await updateCollaboration(id, {
      eventDetails: updatedEventDetails,
    });

    return res.status(200).json({
      success: true,
      data: updatedCollaboration || undefined,
      externalEventId: result.data?.id,
    });
  } catch (error) {
    console.error('Error publishing event:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to publish event',
    });
  }
}
