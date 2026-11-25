import type { DatabaseSync } from "node:sqlite";

type MemberWithPlan = {
  id: string;
  name: string;
  dailyLimitMinutes: number;
};

export function findMember(
  db: DatabaseSync,
  organizationId: string,
  memberId: string,
): MemberWithPlan | undefined {
  return db
    .prepare(
      `
    SELECT
      m.id,
      m.name,
      p.daily_limit_minutes AS dailyLimitMinutes
    FROM members m
    JOIN membership_plans p
      ON p.organization_id = m.organization_id
      AND p.id = m.membership_plan_id
    WHERE m.organization_id = ? AND m.id = ?
  `,
    )
    .get(organizationId, memberId) as MemberWithPlan | undefined;
}
