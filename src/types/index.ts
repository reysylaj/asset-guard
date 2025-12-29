// Employee Types
export type EmploymentStatus = 'active' | 'left';

export interface Employee {
  id: string;
  name: string;
  surname: string;
  department: string;
  badgeId: string;
  healthCardId: string;
  status: EmploymentStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Asset Types
export type AssetType = 
  | 'laptop' 
  | 'desktop' 
  | 'monitor' 
  | 'server' 
  | 'network_device' 
  | 'accessory';

export type AssetStatus = 'in_use' | 'in_stock' | 'under_repair' | 'retired';

export type Ownership = 'TinextaCyber' | 'FDM' | 'ServiceFactory';

export type StorageType = 'HDD' | 'SSD' | 'NVMe';

export type StorageHealth = 'healthy' | 'warning' | 'critical';

export interface StorageUnit {
  id: string;
  type: StorageType;
  capacity: string;
  health: StorageHealth;
}

export interface HardwareSpecs {
  cpu?: string;
  ram?: string;
  motherboard?: string;
  graphics?: string;
  display?: string;
  storage: StorageUnit[];
}

export interface Asset {
  id: string;
  assetId: string;
  type: AssetType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  hostname?: string;
  operatingSystem?: string;
  ownership: Ownership;
  status: AssetStatus;
  specs?: HardwareSpecs;
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment Types
export interface Assignment {
  id: string;
  assetId: string;
  employeeId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}

// Maintenance Types
export type MaintenanceType = 
  | 'formatting' 
  | 'repair' 
  | 'upgrade' 
  | 'inspection' 
  | 'replacement';

export interface MaintenanceEvent {
  id: string;
  assetId: string;
  type: MaintenanceType;
  date: string;
  performedBy: string;
  description: string;
  resultingHealth: StorageHealth;
  createdAt: string;
}

// Location Types
export type LocationType = 'office' | 'storage' | 'server_room' | 'rack';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  building?: string;
  floor?: string;
  rackPosition?: string;
}

export interface LocationHistory {
  id: string;
  assetId: string;
  locationId: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

// Audit Types
export type AuditAction = 'create' | 'update' | 'delete' | 'assign' | 'unassign';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: 'employee' | 'asset' | 'assignment' | 'maintenance' | 'location';
  entityId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
}

// User Roles
export type UserRole = 'admin' | 'it' | 'hr' | 'readonly';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
