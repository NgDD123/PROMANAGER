import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function readEnv(name) {
  return String(process.env[name] || '').trim();
}

function getCloudinaryCredentials() {
  const cloud_name = readEnv('CLOUDINARY_CLOUD_NAME');
  const api_key = readEnv('CLOUDINARY_API_KEY');
  const api_secret = readEnv('CLOUDINARY_API_SECRET');

  if (!cloud_name || !api_key || !api_secret) {
    return null;
  }

  return { cloud_name, api_key, api_secret };
}

function ensureConfigured() {
  if (configured) return true;

  const creds = getCloudinaryCredentials();
  if (!creds) return false;

  cloudinary.config({
    cloud_name: creds.cloud_name,
    api_key: creds.api_key,
    api_secret: creds.api_secret,
    secure: true,
  });

  configured = true;
  return true;
}

export function isCloudinaryConfigured() {
  return ensureConfigured();
}

export function getCloudinaryConfigStatus() {
  const creds = getCloudinaryCredentials();
  if (ensureConfigured()) {
    return { configured: true, cloudName: creds.cloud_name };
  }

  return {
    configured: false,
    reason:
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env, then restart the backend server.',
  };
}

/**
 * Upload an image buffer to Cloudinary. Returns secure_url and public_id.
 */
export async function uploadImageBuffer(buffer, { folder = 'ngo-church-members', mimetype = 'image/jpeg' } = {}) {
  if (!ensureConfigured()) {
    const error = new Error(getCloudinaryConfigStatus().reason);
    error.statusCode = 503;
    throw error;
  }

  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
