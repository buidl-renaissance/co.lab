import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { uploadToSpaces } from '@/lib/spaces';
import { Collaboration } from '@/data/collaboration';

type ResponseData = {
  success: boolean;
  data?: Collaboration;
  flyerUrl?: string;
  error?: string;
};

// Lazy-initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

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
    // Get the collaboration
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
        error: 'Flyer generation is only available for event collaborations',
      });
    }

    const eventDetails = collaboration.eventDetails;
    if (!eventDetails || !eventDetails.eventTitle) {
      return res.status(400).json({
        success: false,
        error: 'Event details are required to generate a flyer. Please add an event title first.',
      });
    }

    // Optional style hint from request body
    const { style } = req.body || {};

    // Build a prompt for DALL-E based on event details
    const eventInfo = [
      eventDetails.eventTitle,
      eventDetails.date && `Date: ${eventDetails.date}`,
      eventDetails.time && `Time: ${eventDetails.time}`,
      eventDetails.location && `Location: ${eventDetails.location}`,
      eventDetails.tags?.length && `Theme: ${eventDetails.tags.join(', ')}`,
      eventDetails.metadata?.description && `Description: ${eventDetails.metadata.description}`,
    ].filter(Boolean).join('\n');

    const styleHint = style || 'modern, professional, eye-catching';
    
    const prompt = `Create a visually stunning event flyer/poster design for:

${eventInfo}

Style: ${styleHint}

Requirements:
- Clean, modern typography (do NOT include any text - just visual design elements)
- Eye-catching color scheme that matches the event theme
- Professional layout suitable for social media and print
- Include abstract decorative elements, patterns, or imagery that represent the event type
- Leave clear space in the center for text overlay
- Portrait orientation (3:4 aspect ratio)
- High contrast and visually striking

DO NOT include any text, letters, words, or numbers in the image - only visual design elements, patterns, and imagery.`;

    console.log('Generating flyer with prompt:', prompt);

    // Generate image with DALL-E
    const response = await getOpenAI().images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792', // Portrait for flyers
      quality: 'hd',
      style: 'vivid',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate image - no URL returned',
      });
    }

    // Download the image from OpenAI's temporary URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return res.status(500).json({
        success: false,
        error: 'Failed to download generated image',
      });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Upload to DigitalOcean Spaces
    const fileName = `flyer-${id}-${Date.now()}.png`;
    const uploadResult = await uploadToSpaces(imageBuffer, fileName, 'image/png');

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        error: uploadResult.error || 'Failed to upload flyer',
      });
    }

    // Update the collaboration with the new flyer URL
    const updatedCollaboration = await updateCollaboration(id, {
      eventDetails: {
        ...eventDetails,
        flyerUrl: uploadResult.url,
      },
    });

    if (!updatedCollaboration) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update collaboration with flyer URL',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCollaboration,
      flyerUrl: uploadResult.url,
    });
  } catch (error) {
    console.error('Error generating flyer:', error);
    
    // Check for specific errors
    if (error instanceof Error) {
      // DNS resolution errors (often from misconfigured endpoints)
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('DNS resolution error - check environment variables for endpoints');
        return res.status(500).json({
          success: false,
          error: 'Network configuration error. Please check server configuration.',
        });
      }
      if (error.message.includes('content_policy_violation')) {
        return res.status(400).json({
          success: false,
          error: 'The event details triggered a content policy violation. Please modify the event description.',
        });
      }
      if (error.message.includes('rate_limit')) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit reached. Please try again in a moment.',
        });
      }
      
      // Return the actual error message for debugging
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to generate flyer',
    });
  }
}
