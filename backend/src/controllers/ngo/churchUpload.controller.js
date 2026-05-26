import { uploadImageBuffer, isCloudinaryConfigured, getCloudinaryConfigStatus } from '../../utils/cloudinary.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const uploadChurchMemberPhoto = async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        error: getCloudinaryConfigStatus().reason,
      });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, error: 'Photo file is required' });
    }

    if (!ALLOWED_TYPES.has(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Only JPEG, PNG, WebP, or GIF images are allowed',
      });
    }

    if (req.file.size > MAX_BYTES) {
      return res.status(400).json({ success: false, error: 'Image must be 5MB or smaller' });
    }

    const { url, publicId } = await uploadImageBuffer(req.file.buffer, {
      folder: `ngo-church/${req.organizationId || 'shared'}`,
      mimetype: req.file.mimetype,
    });

    res.json({
      success: true,
      data: { url, publicId },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};
