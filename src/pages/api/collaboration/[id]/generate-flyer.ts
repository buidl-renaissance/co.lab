import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { getCollaborationById, updateCollaboration } from '@/db/collaboration';
import { uploadToSpaces } from '@/lib/spaces';
import { Collaboration } from '@/data/collaboration';
import fs from 'fs';
import path from 'path';

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

// Reference flyer image path
const REFERENCE_FLYER_PATH = path.join(process.cwd(), 'public', 'images', 'reference-flyer.jpg');

// Cache for the analyzed style description
let cachedStyleDescription: string | null = null;

/**
 * Analyze the reference flyer image using GPT-4 Vision to extract style guidance
 */
async function getStyleFromReferenceImage(): Promise<string> {
  // Return cached description if available
  if (cachedStyleDescription) {
    return cachedStyleDescription;
  }

  // Check if reference image exists
  if (!fs.existsSync(REFERENCE_FLYER_PATH)) {
    console.log('Reference flyer image not found, using default style');
    return getDefaultStyleDescription();
  }

  try {
    // Read the image and convert to base64
    const imageBuffer = fs.readFileSync(REFERENCE_FLYER_PATH);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg';

    // Use GPT-4 Vision to analyze the reference flyer
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this event flyer and describe its visual style in detail for recreating similar flyers. Focus on:
1. Color scheme (background, text colors)
2. Typography style (font weight, style, size hierarchy)
3. Layout structure (where elements are positioned)
4. Visual elements (any imagery, objects, textures)
5. Overall mood/aesthetic

Provide a concise but detailed style guide that could be used to generate similar flyers. Be specific about colors, fonts, and positioning.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const styleDescription = response.choices[0]?.message?.content || getDefaultStyleDescription();
    cachedStyleDescription = styleDescription;
    console.log('Analyzed reference flyer style:', styleDescription);
    return styleDescription;
  } catch (error) {
    console.error('Error analyzing reference image:', error);
    return getDefaultStyleDescription();
  }
}

/**
 * Default style description if reference image is not available
 */
function getDefaultStyleDescription(): string {
  return `Dark black textured background. Bold white/cream sans-serif typography (condensed, high-impact). 
Layout: Venue name small at top, event title HUGE and dominant in upper third, single striking central object/image, 
tagline medium below center, date/time at bottom. Minimalist with lots of negative space. High contrast. 
Professional nightclub/event promotional aesthetic.`;
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

    // Determine theme based on tags or event type
    // Note: style parameter from request body can be used for future customization
    void style;
    const themeKeywords = eventDetails.tags?.join(', ') || 'professional networking';
    
    // Get style guidance from reference image (analyzed via GPT-4 Vision)
    const referenceStyle = await getStyleFromReferenceImage();
    
    const prompt = `Create a FLAT event flyer graphic matching this EXACT reference style:

REFERENCE STYLE GUIDE (from analyzed reference image):
${referenceStyle}

EVENT DETAILS TO DISPLAY:
- VENUE/LOCATION: "${locationDisplay}"
- EVENT TITLE: "${eventTitle}"
- THEME/VIBE: ${themeKeywords}
- TAGLINE: "${tagline || 'Join us for an unforgettable experience'}"
- DATE & TIME: "${formattedDate}${timeDisplay ? ` • ${timeDisplay}` : ''}"

CRITICAL REQUIREMENTS:
- Match the reference style EXACTLY (colors, typography, layout, mood)
- Include ONE central striking visual element related to: ${themeKeywords}
- All text must be PERFECTLY SPELLED and CLEARLY READABLE
- This is a FLAT graphic - NOT a mockup, photo, or 3D render
- Portrait orientation, ready for social media
- Professional event promotional aesthetic`;

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
