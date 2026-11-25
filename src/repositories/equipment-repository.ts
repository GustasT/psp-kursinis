import type { DatabaseSync } from "node:sqlite";

export function listEquipment(db: DatabaseSync, organizationId: string) {
  const organization = db
    .prepare(
      `
    SELECT id FROM organizations WHERE id = ?
  `,
    )
    .get(organizationId);

  if (!organization) {
    return undefined;
  }

  return db
    .prepare(
      `
    SELECT id, organization_id, branch_id, name
    FROM equipment
    WHERE organization_id = ?
    ORDER BY id
  `,
    )
    .all(organizationId);
}

export function findEquipment(
  db: DatabaseSync,
  organizationId: string,
  equipmentId: string,
) {
  return db
    .prepare(
      `
    SELECT id, branch_id AS branchId, name
    FROM equipment
    WHERE organization_id = ? AND id = ?
  `,
    )
    .get(organizationId, equipmentId);
}
