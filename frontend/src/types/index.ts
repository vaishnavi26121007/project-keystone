export type Role = 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'CLIENT';

export type WorkOrderStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuthUser {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Client {
  id: number;
  companyName: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress?: string;
  slaTier: 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
}

export interface Site {
  id: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  client: { id: number; companyName?: string };
}

export interface Asset {
  id: number;
  name: string;
  assetTag?: string;
  category?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  site: { id: number; name?: string };
}

export interface Technician {
  id: number;
  user: { id: number; fullName: string; email: string; phone?: string };
  specialization?: string;
  availability: 'AVAILABLE' | 'ON_JOB' | 'OFF_DUTY';
  skillTags?: string;
}

export interface Part {
  id: number;
  name: string;
  sku?: string;
  unitCost: number;
  quantityInStock: number;
  reorderThreshold: number;
}

export interface WorkOrder {
  id: number;
  ticketNumber: string;
  title: string;
  description?: string;
  clientName?: string;
  siteName?: string;
  assetName?: string;
  technicianName?: string;
  status: WorkOrderStatus;
  priority: Priority;
  createdAt: string;
  slaDueAt: string;
  slaBreached: boolean;
  completedAt?: string;
}

export interface DashboardStats {
  totalOpen: number;
  totalInProgress: number;
  totalCompleted: number;
  totalOverdue: number;
  totalClosed: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface WorkOrderNote {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; fullName: string };
}

export interface TimeLogEntry {
  id: number;
  technicianId: number;
  technicianName: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  workDescription?: string;
  running: boolean;
}

export interface WorkOrderPartUsage {
  id: number;
  partId: number;
  partName: string;
  quantityUsed: number;
  unitCostAtUse: number;
  lineTotal: number;
}
