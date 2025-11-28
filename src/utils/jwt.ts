import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types';

// Convert time strings to seconds
const convertToSeconds = (timeStr: string): number => {
  const units: { [key: string]: number } = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400
  };
  
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // default 1 hour
  
  const value = parseInt(match[1]);
  const unit = match[2];
  return value * (units[unit] || 1);
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES = convertToSeconds(process.env.JWT_EXPIRES || '1h');
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret';
const REFRESH_EXPIRES = convertToSeconds(process.env.REFRESH_EXPIRES || '7d');

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRES
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Generate both tokens
 */
export const generateTokens = (payload: JWTPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};
