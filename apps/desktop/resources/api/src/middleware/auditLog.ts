import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const logActivity = (action: string, entityType: string, getDescription: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We only log after the request succeeds, so hook into the finish event
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.userId || null;
          const ipAddress = req.ip || null;
          const userAgent = req.headers['user-agent'] || null;
          const description = getDescription(req);

          // Determine entityId from response body or request params if possible
          // In a real environment, we'd extract it from standard response fields or route params
          const entityId = typeof req.params.id === 'string' ? req.params.id : '';

          await prisma.activityLog.create({
            data: {
              userId,
              action: action as any,
              entityType,
              entityId,
              description,
              ipAddress,
              userAgent,
              newValues: req.body ? req.body : undefined,
            },
          });
        } catch (error) {
          console.error('Error logging audit activity:', error);
        }
      }
    });

    next();
  };
};
