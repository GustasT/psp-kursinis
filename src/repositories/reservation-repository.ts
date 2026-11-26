import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

type NewReservation = {
  organizationId: string;
  memberId: string;
  equipmentId: string;
  startsAt: number;
  endsAt: number;
};

export function insertReservation(db: DatabaseSync, input: NewReservation) {
  const reservation = {
    ...input,
    id: randomUUID(),
    status: "CONFIRMED" as const,
  };

  db.prepare(
    `
    INSERT INTO reservations (
      organization_id,
      id,
      member_id,
      equipment_id,
      starts_at,
      ends_at,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    reservation.organizationId,
    reservation.id,
    reservation.memberId,
    reservation.equipmentId,
    reservation.startsAt,
    reservation.endsAt,
    reservation.status,
  );

  return reservation;
}

export function listMemberReservations(
  db: DatabaseSync,
  organizationId: string,
  memberId: string,
) {
  return db
    .prepare(
      `
    SELECT
      id,
      organization_id AS organizationId,
      member_id AS memberId,
      equipment_id AS equipmentId,
      starts_at AS startsAt,
      ends_at AS endsAt,
      status
    FROM reservations
    WHERE organization_id = ? AND member_id = ?
    ORDER BY starts_at
  `,
    )
    .all(organizationId, memberId);
}

type ReservationConflict = {
  memberId: string;
  equipmentId: string;
};

export function findReservationConflict(
  db: DatabaseSync,
  organizationId: string,
  memberId: string,
  equipmentId: string,
  startsAt: number,
  endsAt: number,
): ReservationConflict | undefined {
  return db
    .prepare(
      `
    SELECT
      member_id AS memberId,
      equipment_id AS equipmentId
    FROM reservations
    WHERE organization_id = ?
      AND status = 'CONFIRMED'
      AND (member_id = ? OR equipment_id = ?)
      AND starts_at < ?
      AND ends_at > ?
    ORDER BY (member_id = ?) DESC
    LIMIT 1
  `,
    )
    .get(organizationId, memberId, equipmentId, endsAt, startsAt, memberId) as
    | ReservationConflict
    | undefined;
}

export function getReservedMinutes(
  db: DatabaseSync,
  organizationId: string,
  memberId: string,
  dayStart: number,
  dayEnd: number,
): number {
  const result = db
    .prepare(
      `
    SELECT
      COALESCE(
        SUM(MIN(ends_at, ?) - MAX(starts_at, ?)),
        0
      ) / 60000.0 AS minutes
    FROM reservations
    WHERE organization_id = ?
      AND member_id = ?
      AND status = 'CONFIRMED'
      AND starts_at < ?
      AND ends_at > ?
  `,
    )
    .get(dayEnd, dayStart, organizationId, memberId, dayEnd, dayStart) as {
    minutes: number;
  };

  return result.minutes;
}

export function cancelReservation(
  db: DatabaseSync,
  organizationId: string,
  reservationId: string,
  now = Date.now(),
) {
  return db
    .prepare(
      `
    UPDATE reservations
    SET status = 'CANCELLED'
    WHERE organization_id = ?
      AND id = ?
      AND status = 'CONFIRMED'
      AND starts_at > ?
    RETURNING id, status
  `,
    )
    .get(organizationId, reservationId, now);
}
