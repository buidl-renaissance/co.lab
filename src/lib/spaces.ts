import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// DigitalOcean Spaces configuration
const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'nyc3.digitaloceanspaces.com';
const spacesRegion = process.env.DO_SPACES_REGION || 'nyc3';
const spacesBucket = process.env.DO_SPACES_BUCKET || '';
const spacesKey = process.env.DO_SPACES_KEY || '';
const spacesSecret = process.env.DO_SPACES_SECRET || '';

// Validate endpoint format
const isValidEndpoint = spacesEndpoint && spacesEndpoint.includes('.') && !spacesEndpoint.includes('://');

// Initialize S3-compatible client for DigitalOcean Spaces
export const spacesClient = new S3Client({
  endpoint: isValidEndpoint ? `https://${spacesEndpoint}` : 'https://nyc3.digitaloceanspaces.com',
  region: spacesRegion,
  credentials: {
    accessKeyId: spacesKey,
    secretAccessKey: spacesSecret,
  },
  forcePathStyle: false,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param file - Buffer of the file to upload
 * @param fileName - Name of the file (will be used as the key)
 * @param contentType - MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToSpaces(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  if (!spacesBucket || !spacesKey || !spacesSecret) {
    console.error('Missing Spaces config:', { 
      hasBucket: !!spacesBucket, 
      hasKey: !!spacesKey, 
      hasSecret: !!spacesSecret,
      endpoint: spacesEndpoint,
    });
    return {
      success: false,
      error: 'DigitalOcean Spaces is not configured. Please set DO_SPACES_BUCKET, DO_SPACES_KEY, and DO_SPACES_SECRET environment variables.',
    };
  }
  
  if (!isValidEndpoint) {
    console.error('Invalid Spaces endpoint:', spacesEndpoint);
    return {
      success: false,
      error: `Invalid DigitalOcean Spaces endpoint: ${spacesEndpoint}. Expected format: region.digitaloceanspaces.com`,
    };
  }

  try {
    // Generate a unique key with timestamp
    const timestamp = Date.now();
    const key = `flyers/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: spacesBucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await spacesClient.send(command);

    // Construct the public URL
    // DigitalOcean Spaces URLs follow the pattern: https://{bucket}.{region}.digitaloceanspaces.com/{key}
    const url = `https://${spacesBucket}.${spacesRegion}.digitaloceanspaces.com/${key}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error('Error uploading to DigitalOcean Spaces:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Validate that a file is an image and within size limits
 * @param contentType - MIME type of the file
 * @param size - Size of the file in bytes
 * @returns Validation result
 */
export function validateImageUpload(
  contentType: string,
  size: number
): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(contentType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
    };
  }

  if (size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}
