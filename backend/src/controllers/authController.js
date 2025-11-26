import User from '../models/User.js';
import SystemEvent from '../models/SystemEvent.js';
import { sendTokenResponse } from '../middleware/auth.js';

// @desc    Register new user (Patient or Doctor)
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, licenseId, specialization, hospitalAffiliation, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Validate role
    if (!['PATIENT', 'DOCTOR'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be PATIENT or DOCTOR'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate doctor-specific fields
    if (role === 'DOCTOR' && !licenseId) {
      return res.status(400).json({
        success: false,
        message: 'License ID is required for doctors'
      });
    }

    // Check if license ID already exists (for doctors)
    if (role === 'DOCTOR' && licenseId) {
      const existingDoctor = await User.findOne({ licenseId });
      if (existingDoctor) {
        return res.status(400).json({
          success: false,
          message: 'Doctor with this license ID already exists'
        });
      }
    }

    // Create user object
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role
    };

    // Add role-specific fields
    if (role === 'PATIENT') {
      if (age) userData.age = age;
      if (gender) userData.gender = gender;
    } else if (role === 'DOCTOR') {
      userData.licenseId = licenseId;
      if (specialization) userData.specialization = specialization;
      if (hospitalAffiliation) userData.hospitalAffiliation = hospitalAffiliation;
    }

    if (phoneNumber) userData.phoneNumber = phoneNumber;

    // Create user
    const user = await User.create(userData);

    // Log system event
    await SystemEvent.createEvent({
      type: 'USER_REGISTER',
      title: 'New User Registered',
      description: `${name} registered as ${role}`,
      userId: user._id,
      userName: name,
      userRole: role,
      category: 'AUTHENTICATION',
      status: 'SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send token response
    sendTokenResponse(user, 201, res, 'User registered successfully');

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user account',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Validate role if provided
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Invalid credentials for ${role} login`
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Log system event
    await SystemEvent.logAuth(
      user._id,
      user.name,
      user.role,
      'login',
      req.ip,
      req.get('user-agent')
    );

    // Send token response
    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Log system event
    if (req.user) {
      await SystemEvent.logAuth(
        req.user._id,
        req.user.name,
        req.user.role,
        'logout',
        req.ip,
        req.get('user-agent')
      );
    }

    res.status(200)
      .cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      })
      .json({
        success: true,
        message: 'Logged out successfully'
      });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phoneNumber', 'age', 'gender', 'specialization', 'hospitalAffiliation', 'address'];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Send token response (new token after password change)
    sendTokenResponse(user, 200, res, 'Password changed successfully');

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Verify email (placeholder for future implementation)
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // TODO: Implement email verification logic

    res.status(200).json({
      success: true,
      message: 'Email verification feature coming soon'
    });

  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};
