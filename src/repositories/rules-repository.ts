import type { DatabaseSync } from "node:sqlite";

type ReservationRules = {
  minDurationMinutes: number;
  maxDurationMinutes: number;
};

export function findReservationRules(
  db: DatabaseSync,
  organizationId: string,
): ReservationRules | undefined {
  return db
    .prepare(
      `
    SELECT
      min_duration_minutes AS minDurationMinutes,
      max_duration_minutes AS maxDurationMinutes
    FROM reservation_rules
    WHERE organization_id = ?
  `,
    )
    .get(organizationId) as ReservationRules | undefined;
}
