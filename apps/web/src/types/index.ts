// ─── User & Auth ─────────────────────────────────────────────
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  avatar?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Client ──────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber?: string;
  contactPerson: string;
  status: 'active' | 'inactive' | 'lead';
  totalProjects: number;
  totalRevenue: number;
  avatar?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Project ─────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  deadline: string;
  budget: number;
  spent: number;
  progress: number;
  teamMembers: string[];
  managerId: string;
  managerName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
}

// ─── Task ────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// ─── Invoice ─────────────────────────────────────────────────
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientGst?: string;
  projectId?: string;
  projectName?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// ─── Payment ─────────────────────────────────────────────────
export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  method: 'bank_transfer' | 'upi' | 'credit_card' | 'cash' | 'cheque';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

// ─── Employee ────────────────────────────────────────────────
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  designation: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: string;
  salary: number;
  skills: string[];
  address: string;
  city: string;
  state: string;
  emergencyContact?: string;
  projectCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Document ────────────────────────────────────────────────
export interface Document {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  parentId?: string;
  path: string;
  uploadedBy: string;
  uploadedByName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Calendar Event ──────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  type: 'meeting' | 'deadline' | 'reminder' | 'event' | 'holiday';
  color: string;
  attendees: string[];
  location?: string;
  createdBy: string;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'project' | 'task' | 'invoice' | 'payment' | 'system' | 'team';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── Activity ────────────────────────────────────────────────
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  entity: string;
  entityId: string;
  entityName: string;
  details?: string;
  timestamp: string;
}

// ─── Report ──────────────────────────────────────────────────
export interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface RevenueReport {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyRevenue: { month: string; revenue: number; expenses: number }[];
  topClients: { name: string; revenue: number }[];
}

export interface ProjectReport {
  total: number;
  completed: number;
  inProgress: number;
  onHold: number;
  cancelled: number;
  statusBreakdown: { status: string; count: number }[];
  monthlyProjects: { month: string; started: number; completed: number }[];
}

export interface TaskReport {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
  avgCompletionTime: number;
  statusBreakdown: { status: string; count: number }[];
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardStats {
  totalClients: number;
  clientsTrend: number;
  activeProjects: number;
  projectsTrend: number;
  totalInvoices: number;
  invoicesTrend: number;
  pendingPayments: number;
  paymentsTrend: number;
}

export interface DashboardChartData {
  projectsOverview: { month: string; projects: number }[];
  tasksOverview: { name: string; value: number; color: string }[];
  revenueOverview: { month: string; revenue: number; expenses: number }[];
}

export interface RecentProject {
  id: string;
  name: string;
  client: string;
  progress: number;
  deadline: string;
  status: Project['status'];
}

// ─── Settings ────────────────────────────────────────────────
export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  logo?: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permissions: {
    module: string;
    read: boolean;
    write: boolean;
    delete: boolean;
    manage: boolean;
  }[];
}

// ─── API Response ────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Form types ──────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: SelectOption[];
}
