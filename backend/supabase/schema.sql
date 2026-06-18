-- ============================================================
-- CircuitForge — Supabase SQL Schema (FIXED)
-- Run sections ONE AT A TIME in Supabase SQL Editor
-- Start with Section A, verify, then proceed to B, C, etc.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- SECTION A: EXTENSIONS & BASE FUNCTIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────
-- SECTION B: ENUMS
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('pending', 'approved', 'in_progress', 'review', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('not_started', 'packaging', 'dispatched', 'out_for_delivery', 'delivered', 'picked_up');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE file_type AS ENUM ('abstract', 'report_pdf', 'demo_video', 'circuit_diagram', 'source_code', 'delivery_image', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('project_submitted', 'project_approved', 'progress_update', 'file_uploaded', 'delivery_update', 'general', 'admin_note');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION C: REFERENCE TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS colleges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  short_name  TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT 'Nagpur',
  state       TEXT NOT NULL DEFAULT 'Maharashtra',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);

CREATE TABLE IF NOT EXISTS project_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- SECTION D: PROFILES TABLE
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'student',
  full_name       TEXT NOT NULL,
  phone           TEXT,
  college_id      UUID REFERENCES colleges(id) ON DELETE SET NULL,
  college_name    TEXT,
  program         TEXT,
  semester        TEXT,
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role       ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON profiles(college_id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_full_name TEXT;
BEGIN
  -- Safely extract and validate role
  v_role := 'student'::public.user_role;
  
  IF NEW.raw_user_meta_data ? 'role' THEN
    BEGIN
      v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    EXCEPTION WHEN OTHERS THEN
      v_role := 'student'::public.user_role;
    END;
  END IF;
  
  -- Extract full name with fallback
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert profile safely
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, v_full_name, v_role)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail — signup should succeed even if profile creation has issues
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- SECTION E: PROJECTS & RELATED TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_ref     TEXT NOT NULL UNIQUE,
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  manager_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES project_categories(id) ON DELETE SET NULL,
  college_id      UUID REFERENCES colleges(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  category_name   TEXT,
  college_name    TEXT,
  semester        TEXT,
  program         TEXT,
  deadline        DATE NOT NULL,
  description     TEXT NOT NULL,
  components      TEXT,
  budget_range    TEXT,
  notes           TEXT,
  status          project_status NOT NULL DEFAULT 'pending',
  progress        SMALLINT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_phase   TEXT,
  manager_notes   TEXT,
  quoted_price    NUMERIC(10,2),
  final_price     NUMERIC(10,2),
  is_paid         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_status     ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline   ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_ref        ON projects(project_ref);

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS project_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  phase       TEXT NOT NULL,
  message     TEXT NOT NULL,
  progress    SMALLINT CHECK (progress >= 0 AND progress <= 100),
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON project_updates(project_id);

CREATE TABLE IF NOT EXISTS project_files (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  file_type       file_type NOT NULL DEFAULT 'other',
  label           TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  bucket_name     TEXT NOT NULL,
  original_name   TEXT NOT NULL,
  mime_type       TEXT,
  size_bytes      BIGINT,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  type        notification_type NOT NULL DEFAULT 'general',
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  sent_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS admin_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_notes_project_id ON admin_notes(project_id);

CREATE TABLE IF NOT EXISTS delivery_tracking (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  delivery_type    delivery_type NOT NULL DEFAULT 'pickup',
  status           delivery_status NOT NULL DEFAULT 'not_started',
  tracking_number  TEXT,
  carrier          TEXT,
  pickup_address   TEXT,
  delivery_address TEXT,
  scheduled_date   DATE,
  actual_date      DATE,
  recipient_name   TEXT,
  contact_phone    TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_delivery_updated_at ON delivery_tracking;
CREATE TRIGGER trg_delivery_updated_at
  BEFORE UPDATE ON delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- SECTION L: DATABASE PERFORMANCE & SOFT DELETE
-- ─────────────────────────────────────────────────────────────

-- Add Soft Delete Columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE project_files ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Database Performance Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON projects(student_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE NOT is_read AND NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at);

-- ─────────────────────────────────────────────────────────────
-- SECTION F: NOTIFICATION TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- Notify student when project status changes
CREATE OR REPLACE FUNCTION notify_on_project_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_body  TEXT;
  v_type  notification_type;
BEGIN
  -- OLD and NEW are valid here because this is a TRIGGER FUNCTION
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'approved'    THEN
        v_type  := 'project_approved';
        v_title := '🎉 Project Approved!';
        v_body  := 'Your project "' || NEW.title || '" has been approved and work will begin shortly.';
      WHEN 'in_progress' THEN
        v_type  := 'progress_update';
        v_title := '⚡ Development Started';
        v_body  := 'Work on "' || NEW.title || '" has officially started. Phase: ' || COALESCE(NEW.current_phase, 'Initial');
      WHEN 'review'      THEN
        v_type  := 'progress_update';
        v_title := '🔍 Project Under Review';
        v_body  := 'Your project "' || NEW.title || '" is being reviewed by our QC team.';
      WHEN 'delivered'   THEN
        v_type  := 'delivery_update';
        v_title := '📦 Project Ready!';
        v_body  := 'Your project "' || NEW.title || '" is complete and ready for pickup/delivery!';
      WHEN 'cancelled'   THEN
        v_type  := 'general';
        v_title := 'Project Cancelled';
        v_body  := 'Your project "' || NEW.title || '" has been cancelled. Please contact us.';
      ELSE
        RETURN NEW;
    END CASE;

    INSERT INTO notifications (user_id, project_id, type, title, body)
    VALUES (NEW.student_id, NEW.id, v_type, v_title, v_body);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_project_status_notification ON projects;
CREATE TRIGGER trg_project_status_notification
  AFTER UPDATE OF status ON projects
  FOR EACH ROW EXECUTE FUNCTION notify_on_project_status_change();

-- Notify student when file uploaded to their project
CREATE OR REPLACE FUNCTION notify_on_file_upload()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id    UUID;
  v_project_title TEXT;
  v_label         TEXT;
BEGIN
  SELECT student_id, title INTO v_student_id, v_project_title
  FROM projects WHERE id = NEW.project_id;

  v_label := CASE NEW.file_type
    WHEN 'report_pdf'      THEN 'Project Report PDF'
    WHEN 'demo_video'      THEN 'Demonstration Video'
    WHEN 'circuit_diagram' THEN 'Circuit Diagram'
    WHEN 'source_code'     THEN 'Source Code Archive'
    ELSE NEW.label
  END;

  INSERT INTO notifications (user_id, project_id, type, title, body)
  VALUES (
    v_student_id, NEW.project_id, 'file_uploaded',
    '📄 New File Available',
    v_label || ' is now available for "' || v_project_title || '".'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_file_upload_notification ON project_files;
CREATE TRIGGER trg_file_upload_notification
  AFTER INSERT ON project_files
  FOR EACH ROW EXECUTE FUNCTION notify_on_file_upload();

-- ─────────────────────────────────────────────────────────────
-- SECTION G: RLS HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_owner(row_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = row_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────
-- SECTION H: ROW LEVEL SECURITY POLICIES
-- ─────────────────────────────────────────────────────────────

-- ── PROFILES ──────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON profiles FOR SELECT
  USING (is_owner(id) OR is_admin());

-- Allow trigger to create profiles during signup (no auth context yet)
DROP POLICY IF EXISTS "profiles_insert_trigger" ON profiles;
CREATE POLICY "profiles_insert_trigger"
  ON profiles FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (is_owner(id));

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (is_owner(id) OR is_admin())
  WITH CHECK (is_admin() OR is_owner(id));

DROP POLICY IF EXISTS "profiles_delete_admin_only" ON profiles;
CREATE POLICY "profiles_delete_admin_only"
  ON profiles FOR DELETE
  USING (is_admin());

-- ── COLLEGES ──────────────────────────────────────────────────
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "colleges_public_read" ON colleges;
CREATE POLICY "colleges_public_read"
  ON colleges FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "colleges_admin_write" ON colleges;
CREATE POLICY "colleges_admin_write"
  ON colleges FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── PROJECT CATEGORIES ────────────────────────────────────────
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON project_categories;
CREATE POLICY "categories_public_read"
  ON project_categories FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "categories_admin_write" ON project_categories;
CREATE POLICY "categories_admin_write"
  ON project_categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── PROJECTS ──────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_student_select_own" ON projects;
CREATE POLICY "projects_student_select_own"
  ON projects FOR SELECT
  USING (is_owner(student_id) OR is_admin());

DROP POLICY IF EXISTS "projects_student_insert" ON projects;
CREATE POLICY "projects_student_insert"
  ON projects FOR INSERT
  WITH CHECK (is_owner(student_id));

DROP POLICY IF EXISTS "projects_student_update_own_draft" ON projects;
CREATE POLICY "projects_student_update_own_draft"
  ON projects FOR UPDATE
  -- USING: students may only update rows where status = 'pending' (pre-approval)
  -- Once admin moves status forward, students can no longer edit.
  -- Admins can update any project row.
  USING (
    (is_owner(student_id) AND status = 'pending')
    OR is_admin()
  )
  -- WITH CHECK: validates the proposed new row.
  -- NOTE: OLD.* cannot be used in RLS policies (only in triggers).
  -- Field-level protection is enforced by the USING clause above
  -- and by the backend controller (admin-only PATCH route).
  WITH CHECK (
    is_admin() OR is_owner(student_id)
  );

DROP POLICY IF EXISTS "projects_admin_delete" ON projects;
CREATE POLICY "projects_admin_delete"
  ON projects FOR DELETE
  USING (is_admin());

-- ── PROJECT UPDATES ───────────────────────────────────────────
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_updates_select" ON project_updates;
CREATE POLICY "project_updates_select"
  ON project_updates FOR SELECT
  USING (
    (is_visible = TRUE AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND is_owner(p.student_id)
    ))
    OR is_admin()
  );

DROP POLICY IF EXISTS "project_updates_insert_admin" ON project_updates;
CREATE POLICY "project_updates_insert_admin"
  ON project_updates FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "project_updates_update_admin" ON project_updates;
CREATE POLICY "project_updates_update_admin"
  ON project_updates FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "project_updates_delete_admin" ON project_updates;
CREATE POLICY "project_updates_delete_admin"
  ON project_updates FOR DELETE
  USING (is_admin());

-- ── PROJECT FILES ─────────────────────────────────────────────
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_files_select" ON project_files;
CREATE POLICY "project_files_select"
  ON project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (is_owner(p.student_id) OR is_admin())
    )
  );

DROP POLICY IF EXISTS "project_files_insert" ON project_files;
CREATE POLICY "project_files_insert"
  ON project_files FOR INSERT
  WITH CHECK (
    is_admin()
    OR (
      is_owner(uploaded_by) AND
      file_type = 'abstract' AND
      EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND is_owner(p.student_id))
    )
  );

DROP POLICY IF EXISTS "project_files_delete_admin" ON project_files;
CREATE POLICY "project_files_delete_admin"
  ON project_files FOR DELETE
  USING (is_admin());

-- ── NOTIFICATIONS ─────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (is_owner(user_id) OR is_admin());

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT
  WITH CHECK (is_admin() OR is_owner(user_id));

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (is_owner(user_id));

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (is_owner(user_id) OR is_admin());

-- ── ADMIN NOTES ── (students NEVER see these) ─────────────────
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_notes_admin_only" ON admin_notes;
CREATE POLICY "admin_notes_admin_only"
  ON admin_notes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── DELIVERY TRACKING ─────────────────────────────────────────
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "delivery_select" ON delivery_tracking;
CREATE POLICY "delivery_select"
  ON delivery_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND (is_owner(p.student_id) OR is_admin())
    )
  );

DROP POLICY IF EXISTS "delivery_write_admin" ON delivery_tracking;
CREATE POLICY "delivery_write_admin"
  ON delivery_tracking FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "delivery_update_admin" ON delivery_tracking;
CREATE POLICY "delivery_update_admin"
  ON delivery_tracking FOR UPDATE
  USING (is_admin());

-- ─────────────────────────────────────────────────────────────
-- SECTION I: REALTIME
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE project_updates;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE delivery_tracking;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────
-- SECTION J: SEED DATA
-- ─────────────────────────────────────────────────────────────
INSERT INTO colleges (name, short_name) VALUES
  ('Visvesvaraya National Institute of Technology',    'VNIT'),
  ('Ramdeobaba College of Engineering and Management', 'RCOEM'),
  ('Priyadarshini College of Engineering',             'PCE'),
  ('Yeshwantrao Chavan College of Engineering',        'YCCE'),
  ('G H Raisoni College of Engineering',               'GHRCE'),
  ('Symbiosis Institute of Technology',                'SIT'),
  ('Laxminarayan Institute of Technology',             'LIT'),
  ('Shri Ramdeobaba College of Engineering',           'SRCE'),
  ('Kavikulguru Institute of Technology and Science',  'KITS'),
  ('Manoharbhai Patel Institute of Engineering',       'MPIE')
ON CONFLICT (name) DO NOTHING;

INSERT INTO project_categories (name, slug, description, icon, sort_order) VALUES
  ('IoT & Smart Systems',      'iot-smart-systems',    'Internet of Things and Smart Home projects',    'Wifi',     1),
  ('Robotics & Automation',    'robotics-automation',  'Robot design, automation, and control systems', 'Bot',      2),
  ('Embedded Systems',         'embedded-systems',     'Microcontroller-based projects (Arduino, ESP32)','Cpu',     3),
  ('Power Electronics',        'power-electronics',    'Inverters, converters, motor drives',           'Battery',  4),
  ('Signal Processing',        'signal-processing',    'Audio, image, and signal processing systems',   'Activity', 5),
  ('Communication Systems',    'communication-systems','RF, wireless, optical communication',           'Radio',    6),
  ('Medical Electronics',      'medical-electronics',  'Healthcare and biomedical devices',             'Heart',    7),
  ('Agriculture Technology',   'agriculture-tech',     'Smart farming and precision agriculture',       'Leaf',     8),
  ('Industrial Automation',    'industrial-automation','SCADA, PLCs, industrial control',               'Factory',  9),
  ('Renewable Energy Systems', 'renewable-energy',     'Solar, wind, and hybrid energy systems',        'Sun',      10)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- SECTION K: ADMIN ACCOUNT
-- ─────────────────────────────────────────────────────────────
-- Step 1: Create user in Supabase Dashboard → Authentication → Users
--         Email: admin@circuitforge.in  |  Password: (set securely)
--
-- Step 2: Run this AFTER creating the user:
--
-- UPDATE profiles
--   SET role = 'admin', full_name = 'CircuitForge Admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@circuitforge.in');

-- ─────────────────────────────────────────────────────────────
-- SECTION L: STORAGE BUCKETS
-- Create these manually in: Supabase Dashboard → Storage → New Bucket
-- OR run the INSERT below (may fail if storage schema differs by project)
-- ─────────────────────────────────────────────────────────────
/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('project-abstracts', 'project-abstracts', FALSE, 52428800,
    ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip']),
  ('project-documents', 'project-documents', FALSE, 104857600,
    ARRAY['application/pdf','application/zip']),
  ('demo-videos',       'demo-videos',       FALSE, 524288000,
    ARRAY['video/mp4','video/webm','video/mpeg']),
  ('circuit-diagrams',  'circuit-diagrams',  FALSE, 20971520,
    ARRAY['image/png','image/jpeg','image/svg+xml','application/pdf']),
  ('delivery-images',   'delivery-images',   FALSE, 20971520,
    ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;
*/

-- ─────────────────────────────────────────────────────────────
-- SECTION M: AUDIT LOGGING & TRANSACTIONS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id       UUID NOT NULL REFERENCES profiles(id),
  action_type    TEXT NOT NULL,
  target_project UUID REFERENCES projects(id) ON DELETE CASCADE,
  metadata       JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_project ON audit_logs(target_project);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type);

-- RPC for atomic project update (status, progress, phase, notifications, audit log)
CREATE OR REPLACE FUNCTION admin_update_project(
  p_project_id UUID,
  p_admin_id UUID,
  p_status project_status,
  p_progress SMALLINT,
  p_phase TEXT,
  p_manager_notes TEXT
) RETURNS JSON AS $$
DECLARE
  v_project projects%ROWTYPE;
BEGIN
  -- Update project
  UPDATE projects
  SET status = p_status,
      progress = p_progress,
      current_phase = p_phase,
      manager_notes = p_manager_notes,
      updated_at = NOW()
  WHERE id = p_project_id
  RETURNING * INTO v_project;

  -- Add project update timeline entry if phase is provided
  IF p_phase IS NOT NULL AND p_phase <> '' THEN
    INSERT INTO project_updates (project_id, author_id, phase, message, progress)
    VALUES (p_project_id, p_admin_id, p_phase, COALESCE(p_manager_notes, 'Status updated'), p_progress);
  END IF;

  -- The trigger trg_project_status_notification will automatically handle the basic status notification.
  -- We don't need to manually insert a notification here unless we want to override it.

  -- Audit Log
  INSERT INTO audit_logs (admin_id, action_type, target_project, metadata)
  VALUES (
    p_admin_id, 
    'update_project', 
    p_project_id, 
    jsonb_build_object('status', p_status, 'progress', p_progress, 'phase', p_phase)
  );

  RETURN row_to_json(v_project);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- END OF SCHEMA
-- ─────────────────────────────────────────────────────────────
