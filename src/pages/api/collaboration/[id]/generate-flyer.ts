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

    // Format date for display
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    // Build the text content for the flyer
    const eventTitle = eventDetails.eventTitle.toUpperCase();
    const formattedDate = eventDetails.date ? formatDate(eventDetails.date) : '';
    const timeDisplay = eventDetails.time || '';
    const locationDisplay = eventDetails.location || '';
    const tagline = eventDetails.tags?.length 
      ? eventDetails.tags.slice(0, 3).join(' • ').toUpperCase()
      : '';

    const styleHint = style || 'modern, bold, professional';
    
    // Determine theme based on tags or event type
    const themeKeywords = eventDetails.tags?.join(', ') || 'professional networking';
    
    const prompt = `Create a FLAT, DIRECT event flyer graphic with the following EXACT text displayed prominently:

MAIN TITLE (large, bold, at top): "${eventTitle}"

${formattedDate ? `DATE: "${formattedDate}"` : ''}
${timeDisplay ? `TIME: "${timeDisplay}"` : ''}
${locationDisplay ? `LOCATION: "${locationDisplay}"` : ''}
${tagline ? `TAGLINE (smaller, decorative): "${tagline}"` : ''}

CRITICAL REQUIREMENTS:
- This must be a FLAT graphic design - NOT a mockup, NOT hanging from clips/ropes, NOT shown on a wall
- Direct front-facing flyer design only - as if viewing the actual printed flyer straight on
- No 3D perspective, no shadows suggesting depth, no physical presentation elements
- Style: ${styleHint}
- The event title "${eventTitle}" must be the largest, most prominent text
- Use clean, modern sans-serif typography that is clearly legible
- Eye-catching color scheme inspired by: ${themeKeywords}
- Professional layout suitable for social media and print
- Include decorative graphic elements, patterns, or imagery that represent the event theme
- Portrait orientation (3:4 aspect ratio)
- High contrast between text and background for readability
- The text must be spelled correctly and clearly readable
- Add visual hierarchy: title largest, then date/time/location, then tagline smallest

Output a clean, flat digital flyer graphic ready for immediate use - NOT a photo of a flyer.`;

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
