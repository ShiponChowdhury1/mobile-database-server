import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

/**
 * Middleware to check if user has required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole) {
      res.status(403).json({
        success: false,
        message: 'Access denied. User role not found.'
      });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Check if user is admin or moderator
 */
export const isAdminOrModerator = authorize(UserRole.ADMIN, UserRole.MODERATOR);
