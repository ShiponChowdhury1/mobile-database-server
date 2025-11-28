import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiry time (10 minutes from now)
 */
export const generateOTPExpiry = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Generate reset password token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate reset token expiry (1 hour from now)
 */
export const generateResetTokenExpiry = (): Date => {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
};

/**
 * Verify if OTP is expired
 */
export const isOTPExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};
