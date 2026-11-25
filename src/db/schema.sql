CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS branches (
  organization_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,

  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS membership_plans (
  organization_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  daily_limit_minutes INTEGER NOT NULL CHECK (daily_limit_minutes > 0),

  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS members (
  organization_id TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  membership_plan_id TEXT NOT NULL,

  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (organization_id, membership_plan_id)
    REFERENCES membership_plans(organization_id, id)
);

CREATE TABLE IF NOT EXISTS equipment (
  organization_id TEXT NOT NULL,
  id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  name TEXT NOT NULL,

  PRIMARY KEY (organization_id, id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (organization_id, branch_id)
    REFERENCES branches(organization_id, id)
);

CREATE TABLE IF NOT EXISTS reservation_rules (
  organization_id TEXT PRIMARY KEY NOT NULL,
  min_duration_minutes INTEGER NOT NULL CHECK (min_duration_minutes > 0),
  max_duration_minutes INTEGER NOT NULL,
  
  CHECK (max_duration_minutes >= min_duration_minutes),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
CREATE TABLE IF NOT EXISTS reservations (
  organization_id TEXT NOT NULL,
  id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  equipment_id TEXT NOT NULL,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',

  PRIMARY KEY (organization_id, id),

  FOREIGN KEY (organization_id, member_id)
    REFERENCES members(organization_id, id),

  FOREIGN KEY (organization_id, equipment_id)
    REFERENCES equipment(organization_id, id),

  CHECK (ends_at > starts_at),
  CHECK (status IN ('CONFIRMED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_equipment
  ON reservations (organization_id, equipment_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_reservations_member
  ON reservations (organization_id, member_id, starts_at);