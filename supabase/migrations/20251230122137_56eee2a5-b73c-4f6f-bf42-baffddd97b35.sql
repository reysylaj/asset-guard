-- =====================================================
-- ENTERPRISE IT ASSET MANAGEMENT SYSTEM - FULL SCHEMA
-- =====================================================

-- 1. ENUMS FOR TYPE SAFETY
-- =====================================================

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'hr', 'it', 'auditor');

-- Employment status enum
CREATE TYPE public.employment_status AS ENUM ('active', 'left');

-- Asset types enum
CREATE TYPE public.asset_type AS ENUM (
  'laptop', 'desktop', 'monitor', 'server', 
  'network_device', 'accessory'
);

-- Extended asset lifecycle status enum
CREATE TYPE public.asset_status AS ENUM (
  'planned', 'ordered', 'in_use', 'spare', 
  'under_repair', 'quarantined', 'retired', 'disposed'
);

-- Ownership enum
CREATE TYPE public.ownership_type AS ENUM (
  'TinextaCyber', 'FDM', 'ServiceFactory'
);

-- Storage types enum
CREATE TYPE public.storage_type AS ENUM ('HDD', 'SSD', 'NVMe');

-- Storage health enum
CREATE TYPE public.storage_health AS ENUM ('healthy', 'warning', 'critical');

-- Maintenance types enum
CREATE TYPE public.maintenance_type AS ENUM (
  'formatting', 'repair', 'upgrade', 
  'inspection', 'replacement'
);

-- Location types enum
CREATE TYPE public.location_type AS ENUM (
  'office', 'storage', 'server_room', 'rack'
);

-- Audit action types enum
CREATE TYPE public.audit_action AS ENUM (
  'create', 'update', 'delete', 'assign', 'unassign'
);

-- Entity types for audit enum
CREATE TYPE public.entity_type AS ENUM (
  'employee', 'asset', 'assignment', 
  'maintenance', 'location', 'profile'
);

-- Assignment status enum
CREATE TYPE public.assignment_status AS ENUM (
  'pending_acceptance', 'active', 'pending_return', 'returned'
);

-- Data classification level enum
CREATE TYPE public.data_classification AS ENUM (
  'public', 'internal', 'confidential', 'restricted'
);

-- Depreciation model enum
CREATE TYPE public.depreciation_model AS ENUM ('straight_line');

-- 2. PROFILES TABLE (User Management)
-- =====================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. USER ROLES TABLE (RBAC)
-- =====================================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- 5. EMPLOYEES TABLE
-- =====================================================

CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  department TEXT NOT NULL,
  badge_id TEXT NOT NULL UNIQUE,
  health_card_id TEXT NOT NULL UNIQUE,
  status public.employment_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE,
  is_offboarding_complete BOOLEAN DEFAULT false,
  offboarding_completed_at TIMESTAMPTZ,
  offboarding_completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_badge ON public.employees(badge_id);

-- 6. LOCATIONS TABLE
-- =====================================================

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.location_type NOT NULL,
  building TEXT,
  floor TEXT,
  rack_position TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_locations_type ON public.locations(type);

-- 7. ASSETS TABLE (Extended with Financial & Security)
-- =====================================================

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL UNIQUE,
  type public.asset_type NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  hostname TEXT,
  operating_system TEXT,
  ownership public.ownership_type NOT NULL,
  status public.asset_status NOT NULL DEFAULT 'spare',
  current_location_id UUID REFERENCES public.locations(id),
  
  -- Hardware Specs (JSONB for flexibility)
  specs JSONB DEFAULT '{}',
  
  -- Financial Governance
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  warranty_expiry DATE,
  useful_life_years INTEGER DEFAULT 5,
  depreciation_model public.depreciation_model DEFAULT 'straight_line',
  cost_center TEXT,
  budget_owner TEXT,
  
  -- Security & Compliance
  disk_encryption_enabled BOOLEAN DEFAULT false,
  antivirus_edr_present BOOLEAN DEFAULT false,
  last_security_check DATE,
  admin_privileges_granted BOOLEAN DEFAULT false,
  data_classification public.data_classification DEFAULT 'internal',
  security_compliant BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  is_readonly BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_assets_ownership ON public.assets(ownership);
CREATE INDEX idx_assets_asset_id ON public.assets(asset_id);

-- 8. STORAGE UNITS TABLE (For Computer Assets)
-- =====================================================

CREATE TABLE public.storage_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  type public.storage_type NOT NULL,
  capacity TEXT NOT NULL,
  health public.storage_health NOT NULL DEFAULT 'healthy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.storage_units ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_storage_units_asset ON public.storage_units(asset_id);

-- 9. ASSIGNMENTS TABLE (With Acceptance & Liability)
-- =====================================================

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  status public.assignment_status NOT NULL DEFAULT 'pending_acceptance',
  
  -- Assignment dates
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Acceptance tracking
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id),
  acceptance_notes TEXT,
  digital_acknowledgment BOOLEAN DEFAULT false,
  
  -- Return tracking
  returned_at TIMESTAMPTZ,
  returned_by UUID REFERENCES auth.users(id),
  return_condition TEXT,
  damage_notes TEXT,
  requires_formatting BOOLEAN DEFAULT false,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_assignments_asset ON public.assignments(asset_id);
CREATE INDEX idx_assignments_employee ON public.assignments(employee_id);
CREATE INDEX idx_assignments_status ON public.assignments(status);

-- Constraint: Only one active assignment per asset
CREATE UNIQUE INDEX idx_unique_active_assignment 
ON public.assignments(asset_id) 
WHERE status IN ('pending_acceptance', 'active');

-- 10. MAINTENANCE EVENTS TABLE
-- =====================================================

CREATE TABLE public.maintenance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  type public.maintenance_type NOT NULL,
  date DATE NOT NULL,
  performed_by TEXT NOT NULL,
  description TEXT NOT NULL,
  resulting_health public.storage_health,
  
  -- Extended maintenance data
  parts_replaced TEXT[],
  cost DECIMAL(10,2),
  downtime_hours INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.maintenance_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_maintenance_asset ON public.maintenance_events(asset_id);
CREATE INDEX idx_maintenance_type ON public.maintenance_events(type);
CREATE INDEX idx_maintenance_date ON public.maintenance_events(date);

-- 11. LOCATION HISTORY TABLE (Historical Tracking)
-- =====================================================

CREATE TABLE public.location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  moved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_location_history_asset ON public.location_history(asset_id);
CREATE INDEX idx_location_history_location ON public.location_history(location_id);

-- 12. IMMUTABLE AUDIT LOG TABLE
-- =====================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  action public.audit_action NOT NULL,
  entity_type public.entity_type NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NO RLS on audit logs - append only via trigger
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- 13. OFFBOARDING RECORDS TABLE
-- =====================================================

CREATE TABLE public.offboarding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  initiated_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  pending_assets UUID[] DEFAULT '{}',
  returned_assets UUID[] DEFAULT '{}',
  notes TEXT,
  signoff_generated BOOLEAN DEFAULT false,
  signoff_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offboarding_records ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_offboarding_employee ON public.offboarding_records(employee_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- User roles policies (only admins can manage)
CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Employees policies
CREATE POLICY "All authenticated can view employees"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can insert employees"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can update employees"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- Assets policies
CREATE POLICY "All authenticated can view assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "IT and Admin can insert assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['it', 'admin']::public.app_role[]));

CREATE POLICY "IT and Admin can update assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['it', 'admin']::public.app_role[]));

-- Storage units policies
CREATE POLICY "All authenticated can view storage units"
  ON public.storage_units FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "IT and Admin can manage storage units"
  ON public.storage_units FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['it', 'admin']::public.app_role[]));

-- Locations policies
CREATE POLICY "All authenticated can view locations"
  ON public.locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "IT and Admin can manage locations"
  ON public.locations FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['it', 'admin']::public.app_role[]));

-- Assignments policies
CREATE POLICY "All authenticated can view assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HR IT Admin can create assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'it', 'admin']::public.app_role[]));

CREATE POLICY "HR IT Admin can update assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'it', 'admin']::public.app_role[]));

-- Maintenance events policies
CREATE POLICY "All authenticated can view maintenance"
  ON public.maintenance_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "IT and Admin can manage maintenance"
  ON public.maintenance_events FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['it', 'admin']::public.app_role[]));

-- Location history policies
CREATE POLICY "All authenticated can view location history"
  ON public.location_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "IT and Admin can manage location history"
  ON public.location_history FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['it', 'admin']::public.app_role[]));

-- Audit logs policies (read-only for authenticated)
CREATE POLICY "All authenticated can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Only system can insert audit logs (via trigger)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Offboarding records policies
CREATE POLICY "All authenticated can view offboarding"
  ON public.offboarding_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can manage offboarding"
  ON public.offboarding_records FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER tr_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_storage_units_updated_at
  BEFORE UPDATE ON public.storage_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_action public.audit_action;
  v_entity_type public.entity_type;
  v_old_values JSONB;
  v_new_values JSONB;
  v_changes JSONB;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
  END IF;

  -- Determine entity type from table name
  CASE TG_TABLE_NAME
    WHEN 'employees' THEN v_entity_type := 'employee';
    WHEN 'assets' THEN v_entity_type := 'asset';
    WHEN 'assignments' THEN v_entity_type := 'assignment';
    WHEN 'maintenance_events' THEN v_entity_type := 'maintenance';
    WHEN 'locations' THEN v_entity_type := 'location';
    WHEN 'profiles' THEN v_entity_type := 'profile';
    ELSE v_entity_type := 'asset';
  END CASE;

  -- Build values
  IF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_values := NULL;
    v_new_values := to_jsonb(NEW);
  ELSE
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    changes
  ) VALUES (
    auth.uid(),
    (SELECT email FROM public.profiles WHERE id = auth.uid()),
    v_action,
    v_entity_type,
    COALESCE(NEW.id, OLD.id),
    v_old_values,
    v_new_values,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN v_new_values - v_old_values
      ELSE NULL
    END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply audit triggers
CREATE TRIGGER tr_employees_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER tr_assets_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER tr_assignments_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER tr_maintenance_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_events
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER tr_locations_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

-- =====================================================
-- BUSINESS RULE FUNCTIONS
-- =====================================================

-- Function to calculate depreciated value
CREATE OR REPLACE FUNCTION public.calculate_book_value(
  purchase_cost DECIMAL,
  purchase_date DATE,
  useful_life_years INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  age_years DECIMAL;
  annual_depreciation DECIMAL;
  book_value DECIMAL;
BEGIN
  IF purchase_cost IS NULL OR purchase_date IS NULL OR useful_life_years IS NULL THEN
    RETURN NULL;
  END IF;
  
  age_years := EXTRACT(YEAR FROM age(CURRENT_DATE, purchase_date)) + 
               EXTRACT(MONTH FROM age(CURRENT_DATE, purchase_date)) / 12.0;
  annual_depreciation := purchase_cost / useful_life_years;
  book_value := purchase_cost - (annual_depreciation * age_years);
  
  RETURN GREATEST(book_value, 0);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function to check if employee can receive assignments
CREATE OR REPLACE FUNCTION public.can_receive_assignment(_employee_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees
    WHERE id = _employee_id
    AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Function to check if asset can be assigned
CREATE OR REPLACE FUNCTION public.can_be_assigned(_asset_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assets
    WHERE id = _asset_id
    AND status IN ('spare', 'in_use')
    AND security_compliant = true
    AND is_readonly = false
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Assignment validation trigger
CREATE OR REPLACE FUNCTION public.validate_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if employee is active
  IF NOT public.can_receive_assignment(NEW.employee_id) THEN
    RAISE EXCEPTION 'Cannot assign to inactive or offboarded employee';
  END IF;
  
  -- Check if asset can be assigned
  IF NOT public.can_be_assigned(NEW.asset_id) THEN
    RAISE EXCEPTION 'Asset cannot be assigned (retired, quarantined, disposed, or non-compliant)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tr_validate_assignment
  BEFORE INSERT ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.validate_assignment();

-- Update asset status on assignment
CREATE OR REPLACE FUNCTION public.update_asset_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('pending_acceptance', 'active') THEN
    UPDATE public.assets SET status = 'in_use', updated_at = now()
    WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'returned' AND OLD.status != 'returned' THEN
    UPDATE public.assets SET status = 'spare', updated_at = now()
    WHERE id = NEW.asset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tr_asset_status_on_assignment
  AFTER INSERT OR UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_asset_on_assignment();

-- Prevent modification of disposed assets
CREATE OR REPLACE FUNCTION public.prevent_disposed_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'disposed' AND OLD.is_readonly = true THEN
    RAISE EXCEPTION 'Cannot modify disposed asset';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tr_prevent_disposed_modification
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.prevent_disposed_modification();

-- Mark asset as readonly when disposed
CREATE OR REPLACE FUNCTION public.mark_disposed_readonly()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'disposed' AND OLD.status != 'disposed' THEN
    NEW.is_readonly := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tr_mark_disposed_readonly
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.mark_disposed_readonly();