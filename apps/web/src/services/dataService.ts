import api from './api';
import type {
  Activity,
  CalendarEvent,
  Client,
  CompanySettings,
  DashboardChartData,
  DashboardStats,
  Document,
  Employee,
  Invoice,
  Milestone,
  Notification,
  Payment,
  Project,
  ProjectReport,
  RecentProject,
  RevenueReport,
  RolePermission,
  Task,
  TaskReport,
  User,
} from '@/types';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

const toIsoDate = (value?: string | Date | null) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const numberValue = (value: unknown) => Number(value ?? 0);

const lowerEnum = (value?: string | null) => (value || '').toLowerCase();

const toApiEnum = (value?: string | null) => (value || '').toUpperCase();

const toApiTaskStatus = (status?: string | null) => {
  const map: Record<string, string> = {
    pending: 'TODO',
    in_progress: 'IN_PROGRESS',
    review: 'IN_REVIEW',
    completed: 'COMPLETED',
  };
  return map[status || ''] || toApiEnum(status);
};

const fromApiTaskStatus = (status?: string | null): Task['status'] => {
  const map: Record<string, Task['status']> = {
    TODO: 'pending',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'review',
    COMPLETED: 'completed',
  };
  return map[status || ''] || 'pending';
};

const toApiClientStatus = (status?: string | null) => {
  const map: Record<string, string> = {
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    lead: 'PROSPECT',
  };
  return map[status || ''] || toApiEnum(status);
};

const fromApiClientStatus = (status?: string | null): Client['status'] => {
  const map: Record<string, Client['status']> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'inactive',
    PROSPECT: 'lead',
  };
  return map[status || ''] || 'active';
};

const fromApiProjectStatus = (status?: string | null): Project['status'] => {
  const map: Record<string, Project['status']> = {
    PLANNING: 'planning',
    IN_PROGRESS: 'in_progress',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return map[status || ''] || 'planning';
};

const fromApiInvoiceStatus = (status?: string | null): Invoice['status'] => {
  const map: Record<string, Invoice['status']> = {
    DRAFT: 'draft',
    SENT: 'sent',
    VIEWED: 'sent',
    PAID: 'paid',
    PARTIALLY_PAID: 'sent',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
    REFUNDED: 'cancelled',
    PENDING: 'sent',
  };
  return map[status || ''] || 'draft';
};

const toApiPaymentMethod = (method?: string | null) => {
  const map: Record<string, string> = {
    bank_transfer: 'BANK_TRANSFER',
    upi: 'UPI',
    credit_card: 'CARD',
    cash: 'CASH',
    cheque: 'CHEQUE',
  };
  return map[method || ''] || toApiEnum(method);
};

const fromApiPaymentMethod = (method?: string | null): Payment['method'] => {
  const map: Record<string, Payment['method']> = {
    BANK_TRANSFER: 'bank_transfer',
    UPI: 'upi',
    CARD: 'credit_card',
    CASH: 'cash',
    CHEQUE: 'cheque',
  };
  return map[method || ''] || 'bank_transfer';
};

const unsupported = (feature: string) => {
  throw new Error(`${feature} is not available from the API yet.`);
};

const mapUser = (user: any): User => {
  const role = (user.role || user.roles?.[0] || 'employee').toLowerCase();
  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    role,
    avatar: user.avatar || '',
    phone: user.phone || '',
    department: user.department || '',
    isActive: user.isActive ?? true,
    createdAt: toIsoDate(user.createdAt),
    updatedAt: toIsoDate(user.updatedAt),
  } as User;
};

const mapClient = (client: any): Client => ({
  id: client.id,
  name: client.name || client.companyName || '',
  email: client.email || '',
  phone: client.phone || '',
  company: client.company || client.companyName || '',
  industry: client.industry || '',
  website: client.website || '',
  address: client.address || '',
  city: client.city || '',
  state: client.state || '',
  country: client.country || 'India',
  pincode: client.pincode || client.postalCode || '',
  gstNumber: client.gstNumber || '',
  contactPerson: client.contactPerson || '',
  status: fromApiClientStatus(client.status),
  totalProjects: client._count?.projects || client.projects?.length || 0,
  totalRevenue: numberValue(client.totalRevenue),
  notes: client.notes || '',
  createdAt: toIsoDate(client.createdAt),
  updatedAt: toIsoDate(client.updatedAt),
});

const clientPayload = (data: Partial<Client>) => ({
  companyName: data.company || data.name,
  contactPerson: data.contactPerson || '',
  email: data.email,
  phone: data.phone || undefined,
  website: data.website || undefined,
  address: data.address || undefined,
  city: data.city || undefined,
  state: data.state || undefined,
  country: data.country || 'India',
  postalCode: data.pincode || undefined,
  gstNumber: data.gstNumber || undefined,
  industry: data.industry || undefined,
  status: toApiClientStatus(data.status || 'active'),
  notes: data.notes || undefined,
});

const mapProject = (project: any): Project => ({
  id: project.id,
  name: project.name || '',
  description: project.description || '',
  clientId: project.clientId || '',
  clientName: project.clientName || project.client?.companyName || '',
  status: fromApiProjectStatus(project.status),
  priority: lowerEnum(project.priority || 'MEDIUM') as Project['priority'],
  startDate: toIsoDate(project.startDate),
  endDate: toIsoDate(project.endDate),
  deadline: toIsoDate(project.deadline || project.endDate),
  budget: numberValue(project.budget),
  spent: numberValue(project.spent),
  progress: numberValue(project.progress),
  teamMembers: project.members?.map((member: any) => member.userId) || project.teamMembers || [],
  managerId: project.managerId || '',
  managerName: project.managerName || [project.manager?.firstName, project.manager?.lastName].filter(Boolean).join(' '),
  tags: project.tags || [],
  createdAt: toIsoDate(project.createdAt),
  updatedAt: toIsoDate(project.updatedAt),
});

const resolveClientId = async (clientName?: string, clientId?: string) => {
  if (clientId) return clientId;
  const clients = await clientService.getAll();
  const normalized = (clientName || '').trim().toLowerCase();
  const client = clients.find((item) => item.company.toLowerCase() === normalized || item.name.toLowerCase() === normalized);
  if (!client) {
    throw new Error('Create the client first, then use the exact client name.');
  }
  return client.id;
};

const resolveProjectId = async (projectName?: string, projectId?: string) => {
  if (projectId) return projectId;
  const projects = await projectService.getAll();
  const normalized = (projectName || '').trim().toLowerCase();
  const project = projects.find((item) => item.name.toLowerCase() === normalized);
  if (!project) {
    throw new Error('Create the project first, then use the exact project name.');
  }
  return project.id;
};

const resolveInvoiceId = async (invoiceNumber?: string, invoiceId?: string) => {
  if (invoiceId) return invoiceId;
  if (!invoiceNumber) return undefined;
  const invoices = await invoiceService.getAll();
  return invoices.find((item) => item.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase())?.id;
};

const mapTask = (task: any): Task => ({
  id: task.id,
  title: task.title || '',
  description: task.description || '',
  projectId: task.projectId || '',
  projectName: task.projectName || task.project?.name || '',
  assigneeId: task.assigneeId || '',
  assigneeName: task.assigneeName || [task.assignee?.firstName, task.assignee?.lastName].filter(Boolean).join(' '),
  assigneeAvatar: task.assignee?.avatar || '',
  status: fromApiTaskStatus(task.status),
  priority: lowerEnum(task.priority || 'MEDIUM') as Task['priority'],
  dueDate: toIsoDate(task.dueDate),
  estimatedHours: numberValue(task.estimatedHours),
  loggedHours: numberValue(task.actualHours),
  tags: task.tags || [],
  comments: task.comments || [],
  createdAt: toIsoDate(task.createdAt),
  updatedAt: toIsoDate(task.updatedAt),
});

const mapInvoice = (invoice: any): Invoice => ({
  id: invoice.id,
  invoiceNumber: invoice.invoiceNumber || '',
  clientId: invoice.clientId || '',
  clientName: invoice.clientName || invoice.client?.companyName || '',
  clientEmail: invoice.clientEmail || invoice.client?.email || '',
  clientAddress: invoice.clientAddress || invoice.client?.address || '',
  clientGst: invoice.clientGst || invoice.client?.gstNumber || '',
  projectId: invoice.projectId || '',
  projectName: invoice.projectName || invoice.project?.name || '',
  status: fromApiInvoiceStatus(invoice.status),
  issueDate: toIsoDate(invoice.issueDate),
  dueDate: toIsoDate(invoice.dueDate),
  items: (invoice.items || []).map((item: any) => ({
    id: item.id,
    description: item.description,
    quantity: numberValue(item.quantity),
    rate: numberValue(item.rate ?? item.unitPrice),
    amount: numberValue(item.amount ?? item.totalPrice),
  })),
  subtotal: numberValue(invoice.subtotal),
  taxRate: numberValue(invoice.taxRate),
  taxAmount: numberValue(invoice.taxAmount),
  discount: numberValue(invoice.discount ?? invoice.discountAmount),
  total: numberValue(invoice.total ?? invoice.totalAmount),
  paidAmount: numberValue(invoice.paidAmount),
  notes: invoice.notes || '',
  createdAt: toIsoDate(invoice.createdAt),
  updatedAt: toIsoDate(invoice.updatedAt),
});

const mapPayment = (payment: any): Payment => ({
  id: payment.id,
  invoiceId: payment.invoiceId || '',
  invoiceNumber: payment.invoiceNumber || payment.invoice?.invoiceNumber || '',
  clientId: payment.clientId || '',
  clientName: payment.clientName || payment.client?.companyName || '',
  amount: numberValue(payment.amount),
  method: fromApiPaymentMethod(payment.method),
  status: lowerEnum(payment.status || 'PENDING') as Payment['status'],
  transactionId: payment.transactionId || payment.reference || '',
  date: toIsoDate(payment.date || payment.paymentDate),
  notes: payment.notes || '',
  createdAt: toIsoDate(payment.createdAt),
});

const mapEmployee = (employee: any): Employee => ({
  id: employee.id,
  firstName: employee.firstName || '',
  lastName: employee.lastName || '',
  email: employee.email || '',
  phone: employee.phone || '',
  avatar: employee.avatar || '',
  department: employee.department || '',
  designation: employee.designation || '',
  role: lowerEnum(employee.role || 'EMPLOYEE') as Employee['role'],
  status: lowerEnum(employee.status || 'ACTIVE') === 'resigned' ? 'inactive' : (lowerEnum(employee.status || 'ACTIVE') as Employee['status']),
  joinDate: toIsoDate(employee.joinDate || employee.joiningDate),
  salary: numberValue(employee.salary),
  skills: employee.skills || [],
  address: employee.address || '',
  city: employee.city || '',
  state: employee.state || '',
  emergencyContact: employee.emergencyContact || '',
  projectCount: numberValue(employee.projectCount),
  taskCount: numberValue(employee.taskCount),
  createdAt: toIsoDate(employee.createdAt),
  updatedAt: toIsoDate(employee.updatedAt),
});

const mapDocument = (doc: any): Document => ({
  id: doc.id,
  name: doc.name || '',
  type: lowerEnum(doc.type) === 'folder' ? 'folder' : 'file',
  mimeType: doc.mimeType || '',
  size: numberValue(doc.size),
  parentId: doc.parentId || undefined,
  path: doc.path || doc.url || '',
  uploadedBy: doc.uploadedById || '',
  uploadedByName: [doc.uploadedBy?.firstName, doc.uploadedBy?.lastName].filter(Boolean).join(' '),
  tags: doc.tags || [],
  createdAt: toIsoDate(doc.createdAt),
  updatedAt: toIsoDate(doc.updatedAt),
});

const mapCalendarEvent = (event: any): CalendarEvent => ({
  id: event.id,
  title: event.title || '',
  description: event.description || '',
  start: event.start || event.startTime || '',
  end: event.end || event.endTime || '',
  allDay: event.allDay ?? event.isAllDay ?? false,
  type: lowerEnum(event.type || 'MEETING') as CalendarEvent['type'],
  color: event.color || '#2563eb',
  attendees: event.attendees?.map((attendee: any) => attendee.userId) || [],
  location: event.location || '',
  createdBy: event.creatorId || '',
  createdAt: toIsoDate(event.createdAt),
});

const mapNotification = (notification: any): Notification => ({
  id: notification.id,
  title: notification.title || '',
  message: notification.message || '',
  type: lowerEnum(notification.type || 'INFO') as Notification['type'],
  category: lowerEnum(notification.category || notification.metadata?.category || 'system') as Notification['category'],
  read: notification.read ?? notification.isRead ?? false,
  actionUrl: notification.actionUrl || '',
  createdAt: notification.createdAt || '',
});

const mapActivity = (activity: any): Activity => ({
  id: activity.id,
  userId: activity.userId || '',
  userName: activity.userName || [activity.user?.firstName, activity.user?.lastName].filter(Boolean).join(' '),
  action: lowerEnum(activity.action || ''),
  entity: activity.entity || activity.entityType || '',
  entityId: activity.entityId || '',
  entityName: activity.entityName || '',
  details: activity.details || activity.description || '',
  timestamp: activity.timestamp || activity.createdAt || '',
});

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post<ApiEnvelope<{ user: any; token: string; refreshToken?: string }>>('/auth/login', data);
    const auth = unwrap(response);
    return { user: mapUser(auth.user), token: auth.token, refreshToken: auth.refreshToken };
  },
  register: async (data: any) => {
    const response = await api.post<ApiEnvelope<{ user: any; token: string; refreshToken?: string }>>('/auth/register', data);
    const auth = unwrap(response);
    return { user: mapUser(auth.user), token: auth.token, refreshToken: auth.refreshToken };
  },
  forgotPassword: async () => unsupported('Password reset'),
  resetPassword: async () => unsupported('Password reset'),
  getProfile: async () => mapUser(unwrap(await api.get<ApiEnvelope<any>>('/auth/me'))),
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const stats = unwrap(await api.get<ApiEnvelope<any>>('/dashboard/stats'));
    return {
      totalClients: numberValue(stats.totalClients),
      clientsTrend: 0,
      activeProjects: numberValue(stats.activeProjects),
      projectsTrend: 0,
      totalInvoices: numberValue(stats.totalInvoices),
      invoicesTrend: 0,
      pendingPayments: numberValue(stats.pendingPayments),
      paymentsTrend: 0,
    };
  },
  getChartData: async (): Promise<DashboardChartData> => ({
    projectsOverview: [],
    tasksOverview: [],
    revenueOverview: [],
  }),
  getRecentProjects: async (): Promise<RecentProject[]> => {
    const projects = await projectService.getAll();
    return projects.slice(0, 5).map((project) => ({
      id: project.id,
      name: project.name,
      client: project.clientName,
      progress: project.progress,
      deadline: project.deadline,
      status: project.status,
    }));
  },
  getRecentActivities: async () => (await activityService.getAll()).slice(0, 5),
};

export const clientService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/clients')).map(mapClient),
  getById: async (id: string) => mapClient(unwrap(await api.get<ApiEnvelope<any>>(`/clients/${id}`))),
  create: async (data: Partial<Client>) => mapClient(unwrap(await api.post<ApiEnvelope<any>>('/clients', clientPayload(data)))),
  update: async (id: string, data: Partial<Client>) =>
    mapClient(unwrap(await api.put<ApiEnvelope<any>>(`/clients/${id}`, clientPayload(data)))),
  delete: async (id: string) => unwrap(await api.delete<ApiEnvelope<{ success: true }>>(`/clients/${id}`)),
};

export const projectService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/projects')).map(mapProject),
  getById: async (id: string) => mapProject(unwrap(await api.get<ApiEnvelope<any>>(`/projects/${id}`))),
  create: async (data: Partial<Project>) => {
    const clientId = await resolveClientId(data.clientName, data.clientId);
    return mapProject(
      unwrap(
        await api.post<ApiEnvelope<any>>('/projects', {
          name: data.name,
          description: data.description,
          clientId,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          deadline: data.deadline || data.endDate || undefined,
          budget: data.budget,
          status: toApiEnum(data.status || 'planning'),
          priority: toApiEnum(data.priority || 'medium'),
          tags: data.tags || [],
        })
      )
    );
  },
  update: async (id: string, data: Partial<Project>) =>
    mapProject(
      unwrap(
        await api.put<ApiEnvelope<any>>(`/projects/${id}`, {
          ...data,
          status: data.status ? toApiEnum(data.status) : undefined,
          priority: data.priority ? toApiEnum(data.priority) : undefined,
        })
      )
    ),
  delete: async (id: string) => unwrap(await api.delete<ApiEnvelope<{ success: true }>>(`/projects/${id}`)),
  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    const project = unwrap(await api.get<ApiEnvelope<any>>(`/projects/${projectId}`));
    return (project.milestones || []).map((milestone: any) => ({
      id: milestone.id,
      projectId: milestone.projectId,
      title: milestone.title,
      description: milestone.description || '',
      dueDate: toIsoDate(milestone.dueDate),
      status: lowerEnum(milestone.status || 'PENDING'),
      progress: milestone.status === 'COMPLETED' ? 100 : 0,
    }));
  },
};

export const taskService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/tasks')).map(mapTask),
  getById: async (id: string) => (await taskService.getAll()).find((task) => task.id === id),
  create: async (data: Partial<Task>) => {
    const projectId = await resolveProjectId(data.projectName, data.projectId);
    return mapTask(
      unwrap(
        await api.post<ApiEnvelope<any>>('/tasks', {
          title: data.title,
          description: data.description,
          projectId,
          dueDate: data.dueDate || undefined,
          priority: toApiEnum(data.priority || 'medium'),
          status: toApiTaskStatus(data.status || 'pending'),
          estimatedHours: data.estimatedHours,
          tags: data.tags || [],
        })
      )
    );
  },
  update: async (id: string, data: Partial<Task>) => {
    if (data.status && Object.keys(data).length === 1) {
      return mapTask(unwrap(await api.patch<ApiEnvelope<any>>(`/tasks/${id}/status`, { status: toApiTaskStatus(data.status) })));
    }
    return mapTask(
      unwrap(
        await api.put<ApiEnvelope<any>>(`/tasks/${id}`, {
          ...data,
          status: data.status ? toApiTaskStatus(data.status) : undefined,
          priority: data.priority ? toApiEnum(data.priority) : undefined,
        })
      )
    );
  },
  delete: async (id: string) => unwrap(await api.delete<ApiEnvelope<{ success: true }>>(`/tasks/${id}`)),
  getByProject: async (projectId: string) => (await taskService.getAll()).filter((task) => task.projectId === projectId),
};

export const invoiceService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/invoices')).map(mapInvoice),
  getById: async (id: string) => (await invoiceService.getAll()).find((invoice) => invoice.id === id),
  create: async (data: Partial<Invoice>) => {
    const clientId = await resolveClientId(data.clientName, data.clientId);
    const projectId = data.projectName ? await resolveProjectId(data.projectName, data.projectId) : data.projectId;
    const total = numberValue(data.total);
    return mapInvoice(
      unwrap(
        await api.post<ApiEnvelope<any>>('/invoices', {
          invoiceNumber: data.invoiceNumber,
          clientId,
          projectId: projectId || undefined,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          subtotal: total,
          totalAmount: total,
          paidAmount: data.paidAmount || 0,
          status: toApiEnum(data.status || 'draft'),
          items: [
            {
              description: 'Invoice total',
              quantity: 1,
              unitPrice: total,
              totalPrice: total,
            },
          ],
        })
      )
    );
  },
  update: async () => unsupported('Invoice update'),
  delete: async () => unsupported('Invoice delete'),
};

export const paymentService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/payments')).map(mapPayment),
  getById: async (id: string) => (await paymentService.getAll()).find((payment) => payment.id === id),
  create: async (data: Partial<Payment>) => {
    const clientId = await resolveClientId(data.clientName, data.clientId);
    const invoiceId = await resolveInvoiceId(data.invoiceNumber, data.invoiceId);
    return mapPayment(
      unwrap(
        await api.post<ApiEnvelope<any>>('/payments', {
          clientId,
          invoiceId,
          transactionId: data.transactionId || undefined,
          amount: data.amount,
          paymentDate: data.date,
          method: toApiPaymentMethod(data.method || 'bank_transfer'),
          status: toApiEnum(data.status || 'completed'),
        })
      )
    );
  },
};

export const employeeService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/employees')).map(mapEmployee),
  getById: async (id: string) => (await employeeService.getAll()).find((employee) => employee.id === id),
  create: async (data: Partial<Employee>) =>
    mapEmployee(
      unwrap(
        await api.post<ApiEnvelope<any>>('/employees', {
          employeeId: `EMP-${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          department: data.department || undefined,
          designation: data.designation || undefined,
          joiningDate: data.joinDate,
          salary: data.salary,
          status: toApiEnum(data.status || 'active'),
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
        })
      )
    ),
  update: async () => unsupported('Employee update'),
  delete: async () => unsupported('Employee delete'),
};

export const documentService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/documents')).map(mapDocument),
  getByFolder: async (folderId?: string) => (await documentService.getAll()).filter((doc) => (folderId ? doc.parentId === folderId : !doc.parentId)),
  upload: async (data: any) => {
    if (data instanceof FormData) {
      return mapDocument(unwrap(await api.post<ApiEnvelope<any>>('/documents/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })));
    }
    return mapDocument(
      unwrap(
        await api.post<ApiEnvelope<any>>('/documents/folder', {
          name: data.name,
          parentId: data.parentId,
          projectId: data.projectId,
        })
      )
    );
  },
  createFolder: async (name: string, parentId?: string, projectId?: string) => {
    return documentService.upload({ name, parentId, projectId });
  },
  delete: async (id: string) => unwrap(await api.delete<ApiEnvelope<{ success: true }>>(`/documents/${id}`)),
};

export const calendarService = {
  getEvents: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/calendar')).map(mapCalendarEvent),
  getAll: async () => calendarService.getEvents(),
  createEvent: async (data: Partial<CalendarEvent>) =>
    mapCalendarEvent(
      unwrap(
        await api.post<ApiEnvelope<any>>('/calendar', {
          title: data.title,
          description: data.description,
          type: toApiEnum(data.type || 'meeting'),
          startTime: data.start,
          endTime: data.end,
          isAllDay: data.allDay || false,
          location: data.location || undefined,
          color: data.color || undefined,
        })
      )
    ),
  updateEvent: async () => unsupported('Calendar event update'),
  deleteEvent: async () => unsupported('Calendar event delete'),
  create: async (data: Partial<CalendarEvent>) => calendarService.createEvent(data),
};

export const notificationService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/notifications')).map(mapNotification),
  markAsRead: async (id: string) => unwrap(await api.patch<ApiEnvelope<any>>(`/notifications/${id}/read`)),
  markAllRead: async () => unwrap(await api.patch<ApiEnvelope<any>>('/notifications/read-all')),
};

export const activityService = {
  getAll: async () => unwrap(await api.get<ApiEnvelope<any[]>>('/activities')).map(mapActivity),
};

export const reportService = {
  getRevenueReport: async (): Promise<RevenueReport> => {
    const [invoices, payments, clients] = await Promise.all([
      invoiceService.getAll(),
      paymentService.getAll(),
      clientService.getAll(),
    ]);
    const totalRevenue = payments.filter((payment) => payment.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
    return {
      totalRevenue,
      totalExpenses: 0,
      netProfit: totalRevenue,
      monthlyRevenue: [],
      topClients: clients
        .map((client) => ({
          name: client.company,
          revenue: invoices.filter((invoice) => invoice.clientId === client.id).reduce((sum, invoice) => sum + invoice.total, 0),
        }))
        .filter((client) => client.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    };
  },
  getProjectReport: async (): Promise<ProjectReport> => {
    const projects = await projectService.getAll();
    const count = (status: Project['status']) => projects.filter((project) => project.status === status).length;
    return {
      total: projects.length,
      completed: count('completed'),
      inProgress: count('in_progress'),
      onHold: count('on_hold'),
      cancelled: count('cancelled'),
      statusBreakdown: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'].map((status) => ({
        status,
        count: count(status as Project['status']),
      })),
      monthlyProjects: [],
    };
  },
  getTaskReport: async (): Promise<TaskReport> => {
    const tasks = await taskService.getAll();
    const count = (status: Task['status']) => tasks.filter((task) => task.status === status).length;
    const completed = count('completed');
    return {
      total: tasks.length,
      completed,
      pending: count('pending'),
      inProgress: count('in_progress'),
      overdue: tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed').length,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      avgCompletionTime: 0,
      statusBreakdown: ['pending', 'in_progress', 'review', 'completed'].map((status) => ({
        status,
        count: count(status as Task['status']),
      })),
    };
  },
};

export const settingsService = {
  getCompanySettings: async (): Promise<CompanySettings> => ({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    currency: 'INR',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'DD/MM/YYYY',
  }),
  updateCompanySettings: async () => unsupported('Company settings update'),
  getRolePermissions: async (): Promise<RolePermission[]> => [],
  updateRolePermissions: async () => unsupported('Role permission update'),
  getUsers: async (): Promise<User[]> => [],
};
