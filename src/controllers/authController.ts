import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateTokens } from '../utils/jwt';
import { generateOTP, generateOTPExpiry, generateResetToken, generateResetTokenExpiry, isOTPExpired } from '../utils/otp';
import { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = generateOTPExpiry();

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
      role,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email with OTP.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens,
        otpSent: emailSent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user with OTP
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    if (!user.otp || !user.otpExpires) {
      res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
      return;
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpires)) {
      res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
      return;
    }

    // Verify OTP
    if (user.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Invalid OTP.'
      });
      return;
    }

    // Update user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'OTP verification failed.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: 'User is already verified.'
      });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = generateOTPExpiry();

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully.',
      data: {
        otpSent: emailSent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        },
        tokens
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Change password (requires current password)
 * POST /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    // Find user
    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Forgot password - send reset token
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal that user doesn't exist
      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.'
      });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpires = generateResetTokenExpiry();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email.',
      data: {
        emailSent,
        // In development, you might want to return the token
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, phone } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
