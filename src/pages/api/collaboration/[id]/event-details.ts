import { NextApiRequest, NextApiResponse } from 'next';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { Collaboration, EventDetails } from '@/data/collaboration';

type ResponseData = {
  success: boolean;
  data?: Collaboration;
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

  if (req.method !== 'POST' && req.method !== 'PUT') {
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
        error: 'Event details can only be updated for event-type collaborations',
      });
    }

    const { eventDetails } = req.body as { eventDetails: EventDetails };

    if (!eventDetails) {
      return res.status(400).json({
        success: false,
        error: 'Missing eventDetails in request body',
      });
    }

    // Validate eventDetails structure
    if (
      typeof eventDetails.eventTitle !== 'string' ||
      typeof eventDetails.date !== 'string' ||
      typeof eventDetails.time !== 'string' ||
      typeof eventDetails.location !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid eventDetails structure. Required fields: eventTitle, date, time, location',
      });
    }

    // Merge new event details with existing ones to preserve fields like externalEventId, publishedAt
    const existingEventDetails = collaboration.eventDetails || {};
    const mergedEventDetails = {
      ...existingEventDetails,
      ...eventDetails,
    };

    // Update the collaboration with merged event details
    const updatedCollaboration = await updateCollaboration(id, {
      eventDetails: mergedEventDetails,
    });

    if (!updatedCollaboration) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update collaboration',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCollaboration,
    });
  } catch (error) {
    console.error('Error updating event details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update event details',
    });
  }
}
