const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const excelService = require('../services/excelService');
const config = require('../config/config');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admins = await excelService.getSheetData('Admin');
    const admin = admins.find(
      (a) => a.email && a.email.toLowerCase() === email.trim().toLowerCase() && a.status === 'Active'
    );

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      {
        admin_id: admin.admin_id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        admin_id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const admin = await excelService.findById('Admin', req.user.admin_id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.json({
      success: true,
      admin: {
        admin_id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (error) {
    console.error('[AUTH GET PROFILE ERROR]', error);
    return res.status(500).json({ success: false, message: 'Error retrieving profile' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const admin = await excelService.findById('Admin', req.user.admin_id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await excelService.update('Admin', req.user.admin_id, {
      password_hash: newHash
    });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('[AUTH UPDATE PASSWORD ERROR]', error);
    return res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

