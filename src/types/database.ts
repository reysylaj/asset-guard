// Database types that map to our Supabase schema
// These provide type safety for our database operations

export type AppRole = 'admin' | 'hr' | 'it' | 'auditor';

export type EmploymentStatus = 'active' | 'left';

export type AssetType = 
  | 'laptop' 
  | 'desktop' 
  | 'monitor' 
  | 'server' 
  | 'network_device' 
  | 'accessory';

export type AssetStatus = 
  | 'planned' 
  | 'ordered' 
  | 'in_use' 
  | 'spare' 
  | 'under_repair' 
  | 'quarantined' 
  | 'retired' 
  | 'disposed';

export type OwnershipType = 'TinextaCyber' | 'FDM' | 'ServiceFactory';

export type StorageType = 'HDD' | 'SSD' | 'NVMe';

export type StorageHealth = 'healthy' | 'warning' | 'critical';

export type MaintenanceType = 
  | 'formatting' 
  | 'repair' 
  | 'upgrade' 
  | 'inspection' 
  | 'replacement';

export type LocationType = 'office' | 'storage' | 'server_room' | 'rack';

export type AuditAction = 'create' | 'update' | 'delete' | 'assign' | 'unassign';

export type EntityType = 'employee' | 'asset' | 'assignment' | 'maintenance' | 'location' | 'profile';

export type AssignmentStatus = 'pending_acceptance' | 'active' | 'pending_return' | 'returned';

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export type DepreciationModel = 'straight_line';

// Table Row Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  surname: string;
  department: string;
  badge_id: string;
  health_card_id: string;
  status: EmploymentStatus;
  start_date: string;
  end_date: string | null;
  is_offboarding_complete: boolean;
  offboarding_completed_at: string | null;
  offboarding_completed_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  building: string | null;
  floor: string | null;
  rack_position: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface HardwareSpecs {
  cpu?: string;
  ram?: string;
  motherboard?: string;
  graphics?: string;
  display?: string;
}

export interface Asset {
  id: string;
  asset_id: string;
  type: AssetType;
  manufacturer: string;
  model: string;
  serial_number: string;
  hostname: string | null;
  operating_system: string | null;
  ownership: OwnershipType;
  status: AssetStatus;
  current_location_id: string | null;
  specs: HardwareSpecs;
  
  // Financial
  purchase_date: string | null;
  purchase_cost: number | null;
  warranty_expiry: string | null;
  useful_life_years: number;
  depreciation_model: DepreciationModel;
  cost_center: string | null;
  budget_owner: string | null;
  
  // Security & Compliance
  disk_encryption_enabled: boolean;
  antivirus_edr_present: boolean;
  last_security_check: string | null;
  admin_privileges_granted: boolean;
  data_classification: DataClassification;
  security_compliant: boolean;
  
  // Metadata
  notes: string | null;
  is_readonly: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface StorageUnit {
  id: string;
  asset_id: string;
  type: StorageType;
  capacity: string;
  health: StorageHealth;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  asset_id: string;
  employee_id: string;
  status: AssignmentStatus;
  start_date: string;
  end_date: string | null;
  
  // Acceptance
  accepted_at: string | null;
  accepted_by: string | null;
  acceptance_notes: string | null;
  digital_acknowledgment: boolean;
  
  // Return
  returned_at: string | null;
  returned_by: string | null;
  return_condition: string | null;
  damage_notes: string | null;
  requires_formatting: boolean;
  
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface MaintenanceEvent {
  id: string;
  asset_id: string;
  type: MaintenanceType;
  date: string;
  performed_by: string;
  description: string;
  resulting_health: StorageHealth | null;
  parts_replaced: string[] | null;
  cost: number | null;
  downtime_hours: number | null;
  created_at: string;
  created_by: string | null;
}

export interface LocationHistory {
  id: string;
  asset_id: string;
  location_id: string;
  start_date: string;
  end_date: string | null;
  moved_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface OffboardingRecord {
  id: string;
  employee_id: string;
  initiated_at: string;
  initiated_by: string | null;
  completed_at: string | null;
  completed_by: string | null;
  pending_assets: string[];
  returned_assets: string[];
  notes: string | null;
  signoff_generated: boolean;
  signoff_generated_at: string | null;
  created_at: string;
}

// Extended types with relations
export interface AssignmentWithRelations extends Assignment {
  employee?: Employee;
  asset?: Asset;
}

export interface AssetWithRelations extends Asset {
  storage_units?: StorageUnit[];
  current_location?: Location;
  current_assignment?: Assignment;
}

export interface EmployeeWithAssignments extends Employee {
  current_assignments?: AssignmentWithRelations[];
  assignment_count?: number;
}
