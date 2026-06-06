// ===========================
// ENUMS
// ===========================

export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER',
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  PROSPECT = 'PROSPECT',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UPI = 'UPI',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  OTHER = 'OTHER',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  PROBATION = 'PROBATION',
}

export enum DocumentType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  INVOICE_CREATED = 'INVOICE_CREATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  MENTION = 'MENTION',
  REMINDER = 'REMINDER',
}

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
  STATUS_CHANGE = 'STATUS_CHANGE',
  COMMENT = 'COMMENT',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum EventType {
  MEETING = 'MEETING',
  DEADLINE = 'DEADLINE',
  REMINDER = 'REMINDER',
  HOLIDAY = 'HOLIDAY',
  TASK_DUE = 'TASK_DUE',
  MILESTONE_DUE = 'MILESTONE_DUE',
  OTHER = 'OTHER',
}

export enum RecurrencePattern {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

// ===========================
// ENTITY INTERFACES
// ===========================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  roles?: UserRole[];
  employee?: Employee | null;
}

export interface Role {
  id: string;
  name: RoleType;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  users?: UserRole[];
  permissions?: RolePermission[];
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles?: RolePermission[];
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: Date;
  user?: User;
  role?: Role;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: Date;
  role?: Role;
  permission?: Permission;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  industry: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  contacts?: ClientContact[];
  projects?: Project[];
  invoices?: Invoice[];
}

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  isPrimary: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  managerId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  deadline: Date | null;
  budget: number | null;
  estimatedHours: number | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  client?: Client;
  manager?: User | null;
  members?: ProjectMember[];
  milestones?: Milestone[];
  tasks?: Task[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  hourlyRate: number | null;
  joinedAt: Date;
  leftAt: Date | null;
  project?: Project;
  user?: User;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  dueDate: Date;
  completedAt: Date | null;
  status: MilestoneStatus;
  sortOrder: number;
  amount: number | null;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  assigneeId: string | null;
  creatorId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  startDate: Date | null;
  completedAt: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  sortOrder: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  project?: Project;
  milestone?: Milestone | null;
  parentTask?: Task | null;
  subtasks?: Task[];
  assignee?: User | null;
  creator?: User;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  task?: Task;
  user?: User;
  parent?: TaskComment | null;
  replies?: TaskComment[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string | null;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  status: InvoiceStatus;
  notes: string | null;
  termsConditions: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  client?: Client;
  project?: Project | null;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  sortOrder: number;
  invoice?: Invoice;
}

export interface Payment {
  id: string;
  transactionId: string | null;
  clientId: string;
  invoiceId: string | null;
  amount: number;
  currency: string;
  paymentDate: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  notes: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  invoice?: Invoice | null;
}

export interface Employee {
  id: string;
  employeeId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  department: string | null;
  designation: string | null;
  joiningDate: Date;
  leavingDate: Date | null;
  salary: number | null;
  bankAccountNo: string | null;
  bankName: string | null;
  bankIFSC: string | null;
  panNumber: string | null;
  aadharNumber: string | null;
  status: EmployeeStatus;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user?: User | null;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  mimeType: string | null;
  size: bigint | null;
  url: string | null;
  description: string | null;
  projectId: string | null;
  parentId: string | null;
  uploadedById: string;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  project?: Project | null;
  parent?: Document | null;
  children?: Document[];
  uploadedBy?: User;
  versions?: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  url: string;
  size: bigint;
  changelog: string | null;
  uploadedById: string;
  createdAt: Date;
  document?: Document;
  uploadedBy?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  user?: User;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  description: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  user?: User | null;
}

export interface Setting {
  id: string;
  userId: string | null;
  group: string;
  key: string;
  value: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location: string | null;
  color: string | null;
  recurrence: RecurrencePattern;
  recurrenceEnd: Date | null;
  creatorId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  creator?: User;
  attendees?: EventAttendee[];
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  createdAt: Date;
  event?: CalendarEvent;
  user?: User;
}

// ===========================
// API TYPES
// ===========================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ===========================
// AUTH TYPES
// ===========================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: RoleType[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ===========================
// FILTER / QUERY TYPES
// ===========================

export interface ClientFilters extends PaginationParams {
  status?: ClientStatus;
  industry?: string;
  city?: string;
  country?: string;
}

export interface ProjectFilters extends PaginationParams {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  managerId?: string;
}

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assigneeId?: string;
  milestoneId?: string;
}

export interface InvoiceFilters extends PaginationParams {
  status?: InvoiceStatus;
  clientId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentFilters extends PaginationParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  clientId?: string;
  invoiceId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EmployeeFilters extends PaginationParams {
  status?: EmployeeStatus;
  department?: string;
  designation?: string;
}

export interface ActivityFilters extends PaginationParams {
  entityType?: string;
  userId?: string;
  action?: ActivityAction;
  dateFrom?: string;
  dateTo?: string;
}

export interface CalendarFilters {
  startDate?: string;
  endDate?: string;
  type?: EventType;
  creatorId?: string;
}

// ===========================
// DASHBOARD TYPES
// ===========================

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  pendingTasks: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalEmployees: number;
  overdueTasks: number;
  monthlyRevenue: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

export interface RevenueReport {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  monthlyData: { month: string; revenue: number; paid: number }[];
}
