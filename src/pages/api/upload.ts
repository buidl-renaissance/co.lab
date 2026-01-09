import { NextApiRequest, NextApiResponse } from 'next';
import { uploadToSpaces, validateImageUpload } from '@/lib/spaces';

// Disable Next.js body parsing to handle file uploads manually
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

type ResponseData = {
  success: boolean;
  url?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { file, fileName, contentType } = req.body;

    if (!file || !fileName || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: file, fileName, contentType',
      });
    }

    // Decode base64 file
    const fileBuffer = Buffer.from(file, 'base64');

    // Validate the upload
    const validation = validateImageUpload(contentType, fileBuffer.length);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // Upload to DigitalOcean Spaces
    const result = await uploadToSpaces(fileBuffer, fileName, contentType);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(200).json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload file',
    });
  }
}
