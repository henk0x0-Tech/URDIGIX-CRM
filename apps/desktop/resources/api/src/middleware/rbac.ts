import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Authenticate first.' });
      return;
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole && !req.user.roles.includes('SUPER_ADMIN')) {
      res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
      return;
    }

    next();
  };
};

export const checkPermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Authenticate first.' });
      return;
    }

    // Super Admin gets a pass on all permissions
    if (req.user.roles.includes('SUPER_ADMIN')) {
      next();
      return;
    }

    try {
      // Find if any of user's roles have the required permission
      const userPermissions = await prisma.rolePermission.findFirst({
        where: {
          role: {
            name: { in: req.user.roles as any },
          },
          permission: {
            module,
            action,
          },
        },
      });

      if (!userPermissions) {
        res.status(403).json({ success: false, message: `Forbidden. You do not have permission to ${action} ${module}.` });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error checking permissions.' });
    }
  };
};
