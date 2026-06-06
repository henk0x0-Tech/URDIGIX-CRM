import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { checkRole, checkPermission } from '../middleware/rbac';
import { validateRequest } from '../middleware/validate';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token';
import { generateInvoicePDF } from '../utils/pdf';
import { logActivity } from '../middleware/auditLog';
import { upload } from '../middleware/upload';
import fs from 'fs';
import path from 'path';

const router = Router();

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

router.post('/auth/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Invalid credentials or inactive account.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const accessToken = signAccessToken({ userId: user.id, email: user.email, roles });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          roles,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().optional(),
  }),
});

router.post('/auth/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const roleName = (role || 'EMPLOYEE').toUpperCase();
    const dbRole = await prisma.role.findFirst({
      where: { name: roleName as any },
    });

    if (!dbRole) {
      res.status(400).json({ success: false, message: `Invalid role requested: ${roleName}` });
      return;
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          isActive: true,
          isEmailVerified: false,
        },
      });

      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: dbRole.id,
        },
      });

      return newUser;
    });

    const roles = [dbRole.name];
    const accessToken = signAccessToken({ userId: user.id, email: user.email, roles });
    const refreshToken = signRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(201).json({
      success: true,
      data: {
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required.' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, refreshToken, deletedAt: null },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
      return;
    }

    const roles = user.roles.map((ur) => ur.role.name);
    const newAccessToken = signAccessToken({ userId: user.id, email: user.email, roles });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
});

router.get('/auth/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles: user.roles.map((ur) => ur.role.name),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/logout', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user?.userId },
      data: { refreshToken: null },
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. CLIENT MANAGEMENT MODULE
// ==========================================

router.get('/clients', authenticate, checkPermission('clients', 'read'), async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { companyName: 'asc' },
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
});

router.post('/clients', authenticate, checkPermission('clients', 'create'), async (req, res, next) => {
  try {
    const client = await prisma.client.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
});

router.get('/clients/:id', authenticate, checkPermission('clients', 'read'), async (req, res, next) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { contacts: true, projects: true, invoices: true },
    });
    if (!client) {
      res.status(404).json({ success: false, message: 'Client not found.' });
      return;
    }
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
});

router.put('/clients/:id', authenticate, checkPermission('clients', 'update'), async (req, res, next) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
});

router.delete('/clients/:id', authenticate, checkPermission('clients', 'delete'), async (req, res, next) => {
  try {
    await prisma.client.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: 'Client soft-deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. PROJECT MANAGEMENT MODULE
// ==========================================

router.get('/projects', authenticate, checkPermission('projects', 'read'), async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: { client: true, manager: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
});

router.post('/projects', authenticate, checkPermission('projects', 'create'), async (req, res, next) => {
  try {
    const project = await prisma.project.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.get('/projects/:id', authenticate, checkPermission('projects', 'read'), async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { client: true, manager: true, members: { include: { user: true } }, milestones: true, tasks: true },
    });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.put('/projects/:id', authenticate, checkPermission('projects', 'update'), async (req, res, next) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

router.delete('/projects/:id', authenticate, checkPermission('projects', 'delete'), async (req, res, next) => {
  try {
    await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: 'Project soft-deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. TASK MANAGEMENT MODULE
// ==========================================

router.get('/tasks', authenticate, checkPermission('tasks', 'read'), async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { deletedAt: null },
      include: { project: true, assignee: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/tasks', authenticate, checkPermission('tasks', 'create'), async (req, res, next) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        creatorId: req.user!.userId,
      },
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.put('/tasks/:id', authenticate, checkPermission('tasks', 'update'), async (req, res, next) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.patch('/tasks/:id/status', authenticate, checkPermission('tasks', 'update'), async (req, res, next) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

router.delete('/tasks/:id', authenticate, checkPermission('tasks', 'delete'), async (req, res, next) => {
  try {
    await prisma.task.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: 'Task soft-deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. INVOICE MANAGEMENT MODULE
// ==========================================

router.get('/invoices', authenticate, checkPermission('invoices', 'read'), async (req, res, next) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { deletedAt: null },
      include: { client: true, project: true },
      orderBy: { invoiceNumber: 'desc' },
    });
    res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
});

router.post('/invoices', authenticate, checkPermission('invoices', 'create'), async (req, res, next) => {
  try {
    const { items, ...invoiceData } = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
});

router.get('/invoices/:id/pdf', authenticate, checkPermission('invoices', 'read'), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { client: true, items: true },
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    const doc = generateInvoicePDF(invoice as any);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 6. PAYMENTS MODULE
// ==========================================

router.get('/payments', authenticate, checkPermission('payments', 'read'), async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { client: true, invoice: true },
      orderBy: { paymentDate: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

router.post('/payments', authenticate, checkPermission('payments', 'create'), async (req, res, next) => {
  try {
    const payment = await prisma.payment.create({
      data: req.body,
    });

    // If linked to an invoice, update paidAmount
    if (payment.invoiceId && payment.status === 'COMPLETED') {
      const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
      if (invoice) {
        const newPaid = Number(invoice.paidAmount) + Number(payment.amount);
        const newStatus = newPaid >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { paidAmount: newPaid, status: newStatus as any },
        });
      }
    }

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 7. EMPLOYEE MANAGEMENT MODULE
// ==========================================

router.get('/employees', authenticate, checkPermission('employees', 'read'), async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      orderBy: { firstName: 'asc' },
    });
    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
});

router.post('/employees', authenticate, checkPermission('employees', 'create'), async (req, res, next) => {
  try {
    const employee = await prisma.employee.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 8. DOCUMENT MANAGEMENT MODULE
// ==========================================

router.get('/documents', authenticate, checkPermission('documents', 'read'), async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const documents = await prisma.document.findMany({
      where: {
        deletedAt: null,
        ...(projectId ? { projectId: projectId as string } : {}),
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
});

router.post('/documents/folder', authenticate, checkPermission('documents', 'create'), async (req, res, next) => {
  try {
    const { name, parentId, projectId } = req.body;
    const folder = await prisma.document.create({
      data: {
        name,
        type: 'FOLDER',
        parentId,
        projectId,
        uploadedById: req.user!.userId,
      },
    });
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
});

router.post('/documents/upload', authenticate, checkPermission('documents', 'create'), upload.single('file') as any, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const { name, parentId, projectId } = req.body;
    const doc = await prisma.document.create({
      data: {
        name: name || req.file.originalname,
        type: 'FILE',
        mimeType: req.file.mimetype,
        size: BigInt(req.file.size),
        url: req.file.path,
        parentId,
        projectId,
        uploadedById: req.user!.userId,
      },
    });

    // Save as first version
    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        version: 1,
        url: req.file.path,
        size: BigInt(req.file.size),
        uploadedById: req.user!.userId,
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
});

router.delete('/documents/:id', authenticate, checkPermission('documents', 'delete'), async (req, res, next) => {
  try {
    await prisma.document.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 9. CALENDAR MODULE
// ==========================================

router.get('/calendar', authenticate, async (req, res, next) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { deletedAt: null },
      include: { creator: true, attendees: { include: { user: true } } },
    });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
});

router.post('/calendar', authenticate, async (req, res, next) => {
  try {
    const event = await prisma.calendarEvent.create({
      data: {
        ...req.body,
        creatorId: req.user!.userId,
      },
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 10. NOTIFICATIONS MODULE
// ==========================================

router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

router.patch('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
});

router.patch('/notifications/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 11. DASHBOARD & SYSTEM
// ==========================================

router.get('/dashboard/stats', authenticate, async (req, res, next) => {
  try {
    const [clientsCount, projectsCount, invoicesCount, pendingPayments] = await Promise.all([
      prisma.client.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } }),
      prisma.invoice.count({ where: { deletedAt: null } }),
      prisma.invoice.aggregate({
        where: { status: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID', 'OVERDUE'] }, deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true },
      }),
    ]);

    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const pendingSum = (Number(pendingPayments._sum.totalAmount) || 0) - (Number(pendingPayments._sum.paidAmount) || 0);

    res.json({
      success: true,
      data: {
        totalClients: clientsCount,
        activeProjects: projectsCount,
        totalInvoices: invoicesCount,
        pendingPayments: pendingSum,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/activities', authenticate, checkPermission('settings', 'read'), async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
});

export default router;
