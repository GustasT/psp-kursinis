import type { DatabaseSync } from "node:sqlite";

export function seedDatabase(db: DatabaseSync) {
  const insertOrganization = db.prepare(`
    INSERT INTO organizations (id, name)
    VALUES (?, ?)
    ON CONFLICT DO NOTHING
  `);

  const insertBranch = db.prepare(`
    INSERT INTO branches (organization_id, id, name)
    VALUES (?, ?, ?)
    ON CONFLICT DO NOTHING
  `);

  const insertPlan = db.prepare(`
    INSERT INTO membership_plans (
      organization_id, id, name, daily_limit_minutes
    )
    VALUES (?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `);

  const insertMember = db.prepare(`
    INSERT INTO members (
      organization_id, id, name, membership_plan_id
    )
    VALUES (?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `);

  const insertEquipment = db.prepare(`
    INSERT INTO equipment (organization_id, id, branch_id, name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `);

  const insertRules = db.prepare(`
    INSERT INTO reservation_rules (
      organization_id, min_duration_minutes, max_duration_minutes
    )
    VALUES (?, ?, ?)
    ON CONFLICT DO NOTHING
  `);

  db.exec("BEGIN");

  try {
    for (const organizationId of ["club-a", "club-b"]) {
      const name =
        organizationId === "club-a" ? "Sporto klubas A" : "Sporto klubas B";

      insertOrganization.run(organizationId, name);
      insertBranch.run(organizationId, "branch-1", "Pagrindinis filialas");
      insertPlan.run(organizationId, "standard", "Standard", 60);

      insertMember.run(organizationId, "member-1", "Jonas", "standard");
      insertMember.run(organizationId, "member-2", "Petras", "standard");

      insertEquipment.run(
        organizationId,
        "equipment-1",
        "branch-1",
        "Bėgimo takelis",
      );

      insertEquipment.run(
        organizationId,
        "equipment-2",
        "branch-1",
        "Dviratis",
      );

      insertRules.run(organizationId, 5, 30);
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
