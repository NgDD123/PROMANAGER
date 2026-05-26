import bcrypt from 'bcryptjs';
import { NGOUser } from '../../models/ngo/user.model.js';

export const getMyProfile = async (req, res) => {
  try {
    res.json({ success: true, data: NGOUser.toSafe(req.ngoUser) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, jobTitle } = req.body || {};
    if (!fullName?.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required' });
    }

    const user = await NGOUser.updateProfile(req.ngoUserId, {
      fullName: fullName.trim(),
      phone: phone?.trim() || '',
      jobTitle: jobTitle?.trim() || '',
    });

    res.json({ success: true, data: NGOUser.toSafe(user) });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
      });
    }

    const user = await NGOUser.getById(req.ngoUserId);
    if (!user?.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'Password is not set for this account. Contact your administrator.',
      });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await NGOUser.updatePasswordHash(req.ngoUserId, passwordHash);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};
